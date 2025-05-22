'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import './AvatarButton.css';

const AvatarButton = ({ patientData, onClick }) => {
  const [avatarUrl, setAvatarUrl] = useState('/default-avatar.png');
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // Solo intentamos cargar si tenemos un ID de paciente y un profileImagePath
    if (patientData?.id && patientData?.profileImagePath) {
      const loadProfileImage = async () => {
        try {
          setLoading(true);
          // Importamos dinámicamente para evitar problemas con SSR
          const { storage } = await import('@/lib/firebase/firebaseClient');
          const { ref, getDownloadURL } = await import('firebase/storage');
          
          // Construimos la referencia a la imagen en Storage
          const imageRef = ref(storage, patientData.profileImagePath);
          
          // Obtenemos la URL descargable
          const url = await getDownloadURL(imageRef);
          setAvatarUrl(url);
        } catch (error) {
          console.error('Error al cargar imagen de perfil:', error);
          // Si hay error, usamos la URL de la imagen por defecto
          setAvatarUrl('/default-avatar.png');
        } finally {
          setLoading(false);
        }
      };
      
      loadProfileImage();
    } else if (patientData?.avatarUrl) {
      // Si ya tenemos una URL directa en los datos del paciente, la usamos
      setAvatarUrl(patientData.avatarUrl);
    }
  }, [patientData]);
  
  return (
    <Link
      href={`/dashboard/paciente/${patientData?.id || '#'}/perfil`}
      className="avatar-button block w-14 h-14 sm:w-16 sm:h-16"
      onClick={onClick}
      aria-label="Ver o editar perfil"
    >
      <div className="relative w-full h-full overflow-hidden bg-blue-100 rounded-full">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 animate-pulse">
            <span className="sr-only">Cargando imagen de perfil...</span>
          </div>
        ) : (
          <Image
            src={avatarUrl}
            alt={`Foto de ${patientData?.name || 'perfil'}`}
            fill
            sizes="(max-width: 640px) 3.5rem, 4rem"
            className="object-cover rounded-full"
          />
        )}
      </div>
    </Link>
  );
};

export default AvatarButton;
