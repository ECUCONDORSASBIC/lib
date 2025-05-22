import { authAdmin, db } from '@firebase/admin';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Extraer datos de la solicitud
    const { uid } = await request.json();

    if (!uid) {
      return NextResponse.json({ error: 'Se requiere el ID de usuario' }, { status: 400 });
    }

    // 1. Verificar que el usuario existe en Firebase Auth
    try {
      await authAdmin.getUser(uid);
    } catch (error) {
      return NextResponse.json({ error: 'Usuario no encontrado en Firebase Auth' }, { status: 404 });
    }

    // 2. Obtener los datos del usuario desde Firestore
    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'Usuario no encontrado en Firestore' }, { status: 404 });
    }

    const userData = userDoc.data();
    const role = userData.role;

    if (!role) {
      return NextResponse.json({ error: 'El usuario no tiene un rol asignado en Firestore' }, { status: 400 });
    }

    // 3. Actualizar los custom claims del usuario
    await authAdmin.setCustomUserClaims(uid, { role });

    // 4. Responder con éxito
    return NextResponse.json({
      success: true,
      message: `El rol '${role}' se ha sincronizado correctamente con los custom claims del usuario`,
      role
    });

  } catch (error) {
    console.error('Error al sincronizar el rol del usuario:', error);
    return NextResponse.json({
      error: 'Error al sincronizar el rol',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
