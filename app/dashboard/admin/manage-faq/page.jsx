'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, doc, getDoc, setDoc, addDoc, deleteDoc, getFirestore, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-toastify';
import DashboardLayout from '@/app/components/dashboard/DashboardLayout';

export default function ManageFAQ() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [faqs, setFaqs] = useState([]);
  const [editingFaq, setEditingFaq] = useState(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'general',
    order: 0,
    active: true
  });
  const router = useRouter();
  const db = getFirestore();

  // Cargar FAQs existentes
  useEffect(() => {
    async function loadFaqs() {
      try {
        setLoading(true);
        
        // Verificar permisos de administrador
        const sessionRes = await fetch('/api/auth/session');
        const session = await sessionRes.json();
        
        if (!session?.user?.role || session.user.role !== 'admin') {
          toast.error('No tienes permisos para acceder a esta sección');
          router.push('/dashboard');
          return;
        }
        
        // Cargar FAQs de Firestore
        const faqCollection = collection(db, 'faqs');
        const snapshot = await getDocs(faqCollection);
        
        const faqList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        // Ordenar por el campo order
        faqList.sort((a, b) => (a.order || 0) - (b.order || 0));
        
        setFaqs(faqList);
      } catch (err) {
        console.error('Error al cargar FAQs:', err);
        toast.error('Error al cargar las preguntas frecuentes');
      } finally {
        setLoading(false);
      }
    }
    
    loadFaqs();
  }, [db, router]);

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Iniciar edición de FAQ
  const handleEdit = (faq) => {
    setEditingFaq(faq.id);
    setFormData({
      question: faq.question || '',
      answer: faq.answer || '',
      category: faq.category || 'general',
      order: faq.order || 0,
      active: faq.active !== false // por defecto es activo si no está definido
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancelar edición
  const handleCancel = () => {
    setEditingFaq(null);
    setFormData({
      question: '',
      answer: '',
      category: 'general',
      order: 0,
      active: true
    });
  };

  // Guardar FAQ (crear nueva o actualizar existente)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar campos
    if (!formData.question.trim() || !formData.answer.trim()) {
      toast.error('La pregunta y la respuesta son obligatorias');
      return;
    }
    
    try {
      setSaving(true);
      
      const faqData = {
        ...formData,
        updatedAt: new Date().toISOString()
      };
      
      if (editingFaq) {
        // Actualizar FAQ existente
        const faqRef = doc(db, 'faqs', editingFaq);
        await setDoc(faqRef, faqData, { merge: true });
        
        // Actualizar en el estado local
        setFaqs(prevFaqs => 
          prevFaqs.map(faq => 
            faq.id === editingFaq ? { ...faq, ...faqData } : faq
          )
        );
        
        toast.success('Pregunta actualizada correctamente');
      } else {
        // Crear nueva FAQ
        faqData.createdAt = new Date().toISOString();
        
        const docRef = await addDoc(collection(db, 'faqs'), faqData);
        
        // Añadir al estado local
        setFaqs(prevFaqs => [...prevFaqs, { id: docRef.id, ...faqData }]);
        
        toast.success('Pregunta creada correctamente');
      }
      
      // Limpiar formulario
      handleCancel();
    } catch (err) {
      console.error('Error al guardar FAQ:', err);
      toast.error('Error al guardar la pregunta frecuente');
    } finally {
      setSaving(false);
    }
  };

  // Eliminar FAQ
  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta pregunta frecuente?')) {
      return;
    }
    
    try {
      setSaving(true);
      
      // Eliminar de Firestore
      await deleteDoc(doc(db, 'faqs', id));
      
      // Eliminar del estado local
      setFaqs(prevFaqs => prevFaqs.filter(faq => faq.id !== id));
      
      // Si estábamos editando esta FAQ, cancelar la edición
      if (editingFaq === id) {
        handleCancel();
      }
      
      toast.success('Pregunta eliminada correctamente');
    } catch (err) {
      console.error('Error al eliminar FAQ:', err);
      toast.error('Error al eliminar la pregunta frecuente');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gestión de Preguntas Frecuentes</h1>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => router.push('/dashboard/admin')}
          >
            ← Volver al panel
          </button>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingFaq ? 'Editar Pregunta Frecuente' : 'Añadir Nueva Pregunta Frecuente'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-1">
                Pregunta
              </label>
              <input
                type="text"
                id="question"
                name="question"
                value={formData.question}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="¿Cómo puedo...?"
                required
              />
            </div>
            
            <div>
              <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-1">
                Respuesta
              </label>
              <textarea
                id="answer"
                name="answer"
                value={formData.answer}
                onChange={handleInputChange}
                rows={5}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Para resolver esto, debes..."
                required
              />
              <p className="mt-1 text-xs text-gray-500">Puedes usar formato Markdown para dar formato al texto</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="general">General</option>
                  <option value="account">Cuenta y Perfiles</option>
                  <option value="medical">Consultas Médicas</option>
                  <option value="payments">Pagos</option>
                  <option value="telemedicine">Telemedicina</option>
                  <option value="technical">Soporte Técnico</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-1">
                  Orden
                </label>
                <input
                  type="number"
                  id="order"
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  min="0"
                />
                <p className="mt-1 text-xs text-gray-500">Las preguntas se mostrarán en orden ascendente</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="active"
                name="active"
                checked={formData.active}
                onChange={handleInputChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                Activa (visible para los usuarios)
              </label>
            </div>
            
            <div className="flex justify-end space-x-3">
              {editingFaq && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancelar
                </button>
              )}
              
              <button
                type="submit"
                disabled={saving}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </>
                ) : (
                  editingFaq ? 'Actualizar' : 'Crear'
                )}
              </button>
            </div>
          </form>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Preguntas Frecuentes</h2>
          
          {loading ? (
            <div className="flex justify-center my-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : faqs.length === 0 ? (
            <div className="bg-gray-50 p-4 text-center text-gray-500 rounded-md">
              No hay preguntas frecuentes. Añade una nueva.
            </div>
          ) : (
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.id} className={`border rounded-lg p-4 ${!faq.active ? 'bg-gray-50' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-lg">{faq.question}</h3>
                        {!faq.active && (
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Inactiva</span>
                        )}
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">{faq.category}</span>
                      </div>
                      <div className="mt-2 text-gray-600 whitespace-pre-line">{faq.answer}</div>
                      <div className="mt-1 text-sm text-gray-500">
                        Orden: {faq.order || 0}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(faq)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(faq.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
