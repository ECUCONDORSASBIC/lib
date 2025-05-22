"use client";

import Link from 'next/link';
import Image from 'next/image';

export default function TermsOfServicePage() {
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
          <h1 className="text-3xl md:text-4xl font-bold text-sky-700 mb-8 text-center">Términos de Servicio</h1>
          
          <p className="text-sm text-gray-500 mb-6">Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-sky-600 mb-3">1. Acuerdo de los Términos</h2>
            <p className="text-gray-700 leading-relaxed">
              Estos Términos de Servicio constituyen un acuerdo legalmente vinculante hecho entre usted, ya sea personalmente o en nombre de una entidad (“usted”) y Altamedica S.A.S. (“nosotros”, “nos” o “nuestro”), concerniente a su acceso y uso del sitio web altamedica.ec así como cualquier otra forma de medio, canal de medios, sitio web móvil o aplicación móvil relacionada, vinculada o conectada de otra manera al mismo (colectivamente, el “Sitio”). Usted acepta que al acceder al Sitio, ha leído, entendido y aceptado estar obligado por todos estos Términos de Servicio. SI NO ESTÁ DE ACUERDO CON TODOS ESTOS TÉRMINOS DE SERVICIO, ENTONCES SE LE PROHÍBE EXPRESAMENTE USAR EL SITIO Y DEBE DESCONTINUAR EL USO INMEDIATAMENTE.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-sky-600 mb-3">2. Derechos de Propiedad Intelectual</h2>
            <p className="text-gray-700 leading-relaxed">
              A menos que se indique lo contrario, el Sitio es nuestra propiedad propietaria y todo el código fuente, bases de datos, funcionalidad, software, diseños de sitios web, audio, video, texto, fotografías y gráficos en el Sitio (colectivamente, el “Contenido”) y las marcas comerciales, marcas de servicio y logotipos contenidos en él (las “Marcas”) son propiedad nuestra o están controlados por nosotros o nos han sido licenciados, y están protegidos por las leyes de derechos de autor y marcas registradas y diversas otras leyes de propiedad intelectual y leyes de competencia desleal de Ecuador, jurisdicciones extranjeras y convenciones internacionales. 
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-sky-600 mb-3">3. Representaciones del Usuario</h2>
            <p className="text-gray-700 leading-relaxed">
              Al usar el Sitio, usted representa y garantiza que: (1) toda la información de registro que envíe será verdadera, precisa, actual y completa; (2) mantendrá la exactitud de dicha información y la actualizará rápidamente según sea necesario; (3) tiene la capacidad legal y acepta cumplir con estos Términos de Servicio; [...] y (6) su uso del Sitio no violará ninguna ley o regulación aplicable.
            </p>
          </section>
          
          <p className="text-gray-700 leading-relaxed mt-8">
            <strong>[Este es un documento de plantilla y debe ser revisado y completado por un asesor legal para asegurar el cumplimiento con todas las leyes y regulaciones aplicables a su jurisdicción y modelo de negocio específico. No confíe únicamente en esta plantilla. Reemplace los marcadores de posición como [TuURLdelSitio.com] y [Tu Dirección Física Completa] con su información real.]</strong>
          </p>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-sky-600 mb-3">Contacto</h2>
            <p className="text-gray-700 leading-relaxed">
              Para resolver una queja sobre el Sitio o para recibir más información sobre el uso del Sitio, por favor contáctenos en:
              <br />
              Altamedica S.A.S.
              <br />
              ECUCONDOR S.A.S. BIC, Quito, Ecuador
              <br />
              legal@altamedica.ec
              <br />
              +593 XXXXXXXX
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
          </div>
        </div>
      </footer>
    </div>
  );
}
