'use client';

import { useTranslation } from '@/app/i18n';
import ProfileUpdateNotification from '@components/ui/ProfileUpdateNotification'; // Import the notification component
import { DocumentArrowUpIcon, PencilSquareIcon, ShieldCheckIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const InfoCard = ({ title, children, icon, actionButton }) => {
  const { t } = useTranslation();
  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="flex flex-wrap items-center justify-between text-blue-600 mb-4">
        <div className="flex items-center mb-2 sm:mb-0">
          {icon && <span className="mr-2 h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0">{icon}</span>}
          <h3 className="text-base sm:text-lg font-semibold">{title}</h3>
        </div>
        <div className="w-full sm:w-auto mt-1 sm:mt-0">
          {actionButton ? actionButton : (
            title === t('patient.demographics') && !isEditing && (
              <Link href={`/dashboard/paciente/${profileData?.id}/perfil/editar`}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <PencilSquareIcon className="h-4 w-4 mr-1.5" />
                {t('common.editProfile')}
              </Link>
            )
          )}
        </div>
      </div>
      <div className="text-gray-700 space-y-3 text-sm">
        {children}
      </div>
    </div>
  );
};

const AnamnesisFormPlaceholder = ({ onSubmit }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Anamnesis form submitted (placeholder):", formData);
    onSubmit(formData);
    alert(t('anamnesis.formSubmittedSimulation'))
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-3 sm:p-4 border border-gray-200 rounded-md bg-gray-50">
      <div className="bg-blue-50 p-3 rounded-md mb-4">
        <p className="text-center text-blue-700 font-medium">{t('anamnesis.interactiveFormTitle')}</p>
        <p className="text-xs text-center text-blue-600 mt-1">{t('anamnesis.completeHistoryPrompt')}</p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="habits" className="block text-sm font-medium text-gray-700 mb-1">Hábitos Diarios</label>
          <textarea
            id="habits"
            name="habits"
            rows="3"
            onChange={handleInputChange}
            value={formData.habits || ''}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-3"
            placeholder="Describa sus hábitos alimenticios, actividad física, sueño..."
          ></textarea>
        </div>

        <div>
          <label htmlFor="riskFactors" className="block text-sm font-medium text-gray-700 mb-1">Factores de Riesgo</label>
          <textarea
            id="riskFactors"
            name="riskFactors"
            rows="3"
            onChange={handleInputChange}
            value={formData.riskFactors || ''}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-3"
            placeholder="Tabaquismo, antecedentes familiares, exposiciones laborales..."
          ></textarea>
        </div>

        <div>
          <label htmlFor="medications" className="block text-sm font-medium text-gray-700 mb-1">Medicaciones Actuales</label>
          <textarea
            id="medications"
            name="medications"
            rows="2"
            onChange={handleInputChange}
            value={formData.medications || ''}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-3"
            placeholder="Liste sus medicamentos actuales y dosis..."
          ></textarea>
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 sm:py-2 px-4 rounded-lg shadow transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Enviar Anamnesis
      </button>

      <p className="text-xs text-gray-500 text-center mt-2">
        Altamedica generará alertas personalizadas basadas en esta información para mejorar su atención médica.
      </p>
    </form>
  );
}

