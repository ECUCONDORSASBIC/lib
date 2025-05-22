# User Role Integration Documentation

This document outlines how different user roles (Doctors, Patients, Companies) interact within the Altamedica platform, including how unique identifiers (UIDs) are used to establish relationships and permissions.

## User Role Architecture

### Core Roles
- **Paciente (Patient)**: End-users receiving medical care
- **Médico (Doctor)**: Healthcare professionals providing medical services
- **Empresa (Company/Clinic)**: Organizations employing doctors or offering healthcare services

## UID Integration and Relationships

### Doctor-Patient Integration

Each doctor (médico) has their own unique Firebase UID that serves as their primary identifier in the system. This UID establishes the following relationships:

1. **Patient Assignment**:
   - Doctors are linked to patients through a many-to-many relationship
   - The association is stored in `doctor_patient_relationships` collection
   - Structure: `{ doctorId: "uid-doctor", patientId: "uid-patient", assignedDate: timestamp, status: "active" }`

2. **Medical Records Access**:
   - Doctors can only access patient medical records for patients assigned to them
   - Access permissions are validated through Firebase security rules that check the doctor-patient relationship
   - Each medical action (notes, prescriptions, appointments) includes the doctor's UID for audit trail

3. **Appointment Management**:
   - When a doctor creates an appointment, their UID is stored as `doctorId` in the appointment document
   - This establishes ownership and access control for appointment management

### Company-Doctor Integration

Companies (Empresas) can have relationships with multiple doctors, establishing:

1. **Employment/Association**:
   - Doctors can be employed by or associated with companies/clinics
   - This relationship is stored in `company_doctor_relationships` collection
   - Structure: `{ companyId: "uid-empresa", doctorId: "uid-medico", role: "employee|contractor", startDate: timestamp, status: "active" }`

2. **Hierarchical Access**:
   - Companies can view data for all doctors associated with them
   - Companies cannot directly access patient data, but can see anonymized statistics and appointment information

3. **Service Management**:
   - Companies can manage services offered by their doctors
   - Doctors associated with multiple companies have separate profiles for each association

## Implementation Details

### Authentication and Authorization Flow

1. During authentication, user roles are stored as custom claims in Firebase Auth:
   ```javascript
   await authAdmin.setCustomUserClaims(userId, { role: "medico" });
   ```

2. Role-based access is enforced through middleware that checks:
   - User's role (médico, paciente, empresa)
   - Relationship between the authenticated user and the requested resource

3. Direct patient data access requires either:
   - The user is the patient (UID matches patientId)
   - The user is a doctor with an established relationship to the patient
   - The user is an admin with elevated privileges

### API Routes

API routes enforce these relationships through validation middleware:

```javascript
// Example of doctor-patient relationship validation middleware
const validateDoctorPatientRelationship = async (req, res, next) => {
  const doctorId = req.user.uid;
  const patientId = req.params.patientId;
  
  const relationshipRef = db.collection('doctor_patient_relationships')
    .where('doctorId', '==', doctorId)
    .where('patientId', '==', patientId)
    .where('status', '==', 'active');
    
  const relationship = await relationshipRef.get();
  
  if (relationship.empty) {
    return res.status(403).json({ error: 'No authorized relationship with this patient' });
  }
  
  next();
};
```

## Dashboard Access

- **Doctor Dashboard**: Shows only patients assigned to the authenticated doctor
- **Company Dashboard**: Shows only doctors associated with the authenticated company
- **Patient Dashboard**: Shows only their own personal data and assigned doctors

## Security Considerations

1. **UID Protection**: UIDs are never exposed in client-side code to prevent enumeration attacks
2. **Deep Relationship Validation**: All operations verify not just roles but specific relationships
3. **Audit Logging**: Changes to relationships are logged for compliance and security purposes
