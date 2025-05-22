const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

// Si aún no se ha inicializado admin, inicializarlo
if (!admin.apps.length) {
  admin.initializeApp();
}

// Configuración para envío de correos
let transporter = null;

/**
 * Configura el transporter de nodemailer según las variables de entorno
 */
function getTransporter() {
  if (transporter) return transporter;
  
  // Obtener configuración desde Firebase Functions Config
  const mailConfig = functions.config().mail || {};
  
  if (!mailConfig.user || !mailConfig.pass) {
    console.error('Error: Configuración de correo no encontrada');
    return null;
  }
  
  // Crear transporter de nodemailer
  transporter = nodemailer.createTransport({
    service: mailConfig.service || 'gmail',
    auth: {
      user: mailConfig.user,
      pass: mailConfig.pass
    }
  });
  
  return transporter;
}

/**
 * Cloud Function que se activa cuando un error se registra en Firestore
 * Envía un correo electrónico a los destinatarios configurados
 */
exports.sendErrorNotification = functions.firestore
  .document('system_errors/{errorId}')
  .onCreate(async (snapshot, context) => {
    const errorData = snapshot.data();
    
    if (!errorData) {
      console.error('Error: No se encontraron datos de error');
      return null;
    }
    
    // Obtener la configuración de notificaciones
    const notificationConfigSnapshot = await admin.firestore()
      .collection('system_config')
      .doc('error_notifications')
      .get();
    
    if (!notificationConfigSnapshot.exists) {
      console.error('Error: Configuración de notificaciones no encontrada');
      return null;
    }
    
    const config = notificationConfigSnapshot.data();
    
    // Verificar si este tipo de error debe ser notificado
    const errorType = errorData.type || 'general';
    if (config.enabledTypes && !config.enabledTypes.includes(errorType)) {
      console.log(`Notificación para tipo de error '${errorType}' está desactivada`);
      return null;
    }
    
    // Configurar destinatarios
    const recipients = config.recipients || [];
    if (recipients.length === 0) {
      console.error('Error: No se encontraron destinatarios configurados');
      return null;
    }
    
    // Obtener transporter
    const mailer = getTransporter();
    if (!mailer) {
      console.error('Error: No se pudo configurar el transporte de correo');
      return null;
    }
    
    // Preparar contenido del email
    const errorTime = errorData.timestamp 
      ? new Date(errorData.timestamp).toLocaleString('es-ES')
      : new Date().toLocaleString('es-ES');
    
    const severity = errorData.severity || 'info';
    const severityEmoji = {
      critical: '🔴',
      error: '🟠',
      warning: '🟡',
      info: '🔵'
    }[severity] || '🔵';
    
    const mailOptions = {
      from: `"Sistema PR Quality" <${functions.config().mail.user}>`,
      to: recipients.join(', '),
      subject: `${severityEmoji} [PR Quality] Error ${severity}: ${errorData.message?.substring(0, 50) || 'Error del sistema'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #d33; border-bottom: 1px solid #eee; padding-bottom: 10px;">
            Alerta de Error - PR Quality
          </h2>
          
          <div style="background: ${severity === 'critical' ? '#fff0f0' : '#f9f9f9'}; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Tipo:</strong> ${errorData.type || 'General'}</p>
            <p><strong>Severidad:</strong> ${severity.toUpperCase()}</p>
            <p><strong>Fecha/Hora:</strong> ${errorTime}</p>
            <p><strong>Mensaje:</strong> ${errorData.message || 'No disponible'}</p>
            ${errorData.location ? `<p><strong>Ubicación:</strong> ${errorData.location}</p>` : ''}
          </div>
          
          ${errorData.stack ? `
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0; overflow-x: auto;">
            <h3 style="margin-top: 0;">Stack Trace:</h3>
            <pre style="white-space: pre-wrap; font-family: monospace;">${errorData.stack}</pre>
          </div>
          ` : ''}
          
          <div style="margin-top: 30px; font-size: 12px; color: #777; text-align: center;">
            <p>Este es un mensaje automático del sistema. Por favor no responda a este correo.</p>
            <p>Para gestionar las notificaciones, visite el panel de administración.</p>
          </div>
        </div>
      `
    };
    
    try {
      await mailer.sendMail(mailOptions);
      console.log(`Notificación de error enviada a ${recipients.length} destinatarios`);
      
      // Actualizar el documento para marcar que se envió la notificación
      await snapshot.ref.update({
        notificationSent: true,
        notificationTime: admin.firestore.FieldValue.serverTimestamp()
      });
      
      return null;
    } catch (error) {
      console.error('Error al enviar notificación por correo:', error);
      
      // Registrar el error de envío
      await snapshot.ref.update({
        notificationSent: false,
        notificationError: error.message
      });
      
      return null;
    }
  });

/**
 * Función auxiliar para registrar errores críticos desde cualquier parte de la aplicación
 * Esta función se puede llamar tanto desde el cliente como desde el servidor
 */
exports.logError = functions.https.onCall(async (data, context) => {
  // Verificar si el usuario está autenticado
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Solo usuarios autenticados pueden registrar errores'
    );
  }
  
  // Datos requeridos
  if (!data.message) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Se requiere un mensaje de error'
    );
  }
  
  // Datos del error
  const errorData = {
    message: data.message,
    type: data.type || 'general',
    severity: data.severity || 'error',
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    location: data.location || null,
    stack: data.stack || null,
    user: {
      uid: context.auth.uid,
      email: context.auth.token.email || null,
      role: context.auth.token.role || null
    },
    userAgent: data.userAgent || null,
    metadata: data.metadata || {}
  };
  
  try {
    // Guardar error en Firestore para activar la notificación
    const docRef = await admin.firestore()
      .collection('system_errors')
      .add(errorData);
    
    return { success: true, errorId: docRef.id };
  } catch (error) {
    console.error('Error al registrar el error:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Error al registrar el error en la base de datos'
    );
  }
});
