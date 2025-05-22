/**
 * Utilidades administrativas para PR Quality
 * 
 * IMPORTANTE: Este script debe ser ejecutado únicamente por usuarios con permisos administrativos.
 * Proporciona funciones para realizar tareas administrativas como promocionar usuarios a roles médicos,
 * desactivar cuentas problemáticas, y otras funciones administrativas críticas.
 */

const admin = require('firebase-admin');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

// Inicializar Firebase Admin si aún no se ha inicializado
if (!admin.apps.length) {
  try {
    // Intentar cargar las credenciales de un archivo local
    const serviceAccountPath = path.resolve(__dirname, '../service-account.json');
    
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = require(serviceAccountPath);
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      
      console.log('Firebase Admin inicializado correctamente');
    } else {
      console.error('Archivo de credenciales no encontrado en:', serviceAccountPath);
      console.log('Por favor, crea un archivo service-account.json en la raíz del proyecto');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error al inicializar Firebase Admin:', error);
    process.exit(1);
  }
}

// Objetos para interactuar con Firestore y Auth
const db = admin.firestore();
const auth = admin.auth();

// Interfaz para leer líneas desde la terminal
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Preguntar al usuario con promesa
function pregunta(texto) {
  return new Promise((resolve) => {
    rl.question(texto, (respuesta) => {
      resolve(respuesta);
    });
  });
}

// Función para promocionar un usuario a médico
async function promocionarAMedico(email) {
  try {
    // Verificar si el usuario existe
    const userRecord = await auth.getUserByEmail(email);
    
    // Establecer claims para rol de médico - estandarizado a 'doctor'
    await auth.setCustomUserClaims(userRecord.uid, { role: 'doctor' });
    
    // Actualizar documento en Firestore - usar 'doctor' aquí también
    const userRef = db.collection('users').doc(userRecord.uid);
    await userRef.update({
      role: 'doctor',
      updatedAt: new Date().toISOString(),
      updatedBy: 'admin-script'
    });
    
    console.log(`✅ Usuario ${email} (${userRecord.uid}) promocionado a médico correctamente.`);
    
    return true;
  } catch (error) {
    console.error(`❌ Error al promocionar usuario ${email}:`, error.message);
    return false;
  }
}

// Función para promocionar a administrador
async function promocionarAAdmin(email) {
  try {
    // Verificar si el usuario existe
    const userRecord = await auth.getUserByEmail(email);
    
    // Establecer claims para rol de admin - estandarizado a 'admin'
    await auth.setCustomUserClaims(userRecord.uid, { role: 'admin' });
    
    // Actualizar documento en Firestore - usar 'admin' aquí también
    const userRef = db.collection('users').doc(userRecord.uid);
    await userRef.update({
      role: 'admin',
      updatedAt: new Date().toISOString(),
      updatedBy: 'admin-script'
    });
    
    console.log(`✅ Usuario ${email} (${userRecord.uid}) promocionado a administrador correctamente.`);
    
    return true;
  } catch (error) {
    console.error(`❌ Error al promocionar usuario ${email}:`, error.message);
    return false;
  }
}

// Función para promocionar a empresa/employer
async function promocionarAEmpresa(email) {
  try {
    // Verificar si el usuario existe
    const userRecord = await auth.getUserByEmail(email);
    
    // Establecer claims para rol de empresa - estandarizado a 'employer'
    await auth.setCustomUserClaims(userRecord.uid, { role: 'employer' });
    
    // Actualizar documento en Firestore - usar 'employer' aquí también
    const userRef = db.collection('users').doc(userRecord.uid);
    await userRef.update({
      role: 'employer',
      updatedAt: new Date().toISOString(),
      updatedBy: 'admin-script'
    });
    
    console.log(`✅ Usuario ${email} (${userRecord.uid}) promocionado a empresa correctamente.`);
    
    return true;
  } catch (error) {
    console.error(`❌ Error al promocionar usuario ${email} a empresa:`, error.message);
    return false;
  }
}

