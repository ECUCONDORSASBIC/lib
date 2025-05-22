// Script to generate placeholder dashboard images
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const outputDir = path.join(__dirname, '../public/images');

// Asegurarse de que el directorio existe
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Función para crear una imagen de dashboard con texto
async function createDashboardImage(filename, title, width = 1200, height = 800) {
    try {
        // Crear un SVG con texto para representar un dashboard
        const svgText = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f0f9ff" />
      
      <!-- Header barra superior -->
      <rect x="0" y="0" width="${width}" height="60" fill="#0369a1" />
      <text x="20" y="38" font-family="Arial" font-size="24" fill="white">Altamedica - ${title}</text>
      
      <!-- Sidebar izquierdo -->
      <rect x="0" y="60" width="220" height="${height - 60}" fill="#f1f5f9" />
      <rect x="20" y="100" width="180" height="40" rx="5" fill="#0284c7" />
      <text x="50" y="125" font-family="Arial" font-size="16" fill="white">Dashboard</text>
      
      <!-- Elementos del sidebar -->
      <rect x="20" y="160" width="180" height="40" rx="5" fill="#e2e8f0" />
      <text x="50" y="185" font-family="Arial" font-size="16" fill="#334155">Perfil</text>
      
      <rect x="20" y="220" width="180" height="40" rx="5" fill="#e2e8f0" />
      <text x="50" y="245" font-family="Arial" font-size="16" fill="#334155">Historial</text>
      
      <rect x="20" y="280" width="180" height="40" rx="5" fill="#e2e8f0" />
      <text x="50" y="305" font-family="Arial" font-size="16" fill="#334155">Consultas</text>
      
      <!-- Contenido principal -->
      <rect x="240" y="80" width="${width - 260}" height="140" rx="10" fill="white" stroke="#e2e8f0" stroke-width="2" />
      <text x="260" y="120" font-family="Arial" font-size="20" font-weight="bold" fill="#0f172a">Bienvenido a su panel de control</text>
      
      <!-- Tarjetas de información -->
      <rect x="240" y="240" width="280" height="160" rx="10" fill="white" stroke="#e2e8f0" stroke-width="2" />
      <text x="260" y="280" font-family="Arial" font-size="18" font-weight="bold" fill="#0f172a">Estadísticas</text>
      <rect x="260" y="300" width="240" height="80" rx="5" fill="#f0f9ff" />
      
      <rect x="540" y="240" width="280" height="160" rx="10" fill="white" stroke="#e2e8f0" stroke-width="2" />
      <text x="560" y="280" font-family="Arial" font-size="18" font-weight="bold" fill="#0f172a">Actividad Reciente</text>
      <rect x="560" y="300" width="240" height="80" rx="5" fill="#f0f9ff" />
      
      <rect x="840" y="240" width="280" height="160" rx="10" fill="white" stroke="#e2e8f0" stroke-width="2" />
      <text x="860" y="280" font-family="Arial" font-size="18" font-weight="bold" fill="#0f172a">Recordatorios</text>
      <rect x="860" y="300" width="240" height="80" rx="5" fill="#f0f9ff" />
      
      <!-- Gráfico -->
      <rect x="240" y="420" width="880" height="320" rx="10" fill="white" stroke="#e2e8f0" stroke-width="2" />
      <text x="260" y="460" font-family="Arial" font-size="18" font-weight="bold" fill="#0f172a">Análisis y Tendencias</text>
      
      <!-- Líneas simulando un gráfico -->
      <polyline points="280,650 380,600 480,620 580,580 680,540 780,560 880,520 980,480 1080,500" 
                stroke="#0ea5e9" stroke-width="3" fill="none" />
      
      <!-- Área bajo la curva -->
      <path d="M280,650 380,600 480,620 580,580 680,540 780,560 880,520 980,480 1080,500 L1080,650 Z" 
            fill="#bae6fd" fill-opacity="0.3" />
      
      <!-- Ejes -->
      <line x1="280" y1="500" x2="280" y2="650" stroke="#94a3b8" stroke-width="1" />
      <line x1="280" y1="650" x2="1080" y2="650" stroke="#94a3b8" stroke-width="1" />
    </svg>
    `;

        // Convertir SVG a PNG
        await sharp(Buffer.from(svgText))
            .png()
            .toFile(path.join(outputDir, `${filename}.png`));

        // Convertir a WebP para mejor rendimiento
        await sharp(path.join(outputDir, `${filename}.png`))
            .webp({ quality: 80 })
            .toFile(path.join(outputDir, `${filename}.webp`));

        console.log(`Imagen creada: ${filename}.webp`);
    } catch (error) {
        console.error(`Error al crear ${filename}:`, error);
    }
}

// Crear imágenes para cada tipo de usuario
async function generateAllImages() {
    await createDashboardImage('patient-dashboard', 'Panel del Paciente');
    await createDashboardImage('doctor-dashboard', 'Panel del Médico');
    await createDashboardImage('business-dashboard', 'Panel Empresarial');
    await createDashboardImage('demo-interactive', 'Demo Interactiva', 500, 600);
}

generateAllImages();
