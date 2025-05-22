"use client";

import Link from 'next/link';
import Image from 'next/image';

// Sample blog posts data (replace with actual data source)
const blogPosts = [
  {
    id: 1,
    title: "Revolucionando la Atención Médica con Telemedicina e IA",
    slug: "revolucionando-atencion-medica-telemedicina-ia",
    date: "Mayo 15, 2025",
    excerpt: "Descubre cómo Altamedica está transformando el acceso a la salud a través de tecnologías innovadoras, mejorando la vida de pacientes y la eficiencia de los profesionales.",
    imageUrl: "/images/blog/telemedicina-ia.jpg", // Placeholder image
    category: "Innovación"
  },
  {
    id: 2,
    title: "5 Beneficios Clave del Monitoreo Remoto de Pacientes (RPM)",
    slug: "beneficios-monitoreo-remoto-pacientes",
    date: "Mayo 10, 2025",
    excerpt: "El RPM no solo mejora los resultados de salud, sino que también ofrece comodidad y tranquilidad. Conoce sus ventajas más importantes.",
    imageUrl: "/images/blog/rpm-beneficios.jpg", // Placeholder image
    category: "Salud Digital"
  },
  {
    id: 3,
    title: "La Importancia de la Seguridad de Datos en la Telemedicina",
    slug: "seguridad-datos-telemedicina",
    date: "Mayo 5, 2025",
    excerpt: "En Altamedica, la protección de tu información es primordial. Aprende sobre las medidas que tomamos para garantizar la confidencialidad y seguridad de tus datos médicos.",
    imageUrl: "/images/blog/seguridad-datos.jpg", // Placeholder image
    category: "Seguridad"
  }
];

export default function BlogPage() {
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
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-sky-700 mb-10 text-center">Nuestro Blog</h1>
          
          <p className="text-lg text-gray-700 leading-relaxed mb-12 text-center max-w-3xl mx-auto">
            Mantente informado sobre las últimas noticias, avances tecnológicos y consejos de salud de la mano de los expertos de Altamedica.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <div key={post.id} className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col hover:shadow-2xl transition-shadow duration-300">
                {post.imageUrl && (
                  <div className="relative w-full h-56">
                    <Image 
                        src={post.imageUrl} 
                        alt={post.title} 
                        fill 
                        style={{ objectFit: 'cover' }} 
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                )}
                <div className="p-6 flex flex-col flex-grow">
                  <p className="text-sm text-sky-500 mb-1 uppercase font-semibold">{post.category}</p>
                  <h2 className="text-xl font-semibold text-sky-700 mb-2 hover:text-sky-800 transition-colors">
                    <Link href={`/blog/${post.slug}`} legacyBehavior>
                      <a>{post.title}</a>
                    </Link>
                  </h2>
                  <p className="text-xs text-gray-500 mb-3">{post.date}</p>
                  <p className="text-gray-600 leading-relaxed text-sm flex-grow mb-4">{post.excerpt}</p>
                  <Link href={`/blog/${post.slug}`} legacyBehavior>
                    <a className="text-sm font-medium text-sky-600 hover:text-sky-700 transition-colors self-start">
                      Leer más &rarr;
                    </a>
                  </Link>
                </div>
              </div>
            ))}
          </div>
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
