'use client';

import { ChatBubbleLeftEllipsisIcon, ChevronDownIcon, ChevronUpIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useState } from 'react';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full text-left text-gray-700 hover:text-blue-600 focus:outline-none"
      >
        <span className="font-medium">{question}</span>
        {isOpen ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
      </button>
      {isOpen && <p className="mt-2 text-sm text-gray-600 pr-5">{answer}</p>}
    </div>
  );
};

const HelpAndSupportSection = () => {
  const [contactForm, setContactForm] = useState({ subject: '', message: '' });
  const [isChatOpen, setIsChatOpen] = useState(false); // Placeholder for real-time chat state

  // Mock FAQ data - replace with actual data
  const faqs = [
    { id: 1, question: '¿Cómo puedo agendar una nueva consulta?', answer: 'Puede agendar una nueva consulta haciendo clic en el botón "Agendar Nueva Consulta" en la sección de Inicio o en "Mis Consultas".' },
    { id: 2, question: '¿Dónde encuentro mis resultados de exámenes?', answer: 'Sus resultados de exámenes se encuentran en la sección "Resultados y Diagnósticos". Podrá ver resúmenes y descargar los informes completos en PDF.' },
    { id: 3, question: '¿Cómo actualizo mis datos personales?', answer: 'En la sección "Mi Perfil Médico", puede hacer clic en "Actualizar Datos Clínicos" para modificar su información personal y médica.' },
    { id: 4, question: '¿Qué hago si olvido la contraseña?', answer: 'Puede restablecer su contraseña haciendo clic en la opción "¿Olvidó su contraseña?" en la página de inicio de sesión.' },
  ];

  const handleContactFormChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
  };

  const handleContactFormSubmit = (e) => {
    e.preventDefault();
    console.log('Formulario de contacto enviado:', contactForm);
    alert('Su mensaje ha sido enviado. Nos pondremos en contacto con usted pronto.');
    setContactForm({ subject: '', message: '' });
    // Here you would typically send the form data to a backend service or email
  };

  const handleStartChat = () => {
    setIsChatOpen(true);
    console.log('Iniciando chat de soporte en tiempo real...');
    // Logic to open a chat widget or navigate to a chat page
    alert('Simulación: Chat de soporte iniciado.');
  };

  return (
    <section id="ayuda-soporte" className="p-6 bg-gray-50 rounded-xl shadow-lg space-y-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Ayuda y Soporte</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Preguntas Frecuentes (FAQ) */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-blue-700 mb-4 flex items-center">
            <QuestionMarkCircleIcon className="h-6 w-6 mr-2" />
            Preguntas Frecuentes (FAQ)
          </h3>
          <div className="space-y-2">
            {faqs.map(faq => (
              <FAQItem key={faq.id} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>

        {/* Contacto Directo */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-blue-700 mb-4 flex items-center">
            <ChatBubbleLeftEllipsisIcon className="h-6 w-6 mr-2" />
            Contacto Directo
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Si no encuentra respuesta a su pregunta en las FAQ, puede contactarnos directamente.
          </p>

          {/* Formulario de Contacto */}
          <form onSubmit={handleContactFormSubmit} className="space-y-4 mb-6">
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Asunto</label>
              <input
                type="text"
                name="subject"
                id="subject"
                value={contactForm.subject}
                onChange={handleContactFormChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">Mensaje</label>
              <textarea
                name="message"
                id="message"
                rows="4"
                value={contactForm.message}
                onChange={handleContactFormChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow transition-colors"
            >
              Enviar Mensaje
            </button>
          </form>

          {/* Chat en Tiempo Real (Simulado) */}
          <div>
            <h4 className="text-md font-medium text-gray-800 mb-2">Soporte en Tiempo Real</h4>
            <button
              onClick={handleStartChat}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow transition-colors flex items-center justify-center space-x-2"
            >
              <ChatBubbleLeftEllipsisIcon className="h-5 w-5" />
              <span>Iniciar Chat con Soporte</span>
            </button>
            {isChatOpen && <p className="text-xs text-green-700 mt-2 text-center">Conectando con un agente de soporte...</p>}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="text-md font-medium text-gray-800 mb-2">Otros Recursos</h4>
            <ul className="space-y-1">
              <li><Link href={`/faq`} className="text-sm text-blue-600 hover:underline">Preguntas Frecuentes (General)</Link></li>
              <li><Link href={`/contacto`} className="text-sm text-blue-600 hover:underline">Información de Contacto</Link></li>
              <li><Link href={`/soporte-tecnico`} className="text-sm text-blue-600 hover:underline">Soporte Técnico</Link></li>
              <li><Link href={`/guias-usuario`} className="text-sm text-blue-600 hover:underline">Guías de Usuario</Link></li>
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HelpAndSupportSection;
