import { patientSummaryFlow } from '@/lib/genkit.js'; // Corrected to use the alias
import { adminAuth } from '@firebase/admin'; // Import adminAuth
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const authorization = req.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json({ error: 'Unauthorized: Missing or invalid token' }, { status: 401 });
    }
    const idToken = authorization.split("Bearer ")[1];

    try {
      await adminAuth.verifyIdToken(idToken);
    } catch (error) {
      console.error("[API Patient Summary POST] Invalid token:", error);
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const { anamnesis } = await req.json();
    if (!anamnesis) {
      return NextResponse.json({ error: 'Falta anamnesis' }, { status: 400 });
    }
    const summary = await patientSummaryFlow(anamnesis);
    return NextResponse.json({ summary });
  } catch (error) {
    console.error("[API Patient Summary POST] Error:", error);
    return NextResponse.json({ error: 'Failed to process patient summary', details: error.message }, { status: 500 });
  }
}
