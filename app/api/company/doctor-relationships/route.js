import { authAdmin, db } from '@/lib/firebase/firebaseAdmin';
import { NextResponse } from 'next/server';

/**
 * API para gestionar las relaciones entre empresas y médicos
 * Esta ruta permite crear, listar y eliminar relaciones empresa-médico
 */

// GET: Obtener todas las relaciones de una empresa con médicos
export async function GET(request) {
    try {
        // Verificar autenticación y obtener el ID de la empresa del token
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

        // Solo empresas y admins pueden ver estas relaciones
        if (role !== 'empresa' && role !== 'admin') {
            return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 403 });
        }

        // Obtener el ID de la empresa del query param (admin) o del token (empresa)
        const url = new URL(request.url);
        const companyId = role === 'admin' ? url.searchParams.get('companyId') : uid;

        if (!companyId) {
            return NextResponse.json({ error: 'ID de empresa requerido' }, { status: 400 });
        }

        // Obtener todas las relaciones activas de la empresa con médicos
        const relationshipsRef = db.collection('company_doctor_relationships')
            .where('companyId', '==', companyId)
            .where('status', '==', 'active');

        const relationshipsSnapshot = await relationshipsRef.get();

        // Transformar los datos para la respuesta
        const relationships = [];
        for (const doc of relationshipsSnapshot.docs) {
            const data = doc.data();

            // Obtener datos básicos del médico para enriquecer la respuesta
            const doctorDoc = await db.collection('users').doc(data.doctorId).get();
            const doctorData = doctorDoc.exists ? doctorDoc.data() : null;

            relationships.push({
                id: doc.id,
                companyId: data.companyId,
                doctorId: data.doctorId,
                relationship: data.relationship || 'employee', // tipo de relación: employee, contractor, etc.
                startDate: data.startDate,
                status: data.status,
                doctor: doctorData ? {
                    name: doctorData.name || '',
                    email: doctorData.email || '',
                    specialty: doctorData.specialty || '',
                    licenseNumber: doctorData.licenseNumber || ''
                } : null
            });
        }

        return NextResponse.json({ relationships });

    } catch (error) {
        console.error('Error al obtener relaciones empresa-médico:', error);
        return NextResponse.json({
            error: 'Error en el servidor',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}

// POST: Crear una nueva relación empresa-médico
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

        // Solo empresas y admins pueden crear estas relaciones
        if (role !== 'empresa' && role !== 'admin') {
            return NextResponse.json({ error: 'No tiene permisos para crear esta relación' }, { status: 403 });
        }

        // Obtener datos del cuerpo de la solicitud
        const requestData = await request.json();
        const { companyId, doctorId, relationship, terms } = requestData;

        if (!companyId || !doctorId) {
            return NextResponse.json({ error: 'Se requieren IDs de empresa y médico' }, { status: 400 });
        }

        // Si es empresa, solo puede crear relaciones para sí misma
        if (role === 'empresa' && companyId !== uid) {
            return NextResponse.json({ error: 'Una empresa solo puede crear relaciones para sí misma' }, { status: 403 });
        }

        // Verificar que el médico existe y tiene rol de médico
        const doctorDoc = await db.collection('users').doc(doctorId).get();
        if (!doctorDoc.exists || doctorDoc.data().role !== 'medico') {
            return NextResponse.json({ error: 'El médico no existe o no tiene rol de médico' }, { status: 404 });
        }

        // Verificar que la empresa existe
        const companyDoc = await db.collection('users').doc(companyId).get();
        if (!companyDoc.exists || companyDoc.data().role !== 'empresa') {
            return NextResponse.json({ error: 'La empresa no existe o no tiene rol de empresa' }, { status: 404 });
        }

        // Verificar si ya existe una relación activa
        const existingRelationshipRef = db.collection('company_doctor_relationships')
            .where('companyId', '==', companyId)
            .where('doctorId', '==', doctorId)
            .where('status', '==', 'active');

        const existingRelationship = await existingRelationshipRef.get();

        if (!existingRelationship.empty) {
            return NextResponse.json({ error: 'Ya existe una relación activa entre esta empresa y médico' }, { status: 409 });
        }

        // Crear la nueva relación
        const relationshipData = {
            companyId,
            doctorId,
            relationship: relationship || 'employee', // Por defecto "employee"
            terms: terms || {}, // Términos específicos de la relación (opcional)
            startDate: new Date().toISOString(),
            createdBy: {
                uid,
                role
            },
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const relationshipRef = await db.collection('company_doctor_relationships').add(relationshipData);

        // Actualizar la lista de médicos en el documento de la empresa
        await db.collection('companies').doc(companyId).update({
            doctors: admin.firestore.FieldValue.arrayUnion(doctorId),
            updatedAt: new Date().toISOString()
        });

        // Actualizar la lista de empresas en el documento del médico
        await db.collection('doctors').doc(doctorId).update({
            companies: admin.firestore.FieldValue.arrayUnion(companyId),
            updatedAt: new Date().toISOString()
        });

        return NextResponse.json({
            success: true,
            relationshipId: relationshipRef.id,
            message: 'Relación empresa-médico creada exitosamente'
        });

    } catch (error) {
        console.error('Error al crear relación empresa-médico:', error);
        return NextResponse.json({
            error: 'Error en el servidor',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}

// PUT: Actualizar una relación empresa-médico (por ejemplo, cambiar términos o tipo de relación)
export async function PUT(request) {
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

        // Solo empresas y admins pueden actualizar estas relaciones
        if (role !== 'empresa' && role !== 'admin') {
            return NextResponse.json({ error: 'No tiene permisos para actualizar esta relación' }, { status: 403 });
        }

        // Obtener datos del cuerpo de la solicitud
        const requestData = await request.json();
        const { id, relationship, terms } = requestData;

        if (!id) {
            return NextResponse.json({ error: 'Se requiere ID de la relación' }, { status: 400 });
        }

        // Obtener la relación actual
        const relationshipRef = db.collection('company_doctor_relationships').doc(id);
        const relationshipDoc = await relationshipRef.get();

        if (!relationshipDoc.exists) {
            return NextResponse.json({ error: 'La relación no existe' }, { status: 404 });
        }

        const relationshipData = relationshipDoc.data();

        // Si es empresa, solo puede actualizar sus propias relaciones
        if (role === 'empresa' && relationshipData.companyId !== uid) {
            return NextResponse.json({ error: 'Una empresa solo puede actualizar sus propias relaciones' }, { status: 403 });
        }

        // Preparar datos a actualizar
        const updateData = {
            updatedAt: new Date().toISOString(),
            updatedBy: {
                uid,
                role
            }
        };

        // Actualizar campos si se proporcionaron
        if (relationship) updateData.relationship = relationship;
        if (terms) updateData.terms = terms;

        // Actualizar la relación
        await relationshipRef.update(updateData);

        return NextResponse.json({
            success: true,
            message: 'Relación empresa-médico actualizada exitosamente'
        });

    } catch (error) {
        console.error('Error al actualizar relación empresa-médico:', error);
        return NextResponse.json({
            error: 'Error en el servidor',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}

// DELETE: Finalizar una relación empresa-médico
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

        // Obtener ID de la relación a finalizar
        const url = new URL(request.url);
        const relationshipId = url.searchParams.get('id');

        if (!relationshipId) {
            return NextResponse.json({ error: 'Se requiere ID de la relación' }, { status: 400 });
        }

        // Obtener la relación
        const relationshipRef = db.collection('company_doctor_relationships').doc(relationshipId);
        const relationshipDoc = await relationshipRef.get();

        if (!relationshipDoc.exists) {
            return NextResponse.json({ error: 'La relación no existe' }, { status: 404 });
        }

        const relationshipData = relationshipDoc.data();

        // Verificar permisos para finalizar la relación
        const canEnd =
            role === 'admin' ||
            (role === 'empresa' && relationshipData.companyId === uid) ||
            (role === 'medico' && relationshipData.doctorId === uid); // Los médicos también pueden finalizar sus propias relaciones

        if (!canEnd) {
            return NextResponse.json({ error: 'No tiene permisos para finalizar esta relación' }, { status: 403 });
        }

        // No eliminar físicamente, solo marcar como inactiva
        await relationshipRef.update({
            status: 'inactive',
            endDate: new Date().toISOString(),
            endedBy: {
                uid,
                role
            },
            updatedAt: new Date().toISOString()
        });

        // Actualizar la lista de médicos en el documento de la empresa
        await db.collection('companies').doc(relationshipData.companyId).update({
            doctors: admin.firestore.FieldValue.arrayRemove(relationshipData.doctorId),
            updatedAt: new Date().toISOString()
        });

        // Actualizar la lista de empresas en el documento del médico
        await db.collection('doctors').doc(relationshipData.doctorId).update({
            companies: admin.firestore.FieldValue.arrayRemove(relationshipData.companyId),
            updatedAt: new Date().toISOString()
        });

        return NextResponse.json({
            success: true,
            message: 'Relación empresa-médico finalizada exitosamente'
        });

    } catch (error) {
        console.error('Error al finalizar relación empresa-médico:', error);
        return NextResponse.json({
            error: 'Error en el servidor',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}
