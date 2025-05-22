import { getDashboardBaseUrl } from '@/app/utils/roleUtils';

const TelemedicineSession = ({ appointmentId }) => {
    // ...existing code...

    const endCall = async () => {
        try {
            // Utilizamos la utilidad para obtener la ruta base correcta
            const userRole = user?.role || 'paciente';
            const baseUrl = getDashboardBaseUrl(userRole);

            const redirectPath = isDoctor
                ? `${baseUrl}/consultas/${appointmentId}/finalizar`
                : `${baseUrl}/${user.uid}`;

            // ...existing code...
        } catch (err) {
            // ...existing code...
        }
    };

    // ...existing code...
};