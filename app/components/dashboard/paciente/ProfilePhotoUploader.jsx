'use client';

import { db, ensureFirebase, storage } from '@/lib/firebase/firebaseClient';
import { doc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useRef, useState } from 'react';
import ImageWithFallback from '../../common/ImageWithFallback';
import { Spinner } from '../../ui/Spinner';

const ProfilePhotoUploader = ({ patientId, currentPhotoUrl, onPhotoUpdated }) => {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('La foto no debe exceder los 5MB.');
        return;
      }
      setSelectedPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
      setError('');
      setSuccess(false);
    }
  };
  const handlePhotoUpload = async () => {
    if (!selectedPhoto) {
      console.log('handlePhotoUpload: No photo selected.');
      return;
    }
    console.log('handlePhotoUpload: Starting photo upload process...', { patientId, fileName: selectedPhoto.name });
    setLoading(true);
    setError('');
    setSuccess(false);

    // Ensure Firebase is initialized
    try {
      await ensureFirebase();

      if (!storage || !db) {
        throw new Error('Firebase services are not properly initialized');
      }
    } catch (err) {
      console.error('Failed to initialize Firebase:', err);
      setError('Error de conexión. Por favor, inténtelo de nuevo.');
      setLoading(false);
      return;
    }

    try {
      console.log('handlePhotoUpload: Creating storage reference...');
      const storageRef = ref(storage, `patients/${patientId}/profilePictures/${selectedPhoto.name}`); // Using original file name for now
      console.log('handlePhotoUpload: Storage reference created:', storageRef.fullPath);

      console.log('handlePhotoUpload: Attempting to upload bytes...');
      const uploadResult = await uploadBytes(storageRef, selectedPhoto);
      console.log('handlePhotoUpload: Photo uploaded successfully. Result:', uploadResult);

      console.log('handlePhotoUpload: Attempting to get download URL...');
      const downloadURL = await getDownloadURL(storageRef);
      console.log('handlePhotoUpload: Download URL obtained:', downloadURL);

      console.log('handlePhotoUpload: Creating patient document reference...');
      const patientDocRef = doc(db, 'patients', patientId);
      console.log('handlePhotoUpload: Patient document reference created:', patientDocRef.path);

      console.log('handlePhotoUpload: Attempting to update Firestore document...');
      await updateDoc(patientDocRef, { photoUrl: downloadURL });
      console.log('handlePhotoUpload: Firestore document updated successfully.');

      setSuccess(true);
      setSelectedPhoto(null);
      setPhotoPreview(null);
      if (onPhotoUpdated) {
        console.log('handlePhotoUpload: Calling onPhotoUpdated callback.');
        onPhotoUpdated(downloadURL);
      }
      console.log('handlePhotoUpload: Process completed successfully.');

    } catch (err) {
      console.error("handlePhotoUpload: Error during photo upload process.", err);
      console.error("Error name:", err.name);
      console.error("Error message:", err.message);
      console.error("Error stack:", err.stack);
      setError(`Error al subir: ${err.message}`);
    } finally {
      console.log('handlePhotoUpload: Setting loading to false.');
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <div className="w-20 h-20 overflow-hidden bg-gray-200 rounded-full">
        <ImageWithFallback
          src={currentPhotoUrl || '/default-avatar.png'}
          alt="Profile"
          fallbackSrc="/default-avatar.png"
          width={80}
          height={80}
          className="object-cover w-full h-full"
        />
      </div>
      <input
        type="file"
        accept="image/jpeg, image/png, image/gif"
        className="hidden"
        ref={fileInputRef}
        onChange={handlePhotoChange}
      />
      {!selectedPhoto && (
        <button
          type="button"
          className="absolute bottom-0 px-2 py-1 text-xs text-white -translate-x-1/2 bg-blue-600 rounded-full shadow-md left-1/2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          style={{ transform: 'translate(-50%, 25%)' }} // Adjust to sit nicely on the bottom edge
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
          disabled={loading}
          aria-label="Actualizar foto de perfil"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
            <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
          </svg>
        </button>
      )}
      {photoPreview && (
        <div className="flex items-center mt-2 space-x-2">
          <button
            className="p-1 text-white bg-green-500 rounded-full shadow-sm hover:bg-green-600 disabled:opacity-50"
            onClick={handlePhotoUpload}
            disabled={loading}
            aria-label="Guardar nueva foto"
          >
            {loading ? <Spinner size="xs" color="text-white" /> : <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
          </button>
          <button
            className="p-1 text-gray-700 bg-gray-200 rounded-full shadow-sm hover:bg-gray-300 disabled:opacity-50"
            onClick={() => { setSelectedPhoto(null); setPhotoPreview(null); setError(''); }}
            disabled={loading}
            aria-label="Cancelar cambio de foto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414z" clipRule="evenodd" /></svg>
          </button>
        </div>
      )}
      {error && <div className="mt-1 text-xs text-center text-red-600">{error}</div>}
      {success && <div className="mt-1 text-xs text-center text-green-600">Foto actualizada.</div>}
    </div>
  );
};

export default ProfilePhotoUploader;
