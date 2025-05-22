"use client";

import Link from 'next/link';
import Image from 'next/image';

export default function ServicesPage() {
  const services = [
    {
      title: "Teleconsultas Médicas Especializadas",
      description: "Acceso rápido y conveniente a médicos especialistas en diversas áreas como cardiología, dermatología, pediatría, ginecología, y más, desde la comodidad de tu hogar.",
      icon: "🩺" // Placeholder icon
    },
    {
      title: "Diagnóstico Asistido por IA",
      description: "Utilizamos algoritmos de inteligencia artificial para analizar imágenes médicas y datos clínicos, proporcionando un apoyo diagnóstico más rápido y preciso a los profesionales de la salud.",
      icon: "💡" // Placeholder icon
    },
    {
      title: "Monitoreo Remoto de Pacientes (RPM)",
      description: "Seguimiento continuo de pacientes con enfermedades crónicas a través de dispositivos wearables y sensores, permitiendo una intervención proactiva y personalizada.",
      icon: "💓" // Placeholder icon
    },
    {
      title: "Plataforma de Gestión para Clínicas y Hospitales",
      description: "Soluciones integrales para optimizar la gestión de citas, historias clínicas electrónicas, facturación y comunicación con pacientes en instituciones de salud.",
      icon: "🏥" // Placeholder icon
    },
    {
      title: "Programas de Bienestar Corporativo",
      description: "Planes de salud digital personalizados para empresas, enfocados en la prevención, el bienestar de los empleados y la reducción del ausentismo laboral.",
      icon: "🏢" // Placeholder icon
    },
    {
      title: "Segunda Opinión Médica Online",
      description: "Facilitamos el acceso a segundas opiniones de expertos reconocidos a nivel nacional e internacional para casos médicos complejos.",
      icon: "👥" // Placeholder icon
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
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-sky-700 mb-10 text-center">Nuestros Servicios</h1>
          
          <p className="text-lg text-gray-700 leading-relaxed mb-12 text-center max-w-3xl mx-auto">
            En Altamedica, ofrecemos una amplia gama de servicios diseñados para cubrir las necesidades de pacientes, médicos y empresas del sector salud, leveraging lo último en tecnología de telemedicina e inteligencia artificial.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col">
                <div className="text-4xl mb-4 text-center">{service.icon}</div>
                <h2 className="text-xl font-semibold text-sky-600 mb-3 text-center">{service.title}</h2>
                <p className="text-gray-600 leading-relaxed flex-grow">{service.description}</p>
                <div className="mt-6 text-center">
                  <Link href="/contact" className="inline-block px-6 py-2 text-sm font-medium text-white bg-sky-500 rounded-lg hover:bg-sky-600 transition-colors">
                    Más Información
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <section className="mt-16 py-12 bg-sky-50 rounded-lg px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-sky-700 mb-6 text-center">¿Interesado en una Solución Personalizada?</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-8 text-center max-w-2xl mx-auto">
              Entendemos que cada organización tiene necesidades únicas. Contáctanos para discutir cómo podemos adaptar nuestros servicios a tus requerimientos específicos.
            </p>
            <div className="text-center">
              <Link href="/contact" className="inline-flex items-center justify-center px-10 py-4 border border-transparent text-base font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-transform transform hover:scale-105">
                Habla con un Experto
              </Link>
            </div>
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