const MyMedicalProfileSection = ({ patientData, onUpdate }) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(patientData);
  const [selectedFile, setSelectedFile] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    setProfileData(patientData);
    setHasUnsavedChanges(false);
    console.log('Patient profile data updated:', patientData);
  }, [patientData]);

  useEffect(() => {
    if (!patientData?.id) return;

    const setupRealtimeListener = async () => {
      try {
        const { doc, onSnapshot } = await import('firebase/firestore');
        const { db, ensureFirebase } = await import('@/lib/firebase/firebaseClient');
        await ensureFirebase();

        const userRef = doc(db, 'users', patientData.id);
        const unsubscribeUser = onSnapshot(userRef, (snapshot) => {
          if (snapshot.exists()) {
            const updatedData = snapshot.data();
            console.log('Real-time update from users collection:', updatedData);
            onUpdate({ ...patientData, ...updatedData });
          }
        }, (error) => {
          console.error('Error in users real-time listener:', error);
        });

        const patientRef = doc(db, 'patients', patientData.id);
        const unsubscribePatient = onSnapshot(patientRef, (snapshot) => {
          if (snapshot.exists()) {
            const updatedData = snapshot.data();
            console.log('Real-time update from patients collection:', updatedData);
            onUpdate({ ...patientData, ...updatedData });
          }
        }, (error) => {
          console.error('Error in patients real-time listener:', error);
        });

        const anamnesisRef = doc(db, 'patients', patientData.id, 'anamnesis', 'conversacional');
        const unsubscribeAnamnesis = onSnapshot(anamnesisRef, async (snapshot) => {
          if (snapshot.exists()) {
            console.log('Detected anamnesis update, ensuring patient profile is synchronized');

            try {
              const { updatePatientProfile } = await import('@/app/services/anamnesisService');
              const anamnesisData = snapshot.data();

              const profileUpdated = await updatePatientProfile(patientData.id, anamnesisData);

              if (profileUpdated) {
                console.log('Patient profile synchronized with latest anamnesis data');
              }
            } catch (syncError) {
              console.error('Error synchronizing profile with anamnesis:', syncError);
            }
          }
        }, (error) => {
          console.error('Error in anamnesis real-time listener:', error);
        });

        return () => {
          unsubscribeUser();
          unsubscribePatient();
          unsubscribeAnamnesis();
        };
      } catch (error) {
        console.error('Error setting up real-time listeners:', error);
      }
    };

    const cleanup = setupRealtimeListener();
    return () => {
      if (cleanup) cleanup.then(fn => fn());
    };
  }, [patientData?.id, onUpdate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setHasUnsavedChanges(true);
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUploadDocument = async () => {
    if (!selectedFile) {
      alert('Por favor, seleccione un archivo.');
      return;
    }
    try {
      alert(`Simulación: Documento "${selectedFile.name}" subido.`);
      setSelectedFile(null);
    } catch (error) {
      console.error("Error al subir documento:", error);
      alert('Error al subir el documento.');
    }
  };

  const handleCancelEdit = () => {
    if (hasUnsavedChanges) {
      const confirmCancel = window.confirm('Tiene cambios sin guardar. ¿Está seguro que desea cancelar?');
      if (!confirmCancel) return;
    }

    setIsEditing(false);
    setProfileData(patientData);
    setHasUnsavedChanges(false);
  };

  const handleSaveChanges = async () => {
    try {
      const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
      const { db, ensureFirebase } = await import('@/lib/firebase/firebaseClient');
      await ensureFirebase();

      const patientRef = doc(db, 'patients', patientData.id);

      await updateDoc(patientRef, {
        ...profileData,
        updatedAt: serverTimestamp(),
        lastProfileUpdate: serverTimestamp()
      });

      try {
        const userRef = doc(db, 'users', patientData.id);
        await updateDoc(userRef, {
          ...profileData,
          updatedAt: serverTimestamp(),
          lastProfileUpdate: serverTimestamp()
        });
        console.log('Perfil actualizado en ambas colecciones');
      } catch (userUpdateError) {
        console.warn('No se pudo actualizar el perfil en la colección users:', userUpdateError);
      }

      onUpdate(profileData);
      setIsEditing(false);
      setHasUnsavedChanges(false);
      setShowNotification(true);
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      alert('Error al actualizar el perfil: ' + error.message);
    }
  };

  const handleAnamnesisSubmit = async (anamnesisData) => {
    try {
      const { saveAnamnesisData } = await import('@/app/services/anamnesisService');
      const { auth, ensureFirebase } = await import('@/lib/firebase/firebaseClient');
      await ensureFirebase();
      const currentUser = auth?.currentUser;

      if (!currentUser) {
        throw new Error('Usuario no autenticado');
      }

      await saveAnamnesisData(patientData.id, {
        datos_personales: {
          nombreCompleto: patientData.name,
          fechaNacimiento: patientData.birthDate,
          sexo: patientData.sex,
          dni: patientData.dni,
          ...anamnesisData
        }
      }, currentUser);

      alert('Datos de anamnesis enviados con éxito y perfil actualizado.');

      const { doc, getDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase/firebaseClient');

      const patientRef = doc(db, 'patients', patientData.id);
      const patientSnapshot = await getDoc(patientRef);

      if (patientSnapshot.exists()) {
        const updatedPatientData = patientSnapshot.data();
        onUpdate({ ...patientData, ...updatedPatientData });
      }
    } catch (error) {
      console.error("Error al enviar anamnesis:", error);
      alert('Error al enviar los datos de anamnesis: ' + error.message);
    }
  };

  return (
    <section id="mi-perfil" className="p-4 sm:p-6 bg-gray-50 rounded-xl shadow-lg space-y-6">
      {showNotification && (
        <ProfileUpdateNotification
          message={t('profile.updateSuccess')}
          onClose={() => setShowNotification(false)}
        />
      )}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{t('patient.profile')}</h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            {t('patient.profileUpdateMessage')}
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center px-3 py-2 sm:py-1.5 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto justify-center sm:justify-start"
          >
            <PencilSquareIcon className="h-4 w-4 mr-2" />
            {t('common.edit')}
          </button>
        )}
      </div>

      <InfoCard title={t('patient.demographics')}
        icon={<UserCircleIcon />}
        actionButton={!isEditing && (
          <div className="text-xs text-gray-500">
            {profileData?.lastProfileUpdate ? (
              <p>Última actualización: {new Date(profileData.lastProfileUpdate.seconds * 1000).toLocaleString()}</p>
            ) : profileData?.updatedAt ? (
              <p>Última actualización: {new Date(profileData.updatedAt.seconds * 1000).toLocaleString()}</p>
            ) : null}
          </div>
        )}
      >
        {isEditing ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-500">{t('patient.fullName')}</label>
                <input
                  type="text"
                  name="name"
                  value={profileData?.name || profileData?.nombreCompleto || ''}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-3 sm:p-2"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">{t('patient.idDocument')}</label>
                <input
                  type="text"
                  name="dni"
                  value={profileData?.dni || profileData?.documentoIdentidad || ''}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-3 sm:p-2"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">{t('patient.dateOfBirth')}</label>
                <input
                  type="date"
                  name="birthDate"
                  value={profileData?.birthDate || profileData?.fechaNacimiento || ''}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-3 sm:p-2"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-500">Sexo / Género</label>
                <select
                  name="sex"
                  value={profileData?.sex || profileData?.genero || profileData?.gender || ''}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-3 sm:p-2"
                >
                  <option value="">Seleccionar...</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 mt-6">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveChanges}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md shadow text-sm transition-colors"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <ul className="list-disc list-inside space-y-2 text-sm sm:text-base">
              <li className="break-words"><span className="font-medium">Nombre:</span> {patientData?.name || patientData?.nombreCompleto || patientData?.fullName || 'N/A'}</li>
              <li className="break-words"><span className="font-medium">DNI:</span> {patientData?.dni || patientData?.documentoIdentidad || 'N/A'}</li>
              <li className="break-words"><span className="font-medium">Edad:</span> {patientData?.age || patientData?.edad || 'N/A'} ({patientData?.birthDate || patientData?.fechaNacimiento ? new Date(patientData.birthDate || patientData.fechaNacimiento).toLocaleDateString() : 'N/A'})</li>
              <li className="break-words"><span className="font-medium">Sexo:</span> {patientData?.sex || patientData?.sexo || patientData?.genero || 'N/A'}</li>
              <li className="break-words"><span className="font-medium">Email:</span> {patientData?.email || patientData?.correo || patientData?.correoElectronico || 'N/A'}</li>
              <li className="break-words"><span className="font-medium">Teléfono:</span> {patientData?.phone || patientData?.telefono || patientData?.phoneNumber || 'N/A'}</li>
              <li className="break-words"><span className="font-medium">Última actualización:</span> {patientData?.lastProfileUpdate ? new Date(patientData.lastProfileUpdate.seconds * 1000).toLocaleString() : 'N/A'}</li>
              {patientData?.lastAnamnesisUpdate && (
                <li className="text-blue-600 font-semibold flex items-start sm:items-center py-1 animate-fadeIn">
                  <div className="flex-shrink-0 relative">
                    <span className="absolute inset-0 w-2 h-2 mt-1.5 sm:mt-0 bg-blue-500 rounded-full animate-pulse"></span>
                    <span className="relative inline-block w-2 h-2 mt-1.5 sm:mt-0 mr-2 bg-blue-500 rounded-full opacity-70"></span>
                  </div>
                  <span className="break-words">
                    <span className="font-medium">Datos actualizados desde anamnesis:</span> {new Date(patientData.lastAnamnesisUpdate.seconds * 1000).toLocaleString()}
                  </span>
                </li>
              )}
            </ul>
            <div className="mt-4 flex justify-end gap-3">
              <Link
                href={`/dashboard/paciente/${patientData?.id}/perfil/editar`}
                className="text-blue-600 hover:underline text-sm flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 10-4-4l-8 8v3z" /></svg>
                Editar perfil
              </Link>
              <Link
                href={`/dashboard/paciente/${patientData?.id}/configuracion`}
                className="text-gray-600 hover:text-gray-800 text-sm flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Configuración
              </Link>
            </div>
          </div>
        )}
      </InfoCard>

      <InfoCard title={t('patient.documentUpload')} icon={<DocumentArrowUpIcon />}>
        <p className="text-xs sm:text-sm text-gray-500 mb-3">{t('patient.uploadDocumentsInfo')}</p>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">          <input
          type="file"
          id="document-upload"
          name="document-upload"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
                      file:mr-3 file:py-2.5 file:px-5
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100
                      cursor-pointer"
        />
          <p className="mt-2 text-xs text-center text-gray-500">{t('patient.acceptedFormats')}: PDF, JPG, PNG</p>
        </div>
        {selectedFile && (
          <div className="flex items-center mt-3 p-2 bg-blue-50 rounded-md border border-blue-100">
            <div className="shrink-0">
              <DocumentArrowUpIcon className="h-5 w-5 text-blue-500" />
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-xs font-medium text-blue-700 truncate">{selectedFile.name}</p>
              <p className="text-xs text-blue-500">{Math.round(selectedFile.size / 1024)} KB</p>
            </div>
          </div>
        )}
        <button
          onClick={handleUploadDocument}
          disabled={!selectedFile}
          className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 sm:py-2 px-4 rounded-lg shadow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {!selectedFile ? t('patient.selectDocumentFirst') : t('patient.uploadDocument')}
        </button>
      </InfoCard>

      <InfoCard
        title={t('patient.collaboration')}
        icon={<ShieldCheckIcon />}
        actionButton={
          <a
            href={`/dashboard/paciente/${patientData?.id}/anamnesis`}
            className="text-xs text-blue-600 hover:text-blue-800 transition-colors flex items-center"
          >
            <span className="hidden sm:inline mr-1">{t('patient.completeMedicalHistory')}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </a>
        }
      >
        <AnamnesisFormPlaceholder onSubmit={handleAnamnesisSubmit} />
      </InfoCard>

    </section>
  );
};

export default MyMedicalProfileSection;
