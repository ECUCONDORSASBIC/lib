"use client";

import Link from 'next/link';
import Image from 'next/image'; // Import Image for logo

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header similar to landing page */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="container flex items-center justify-start px-4 py-3 mx-auto md:px-8">
          <Link href="/" className="inline-block">
              <Image
                src="/logo-altamedica.png" // Assuming you have this logo in /public
                alt="Altamedica Logo"
                width={180} 
                height={45} 
                priority
                className="w-auto h-10 md:h-12"
              />
          </Link>
          {/* Optional: Add a simple nav back to home or key sections */}
          <nav className="ml-auto">
            <Link href="/" className="text-gray-600 hover:text-sky-600 transition-colors">
              Volver a Inicio
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-lg shadow-xl">
          <h1 className="text-3xl md:text-4xl font-bold text-sky-700 mb-8 text-center">Contáctanos</h1>
          
          <p className="text-lg text-gray-700 mb-8 leading-relaxed">
            Estamos aquí para ayudarte. Si tienes alguna pregunta sobre nuestros servicios, necesitas soporte técnico o quieres explorar oportunidades de colaboración, no dudes en ponerte en contacto con nosotros a través de los siguientes medios o utilizando el formulario.
          </p>

          <div className="grid md:grid-cols-2 gap-10 mb-10">
            <div className="bg-sky-50 p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold text-sky-600 mb-4">Información de Contacto</h2>
              <p className="text-gray-700 mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-sky-500" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                <strong>Email:</strong>&nbsp;<a href="mailto:info@altamedica.co" className="text-sky-500 hover:underline">info@altamedica.co</a>
              </p>
              <p className="text-gray-700 mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-sky-500" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
                <strong>Teléfono:</strong>&nbsp;<a href="tel:+573001234567" className="text-sky-500 hover:underline">+57 300 123 4567</a>
              </p>
              <p className="text-gray-700 flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-sky-500 flex-shrink-0 mt-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                <span><strong>Dirección:</strong><br/>Av. Amazonas N37-29 y Juan Pablo Sanz,<br/>Edificio Antisana I, Piso 3, Oficina 302,<br/>Quito, Ecuador.</span>
              </p>
            </div>
            <div className="bg-sky-50 p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold text-sky-600 mb-4">Horario de Atención</h2>
              <p className="text-gray-700 mb-2">Lunes a Viernes: 9:00 AM - 6:00 PM (GMT-5)</p>
              <p className="text-gray-700">Sábados y Domingos: Cerrado</p>
              <p className="text-gray-700 mt-4 text-sm"><em>Para emergencias o soporte fuera de horario, por favor utilice el email y marcaremos su caso como prioritario.</em></p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-2xl md:text-3xl font-semibold text-sky-600 mb-6 text-center">Envíanos un Mensaje Directo</h2>
            <form action="#" method="POST" className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-800">Nombre Completo</label>
                <input type="text" name="name" id="name" autoComplete="name" required className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm transition-shadow" placeholder="Ej: Juan Pérez"/>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-800">Correo Electrónico</label>
                <input type="email" name="email" id="email" autoComplete="email" required className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm transition-shadow" placeholder="tu@ejemplo.com"/>
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-800">Asunto</label>
                <input type="text" name="subject" id="subject" required className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm transition-shadow" placeholder="Consulta sobre servicios"/>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-800">Mensaje</label>
                <textarea id="message" name="message" rows={5} required className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm transition-shadow" placeholder="Escribe tu mensaje aquí..."></textarea>
              </div>
              <div className="text-center pt-2">
                <button type="submit" className="inline-flex justify-center py-3 px-8 border border-transparent shadow-lg text-base font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-transform transform hover:scale-105">
                  Enviar Mensaje
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Footer similar to landing page */}
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
