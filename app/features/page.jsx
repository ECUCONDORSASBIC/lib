"use client";

import Link from 'next/link';
import Image from 'next/image';

// Placeholder icons (consider using a library like Heroicons or Lucide React)
const FeatureIcon = ({ icon }) => <div className="text-4xl mb-4 text-sky-500">{icon}</div>;

export default function FeaturesPage() {
  const features = [
    {
      title: "Plataforma Intuitiva y Fácil de Usar",
      description: "Diseñada pensando en el usuario, nuestra interfaz es amigable tanto para pacientes como para profesionales médicos, facilitando la navegación y el acceso a todas las funcionalidades.",
      icon: "🖥️"
    },
    {
      title: "Seguridad de Datos Nivel Hospitalario",
      description: "Cumplimos con los más altos estándares de seguridad y privacidad de datos (HIPAA, GDPR), garantizando la confidencialidad de la información médica en todo momento.",
      icon: "🛡️"
    },
    {
      title: "Videoconferencias en Alta Definición",
      description: "Consultas virtuales claras y fluidas con video y audio de alta calidad, optimizadas para conexiones de bajo ancho de banda.",
      icon: "📹"
    },
    {
      title: "Agenda Inteligente y Gestión de Citas",
      description: "Sistema de agendamiento flexible con recordatorios automáticos para pacientes y médicos, reduciendo las ausencias y optimizando el tiempo clínico.",
      icon: "📅"
    },
    {
      title: "Historia Clínica Electrónica (HCE) Centralizada",
      description: "Acceso seguro y unificado al historial médico completo del paciente, incluyendo diagnósticos, tratamientos, resultados de laboratorio e imágenes.",
      icon: "📂"
    },
    {
      title: "Prescripciones Electrónicas (e-Prescribing)",
      description: "Generación y envío seguro de recetas electrónicas directamente a la farmacia elegida por el paciente, mejorando la adherencia y reduciendo errores.",
      icon: "℞"
    },
    {
      title: "Integración con Wearables y Dispositivos Médicos",
      description: "Sincronización de datos de salud provenientes de dispositivos de monitoreo personal para un seguimiento más completo y proactivo.",
      icon: "⌚"
    },
    {
      title: "Módulos Educativos para Pacientes",
      description: "Acceso a una biblioteca de recursos educativos sobre condiciones médicas, tratamientos y hábitos saludables para empoderar a los pacientes en su cuidado.",
      icon: "📚"
    },
    {
      title: "Analíticas e Informes para Profesionales",
      description: "Herramientas de visualización de datos y generación de informes para ayudar a los médicos y administradores a tomar decisiones informadas y mejorar la calidad de la atención.",
      icon: "📊"
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
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-sky-700 mb-10 text-center">Características Destacadas de Altamedica</h1>
          
          <p className="text-lg text-gray-700 leading-relaxed mb-12 text-center max-w-4xl mx-auto">
            Descubre las funcionalidades que hacen de Altamedica una plataforma de telemedicina integral, potente y fácil de usar para transformar la atención médica.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col items-center text-center">
                <FeatureIcon icon={feature.icon} />
                <h2 className="text-xl font-semibold text-sky-600 mb-3">{feature.title}</h2>
                <p className="text-gray-600 leading-relaxed flex-grow">{feature.description}</p>
              </div>
            ))}
          </div>

          <section className="mt-16 py-12 bg-sky-700 text-white rounded-lg px-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Innovación Constante para un Mejor Cuidado</h2>
            <p className="text-lg leading-relaxed mb-8 text-center max-w-3xl mx-auto">
              Nuestro equipo de desarrollo trabaja continuamente para incorporar las últimas tecnologías y mejorar la experiencia de nuestros usuarios. Estamos comprometidos con la evolución constante de Altamedica.
            </p>
            <div className="text-center">
              <Link href="/contact#demostracion" className="inline-flex items-center justify-center px-10 py-4 border border-transparent text-base font-medium rounded-md text-sky-700 bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-transform transform hover:scale-105">
                Solicita una Demostración
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
