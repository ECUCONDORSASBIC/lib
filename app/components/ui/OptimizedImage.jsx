"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';

// Componente optimizado para carga de imágenes con lazy loading y fallback
export default function OptimizedImage({
    src,
    alt,
    width,
    height,
    className,
    priority = false,
    loadingStrategy = "lazy", // "eager", "lazy"
    fallbackSrc = "/images/placeholder.webp",
    onLoad,
    ...rest
}) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [imgSrc, setImgSrc] = useState(src);

    // Si la ruta de la imagen termina en .jpg o .png, intentamos cargar la versión WebP
    // asumiendo que existe siguiendo la convención nombre.webp
    useEffect(() => {
        // Solo reemplazamos si no es ya un WebP y si está en nuestro dominio (no CDNs externos)
        if (!src.endsWith('.webp') && !src.startsWith('http')) {
            const baseName = src.split('.').slice(0, -1).join('.');
            const webpSrc = `${baseName}.webp`;
            setImgSrc(webpSrc);
        } else {
            setImgSrc(src);
        }
    }, [src]);

    // Manejar el evento de carga completada
    const handleLoad = (event) => {
        setLoading(false);
        if (onLoad) onLoad(event);
    };

    // Manejar errores de carga
    const handleError = () => {
        setError(true);
        setImgSrc(fallbackSrc);
    };

    return (
        <div className={`relative ${className || ''}`} style={{ width, height }}>
            <Image
                src={imgSrc}
                alt={alt}
                width={width}
                height={height}
                priority={priority}
                loading={loadingStrategy}
                onLoad={handleLoad}
                onError={handleError}
                className={`
          transition-opacity duration-300
          ${loading ? 'opacity-0' : 'opacity-100'}
          ${className || ''}
        `}
                sizes={rest.sizes || `(max-width: 768px) 100vw, ${width}px`}
                {...rest}
            />

            {/* Skeleton placeholder mientras carga */}
            {loading && !loadingStrategy === "eager" && (
                <div
                    className="absolute inset-0 bg-gray-200 animate-pulse rounded"
                    style={{
                        width: '100%',
                        height: '100%'
                    }}
                />
            )}
        </div>
    );
}