// Función para desactivar cuenta
async function desactivarCuenta(email) {
  try {
    // Verificar si el usuario existe
    const userRecord = await auth.getUserByEmail(email);
    
    // Desactivar cuenta en Auth
    await auth.updateUser(userRecord.uid, { disabled: true });
    
    // Actualizar documento en Firestore
    const userRef = db.collection('users').doc(userRecord.uid);
    await userRef.update({
      disabled: true,
      updatedAt: new Date().toISOString(),
      updatedBy: 'admin-script'
    });
    
    console.log(`✅ Cuenta de usuario ${email} (${userRecord.uid}) desactivada correctamente.`);
    
    return true;
  } catch (error) {
    console.error(`❌ Error al desactivar cuenta ${email}:`, error.message);
    return false;
  }
}

// Función para buscar usuario por email
async function buscarUsuario(email) {
  try {
    const userRecord = await auth.getUserByEmail(email);
    
    // Buscar datos adicionales en Firestore
    const userDoc = await db.collection('users').doc(userRecord.uid).get();
    const userData = userDoc.exists ? userDoc.data() : {};
    
    console.log('\nInformación del usuario:');
    console.log('------------------------');
    console.log(`UID: ${userRecord.uid}`);
    console.log(`Email: ${userRecord.email}`);
    console.log(`Nombre: ${userRecord.displayName || userData.name || 'No especificado'}`);
    console.log(`Rol: ${userData.role || 'No especificado'}`);
    console.log(`Estado: ${userRecord.disabled ? 'Desactivado' : 'Activo'}`);
    console.log(`Creado: ${new Date(userRecord.metadata.creationTime).toLocaleString('es-ES')}`);
    console.log(`Último acceso: ${new Date(userRecord.metadata.lastSignInTime).toLocaleString('es-ES')}`);
    
    return userRecord;
  } catch (error) {
    console.error(`❌ Error al buscar usuario ${email}:`, error.message);
    return null;
  }
}

// Función para listar usuarios por rol
async function listarUsuariosPorRol(rol) {
  try {
    console.log(`\nListando usuarios con rol: ${rol || 'todos'}`);
    console.log('-------------------------------');
    
    // Consultar Firestore para obtener usuarios
    let query = db.collection('users');
    
    if (rol && rol !== 'todos') {
      query = query.where('role', '==', rol);
    }
    
    const snapshot = await query.limit(50).get();
    
    if (snapshot.empty) {
      console.log('No se encontraron usuarios.');
      return;
    }
    
    let contador = 0;
    snapshot.forEach((doc) => {
      contador++;
      const userData = doc.data();
      console.log(`${contador}. ${userData.email || 'Email no disponible'} - ${userData.name || 'Sin nombre'} (${userData.role || 'Sin rol'}) - ${userData.disabled ? 'Desactivado' : 'Activo'}`);
    });
    
    console.log(`\nTotal: ${contador} usuarios`);
  } catch (error) {
    console.error('❌ Error al listar usuarios:', error.message);
  }
}

