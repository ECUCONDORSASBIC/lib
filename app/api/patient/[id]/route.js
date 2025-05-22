import { authAdmin, db } from '@/lib/firebase/firebaseAdmin';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  // Firebase Admin ya está inicializado en la importación
  try {

    // Verificar token y extraer información
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('API patients/[id]: Token no proporcionado');
      return NextResponse.json(
        { error: 'Token de autenticación no disponible.' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    let decodedToken;

    try {
      decodedToken = await authAdmin.verifyIdToken(token);
    } catch (error) {
      console.error('API patients/[id]: Error al verificar token:', error);
      return NextResponse.json(
        { error: 'Token inválido o expirado.' },
        { status: 401 }
      );
    }

    // Extraer información del token
    const uid = decodedToken.uid;
    const role = decodedToken.role; // Keep this to see what role the token *thinks* it has
    const patientId = params.id;

    console.log(`API patients/[id]: Usuario ${uid} con rol '${role}' (claims) solicitando datos del paciente ${patientId}`);

    // IMPORTANTE: Verificar relación médico-paciente si el usuario es un médico
    // Esta verificación es crucial para la integración médico-paciente
    // Un médico solo debería acceder a datos de pacientes que están asociados a él
    if (role === 'medico') {
      // Verificar si existe una relación entre este médico y este paciente
      const relationshipRef = db.collection('doctor_patient_relationships')
        .where('doctorId', '==', uid)
        .where('patientId', '==', patientId)
        .where('status', '==', 'active');

      const relationshipDoc = await relationshipRef.get();

      if (relationshipDoc.empty) {
        console.warn(`API patients/[id]: Médico ${uid} intentó acceder a paciente ${patientId} sin relación establecida`);
        return NextResponse.json(
          { error: 'No tienes autorización para ver a este paciente.' },
          { status: 403 }
        );
      }

      console.log(`API patients/[id]: Relación médico-paciente verificada para médico ${uid} y paciente ${patientId}`);
    }

    // Verificar permisos
    // const hasAccess =
    //   role === 'admin' ||
    //   role === 'medico' ||
    //   (role === 'paciente' && uid === patientId);

    // if (!hasAccess) {
    //   console.warn(`API patients/[id]: Acceso denegado para usuario ${uid} con rol ${role} al paciente ${patientId}`);
    //   return NextResponse.json(
    //     { error: 'Forbidden: You do not have permission to view this patient.' },
    //     { status: 403 }
    //   );
    // }

    // TEMPORARY: Allow access for any authenticated user for debugging
    console.warn("API patients/[id]: ADVERTENCIA - Verificación de roles temporalmente desactivada.");

    // Obtener datos
    const docRef = db.collection('users').doc(patientId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Paciente no encontrado.' },
        { status: 404 }
      );
    }

    // Formatear respuesta según el rol
    const userData = doc.data();

    // Si es paciente consultando sus propios datos o un médico/admin
    const responseData = {
      id: patientId,
      name: userData.name || '',
      email: userData.email || '',
      phone: userData.phone || '',
      birthDate: userData.birthDate || '',
      bloodType: userData.bloodType || '',
      allergies: userData.allergies || [],
      // Información adicional solo para médicos/admin
      ...(role !== 'paciente' && {
        medicalHistory: userData.medicalHistory || [],
        medications: userData.medications || [],
        lastCheckup: userData.lastCheckup || null
      })
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Error general en API patients/[id]:', error);
    return NextResponse.json(
      {
        error: 'Error del servidor al procesar la solicitud.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// PUT: Actualizar datos de un paciente por ID
export async function PUT(request, { params }) {
  const { id: patientIdToUpdate } = params;
  let updatedData;

  const authenticatedUserId = request.headers.get('x-user-id');
  const authenticatedUserRole = request.headers.get('x-user-role');

  // console.log(`[API /patients PUT] Auth User ID: ${authenticatedUserId}, Role: ${authenticatedUserRole}`);
  // console.log(`[API /patients PUT] Patient ID to Update: ${patientIdToUpdate}`);

  if (!authenticatedUserId) {
    return NextResponse.json({ error: 'Authentication context not found (missing x-user-id header)' }, { status: 401 });
  }

  let authorized = false;
  if (authenticatedUserRole === 'admin' || authenticatedUserRole === 'superuser') {
    authorized = true;
  } else if (authenticatedUserRole === 'paciente') {
    if (authenticatedUserId === patientIdToUpdate) {
      authorized = true;
    }
  } else if (authenticatedUserRole === 'medico') {
    // Verificar si existe una relación médico-paciente para autorizar actualización
    try {
      const relationshipRef = await db.collection('doctor_patient_relationships')
        .where('doctorId', '==', authenticatedUserId)
        .where('patientId', '==', patientIdToUpdate)
        .where('status', '==', 'active')
        .get();

      if (!relationshipRef.empty) {
        authorized = true;
        console.log(`Médico ${authenticatedUserId} autorizado para actualizar datos del paciente ${patientIdToUpdate}`);
      }
    } catch (error) {
      console.error('Error al verificar relación médico-paciente:', error);
      return NextResponse.json({ error: 'Error al verificar autorización' }, { status: 500 });
    }
  }
  // TODO: Definir permisos de actualización para médicos

  if (!authorized) {
    console.warn(`[API /patients PUT] Unauthorized attempt by ${authenticatedUserId} with role '${authenticatedUserRole}' to update ${patientIdToUpdate}.`);
    return NextResponse.json({ error: 'Forbidden: You do not have permission to update this patient.' }, { status: 403 });
  }

  if (!patientIdToUpdate) {
    return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 });
  }

  try {
    updatedData = await request.json();
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!updatedData || Object.keys(updatedData).length === 0) {
    return NextResponse.json({ error: 'No data provided for update' }, { status: 400 });
  }

  try {
    const patientDocRef = db.collection('users').doc(patientIdToUpdate);
    const patientDoc = await patientDocRef.get();

    if (!patientDoc.exists) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Prevenir la actualización de campos sensibles/controlados por el sistema
    delete updatedData.id;
    delete updatedData.uid; // uid es el id del documento
    delete updatedData.role; // El rol se gestiona a través de set-role API
    delete updatedData.email; // El cambio de email debe ser un proceso separado y seguro

    // Los médicos sólo pueden actualizar ciertos campos médicos
    if (authenticatedUserRole === 'medico') {
      // Los médicos solo pueden actualizar campos relacionados con la salud
      const allowedFields = ['medicalNotes', 'medications', 'diagnoses', 'treatments', 'allergies', 'vitalSigns', 'observations'];
      const providedFields = Object.keys(updatedData);

      // Filtrar solo campos permitidos para médicos
      const filteredData = {};
      providedFields.forEach(field => {
        if (allowedFields.includes(field)) {
          filteredData[field] = updatedData[field];
        }
      });

      // Añadir registro de quién realizó la actualización
      filteredData.lastUpdatedBy = {
        uid: authenticatedUserId,
        role: 'medico',
        timestamp: new Date().toISOString()
      };

      updatedData = filteredData;
    }

    updatedData.updatedAt = new Date().toISOString();

    await patientDocRef.update(updatedData);

    return NextResponse.json({ message: 'Patient updated successfully', id: patientIdToUpdate }, { status: 200 });
  } catch (error) {
    console.error('Error updating patient:', error);
    return NextResponse.json({ error: 'Failed to update patient data', details: error.message }, { status: 500 });
  }
}

// DELETE: Eliminar un paciente por ID
export async function DELETE(request, { params }) {
  const { id: patientIdToDelete } = params;

  const authenticatedUserId = request.headers.get('x-user-id');
  const authenticatedUserRole = request.headers.get('x-user-role');

  // console.log(`[API /patients DELETE] Auth User ID: ${authenticatedUserId}, Role: ${authenticatedUserRole}`);
  // console.log(`[API /patients DELETE] Patient ID to Delete: ${patientIdToDelete}`);

  if (!authenticatedUserId) {
    return NextResponse.json({ error: 'Authentication context not found (missing x-user-id header)' }, { status: 401 });
  }

  let authorized = false;
  if (authenticatedUserRole === 'admin' || authenticatedUserRole === 'superuser') {
    authorized = true;
  }
  // Generalmente, no se permite a otros roles eliminar directamente.

  if (!authorized) {
    console.warn(`[API /patients DELETE] Unauthorized attempt by ${authenticatedUserId} with role '${authenticatedUserRole}' to delete ${patientIdToDelete}.`);
    return NextResponse.json({ error: 'Forbidden: You do not have permission to delete this patient.' }, { status: 403 });
  }

  if (!patientIdToDelete) {
    return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 });
  }

  try {
    const patientDocRef = db.collection('users').doc(patientIdToDelete);
    const patientDoc = await patientDocRef.get();

    if (!patientDoc.exists) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Lógica de eliminación (ver consideraciones previas sobre datos relacionados y Firebase Auth)
    await patientDocRef.delete();

    // Considerar eliminar de Firebase Auth también:
    // try {
    //   await authAdmin.deleteUser(patientIdToDelete); // patientIdToDelete debe ser el UID de Firebase Auth
    // } catch (authError) {
    //   console.error('Error deleting user from Firebase Authentication:', authError);
    // }

    return NextResponse.json({ message: 'Patient deleted successfully', id: patientIdToDelete }, { status: 200 });
  } catch (error) {
    console.error('Error deleting patient:', error);
    return NextResponse.json({ error: 'Failed to delete patient data', details: error.message }, { status: 500 });
  }
}
