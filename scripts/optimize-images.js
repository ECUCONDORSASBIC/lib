const imagemin = require('imagemin');
const imageminWebp = require('imagemin-webp');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Directorios de origen y destino
const sourceDir = path.join(__dirname, '../public/images');
const destDir = path.join(__dirname, '../public/images');

// Crear directorio de destino si no existe
if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

// Optimizar imágenes y convertirlas a WebP
async function optimizeImages() {
    try {
        // Convertir a WebP manteniendo el nombre original
        const files = await imagemin([`${sourceDir}/*.{jpg,png}`], {
            destination: destDir,
            plugins: [
                imageminWebp({ quality: 75 })
            ]
        });

        console.log('Imágenes convertidas a WebP:', files.length);

        // Generar versiones responsivas
        const imagePaths = fs.readdirSync(sourceDir)
            .filter(file => /\.(jpg|jpeg|png)$/i.test(file))
            .map(file => path.join(sourceDir, file));

        for (const imagePath of imagePaths) {
            const filename = path.basename(imagePath, path.extname(imagePath));

            // Generar versiones de diferentes tamaños
            const sizes = [320, 640, 960, 1280];
            for (const width of sizes) {
                await sharp(imagePath)
                    .resize(width)
                    .webp({ quality: 75 })
                    .toFile(path.join(destDir, `${filename}-${width}.webp`));

                console.log(`Generado: ${filename}-${width}.webp`);
            }
        }

        console.log('Optimización completa');
    } catch (error) {
        console.error('Error al optimizar imágenes:', error);
    }
}

// Ejecutar la optimización
optimizeImages();