// Script para generar avatares placeholder
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const outputDir = path.join(__dirname, '../public/images/avatars');

// Asegurarse de que el directorio existe
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Función para crear un avatar simple con las iniciales de una persona
async function createAvatar(filename, name, bgColor = '#0ea5e9', textColor = '#ffffff', size = 200) {
    try {
        // Obtener las iniciales
        const initials = name
            .split(' ')
            .map(part => part.charAt(0).toUpperCase())
            .join('')
            .slice(0, 2);

        // Crear un SVG con las iniciales
        const svgText = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${bgColor}" />
      <text 
        x="50%" 
        y="50%" 
        font-family="Arial" 
        font-size="${size / 2}" 
        fill="${textColor}" 
        text-anchor="middle" 
        dominant-baseline="central"
        font-weight="bold"
      >${initials}</text>
    </svg>
    `;

        // Convertir SVG a PNG
        await sharp(Buffer.from(svgText))
            .png()
            .toFile(path.join(outputDir, `${filename}.png`));

        // Convertir a WebP para mejor rendimiento
        await sharp(path.join(outputDir, `${filename}.png`))
            .webp({ quality: 90 })
            .toFile(path.join(outputDir, `${filename}.webp`));

        console.log(`Avatar creado: ${filename}.webp`);
    } catch (error) {
        console.error(`Error al crear avatar ${filename}:`, error);
    }
}

// Crear avatares de muestra para testimonios
async function generateAvatars() {
    // Lista de personas para testimonios
    const personas = [
        { nombre: 'Laura Gómez', archivo: 'laura-gomez', color: '#0ea5e9' },
        { nombre: 'Carlos Fernández', archivo: 'carlos-fernandez', color: '#0891b2' },
        { nombre: 'Ana Torres', archivo: 'ana-torres', color: '#0369a1' },
        { nombre: 'Martín Sánchez', archivo: 'martin-sanchez', color: '#0d9488' },
        { nombre: 'Luisa Ramírez', archivo: 'luisa-ramirez', color: '#10b981' },
        { nombre: 'Ricardo Méndez', archivo: 'ricardo-mendez', color: '#6366f1' },
        { nombre: 'Default Avatar', archivo: 'default-avatar', color: '#94a3b8' }
    ];

    // Crear cada avatar
    for (const persona of personas) {
        await createAvatar(persona.archivo, persona.nombre, persona.color);
    }
}

generateAvatars();
