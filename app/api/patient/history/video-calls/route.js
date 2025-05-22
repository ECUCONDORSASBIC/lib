import { getVideoCalls } from '@/app/services/videoCallAndDocumentService';
import { NextResponse } from 'next/server';

// GET: Devuelve el historial de videollamadas del paciente autenticado
export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'No autorizado: falta el token Bearer.' }, { status: 401 });
    }
    // Aquí deberías verificar el token y extraer el patientId real
    // const token = authHeader.split(' ')[1];
    // const patientId = await verifyAndExtractPatientId(token);
    // Simulación:
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    if (!patientId) {
      return NextResponse.json({ success: false, message: 'Falta patientId.' }, { status: 400 });
    }
    const calls = await getVideoCalls(patientId);
    return NextResponse.json({ success: true, data: calls });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error al obtener historial de videollamadas.', error: error.message }, { status: 500 });
  }
}

// POST: Guarda una videollamada en el historial del paciente
export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'No autorizado: falta el token Bearer.' }, { status: 401 });
    }
    // Aquí deberías verificar el token y extraer el patientId real
    // const token = authHeader.split(' ')[1];
    // const patientId = await verifyAndExtractPatientId(token);
    // Simulación:
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    if (!patientId) {
      return NextResponse.json({ success: false, message: 'Falta patientId.' }, { status: 400 });
    }
    const callData = await request.json();
    await saveVideoCall(patientId, callData);
    return NextResponse.json({ success: true, message: 'Videollamada guardada.' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error al guardar videollamada.', error: error.message }, { status: 500 });
  }
}
