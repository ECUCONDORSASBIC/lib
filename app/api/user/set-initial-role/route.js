import { authAdmin, db, initializeFirebaseAdmin } from '@firebase/admin';
import { NextResponse } from 'next/server';

export async function POST(request) {
  initializeFirebaseAdmin(); // Asegura que Firebase Admin SDK esté inicializado

  if (!authAdmin || !db) {
    console.error('set-initial-role API: authAdmin or db service is not available.');
    return NextResponse.json({ error: 'Error de configuración del servidor.' }, { status: 500 });
  }

  try {
    const authorizationHeader = request.headers.get('Authorization');
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token de autorización no proporcionado.' }, { status: 401 });
    }
    const idToken = authorizationHeader.split('Bearer ')[1];

    let decodedToken;
    try {
      decodedToken = await authAdmin.verifyIdToken(idToken);
    } catch (error) {
      console.error('Error al verificar el token en set-initial-role:', error);
      return NextResponse.json({ error: 'Token inválido o expirado.' }, { status: 401 });
    }

    const uid = decodedToken.uid;    const { role: selectedRole } = await request.json();

    // Validar el rol seleccionado
    const allowedRoles = ['patient', 'doctor', 'employer']; // Roles que el usuario puede auto-asignarse
    if (!selectedRole || !allowedRoles.includes(selectedRole)) {
      return NextResponse.json({ error: 'Rol inválido o no proporcionado.' }, { status: 400 });
    }

    // Verificar si el usuario ya tiene un rol (custom claim o en Firestore)
    const userRecord = await authAdmin.getUser(uid);
    if (userRecord.customClaims && userRecord.customClaims.role) {
      return NextResponse.json({ error: 'El rol para este usuario ya ha sido establecido (claim).' }, { status: 403 });
    }

    const userDocRef = db.collection('users').doc(uid);
    const userDoc = await userDocRef.get();

    if (userDoc.exists && userDoc.data()?.role) {
      return NextResponse.json({ error: 'El rol para este usuario ya ha sido establecido (Firestore).' }, { status: 403 });
    }

    // Establecer el custom claim y actualizar/crear documento en Firestore
    await authAdmin.setCustomUserClaims(uid, { role: selectedRole });

    const userDataToUpdate = {
      role: selectedRole,
      roleSetByUserAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (userDoc.exists) {
      await userDocRef.update(userDataToUpdate);
    } else {
      // Si el documento del usuario no existe, créalo con la información básica y el rol.
      await userDocRef.set({
        uid: uid,
        email: decodedToken.email || userRecord.email, // Usar email del token o del userRecord
        name: decodedToken.name || userRecord.displayName || '', // Usar nombre del token o del userRecord
        createdAt: new Date().toISOString(),
        ...userDataToUpdate
      }, { merge: true });
    }

    return NextResponse.json({ message: 'Rol establecido exitosamente. El cambio se reflejará en tu próxima actualización de sesión.' }, { status: 200 });

  } catch (error) {
    console.error('Error en la API set-initial-role:', error);
    // Evitar exponer detalles internos del error si no es necesario
    let clientErrorMessage = 'Error interno del servidor al establecer el rol.';
    if (error.code === 'auth/user-not-found') {
      clientErrorMessage = 'Usuario no encontrado.';
    }
    return NextResponse.json({ error: clientErrorMessage, details: process.env.NODE_ENV === 'development' ? error.message : undefined }, { status: 500 });
  }
}
