import { getDocuments, saveDocument } from '@/app/services/videoCallAndDocumentService';
import { NextResponse } from 'next/server';

// GET: Devuelve los documentos médicos del paciente autenticado
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
    const docs = await getDocuments(patientId);
    return NextResponse.json({ success: true, data: docs });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error al obtener documentos médicos.', error: error.message }, { status: 500 });
  }
}

// POST: Guarda un documento médico en el historial del paciente
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
    const documentData = await request.json();
    await saveDocument(patientId, documentData);
    return NextResponse.json({ success: true, message: 'Documento guardado.' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error al guardar documento.', error: error.message }, { status: 500 });
  }
}
