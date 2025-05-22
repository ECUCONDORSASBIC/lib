import { getRiskAnalyses } from '@/app/services/historyService';

export async function GET(req) {
  // JWT check placeholder (implementar verificación real)
  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get('patientId');
  if (!patientId) {
    return new Response(JSON.stringify({ error: 'Falta patientId' }), { status: 400 });
  }
  // TODO: Verificar JWT y que el usuario tenga permiso para ver este historial
  const analyses = await getRiskAnalyses(patientId);
  return new Response(JSON.stringify({ analyses }), { status: 200 });
}
