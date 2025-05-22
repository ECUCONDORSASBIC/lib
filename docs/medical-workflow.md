# Documentación del Flujo de Trabajo para Médicos

## Visión General

El dashboard médico permite a los profesionales de la salud gestionar citas, pacientes y consultas, incluyendo funcionalidades de telemedicina. Esta guía describe los flujos principales y su implementación técnica.

## Flujo de Autenticación

1. **Inicio de sesión**:
   - El médico inicia sesión a través de `/login`
   - Al autenticarse correctamente, es redirigido a `/dashboard/medico`

2. **Verificación de rol**:
   - El sistema verifica que el usuario tenga el rol `medico` (normalizado)
   - Si el rol no coincide, se redirige al dashboard correspondiente a su rol

## Flujo de Consultas y Citas

1. **Gestión de citas**:
   - Vista principal: `/dashboard/medico/consultas`
   - Detalle de cita: `/dashboard/medico/consultas/:appointmentId`
   - Finalización: `/dashboard/medico/consultas/:appointmentId/finalizar`

2. **Telemedicina**:
   - Inicio de consulta: `/dashboard/medico/consulta/:appointmentId`
   - Durante la consulta, se utilizan los servicios de video y chat
   - Al finalizar, se redirige a la página de finalización de consulta

## Flujo de Gestión de Pacientes

1. **Lista de pacientes**:
   - Vista principal: `/dashboard/medico/pacientes`
   - Búsqueda y filtrado de pacientes
   - Acceso a historiales médicos

2. **Detalles del paciente**:
   - Perfil del paciente: `/dashboard/medico/pacientes/:patientId`
   - Historial médico: `/dashboard/medico/pacientes/:patientId/historial`
   - Métricas de salud: `/dashboard/medico/pacientes/:patientId/metricas-salud`

## Relaciones Médico-Paciente

Las relaciones entre médicos y pacientes son gestionadas por la API en:
- `/api/doctor/patient-relationships`

Esta API permite:
- Crear nuevas relaciones médico-paciente
- Listar los pacientes de un médico
- Actualizar el estado de las relaciones
- Terminar relaciones

## Relaciones Médico-Empresa

Las relaciones entre médicos y empresas son gestionadas por la API en:
- `/api/company/doctor-relationships`

Esta API permite:
- Vincular médicos a empresas
- Establecer términos y condiciones
- Gestionar los tipos de relación (empleado, contratista)
