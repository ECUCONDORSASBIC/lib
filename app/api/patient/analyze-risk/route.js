import { adminDb, authAdmin } from '@/lib/firebase/firebaseAdmin';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Verificar autenticación
    const authorization = request.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json({ error: 'No se proporcionó un token de autenticación' }, { status: 401 });
    }
    const idToken = authorization.split("Bearer ")[1]; try {
      await authAdmin.verifyIdToken(idToken);
    } catch (error) {
      console.error("Error al verificar el token:", error);
      return NextResponse.json({ error: 'Token inválido o vencido' }, { status: 401 });
    }

    const body = await request.json();
    const { patientId } = body;

    if (!patientId) {
      return NextResponse.json({ error: 'Se requiere el ID del paciente' }, { status: 400 });
    }

    // Obtener los datos de anamnesis actuales
    const anamnesisRef = adminDb.doc(`patients/${patientId}/medical/anamnesis`);
    const anamnesisDoc = await anamnesisRef.get();

    if (!anamnesisDoc.exists) {
      return NextResponse.json({
        error: 'No se encontraron datos de anamnesis para este paciente'
      }, { status: 404 });
    }

    // La Cloud Function se activará automáticamente al detectar cambios en el documento
    // Aquí simplemente forzamos una pequeña actualización para activarla si es necesario
    await anamnesisRef.update({
      lastAnalysisRequest: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Solicitud de análisis enviada correctamente'
    });
  } catch (error) {
    console.error("Error al procesar la solicitud:", error);
    return NextResponse.json({
      error: 'Error al procesar la solicitud',
      details: error.message
    }, { status: 500 });
  }
}
