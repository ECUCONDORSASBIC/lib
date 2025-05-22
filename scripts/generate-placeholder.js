// Script para generar imagen placeholder
const sharp = require('sharp');
const path = require('path');

const outputDir = path.join(__dirname, '../public/images');

async function createPlaceholder() {
    try {
        // Crear un SVG simple como placeholder
        const svgText = `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f1f5f9" />
      <text 
        x="50%" 
        y="50%" 
        font-family="Arial" 
        font-size="20" 
        fill="#64748b" 
        text-anchor="middle" 
        dominant-baseline="central"
      >Imagen no disponible</text>
    </svg>
    `;

        // Convertir SVG a WebP
        await sharp(Buffer.from(svgText))
            .webp({ quality: 80 })
            .toFile(path.join(outputDir, 'placeholder.webp'));

        console.log('Imagen placeholder creada: placeholder.webp');
    } catch (error) {
        console.error('Error al crear imagen placeholder:', error);
    }
}

createPlaceholder();
