"use client";

import { useState, useRef, useEffect } from 'react';

export default function OptimizedVideo({
    src,
    poster,
    width = "100%",
    height = "auto",
    className = "",
    autoPlay = false,
    loop = true,
    muted = true,
    controls = false,
    playsInline = true,
    preload = "metadata",
    onEnded,
    children,
}) {
    const videoRef = useRef(null);
    const [isInView, setIsInView] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    // Observar cuando el video está en el viewport
    useEffect(() => {
        if (!videoRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                setIsInView(entry.isIntersecting);
            },
            { threshold: 0.1 } // 10% del elemento debe estar visible
        );

        observer.observe(videoRef.current);

        return () => {
            if (videoRef.current) {
                observer.unobserve(videoRef.current);
            }
        };
    }, []);

    // Controlar la reproducción basada en la visibilidad
    useEffect(() => {
        if (!videoRef.current) return;

        if (isInView && autoPlay && !isPlaying) {
            // Solo reproducir si es autoPlay y está en el viewport
            videoRef.current.play()
                .then(() => {
                    setIsPlaying(true);
                })
                .catch((error) => {
                    console.error("Error al reproducir el video:", error);
                });
        } else if (!isInView && isPlaying) {
            // Pausar cuando sale del viewport
            videoRef.current.pause();
            setIsPlaying(false);
        }
    }, [isInView, autoPlay, isPlaying]);

    const handleLoad = () => {
        setIsLoaded(true);
    };

    const handlePlayPause = () => {
        if (!videoRef.current) return;

        if (videoRef.current.paused) {
            videoRef.current.play()
                .then(() => setIsPlaying(true))
                .catch(error => console.error("Error al reproducir:", error));
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    };

    return (
        <div className={`relative ${className}`}>
            {/* Overlay para mostrar mientras el video carga */}
            {!isLoaded && poster && (
                <div
                    className="absolute inset-0 bg-cover bg-center z-10"
                    style={{
                        backgroundImage: `url(${poster})`,
                        backgroundSize: 'cover'
                    }}
                />
            )}

            {/* Video element */}
            <video
                ref={videoRef}
                width={width}
                height={height}
                muted={muted}
                playsInline={playsInline}
                loop={loop}
                controls={controls}
                preload={preload}
                poster={poster}
                className={`w-full h-full object-cover ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
                onLoadedData={handleLoad}
                onEnded={onEnded}
                onClick={handlePlayPause}
            >
                <source src={src} type="video/mp4" />
                Tu navegador no soporta el tag de video.
            </video>

            {/* Se pueden pasar elementos hijos para superponer al video */}
            {children}

            {/* Botón de play/pause accesible (opcional) */}
            {!controls && (
                <button
                    aria-label={isPlaying ? "Pausar video" : "Reproducir video"}
                    onClick={handlePlayPause}
                    className="absolute inset-0 w-full h-full flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-20 z-20 transition-all group"
                >
                    {!isPlaying && (
                        <span className="w-16 h-16 flex items-center justify-center rounded-full bg-white bg-opacity-70 group-hover:bg-opacity-90 transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-900">
                                <polygon points="5 3 19 12 5 21 5 3"></polygon>
                            </svg>
                        </span>
                    )}
                </button>
            )}
        </div>
    );
}
