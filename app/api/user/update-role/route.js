import { authAdmin } from '@firebase/admin';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Extraer datos de la solicitud
    const { userId, role } = await request.json();

    // Validar datos
    if (!userId) {
      return NextResponse.json({ error: 'Se requiere el ID del usuario' }, { status: 400 });
    }

    if (!['admin', 'medico', 'paciente'].includes(role)) {
      return NextResponse.json({ error: 'Rol no válido' }, { status: 400 });
    }

    // Establecer claims personalizados
    await authAdmin.setCustomUserClaims(userId, { role });

    // Responder con éxito
    return NextResponse.json({
      success: true,
      message: `Rol '${role}' asignado correctamente al usuario ${userId}`
    });

  } catch (error) {
    console.error('Error al actualizar el rol del usuario:', error);
    return NextResponse.json({
      error: 'Error al actualizar el rol',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
