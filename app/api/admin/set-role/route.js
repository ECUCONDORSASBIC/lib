import { authAdmin, db } from '@/lib/firebase/firebaseAdmin'; // Usamos authAdmin del Admin SDK
import { NextResponse } from 'next/server';

// Función para verificar si el llamante es un administrador
// Esto es un ejemplo, necesitarás tu propia lógica para determinar si el usuario que llama a ESTA API es un admin
async function verifyCallerIsAdmin(request) {
  const authorizationHeader = request.headers.get('Authorization');
  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    return false;
  }
  const idToken = authorizationHeader.split('Bearer ')[1];
  if (!idToken) return false;

  try {
    const decodedToken = await authAdmin.verifyIdToken(idToken);
    // Verifica si el usuario tiene un custom claim de 'admin' o 'superuser'
    // O si su UID está en una lista de administradores en Firestore
    return decodedToken.role === 'admin' || decodedToken.role === 'superuser';
  } catch (error) {
    console.error('Error verifying admin token:', error);
    return false;
  }
}


export async function POST(request) {
  // 1. Verificar que el usuario que llama a esta API es un administrador
  const isAdmin = await verifyCallerIsAdmin(request);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized: Caller is not an admin.' }, { status: 403 });
  }

  let uidToSet, newRole;
  try {
    const body = await request.json();
    uidToSet = body.uid;
    newRole = body.role;
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!uidToSet || !newRole) {
    return NextResponse.json({ error: 'UID and role are required in the request body' }, { status: 400 });
  }

  // Roles permitidos (puedes expandir esto)
  const allowedRoles = ['paciente', 'medico', 'empresa', 'admin', 'superuser'];
  if (!allowedRoles.includes(newRole)) {
    return NextResponse.json({ error: `Invalid role. Allowed roles are: ${allowedRoles.join(', ')}` }, { status: 400 });
  }

  try {
    // 2. Establecer el custom claim para el rol
    await authAdmin.setCustomUserClaims(uidToSet, { role: newRole });

    // 3. (Opcional pero recomendado) Actualizar también el rol en el documento del usuario en Firestore
    //    para consistencia y para que otras partes de la app puedan leerlo fácilmente sin decodificar tokens.
    const userDocRef = db.collection('users').doc(uidToSet);
    await userDocRef.update({
      role: newRole,
      updatedAt: new Date().toISOString(), // O FieldValue.serverTimestamp()
    });

    // 4. Si se está estableciendo un rol de médico, crear registro en la colección de médicos
    if (newRole === 'medico') {
      // Obtener información básica del usuario
      const userDoc = await userDocRef.get();
      const userData = userDoc.data();

      // Crear o actualizar documento en la colección de médicos
      const doctorRef = db.collection('doctors').doc(uidToSet);
      await doctorRef.set({
        uid: uidToSet, // Mismo UID que el usuario para mantener consistencia
        name: userData.name || '',
        email: userData.email || '',
        role: 'medico',
        specialty: userData.specialty || '',
        licenseNumber: userData.licenseNumber || '',
        status: 'active',
        patients: [], // Lista vacía inicial de IDs de pacientes
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }, { merge: true }); // El merge: true evita sobrescribir campos existentes

      console.log(`Created/updated doctor profile for user ${uidToSet}`);
    }

    // 5. Si se está estableciendo un rol de empresa, crear registro en la colección de empresas
    if (newRole === 'empresa') {
      // Similar al caso del médico, crear documento en colección de empresas
      const companyRef = db.collection('companies').doc(uidToSet);
      await companyRef.set({
        uid: uidToSet,
        role: 'empresa',
        status: 'active',
        doctors: [], // Lista vacía inicial de IDs de médicos asociados
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      console.log(`Created/updated company profile for user ${uidToSet}`);
    }

    // Los custom claims se propagan a los tokens ID la próxima vez que el usuario inicie sesión
    // o cuando su token actual se refresque (generalmente cada hora).
    // Para forzar la actualización del token en el cliente, el usuario podría necesitar cerrar y volver a iniciar sesión,
    // o podrías implementar una lógica de refresh de token más proactiva en el cliente.

    return NextResponse.json({ message: `Successfully set role '${newRole}' for user ${uidToSet}. Custom claims will propagate on next token refresh.` }, { status: 200 });

  } catch (error) {
    console.error(`Error setting custom claims or updating Firestore for user ${uidToSet}:`, error);
    let errorMessage = 'Failed to set role.';
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'User not found in Firebase Authentication.';
      return NextResponse.json({ error: errorMessage }, { status: 404 });
    }
    return NextResponse.json({ error: errorMessage, details: error.message }, { status: 500 });
  }
}
