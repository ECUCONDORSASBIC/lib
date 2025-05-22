"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 py-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full text-left text-lg font-semibold text-sky-700 hover:text-sky-800"
      >
        <span>{question}</span>
        <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      {isOpen && (
        <div className="mt-4 text-gray-600 leading-relaxed">
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
};

export default function FAQPage() {
  const faqs = [
    {
      question: "¿Qué es Altamedica?",
      answer: "Altamedica es una plataforma integral de telemedicina que utiliza inteligencia artificial para conectar a pacientes con especialistas, ofrecer diagnósticos precisos y facilitar el monitoreo remoto de la salud. Nuestro objetivo es hacer la atención médica más accesible, eficiente y personalizada."
    },
    {
      question: "¿Cómo puedo registrarme en Altamedica?",
      answer: "Puedes registrarte fácilmente haciendo clic en el botón 'Comenzar Ahora' o 'Regístrate Gratis' en nuestra página de inicio. Sigue los pasos para crear tu cuenta como paciente, médico o representante de una empresa."
    },
    {
      question: "¿Qué tipo de especialistas están disponibles en la plataforma?",
      answer: "Contamos con una amplia red de médicos especialistas en diversas áreas, incluyendo cardiología, dermatología, pediatría, ginecología, salud mental, nutrición, entre otros. Constantemente estamos expandiendo nuestra red."
    },
    {
      question: "¿Es segura mi información médica en Altamedica?",
      answer: "Absolutamente. La seguridad y privacidad de tu información es nuestra máxima prioridad. Cumplimos con los estándares más rigurosos de seguridad de datos, como HIPAA y GDPR, utilizando encriptación y protocolos avanzados para proteger tu información."
    },
    {
      question: "¿Necesito algún equipo especial para usar Altamedica?",
      answer: "Para las teleconsultas, solo necesitas un dispositivo con conexión a internet (computadora, tableta o smartphone) que tenga cámara y micrófono. Para el monitoreo remoto, podrías necesitar dispositivos específicos que te serían indicados o proporcionados según el caso."
    },
    {
      question: "¿Altamedica ofrece servicios para empresas?",
      answer: "Sí, ofrecemos soluciones de salud digital para empresas, incluyendo programas de bienestar corporativo, optimización de servicios médicos para clínicas y hospitales, y herramientas para mejorar la gestión de la salud de los empleados."
    },
    {
      question: "¿Cómo funciona el diagnóstico asistido por IA?",
      answer: "Nuestras herramientas de IA analizan datos clínicos e imágenes médicas para identificar patrones y posibles diagnósticos, proporcionando a los médicos información valiosa para la toma de decisiones clínicas. Es importante destacar que la IA es una herramienta de apoyo, y el diagnóstico final siempre lo realiza un profesional médico."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="container flex items-center justify-start px-4 py-3 mx-auto md:px-8">
          <Link href="/" className="inline-block">
            <Image
              src="/logo-altamedica.png"
              alt="Altamedica Logo"
              width={180} 
              height={45} 
              priority
              className="w-auto h-10 md:h-12"
            />
          </Link>
          <nav className="ml-auto">
            <Link href="/" className="text-gray-600 hover:text-sky-600 transition-colors">
              Volver a Inicio
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-sky-700 mb-10 text-center">Preguntas Frecuentes (FAQ)</h1>
          
          <div className="bg-white p-8 md:p-10 rounded-lg shadow-xl">
            {faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>

          <section className="mt-16 text-center">
            <h2 className="text-2xl font-semibold text-sky-700 mb-4">¿No encontraste tu respuesta?</h2>
            <p className="text-lg text-gray-600 mb-6">
              Si tienes más preguntas o necesitas asistencia personalizada, no dudes en contactarnos.
            </p>
            <Link href="/contact" className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-transform transform hover:scale-105">
              Contactar a Soporte
            </Link>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 text-gray-300 py-10 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Altamedica S.A.S. Todos los derechos reservados.</p>
          <p className="mt-1">Una empresa de ECUCONDOR S.A.S. BIC. Quito, Ecuador.</p>
          <div className="mt-4">
            <Link href="/privacy-policy" className="text-gray-400 hover:text-sky-400 mx-2">Política de Privacidad</Link>
            |
            <Link href="/terms-of-service" className="text-gray-400 hover:text-sky-400 mx-2">Términos de Servicio</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
