/**
 * Tests para el flujo de autenticación y asignación de roles
 * 
 * Este script prueba varios aspectos críticos del sistema de autenticación 
 * y gestión de roles, incluyendo la consistencia entre Custom Claims y Firestore.
 */

const admin = require('firebase-admin');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Inicializar Firebase Admin
if (!admin.apps.length) {
  try {
    const serviceAccountPath = path.resolve(__dirname, '../service-account.json');
    
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = require(serviceAccountPath);
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      
      console.log('Firebase Admin inicializado correctamente para tests');
    } else {
      console.error('Archivo de credenciales no encontrado en:', serviceAccountPath);
      process.exit(1);
    }
  } catch (error) {
    console.error('Error al inicializar Firebase Admin:', error);
    process.exit(1);
  }
}

// Referencias a servicios
const db = admin.firestore();
const auth = admin.auth();

// Test case para validar consistencia en la nomenclatura de roles
async function testRolesConsistency() {
  console.log('?? Iniciando prueba: Consistencia de roles');
  
  try {
    // Revisar reglas de seguridad de Firestore
    const rulesFilePath = path.join(__dirname, '../firebase-rules.txt');
    const rulesContent = fs.readFileSync(rulesFilePath, 'utf8');
    
    // Verificar que las reglas contengan funciones para todos los roles estandarizados
    const requiredRoles = ['doctor', 'admin', 'patient', 'employer'];
    
    for (const role of requiredRoles) {
      assert(rulesContent.includes(role), 'Las reglas de seguridad deben contener el rol ' + role);
    }
    
    console.log('? Las reglas de seguridad contienen todos los roles estandarizados');
  } catch (error) {
    console.error('? Prueba fallida: Consistencia de roles -', error.message);
    throw error;
  }
}

// Test case para validar asignación de roles
async function testRoleAssignment(email, password) {
  console.log('?? Iniciando prueba: Asignación de rol para ' + email);
  
  try {
    // 1. Verificar si el usuario existe
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
      console.log('  Usuario encontrado: ' + userRecord.uid);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log('  Usuario no encontrado, creando uno nuevo...');
        throw new Error('El usuario de prueba no existe. Créalo manualmente antes de ejecutar el test.');
      } else {
        throw error;
      }
    }
    
    // 2. Verificar que el rol sea consistente entre Auth Claims y Firestore
    const userDoc = await db.collection('users').doc(userRecord.uid).get();
    
    if (!userDoc.exists) {
      throw new Error('El documento Firestore para el usuario ' + userRecord.uid + ' no existe');
    }
    
    // Obtener claims actuales
    const { customClaims } = await auth.getUser(userRecord.uid);
    const roleFromClaims = customClaims?.role;
    const roleFromFirestore = userDoc.data().role;
    
    console.log('  Rol en Auth Claims: ' + (roleFromClaims || 'no definido'));
    console.log('  Rol en Firestore: ' + (roleFromFirestore || 'no definido'));
    
    // Verificar que ambos roles estén definidos
    assert(roleFromClaims, 'El rol debe estar definido en Auth Claims');
    assert(roleFromFirestore, 'El rol debe estar definido en Firestore');
    
    // Verificar que ambos roles sean iguales
    assert.strictEqual(
      roleFromClaims, 
      roleFromFirestore,
      'Los roles deben ser iguales en Auth Claims y Firestore ' + roleFromClaims + ' != ' + roleFromFirestore
    );
    
    // Verificar que el rol sea uno de los estandarizados
    const standardizedRoles = ['doctor', 'admin', 'patient', 'employer'];
    assert(
      standardizedRoles.includes(roleFromClaims),
      'El rol debe ser uno de los estandarizados: ' + standardizedRoles.join(', ')
    );
    
    console.log('? El rol es consistente y estandarizado');
    return true;
  } catch (error) {
    console.error('? Prueba fallida: Asignación de rol -', error.message);
    return false;
  }
}

// Ejecución de todos los tests
async function runAllTests() {
  console.log('?? Iniciando suite de pruebas: Autenticación y Roles\n');
  
  try {
    // Test de consistencia de roles en reglas
    await testRolesConsistency();
    console.log('');
    
    // Email para pruebas - debe ser un usuario real en tu sistema
    const testEmail = 'Marques.eduardo95466020@gmail.com';
    
    // Test de asignación de roles
    await testRoleAssignment(testEmail);
    
    console.log('\n? Todas las pruebas completadas correctamente');
  } catch (error) {
    console.error('\n? Suite de pruebas fallida:', error);
  } finally {
    // Cerrar la conexión con Firebase
    await Promise.all(admin.apps.map(app => app.delete()));
  }
}

// Ejecutar todos los tests
runAllTests().catch(console.error);
