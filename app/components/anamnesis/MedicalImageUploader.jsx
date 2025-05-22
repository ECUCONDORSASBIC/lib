'use client';

import { useState, useRef } from 'react';
import { PhotoIcon, ArrowUpTrayIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useGenkit } from '@/app/contexts/GenkitContext';

/**
 * Componente para subir y analizar imágenes médicas utilizando Vertex AI/Genkit
 * 
 * @param {Object} props
 * @param {Function} props.onImageAnalyzed - Función para recibir el resultado del análisis
 * @param {Function} props.onImageUploaded - Función para recibir la imagen subida
 * @param {string} props.title - Título del componente
 * @param {string} props.description - Descripción del componente
 */
const MedicalImageUploader = ({
  onImageAnalyzed,
  onImageUploaded,
  title = "Subir imagen médica",
  description = "Suba una imagen relacionada con sus síntomas para un análisis visual"
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const { analyzeImage, isProcessing } = useGenkit();

  // Función para manejar la selección de archivos
  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor, seleccione un archivo de imagen válido (JPEG, PNG, etc.)');
      return;
    }
    
    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen es demasiado grande. El tamaño máximo permitido es 5MB.');
      return;
    }
    
    setError(null);
    setUploading(true);
    
    try {
      // Crear vista previa
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        if (onImageUploaded) {
          onImageUploaded(file, reader.result);
        }
      };
      reader.readAsDataURL(file);
      
      // Analizar imagen con Genkit/Vertex AI
      if (analyzeImage) {
        const imageAnalysis = await analyzeImage(file);
        setAnalysis(imageAnalysis);
        
        if (onImageAnalyzed) {
          onImageAnalyzed(imageAnalysis);
        }
      }
    } catch (error) {
      console.error('Error al procesar imagen:', error);
      setError('Error al procesar la imagen: ' + (error.message || 'Error desconocido'));
    } finally {
      setUploading(false);
    }
  };
  
  // Manejar evento de arrastrar y soltar
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  // Manejar evento de soltar archivo
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };
  
  // Manejar clic en el botón de subir
  const handleButtonClick = () => {
    fileInputRef.current.click();
  };
  
  // Limpiar imagen y análisis
  const handleClear = () => {
    setPreview(null);
    setAnalysis(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <div className="medical-image-uploader mt-4">
      <h4 className="text-sm font-medium text-gray-700 mb-1">{title}</h4>
      <p className="text-xs text-gray-500 mb-3">{description}</p>
      
      {!preview ? (
        <div 
          className={`border-2 border-dashed rounded-lg p-6 text-center ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center">
            <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-2">
              <span className="block text-sm font-medium text-gray-900">
                Arrastre y suelte una imagen aquí
              </span>
              <span className="block text-xs text-gray-500">
                o haga clic para seleccionar (PNG, JPG hasta 5MB)
              </span>
            </div>
            <button
              type="button"
              onClick={handleButtonClick}
              className="mt-3 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowUpTrayIcon className="h-4 w-4 mr-1" />
              Seleccionar imagen
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
        </div>
      ) : (
        <div className="relative border rounded-lg overflow-hidden">
          <img 
            src={preview} 
            alt="Vista previa de imagen médica" 
            className="w-full object-contain max-h-64"
          />
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 text-white rounded-full p-1 hover:bg-opacity-90 focus:outline-none"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
          
          {uploading || isProcessing ? (
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <div className="bg-white rounded-md px-4 py-2 flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-sm text-gray-700">Analizando imagen...</span>
              </div>
            </div>
          ) : null}
          
          {analysis && (
            <div className="p-3 bg-white border-t">
              <h5 className="text-sm font-medium text-gray-700 mb-1">Análisis de la imagen:</h5>
              <div className="text-xs text-gray-600 space-y-1">
                {analysis.findings && (
                  <p><span className="font-medium">Hallazgos:</span> {analysis.findings}</p>
                )}
                {analysis.relevance && (
                  <p><span className="font-medium">Relevancia clínica:</span> {analysis.relevance}</p>
                )}
                {analysis.suggestions && (
                  <p><span className="font-medium">Sugerencias:</span> {analysis.suggestions}</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      
      {error && (
        <div className="mt-2 text-xs text-red-600">
          {error}
        </div>
      )}
    </div>
  );
};

export default MedicalImageUploader;
