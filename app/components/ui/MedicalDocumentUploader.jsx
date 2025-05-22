'use client';

import { File, FileText, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';

const MedicalDocumentUploader = ({
  documents = [],
  onUpload,
  onRemove,
  maxSize = 5000000, // 5MB por defecto
  acceptedTypes = ".pdf,.jpg,.jpeg,.png,.doc,.docx"
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (file) => {
    // Validar tamaño
    if (file.size > maxSize) {
      setError(`El archivo es demasiado grande. Tamaño máximo: ${(maxSize / 1000000).toFixed(1)}MB`);
      return false;
    }

    // Validar tipo
    const fileType = `.${file.name.split('.').pop().toLowerCase()}`;
    if (!acceptedTypes.includes(fileType)) {
      setError(`Tipo de archivo no válido. Formatos aceptados: ${acceptedTypes}`);
      return false;
    }

    return true;
  };

  const handleFiles = async (files) => {
    setError(null);

    if (!files || files.length === 0) return;

    const file = files[0]; // Por ahora solo procesamos un archivo a la vez

    if (!validateFile(file)) return;

    setUploading(true);
    try {
      // Aquí podríamos preprocesar el archivo si fuera necesario
      if (onUpload && typeof onUpload === 'function') {
        await onUpload(file);
      }
    } catch (err) {
      console.error("Error al subir documento:", err);
      setError("Error al subir el documento. Intente nuevamente.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();

    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleRemove = (id) => {
    if (onRemove && typeof onRemove === 'function') {
      onRemove(id);
    }
  };

  const getFileIcon = (fileType) => {
    fileType = fileType.toLowerCase();

    if (fileType.includes('pdf')) {
      return <File className="w-6 h-6 text-red-500" />;
    } else if (fileType.includes('doc')) {
      return <FileText className="w-6 h-6 text-blue-500" />;
    } else if (fileType.includes('jpg') || fileType.includes('jpeg') || fileType.includes('png')) {
      return <File className="w-6 h-6 text-green-500" />;
    }

    return <File className="w-6 h-6 text-gray-500" />;
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        {uploading ? (
          <div className="flex flex-col items-center justify-center py-4">
            <div className="w-8 h-8 border-4 border-t-blue-500 border-r-blue-500 border-b-gray-200 border-l-gray-200 rounded-full animate-spin"></div>
            <p className="mt-2 text-sm text-gray-500">Subiendo documento...</p>
          </div>
        ) : (
          <>
            <Upload className="mx-auto h-10 w-10 text-gray-400" />
            <p className="mt-2 text-sm font-medium text-gray-900">
              Arrastra aquí tu documento o haz clic para buscarlo
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {`Formatos aceptados: ${acceptedTypes} (Máx. ${(maxSize / 1000000).toFixed(1)}MB)`}
            </p>
            <input
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleChange}
              accept={acceptedTypes}
            />
          </>
        )}
      </div>

      {error && (
        <div className="p-3 text-sm border rounded-md bg-red-50 border-red-200 text-red-700">
          {error}
        </div>
      )}

      {documents.length > 0 && (
        <div className="space-y-2 mt-4">
          <h4 className="text-sm font-medium text-gray-700">Documentos adjuntos</h4>
          <ul className="border rounded-md divide-y">
            {documents.map((doc) => (
              <li key={doc.id} className="flex items-center justify-between p-3">
                <div className="flex items-center space-x-3">
                  {getFileIcon(doc.type)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                    <p className="text-xs text-gray-500">{doc.type} - {(doc.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="p-1 text-gray-400 rounded-full hover:bg-gray-100 hover:text-red-500"
                  onClick={() => handleRemove(doc.id)}
                  aria-label="Eliminar documento"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MedicalDocumentUploader;
