"use client";

import Link from 'next/link';
import Image from 'next/image';

export default function CookiesPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="container flex items-center justify-start px-4 py-3 mx-auto md:px-8">
          <Link href="/" legacyBehavior>
            <a className="inline-block">
              <Image
                src="/logo-altamedica.png"
                alt="Altamedica Logo"
                width={180} 
                height={45} 
                priority
                className="w-auto h-10 md:h-12"
              />
            </a>
          </Link>
          <nav className="ml-auto">
            <Link href="/" legacyBehavior>
              <a className="text-gray-600 hover:text-sky-600 transition-colors">
                Volver a Inicio
              </a>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-lg shadow-xl">
          <h1 className="text-3xl md:text-4xl font-bold text-sky-700 mb-8 text-center">Política de Cookies</h1>
          
          <p className="text-sm text-gray-500 mb-6">Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-sky-600 mb-3">1. ¿Qué son las cookies?</h2>
            <p className="text-gray-700 leading-relaxed">
              Una cookie es un pequeño archivo de texto que un sitio web guarda en su computadora o dispositivo móvil cuando usted visita el sitio. Permite que el sitio web recuerde sus acciones y preferencias (como inicio de sesión, idioma, tamaño de fuente y otras preferencias de visualización) durante un período de tiempo, para que no tenga que seguir reingresándolas cada vez que regrese al sitio o navegue de una página a otra.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-sky-600 mb-3">2. ¿Cómo usamos las cookies?</h2>
            <p className="text-gray-700 leading-relaxed">
              En Altamedica ([TuURLdelSitio.com]), utilizamos cookies para varios propósitos, tales como:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mt-2 leading-relaxed">
              <li><strong>Cookies Esenciales:</strong> Algunas cookies son esenciales para que pueda navegar por el sitio web y utilizar sus funciones, como acceder a áreas seguras del sitio. Sin estas cookies, los servicios que ha solicitado no se pueden proporcionar.</li>
              <li><strong>Cookies de Rendimiento y Analíticas:</strong> Estas cookies recopilan información sobre cómo los visitantes usan un sitio web, por ejemplo, qué páginas visitan los visitantes con más frecuencia y si reciben mensajes de error de las páginas web. Estas cookies no recopilan información que identifique a un visitante. Toda la información que recopilan estas cookies es agregada y, por lo tanto, anónima. Solo se utiliza para mejorar el funcionamiento de un sitio web.</li>
              <li><strong>Cookies de Funcionalidad:</strong> Estas cookies permiten que el sitio web recuerde las elecciones que realiza (como su nombre de usuario, idioma o la región en la que se encuentra) y proporcionan funciones mejoradas y más personales.</li>
              <li><strong>Cookies de Publicidad o Segmentación:</strong> Estas cookies se utilizan para entregar anuncios más relevantes para usted y sus intereses. También se utilizan para limitar la cantidad de veces que ve un anuncio, así como para ayudar a medir la efectividad de la campaña publicitaria. Suelen ser colocadas por redes publicitarias con el permiso del operador del sitio web.</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-sky-600 mb-3">3. Control de cookies</h2>
            <p className="text-gray-700 leading-relaxed">
              Puede controlar y/o eliminar las cookies como desee – para más detalles, consulte aboutcookies.org. Puede eliminar todas las cookies que ya están en su computadora y puede configurar la mayoría de los navegadores para evitar que se coloquen. Sin embargo, si hace esto, es posible que tenga que ajustar manualmente algunas preferencias cada vez que visite un sitio y que algunos servicios y funcionalidades no funcionen.
            </p>
          </section>
          
          <p className="text-gray-700 leading-relaxed mt-8">
            <strong>[Este es un documento de plantilla y debe ser revisado y completado por un asesor legal. Asegúrese de listar los tipos específicos de cookies que utiliza su sitio y por qué.]</strong>
          </p>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-sky-600 mb-3">Contacto</h2>
            <p className="text-gray-700 leading-relaxed">
              Si tiene alguna pregunta sobre nuestro uso de cookies, por favor contáctenos en:
              <br />
              Altamedica S.A.S.
              <br />
              legal@altamedica.ec
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
            <Link href="/privacy-policy" legacyBehavior><a className="text-gray-400 hover:text-sky-400 mx-2">Política de Privacidad</a></Link>
            |
            <Link href="/terms-of-service" legacyBehavior><a className="text-gray-400 hover:text-sky-400 mx-2">Términos de Servicio</a></Link>
            |
            <Link href="/cookies-policy" legacyBehavior><a className="text-gray-400 hover:text-sky-400 mx-2">Política de Cookies</a></Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
