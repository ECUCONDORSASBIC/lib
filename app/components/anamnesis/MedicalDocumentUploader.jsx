'use client';

import { useToast } from '@/app/components/ui/Toast';
import Tooltip from '@/app/components/ui/Tooltip';
import { useRef, useState } from 'react';

/**
 * Medical document uploader component
 * Used for uploading and displaying medical images, reports, and test results
 */
const MedicalDocumentUploader = ({
  documents = [],
  onUpload,
  onRemove,
  allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'image/dicom'],
  maxSizeMB = 10,
  maxFiles = 5
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const toast = useToast();

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleFilesSelected = async (files) => {
    if (documents.length + files.length > maxFiles) {
      toast.error(`No se pueden cargar más de ${maxFiles} documentos`);
      return;
    }

    setIsUploading(true);

    const uploadPromises = Array.from(files).map(file => {
      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        toast.error(`Tipo de archivo no permitido: ${file.type}`);
        return null;
      }

      // Validate file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`El archivo excede el tamaño máximo de ${maxSizeMB}MB`);
        return null;
      }

      return processFile(file);
    });

    try {
      const results = await Promise.all(uploadPromises.filter(Boolean));
      results.forEach(result => {
        if (result) onUpload(result);
      });
    } catch (error) {
      console.error('Error processing files:', error);
      toast.error('Error al procesar los archivos');
    } finally {
      setIsUploading(false);
      setIsDragging(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const { files } = e.dataTransfer;
    handleFilesSelected(files);
  };

  const handleChange = (e) => {
    const { files } = e.target;
    handleFilesSelected(files);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const processFile = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        // For images, create a preview
        if (file.type.startsWith('image/')) {
          resolve({
            id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            name: file.name,
            type: file.type,
            size: file.size,
            data: reader.result,
            file // Keep original file for later upload
          });
        } else {
          // For non-images like PDFs
          resolve({
            id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            name: file.name,
            type: file.type,
            size: file.size,
            data: null, // No preview for non-images
            file // Keep original file for later upload
          });
        }
      };

      if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsArrayBuffer(file); // Read as ArrayBuffer for non-images
      }
    });
  };

  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">Documentos Médicos</h4>
        <Tooltip text="Cargue imágenes de exámenes, informes médicos u otros documentos relevantes" />
      </div>

      {/* Upload area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragging ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-300 hover:bg-gray-100'}
          ${isUploading ? 'opacity-75 cursor-wait' : ''}
        `}
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={allowedTypes.join(',')}
          onChange={handleChange}
          className="hidden"
        />

        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>

        {isUploading ? (
          <div className="mt-4 text-sm font-medium text-gray-500">
            Procesando archivos...
          </div>
        ) : (
          <>
            <p className="mt-2 text-base font-medium text-gray-700">
              Arrastre archivos aquí o haga clic para seleccionar
            </p>
            <p className="mt-1 text-xs text-gray-500">
              JPG, PNG o PDF (máx. {maxSizeMB}MB por archivo)
            </p>
          </>
        )}
      </div>

      {/* Document list */}
      {documents.length > 0 && (
        <div className="mt-4 space-y-2">
          <h5 className="text-sm font-medium text-gray-700 mb-2">Documentos Cargados</h5>

          <div className="space-y-3">
            {documents.map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200">
                <div className="flex items-center space-x-3">
                  {/* Show thumbnail for images */}
                  {doc.type.startsWith('image/') && doc.data ? (
                    <div className="h-14 w-14 rounded-md overflow-hidden border border-gray-200 bg-white">
                      <img src={doc.data} alt={doc.name} className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-14 w-14 rounded-md overflow-hidden border border-gray-200 bg-white flex items-center justify-center text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}

                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700 truncate max-w-xs">{doc.name}</span>
                    <span className="text-xs text-gray-500">{formatFileSize(doc.size)}</span>
                  </div>
                </div>

                <button
                  onClick={() => onRemove(doc.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalDocumentUploader;
