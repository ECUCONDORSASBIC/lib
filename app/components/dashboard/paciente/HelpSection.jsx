'use client';

import { ChatBubbleLeftEllipsisIcon, LifebuoyIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
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
        <svg
          className={`w-5 h-5 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
      {isOpen && <p className="mt-2 text-sm text-gray-600 pr-5">{answer}</p>}
    </div>
  );
};

const HelpAndSupportSection = () => {
  const [contactForm, setContactForm] = useState({ subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock FAQ data - replace with actual FAQs
  const faqs = [
    { q: '¿Cómo puedo agendar una nueva consulta?', a: 'Puede agendar una nueva consulta desde la sección \"Inicio\" haciendo clic en \"Agendar Nueva Consulta\", o directamente en la sección \"Mis Consultas\".' },
    { q: '¿Dónde encuentro mis resultados de exámenes?', a: 'Sus resultados de exámenes están disponibles en la sección \"Resultados y Diagnósticos\". Podrá ver resúmenes y descargar los informes completos en PDF.' },
    { q: '¿Cómo actualizo mis datos personales?', a: 'Diríjase a \"Mi Perfil Médico\" y haga clic en el botón \"Actualizar Datos Clínicos\". Podrá modificar su información personal y clínica.' },
    { q: '¿Qué hago si olvido la contraseña?', a: 'En la página de inicio de sesión, encontrará un enlace de \"Olvidé mi contraseña\" que le guiará a través del proceso de recuperación.' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitSupportRequest = async (e) => {
    e.preventDefault();
    if (!contactForm.subject.trim() || !contactForm.message.trim()) {
      alert('Por favor, complete todos los campos del formulario de contacto.');
      return;
    }
    setIsSubmitting(true);
    console.log('Enviando solicitud de soporte:', contactForm);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    alert('Su solicitud de soporte ha sido enviada. Nos pondremos en contacto con usted pronto.');
    setContactForm({ subject: '', message: '' });
    setIsSubmitting(false);
  };

  return (
    <section id="ayuda-soporte" className="p-6 bg-gray-50 rounded-xl shadow-lg space-y-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Ayuda y Soporte</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Preguntas Frecuentes (FAQ) */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-blue-700 mb-4 flex items-center">
            <QuestionMarkCircleIcon className="h-6 w-6 mr-2" /> Preguntas Frecuentes (FAQ)
          </h3>
          <div className="space-y-2">
            {faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </div>

        {/* Contacto Directo */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-blue-700 mb-4 flex items-center">
            <ChatBubbleLeftEllipsisIcon className="h-6 w-6 mr-2" /> Contacto Directo
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Si no encuentra respuesta a su pregunta en las FAQ, puede enviarnos un mensaje directamente.
            También puede iniciar un chat en tiempo real si nuestros agentes están disponibles.
          </p>
          <form onSubmit={handleSubmitSupportRequest} className="space-y-4">
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Asunto</label>
              <input
                type="text"
                name="subject"
                id="subject"
                value={contactForm.subject}
                onChange={handleInputChange}
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
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
              ></textarea>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enviando...
                  </>
                ) : 'Enviar Mensaje'}
              </button>
              <button
                type="button"
                onClick={() => alert('Chat en tiempo real no disponible (simulación).')}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <LifebuoyIcon className="h-5 w-5 mr-2" /> Chat en Tiempo Real
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default HelpAndSupportSection;