// Función para promocionar múltiples usuarios desde un CSV
async function procesarCSV(rutaArchivo) {
  try {
    if (!fs.existsSync(rutaArchivo)) {
      console.error(`❌ El archivo ${rutaArchivo} no existe.`);
      return;
    }
    
    const contenido = fs.readFileSync(rutaArchivo, 'utf8');
    const lineas = contenido.split('\n');
    
    console.log(`Procesando ${lineas.length} líneas del archivo...`);
    
    let exitos = 0;
    let fallos = 0;
    
    for (let i = 0; i < lineas.length; i++) {
      const linea = lineas[i].trim();
      if (!linea) continue;
      
      const [email, rol] = linea.split(',').map(item => item.trim());
      
      if (!email || !['doctor', 'admin', 'patient', 'employer'].includes(rol)) {
        console.log(`❌ Línea ${i+1}: Formato incorrecto o rol inválido (${email}, ${rol})`);
        fallos++;
        continue;
      }
      
      let resultado = false;
      
      if (rol === 'doctor') {
        resultado = await promocionarAMedico(email);
      } else if (rol === 'admin') {
        resultado = await promocionarAAdmin(email);
      } else if (rol === 'employer') {
        resultado = await promocionarAEmpresa(email);
      } else if (rol === 'patient') {
        // Implementar si es necesario
        console.log(`⚠️ La conversión a paciente no es necesaria, es el rol por defecto.`);
        resultado = true;
      }
      
      if (resultado) {
        exitos++;
      } else {
        fallos++;
      }
    }
    
    console.log(`\nProcesamiento completado: ${exitos} exitosos, ${fallos} fallos.`);
  } catch (error) {
    console.error('❌ Error al procesar el archivo CSV:', error.message);
  }
}

// Función principal que ejecuta el menú interactivo
async function menuPrincipal() {
  console.log('\n=================================================');
  console.log('🛠️  HERRAMIENTAS ADMINISTRATIVAS - PR QUALITY 🛠️');
  console.log('=================================================\n');
  
  while (true) {
    console.log('\nSelecciona una operación:');
    console.log('1. Promocionar usuario a médico');
    console.log('2. Promocionar usuario a administrador');
    console.log('3. Promocionar usuario a empresa');
    console.log('4. Desactivar cuenta de usuario');
    console.log('5. Buscar información de usuario');
    console.log('6. Listar usuarios por rol');
    console.log('7. Procesar CSV de usuarios (promoción masiva)');
    console.log('0. Salir');
    
    const opcion = await pregunta('\nOpción: ');
    
    switch (opcion.trim()) {
      case '1':
        const emailMedico = await pregunta('Email del usuario a promocionar a médico: ');
        await promocionarAMedico(emailMedico);
        break;
      
      case '2':
        const emailAdmin = await pregunta('Email del usuario a promocionar a administrador: ');
        await promocionarAAdmin(emailAdmin);
        break;
      
      case '3':
        const emailEmpresa = await pregunta('Email del usuario a promocionar a empresa: ');
        await promocionarAEmpresa(emailEmpresa);
        break;
      
      case '4':
        const emailDesactivar = await pregunta('Email del usuario a desactivar: ');
        const confirmacion = await pregunta(`¿Estás seguro de desactivar la cuenta ${emailDesactivar}? (s/n): `);
        if (confirmacion.toLowerCase() === 's') {
          await desactivarCuenta(emailDesactivar);
        } else {
          console.log('Operación cancelada.');
        }
        break;
      
      case '5':
        const emailBuscar = await pregunta('Email del usuario a buscar: ');
        await buscarUsuario(emailBuscar);
        break;
      
      case '6':
        const rol = await pregunta('Rol a filtrar (doctor, admin, patient, employer, o "todos"): ');
        await listarUsuariosPorRol(rol);
        break;
      
      case '7':
        const rutaArchivo = await pregunta('Ruta al archivo CSV (formato: email,rol en cada línea): ');
        await procesarCSV(rutaArchivo);
        break;
      
      case '0':
        console.log('\n¡Hasta pronto! 👋');
        rl.close();
        process.exit(0);
        break;
      
      default:
        console.log('❌ Opción no válida. Inténtalo de nuevo.');
    }
  }
}

// Ejecutar el menú principal si no estamos en modo test
if (process.env.NODE_ENV !== 'test') {
  menuPrincipal().catch(error => {
    console.error('Error en la ejecución del script:', error);
    process.exit(1);
  });
}

// Exportar funciones para pruebas
module.exports = {
  promocionarAMedico,
  promocionarAAdmin,
  promocionarAEmpresa,
  desactivarCuenta,
  buscarUsuario,
  listarUsuariosPorRol,
  procesarCSV
};
