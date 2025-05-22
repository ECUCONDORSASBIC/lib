import { authAdmin, db } from '@/lib/firebase/firebaseAdmin';
import { NextResponse } from 'next/server';

/**
 * API para gestionar las relaciones entre médicos y pacientes
 * Esta ruta permite crear, listar y eliminar relaciones médico-paciente
 */

// GET: Obtener todas las relaciones de un médico con pacientes
export async function GET(request) {
    try {
        // Verificar autenticación y obtener el ID del médico del token
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Autenticación requerida' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        let decodedToken;
        try {
            decodedToken = await authAdmin.verifyIdToken(token);
        } catch (error) {
            console.error('Error al verificar token:', error);
            return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 401 });
        }

        const uid = decodedToken.uid;
        const role = decodedToken.role;

        // Solo médicos pueden ver sus relaciones con pacientes
        if (role !== 'medico' && role !== 'admin') {
            return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 403 });
        }

        // Obtener el ID del médico del query param (admin) o del token (médico)
        const url = new URL(request.url);
        const doctorId = role === 'admin' ? url.searchParams.get('doctorId') : uid;

        if (!doctorId) {
            return NextResponse.json({ error: 'ID de médico requerido' }, { status: 400 });
        }

        // Obtener todas las relaciones activas del médico
        const relationshipsRef = db.collection('doctor_patient_relationships')
            .where('doctorId', '==', doctorId)
            .where('status', '==', 'active');

        const relationshipsSnapshot = await relationshipsRef.get();

        // Transformar los datos para la respuesta
        const relationships = [];
        for (const doc of relationshipsSnapshot.docs) {
            const data = doc.data();

            // Obtener datos básicos del paciente para enriquecer la respuesta
            const patientDoc = await db.collection('users').doc(data.patientId).get();
            const patientData = patientDoc.exists ? patientDoc.data() : null;

            relationships.push({
                id: doc.id,
                doctorId: data.doctorId,
                patientId: data.patientId,
                assignedDate: data.assignedDate,
                status: data.status,
                patient: patientData ? {
                    name: patientData.name || '',
                    email: patientData.email || '',
                    birthDate: patientData.birthDate || '',
                    gender: patientData.gender || ''
                } : null
            });
        }

        return NextResponse.json({ relationships });

    } catch (error) {
        console.error('Error al obtener relaciones médico-paciente:', error);
        return NextResponse.json({
            error: 'Error en el servidor',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}

// POST: Crear una nueva relación médico-paciente
export async function POST(request) {
    try {
        // Verificar autenticación
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Autenticación requerida' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        let decodedToken;
        try {
            decodedToken = await authAdmin.verifyIdToken(token);
        } catch (error) {
            console.error('Error al verificar token:', error);
            return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 401 });
        }

        const uid = decodedToken.uid;
        const role = decodedToken.role;

        // Roles permitidos: médico, admin, empresa (puede asignar médicos)
        if (!['medico', 'admin', 'empresa'].includes(role)) {
            return NextResponse.json({ error: 'No tiene permisos para crear esta relación' }, { status: 403 });
        }

        // Obtener datos del cuerpo de la solicitud
        const requestData = await request.json();
        const { doctorId, patientId, notes } = requestData;

        if (!doctorId || !patientId) {
            return NextResponse.json({ error: 'Se requieren IDs de médico y paciente' }, { status: 400 });
        }

        // Si es médico, solo puede crear relaciones para sí mismo
        if (role === 'medico' && doctorId !== uid) {
            return NextResponse.json({ error: 'Un médico solo puede crear relaciones para sí mismo' }, { status: 403 });
        }

        // Verificar si el paciente existe
        const patientDoc = await db.collection('users').doc(patientId).get();
        if (!patientDoc.exists) {
            return NextResponse.json({ error: 'El paciente no existe' }, { status: 404 });
        }

        // Verificar si el médico existe
        const doctorDoc = await db.collection('users').doc(doctorId).get();
        if (!doctorDoc.exists) {
            return NextResponse.json({ error: 'El médico no existe' }, { status: 404 });
        }

        // Verificar si ya existe una relación activa
        const existingRelationshipRef = db.collection('doctor_patient_relationships')
            .where('doctorId', '==', doctorId)
            .where('patientId', '==', patientId)
            .where('status', '==', 'active');

        const existingRelationship = await existingRelationshipRef.get();

        if (!existingRelationship.empty) {
            return NextResponse.json({ error: 'Ya existe una relación activa entre este médico y paciente' }, { status: 409 });
        }

        // Crear la nueva relación
        const relationshipData = {
            doctorId,
            patientId,
            assignedDate: new Date().toISOString(),
            assignedBy: {
                uid,
                role
            },
            status: 'active',
            notes: notes || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const relationshipRef = await db.collection('doctor_patient_relationships').add(relationshipData);

        // Actualizar la lista de pacientes en el documento del médico
        await db.collection('doctors').doc(doctorId).update({
            patients: admin.firestore.FieldValue.arrayUnion(patientId),
            updatedAt: new Date().toISOString()
        });

        return NextResponse.json({
            success: true,
            relationshipId: relationshipRef.id,
            message: 'Relación médico-paciente creada exitosamente'
        });

    } catch (error) {
        console.error('Error al crear relación médico-paciente:', error);
        return NextResponse.json({
            error: 'Error en el servidor',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}

// DELETE: Finalizar una relación médico-paciente
export async function DELETE(request) {
    try {
        // Verificar autenticación
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Autenticación requerida' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        let decodedToken;
        try {
            decodedToken = await authAdmin.verifyIdToken(token);
        } catch (error) {
            console.error('Error al verificar token:', error);
            return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 401 });
        }

        const uid = decodedToken.uid;
        const role = decodedToken.role;

        // Obtener datos de la URL para saber qué relación eliminar
        const url = new URL(request.url);
        const relationshipId = url.searchParams.get('id');
        const doctorId = url.searchParams.get('doctorId');
        const patientId = url.searchParams.get('patientId');

        // Se requiere o el ID de la relación, o ambos IDs de médico y paciente
        if (!relationshipId && (!doctorId || !patientId)) {
            return NextResponse.json({
                error: 'Se requiere el ID de la relación o ambos IDs: médico y paciente'
            }, { status: 400 });
        }

        let relationshipRef;

        if (relationshipId) {
            relationshipRef = db.collection('doctor_patient_relationships').doc(relationshipId);
        } else {
            // Buscar la relación por doctorId y patientId
            const relationshipsQuery = await db.collection('doctor_patient_relationships')
                .where('doctorId', '==', doctorId)
                .where('patientId', '==', patientId)
                .where('status', '==', 'active')
                .limit(1)
                .get();

            if (relationshipsQuery.empty) {
                return NextResponse.json({ error: 'No se encontró la relación' }, { status: 404 });
            }

            relationshipRef = relationshipsQuery.docs[0].ref;
        }

        // Verificar permisos
        const relationshipDoc = await relationshipRef.get();

        if (!relationshipDoc.exists) {
            return NextResponse.json({ error: 'No se encontró la relación' }, { status: 404 });
        }

        const relationshipData = relationshipDoc.data();

        // Verificar permisos para finalizar la relación
        const canEnd =
            role === 'admin' ||
            (role === 'medico' && relationshipData.doctorId === uid) ||
            (role === 'paciente' && relationshipData.patientId === uid);

        if (!canEnd) {
            return NextResponse.json({ error: 'No tiene permisos para finalizar esta relación' }, { status: 403 });
        }

        // No eliminar físicamente, solo marcar como inactiva
        await relationshipRef.update({
            status: 'inactive',
            endedDate: new Date().toISOString(),
            endedBy: {
                uid,
                role
            },
            updatedAt: new Date().toISOString()
        });

        // Actualizar la lista de pacientes en el documento del médico
        await db.collection('doctors').doc(relationshipData.doctorId).update({
            patients: admin.firestore.FieldValue.arrayRemove(relationshipData.patientId),
            updatedAt: new Date().toISOString()
        });

        return NextResponse.json({
            success: true,
            message: 'Relación médico-paciente finalizada exitosamente'
        });

    } catch (error) {
        console.error('Error al finalizar relación médico-paciente:', error);
        return NextResponse.json({
            error: 'Error en el servidor',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}
