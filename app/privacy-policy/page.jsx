"use client";

import Link from 'next/link';
import Image from 'next/image';

export default function PrivacyPolicyPage() {
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
        <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-lg shadow-xl">
          <h1 className="text-3xl md:text-4xl font-bold text-sky-700 mb-8 text-center">Política de Privacidad</h1>
          
          <p className="text-sm text-gray-500 mb-6">Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-sky-600 mb-3">1. Introducción</h2>
            <p className="text-gray-700 leading-relaxed">
              Bienvenido a Altamedica (en adelante, "nosotros", "nuestro" o "Altamedica"). Nos comprometemos a proteger la privacidad de nuestros usuarios ("usted", "su"). Esta Política de Privacidad explica cómo recopilamos, usamos, divulgamos y salvaguardamos su información cuando visita nuestro sitio web [TuURLdelSitio.com], incluyendo cualquier otra forma de medio, canal de medios, sitio web móvil o aplicación móvil relacionada o conectada al mismo (colectivamente, el "Sitio"). Por favor, lea esta política de privacidad cuidadosamente. Si no está de acuerdo con los términos de esta política de privacidad, por favor no acceda al sitio.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-sky-600 mb-3">2. Recopilación de su Información</h2>
            <p className="text-gray-700 leading-relaxed">
              Podemos recopilar información sobre usted de varias maneras. La información que podemos recopilar en el Sitio incluye:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mt-2 leading-relaxed">
              <li><strong>Datos Personales:</strong> Información de identificación personal, como su nombre, dirección de envío, dirección de correo electrónico y número de teléfono, y datos demográficos, como su edad, sexo, ciudad natal e intereses, que nos proporciona voluntariamente cuando se registra en el Sitio o cuando elige participar en diversas actividades relacionadas con el Sitio, como chat en línea y tablones de mensajes.</li>
              <li><strong>Datos Derivados:</strong> Información que nuestros servidores recopilan automáticamente cuando accede al Sitio, como su dirección IP, su tipo de navegador, su sistema operativo, sus tiempos de acceso y las páginas que ha visto directamente antes y después de acceder al Sitio.</li>
              <li><strong>Datos Financieros:</strong> Información financiera, como datos relacionados con su método de pago (por ejemplo, número de tarjeta de crédito válida, marca de la tarjeta, fecha de caducidad) que podemos recopilar cuando compra, ordena, devuelve, intercambia o solicita información sobre nuestros servicios desde el Sitio. [Mantenemos solo información muy limitada, si la hubiera, de datos financieros. De lo contrario, toda la información financiera es almacenada por nuestro procesador de pagos, [Nombre del Procesador de Pagos], y le recomendamos que revise su política de privacidad y se ponga en contacto directamente con ellos para obtener respuestas a sus preguntas.]</li>
              <li><strong>Datos de Salud (Información de Salud Protegida - PHI):</strong> En el curso de la prestación de nuestros servicios de telemedicina, podemos recopilar información sensible relacionada con su salud. Esta información se maneja con el más alto nivel de confidencialidad y de acuerdo con las regulaciones aplicables como HIPAA (en EE. UU.) o equivalentes locales.</li>
            </ul>
          </section>
          
          {/* Añadir más secciones según sea necesario: Uso de su información, Divulgación de su información, Seguridad de su información, Derechos del usuario, etc. */}
          <p className="text-gray-700 leading-relaxed mt-8">
            <strong>[Este es un documento de plantilla y debe ser revisado y completado por un asesor legal para asegurar el cumplimiento con todas las leyes y regulaciones aplicables a su jurisdicción y modelo de negocio específico. No confíe únicamente en esta plantilla.]</strong>
          </p>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-sky-600 mb-3">Contacto</h2>
            <p className="text-gray-700 leading-relaxed">
              Si tiene preguntas o comentarios sobre esta Política de Privacidad, por favor contáctenos en:
              <br />
              Altamedica S.A.S.
              <br />
              [Tu Dirección Física Completa]
              <br />
              [Tu Email de Contacto para Privacidad]
              <br />
              [Tu Número de Teléfono de Contacto para Privacidad]
            </p>
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
