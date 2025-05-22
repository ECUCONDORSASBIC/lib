"use client";

import { useState, useEffect, useRef } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, PauseIcon, PlayIcon } from '@heroicons/react/24/outline';
import OptimizedImage from './OptimizedImage';

export default function HeroBanner({
    slides,
    autoPlayInterval = 5000,
    initialAutoPlay = true,
    height = "500px",
    className = "",
}) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [autoPlay, setAutoPlay] = useState(initialAutoPlay);
    const [animating, setAnimating] = useState(false);
    const timerId = useRef(null);

    // Manejar la reproducción automática
    useEffect(() => {
        if (autoPlay) {
            timerId.current = setInterval(() => {
                goToNextSlide();
            }, autoPlayInterval);
        }

        return () => {
            if (timerId.current) {
                clearInterval(timerId.current);
            }
        };
    }, [autoPlay, currentIndex, autoPlayInterval]);

    // Función para ir al slide anterior
    const goToPrevSlide = () => {
        if (animating) return;

        setAnimating(true);
        const newIndex = currentIndex === 0 ? slides.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);

        // Pequeño retraso para permitir que termine la animación
        setTimeout(() => setAnimating(false), 500);
    };

    // Función para ir al siguiente slide
    const goToNextSlide = () => {
        if (animating) return;

        setAnimating(true);
        const newIndex = currentIndex === slides.length - 1 ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);

        // Pequeño retraso para permitir que termine la animación
        setTimeout(() => setAnimating(false), 500);
    };

    // Función para ir a un slide específico
    const goToSlide = (index) => {
        if (animating || index === currentIndex) return;

        setAnimating(true);
        setCurrentIndex(index);

        // Pequeño retraso para permitir que termine la animación
        setTimeout(() => setAnimating(false), 500);
    };

    // Alternar reproducción automática
    const toggleAutoPlay = () => {
        setAutoPlay(!autoPlay);
    };

    return (
        <div
            className={`relative overflow-hidden ${className}`}
            style={{ height }}
            role="region"
            aria-label="Slider de contenido destacado"
        >
            {/* Slides */}
            <div className="h-full">
                {slides.map((slide, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-500 ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                            }`}
                        aria-hidden={index !== currentIndex}
                    >
                        {slide.type === 'image' ? (
                            <OptimizedImage
                                src={slide.src}
                                alt={slide.alt || 'Imagen destacada'}
                                fill
                                className="object-cover"
                                priority={index === 0}
                                loadingStrategy={index === 0 ? 'eager' : 'lazy'}
                            />
                        ) : slide.type === 'video' ? (
                            <video
                                autoPlay={index === currentIndex}
                                loop
                                muted
                                playsInline
                                className="absolute inset-0 w-full h-full object-cover"
                            >
                                <source src={slide.src} type="video/mp4" />
                            </video>
                        ) : null}

                        {/* Contenido del slide */}
                        {slide.content && (
                            <div className="absolute inset-0 flex items-center justify-center z-20 bg-gradient-to-b from-transparent to-black/50">
                                <div className="container px-4 mx-auto">
                                    {slide.content}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Controles de navegación */}
            <div className="absolute bottom-0 inset-x-0 z-30 flex justify-center p-4">
                <div className="flex items-center space-x-4 bg-black/30 backdrop-blur-sm rounded-full px-4 py-2">
                    {/* Botón anterior */}
                    <button
                        onClick={goToPrevSlide}
                        className="w-8 h-8 flex items-center justify-center text-white hover:text-sky-300 transition-colors"
                        aria-label="Slide anterior"
                    >
                        <ChevronLeftIcon className="w-6 h-6" />
                    </button>

                    {/* Indicadores */}
                    <div className="flex space-x-2">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`w-3 h-3 rounded-full transition-all ${index === currentIndex
                                        ? 'bg-white scale-110'
                                        : 'bg-white/50 hover:bg-white/80'
                                    }`}
                                aria-label={`Ir al slide ${index + 1}`}
                                aria-current={index === currentIndex ? 'true' : 'false'}
                            />
                        ))}
                    </div>

                    {/* Botón siguiente */}
                    <button
                        onClick={goToNextSlide}
                        className="w-8 h-8 flex items-center justify-center text-white hover:text-sky-300 transition-colors"
                        aria-label="Siguiente slide"
                    >
                        <ChevronRightIcon className="w-6 h-6" />
                    </button>

                    {/* Botón de pausa/reproducción */}
                    <button
                        onClick={toggleAutoPlay}
                        className="w-8 h-8 flex items-center justify-center text-white hover:text-sky-300 transition-colors"
                        aria-label={autoPlay ? 'Pausar reproducción automática' : 'Iniciar reproducción automática'}
                    >
                        {autoPlay ? (
                            <PauseIcon className="w-5 h-5" />
                        ) : (
                            <PlayIcon className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
