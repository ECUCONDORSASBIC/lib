import { getPatientsList, savePatientData } from '@/lib/firebase';
import { adminAuth } from '@/lib/firebase/firebaseAdmin'; // Import adminAuth
import { NextResponse } from 'next/server';

/**
 * GET handler for retrieving all patients
 * @param {Request} request
 */
export async function GET(request) {
  try {
    const authorization = request.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json({ error: 'Unauthorized: Missing or invalid token' }, { status: 401 });
    }
    const idToken = authorization.split("Bearer ")[1];

    try {
      await adminAuth.verifyIdToken(idToken);
    } catch (error) {
      console.error("[API Patients GET] Invalid token:", error);
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    // Get URL search params
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get('sortBy') || 'lastUpdated';
    const priority = searchParams.get('priority');

    // Get patients with optional filters
    const options = { sortField: sortBy };
    const patients = await getPatientsList(options);

    // Filter by priority if specified
    const filteredPatients = priority
      ? patients.filter(p => p.priority?.toLowerCase() === priority.toLowerCase())
      : patients;

    return NextResponse.json({
      patients: filteredPatients,
      count: filteredPatients.length
    }, { status: 200 });
  } catch (error) {
    console.error("[API Patients GET] Error:", error);
    return NextResponse.json(
      { error: 'Failed to fetch patients' },
      { status: 500 }
    );
  }
}

/**
 * POST handler for creating new patients
 * @param {Request} request
 */
export async function POST(request) {
  try {
    const authorization = request.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json({ error: 'Unauthorized: Missing or invalid token' }, { status: 401 });
    }
    const idToken = authorization.split("Bearer ")[1];

    try {
      await adminAuth.verifyIdToken(idToken);
    } catch (error) {
      console.error("[API Patients POST] Invalid token:", error);
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    // Parse request body
    const data = await request.json();

    // Validate required fields
    if (!data.identificacion?.nombre) {
      return NextResponse.json(
        { error: 'El nombre del paciente es requerido' },
        { status: 400 }
      );
    }

    // Save patient data
    const patientId = await savePatientData(data);

    return NextResponse.json({
      success: true,
      id: patientId,
      message: 'Paciente creado exitosamente'
    }, { status: 201 });
  } catch (error) {
    console.error("[API Patients POST] Error:", error);
    return NextResponse.json(
      { error: 'Failed to create patient' },
      { status: 500 }
    );
  }
}
