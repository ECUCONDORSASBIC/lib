'use client';

import { deleteFileByUrl, uploadFile } from '@/app/services/storageService'; // Importar el servicio
import { ArrowPathIcon, PaperClipIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

const PruebasInformesPreviosForm = ({ formData = { texto: '', archivos: [] }, updateData, patientId }) => {
  const initialData = formData; // For backwards compatibility
  const [texto, setTexto] = useState(initialData.texto);
  const [archivos, setArchivos] = useState(initialData.archivos || []); // Array de objetos { name: string, url: string }
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  useEffect(() => {
    // Cargar datos iniciales si cambian desde el padre
    setTexto(initialData.texto || '');
    setArchivos(initialData.archivos || []);
  }, [initialData]);

  const handleTextChange = (e) => {
    const newTexto = e.target.value;
    setTexto(newTexto);
    if (updateData && typeof updateData === 'function') {
      updateData({ texto: newTexto, archivos });
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!patientId) {
      setError('ID del paciente no disponible. No se puede subir el archivo.');
      console.error('Patient ID is missing, cannot upload file.');
      return;
    }

    // Validaciones básicas de archivo (ejemplo)
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setError(`Tipo de archivo no permitido: ${file.type}. Permitidos: PDF, JPG, PNG, DOC, DOCX.`);
      return;
    } if (file.size > 10 * 1024 * 1024) { // Límite de 10MB
      setError('El archivo es demasiado grande. Máximo 10MB.');
      return;
    }

    setIsUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      // Create a storage path for the file
      const storagePath = `patients/${patientId}/medical_records/${file.name}`;
      const downloadURL = await uploadFile(file, storagePath, setUploadProgress);
      const newFile = { name: file.name, url: downloadURL, type: file.type, size: file.size };
      const updatedArchivos = [...archivos, newFile];
      setArchivos(updatedArchivos);

      if (updateData && typeof updateData === 'function') {
        updateData({ texto, archivos: updatedArchivos });
      }
    } catch (uploadError) {
      console.error("Upload failed:", uploadError);
      setError(`Error al subir el archivo: ${uploadError.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      event.target.value = null; // Resetear el input de archivo
    }
  };

  const handleRemoveFile = async (fileUrlToRemove, fileName) => {
    // Confirmación antes de eliminar (opcional pero recomendado)
    if (!window.confirm(`¿Estás seguro de que quieres eliminar el archivo "${fileName}"? Esta acción no se puede deshacer si el archivo ya está en el servidor.`)) {
      return;
    }

    try {
      // Intentar eliminar de Firebase Storage    // Si el archivo aún no se ha guardado en la base de datos principal,
      // esta eliminación es preventiva o para archivos ya subidos.
      await deleteFileByUrl(fileUrlToRemove);

      const updatedArchivos = archivos.filter(archivo => archivo.url !== fileUrlToRemove);
      setArchivos(updatedArchivos);

      if (updateData && typeof updateData === 'function') {
        updateData({ texto, archivos: updatedArchivos });
      }

      setError(''); // Limpiar error si la eliminación fue exitosa
    } catch (deleteError) {
      console.error("Error deleting file from storage:", deleteError);
      // Si el error es porque el archivo no existe en storage (quizás solo estaba en el estado local),
      // igual lo eliminamos de la lista local.
      if (deleteError.code === 'storage/object-not-found') {
        const updatedArchivos = archivos.filter(archivo => archivo.url !== fileUrlToRemove);
        setArchivos(updatedArchivos);

        if (updateData && typeof updateData === 'function') {
          updateData({ texto, archivos: updatedArchivos });
        }

        setError('');
      } else {
        setError(`Error al eliminar el archivo del servidor: ${deleteError.message}. Por favor, inténtalo de nuevo.`);
      }
    }
  };


  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="mb-4 text-xl font-semibold text-gray-700">Pruebas Diagnósticas e Informes Previos</h3>

      <div className="mb-6">
        <label htmlFor="informesPreviosTexto" className="block mb-1 text-sm font-medium text-gray-600">
          Describe cualquier prueba o informe relevante:
        </label>
        <textarea
          id="informesPreviosTexto"
          name="informesPreviosTexto"
          rows="4"
          className="w-full px-3 py-2 text-gray-700 transition duration-150 ease-in-out border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={texto}
          onChange={handleTextChange}
          placeholder="Ej: Resonancia magnética de rodilla (2022) muestra desgarro de menisco. Informe de cardiología (2023) normal."
        />
      </div>

      <div className="mb-4">
        <label htmlFor="fileUpload" className="block mb-2 text-sm font-medium text-gray-600">
          Adjuntar archivos (PDF, JPG, PNG, DOC, DOCX - Máx 10MB):
        </label>
        <div className="flex items-center space-x-3">
          <input
            type="file"
            id="fileUpload"
            onChange={handleFileChange}
            disabled={isUploading || !patientId}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
          />
          {!patientId && <p className="text-xs text-red-500">Se requiere ID de paciente para habilitar la subida.</p>}
        </div>
      </div>

      {isUploading && (
        <div className="my-3">
          <div className="flex items-center space-x-2 text-sm text-blue-600">
            <ArrowPathIcon className="w-5 h-5 animate-spin" />
            <span>Subiendo archivo: {Math.round(uploadProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 my-3 text-sm text-red-700 border border-red-200 rounded-md bg-red-50">
          {error}
        </div>
      )}

      {archivos && archivos.length > 0 && (
        <div className="mt-6">
          <h4 className="mb-2 font-medium text-gray-700 text-md">Archivos Adjuntos:</h4>
          <ul className="space-y-2">
            {archivos.map((archivo, index) => (
              <li key={index} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-md border border-gray-200 hover:bg-gray-100">
                <div className="flex items-center min-w-0">
                  <PaperClipIcon className="flex-shrink-0 w-5 h-5 mr-2 text-gray-500" />
                  <a
                    href={archivo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 truncate hover:underline"
                    title={`Ver ${archivo.name}`}
                  >
                    {archivo.name || 'Archivo sin nombre'}
                  </a>
                  {archivo.size && <span className="ml-2 text-xs text-gray-400">({(archivo.size / 1024 / 1024).toFixed(2)} MB)</span>}
                </div>
                <button
                  onClick={() => handleRemoveFile(archivo.url, archivo.name)}
                  className="p-1 text-red-500 transition-colors rounded-full hover:text-red-700 hover:bg-red-100"
                  title={`Eliminar ${archivo.name}`}
                  disabled={isUploading} // Podrías deshabilitarlo también si el formulario general está "submitted"
                >
                  <XCircleIcon className="w-5 h-5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PruebasInformesPreviosForm;
