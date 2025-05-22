"use client";

import Link from 'next/link';
import Image from 'next/image';

export default function AboutPage() {
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
        <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-lg shadow-xl">
          <h1 className="text-3xl md:text-4xl font-bold text-sky-700 mb-8 text-center">Sobre Altamedica</h1>
          
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-sky-600 mb-4">Nuestra Misión</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              En Altamedica, nuestra misión es revolucionar el acceso y la calidad de la atención médica a través de la telemedicina avanzada y la inteligencia artificial. Nos dedicamos a conectar pacientes con especialistas de manera eficiente, ofrecer diagnósticos precisos y proporcionar un cuidado personalizado que mejore la calidad de vida de las personas y optimice los servicios de salud para médicos y empresas del sector.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-sky-600 mb-4">Nuestra Visión</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              Aspiramos a ser la plataforma líder en telemedicina y soluciones de salud digital en América Latina, reconocida por nuestra innovación, confiabilidad y el impacto positivo en la salud de millones. Buscamos construir un futuro donde la atención médica de alta calidad sea accesible para todos, sin importar su ubicación geográfica o limitaciones socioeconómicas.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-sky-600 mb-4">Nuestros Valores</h2>
            <ul className="list-disc list-inside text-lg text-gray-700 space-y-3 leading-relaxed">
              <li><strong>Innovación:</strong> Buscamos constantemente nuevas tecnologías y enfoques para mejorar nuestros servicios.</li>
              <li><strong>Cuidado Centrado en el Paciente:</strong> Ponemos las necesidades y el bienestar de los pacientes en el centro de todo lo que hacemos.</li>
              <li><strong>Excelencia:</strong> Nos esforzamos por alcanzar los más altos estándares de calidad en nuestra plataforma y atención.</li>
              <li><strong>Integridad:</strong> Actuamos con honestidad, transparencia y ética profesional en todas nuestras interacciones.</li>
              <li><strong>Colaboración:</strong> Fomentamos el trabajo en equipo y las alianzas estratégicas para lograr un mayor impacto.</li>
              <li><strong>Accesibilidad:</strong> Trabajamos para eliminar barreras y hacer que la atención médica sea más inclusiva.</li>
            </ul>
          </section>
          
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-sky-600 mb-4">Nuestro Equipo</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Altamedica está impulsada por un equipo multidisciplinario de profesionales apasionados por la salud y la tecnología, incluyendo médicos, ingenieros, diseñadores y expertos en negocios. Juntos, trabajamos para hacer realidad nuestra visión de un sistema de salud más conectado y eficiente.
            </p>
             {/* Placeholder for team members if you want to add them later */}
            {/* <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              <div className="text-center">
                <Image src="/images/avatars/team-member1.jpg" alt="Miembro del Equipo 1" width={150} height={150} className="rounded-full mx-auto mb-2" />
                <h3 className="font-semibold text-xl">Nombre Apellido</h3>
                <p className="text-sky-500">Cargo</p>
              </div>
            </div> */}
          </section>

          <div className="text-center mt-12">
            <Link href="/contact" className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-transform transform hover:scale-105">
              Contáctanos para más información
            </Link>
          </div>
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
