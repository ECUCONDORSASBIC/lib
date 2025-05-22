'use client';

import { useAuth } from '@/app/contexts/AuthContext';
import { useEffect, useState } from 'react';

// Componente Toast
const Toast = ({ message, type }) => (
  <div className={`fixed top-6 right-6 px-4 py-2 rounded-md z-50 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
    {message}
  </div>
);

// Componente Modal simple
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default function EmpresaDashboard() {
  const { userData } = useAuth();
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const [ofertas, setOfertas] = useState([]);
  const [aplicaciones, setAplicaciones] = useState([]);
  const [profesionales, setProfesionales] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Simular carga de datos
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setOfertas([
        { id: '1', titulo: 'Desarrollador Frontend Senior', vacantes: 2, fechaPublicacion: '2024-07-15' },
        { id: '2', titulo: 'Especialista en Marketing Digital', vacantes: 1, fechaPublicacion: '2024-07-10' },
      ]);
      setAplicaciones([
        { id: 'app1', ofertaTitulo: 'Desarrollador Frontend Senior', candidatoNombre: 'Ana Pérez', fechaAplicacion: '2024-07-16' },
      ]);
      setProfesionales([
        { id: 'prof1', nombre: 'Dr. Carlos López', especialidad: 'Cardiología' },
      ]);
      setLoading(false);
    }, 1500);
  }, [userData]);

  const handleCrearOferta = (nuevaOferta) => {
    console.log("Nueva oferta:", nuevaOferta);
    setOfertas(prev => [
      ...prev,
      {
        ...nuevaOferta,
        id: Date.now().toString(),
        fechaPublicacion: new Date().toISOString().split('T')[0]
      }
    ]);
    setToast({ show: true, message: 'Oferta creada exitosamente', type: 'success' });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-16 h-16 border-t-4 border-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      {toast.show && <Toast message={toast.message} type={toast.type} />}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Crear Nueva Oferta de Trabajo">
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const nuevaOferta = {
            titulo: formData.get('titulo'),
            descripcion: formData.get('descripcion'),
            vacantes: parseInt(formData.get('vacantes'), 10),
          };
          handleCrearOferta(nuevaOferta);
        }}>
          <div className="mb-4">
            <label htmlFor="titulo" className="block text-sm font-medium text-gray-700">Título de la Oferta</label>
            <input type="text" name="titulo" id="titulo" required className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
          </div>
          <div className="mb-4">
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">Descripción</label>
            <textarea name="descripcion" id="descripcion" rows="3" required className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"></textarea>
          </div>
          <div className="mb-4">
            <label htmlFor="vacantes" className="block text-sm font-medium text-gray-700">Número de Vacantes</label>
            <input type="number" name="vacantes" id="vacantes" defaultValue="1" min="1" required className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 mr-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
              Crear Oferta
            </button>
          </div>
        </form>
      </Modal>

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard de Empresa</h1>
        {userData && <p className="text-gray-600">Bienvenido, {userData.displayName || userData.companyName || 'Empresario'}</p>}
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Sección de Ofertas de Trabajo */}
        <div className="col-span-1 p-6 bg-white rounded-lg shadow-lg md:col-span-2 lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Ofertas de Trabajo Publicadas</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center px-4 py-2 text-sm text-white transition duration-150 bg-blue-600 rounded-md hover:bg-blue-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Crear Nueva Oferta
            </button>
          </div>
          {ofertas.length > 0 ? (
            <ul className="space-y-3">
              {ofertas.map(oferta => (
                <li key={oferta.id} className="p-4 transition-shadow border rounded-md hover:shadow-md">
                  <h3 className="font-medium text-blue-600">{oferta.titulo}</h3>
                  <p className="text-sm text-gray-500">Vacantes: {oferta.vacantes} - Publicada: {oferta.fechaPublicacion}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No has publicado ninguna oferta de trabajo.</p>
          )}
        </div>

        {/* Sección de Aplicaciones Recibidas */}
        <div className="p-6 bg-white rounded-lg shadow-lg">
          <h2 className="mb-4 text-xl font-semibold text-gray-700">Aplicaciones Recibidas</h2>
          {aplicaciones.length > 0 ? (
            <ul className="space-y-3">
              {aplicaciones.map(app => (
                <li key={app.id} className="p-3 text-sm border rounded-md">
                  <p><span className="font-medium">{app.candidatoNombre}</span> aplicó a <span className="text-blue-500">{app.ofertaTitulo}</span></p>
                  <p className="text-xs text-gray-500">Fecha: {app.fechaAplicacion}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No has recibido aplicaciones aún.</p>
          )}
        </div>

        {/* Sección de Profesionales Guardados */}
        <div className="p-6 bg-white rounded-lg shadow-lg">
          <h2 className="mb-4 text-xl font-semibold text-gray-700">Profesionales Guardados</h2>
          {profesionales.length > 0 ? (
            <ul className="space-y-3">
              {profesionales.map(prof => (
                <li key={prof.id} className="p-3 text-sm border rounded-md">
                  <p className="font-medium">{prof.nombre}</p>
                  <p className="text-xs text-gray-500">{prof.especialidad}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No tienes profesionales guardados.</p>
          )}
        </div>
      </div>

      {/* Otras secciones o funcionalidades pueden ir aquí */}
      <div className="p-6 mt-8 bg-white rounded-lg shadow-lg">
        <h2 className="mb-4 text-xl font-semibold text-gray-700">Estadísticas Rápidas</h2>
        <p className="text-gray-600">Gráficos y KPIs relevantes para la empresa (ej: número de aplicaciones, ofertas activas).</p>
      </div>
    </div>
  );
}
