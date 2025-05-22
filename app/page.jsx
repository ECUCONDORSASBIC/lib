"use client";

import OptimizedImage from './components/ui/OptimizedImage';
import Link from 'next/link';
import { useState, useEffect } from 'react';

// Iconos de Heroicons
import {
  BriefcaseIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ClockIcon,
  HeartIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  ArrowRightIcon,
  ChevronRightIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

// Perfiles de usuario para el selector
const userProfiles = [
  { id: 'patient', name: 'Paciente', icon: UserGroupIcon },
  { id: 'doctor', name: 'Profesional médico', icon: HeartIcon },
  { id: 'business', name: 'Empresa', icon: BriefcaseIcon }
];

// Testimonios estructurados por tipo de usuario
const testimoniosPorTipo = {
  patient: [
    {
      nombre: "Laura Gómez",
      cargo: "Paciente con Diabetes Tipo 2",
      avatar: "/images/avatars/laura-gomez.jpg",
      comentario: "Altamedica ha transformado cómo manejo mi condición. El monitoreo constante y el acceso fácil a mi médico me dan una tranquilidad que no tenía antes. ¡Altamente recomendado!"
    },
    {
      nombre: "Martín Sánchez",
      cargo: "Paciente con hipertensión",
      avatar: "/images/avatars/martin-sanchez.jpg",
      comentario: "Gracias a Altamedica he reducido mis visitas presenciales en un 70%. La plataforma es muy fácil de usar y el seguimiento diario me ha ayudado a controlar mejor mi presión arterial."
    }
  ],
  doctor: [
    {
      nombre: "Dr. Carlos Fernández",
      cargo: "Cardiólogo en Clínica Central",
      avatar: "/images/avatars/carlos-fernandez.jpg",
      comentario: "La plataforma es intuitiva y las herramientas de IA realmente agilizan mi flujo de trabajo. Puedo dedicar más tiempo de calidad a mis pacientes y ofrecer diagnósticos más precisos."
    },
    {
      nombre: "Dra. Luisa Ramírez",
      cargo: "Médico de familia",
      avatar: "/images/avatars/luisa-ramirez.jpg",
      comentario: "Altamedica me ha permitido realizar seguimiento efectivo de pacientes crónicos. Los cuadros de mando y alertas tempranas son excepcionalmente útiles para la práctica diaria."
    }
  ],
  business: [
    {
      nombre: "Ana Torres",
      cargo: "Gerente de Bienestar Corporativo",
      avatar: "/images/avatars/ana-torres.jpg",
      comentario: "Implementamos Altamedica para nuestros empleados y el feedback ha sido increíble. Mejoró el acceso a servicios de salud y la productividad general."
    },
    {
      nombre: "Ricardo Méndez",
      cargo: "Director de Hospital Regional",
      avatar: "/images/avatars/ricardo-mendez.jpg",
      comentario: "La adopción de Altamedica ha supuesto un retorno de inversión notable en menos de un año. Hemos optimizado recursos y mejorado significativamente la satisfacción de pacientes y médicos."
    }
  ]
};

// Propuesta de valor por tipo de usuario
const propuestaDeValor = {
  patient: {
    titulo: "Cuida tu salud sin complicaciones",
    subtitulo: "Acceso a médicos 24/7, seguimiento personalizado y detección temprana de problemas de salud.",
    imagen: "/images/patient-dashboard.webp",
    beneficios: [
      "Consultas médicas desde casa sin esperas",
      "Monitoreo continuo de tus condiciones de salud",
      "Recordatorios personalizados de medicación",
      "Historial médico completo y accesible"
    ],
    cta: "Cuida tu salud ahora"
  },
  doctor: {
    titulo: "Optimiza tu práctica médica",
    subtitulo: "Herramientas de IA para diagnósticos precisos y gestión eficiente de pacientes.",
    imagen: "/images/doctor-dashboard.webp",
    beneficios: [
      "Reduce tareas administrativas en un 40%",
      "Diagnósticos asistidos por IA para mayor precisión",
      "Monitoreo remoto de pacientes crónicos",
      "Colaboración fácil con especialistas"
    ],
    cta: "Mejora tu consulta"
  },
  business: {
    titulo: "Transforma la atención en tu institución",
    subtitulo: "Soluciones digitales integrales que optimizan recursos y mejoran resultados clínicos.",
    imagen: "/images/business-dashboard.webp",
    beneficios: [
      "ROI demostrable en menos de 12 meses",
      "Reducción de hospitalizaciones evitables",
      "Mayor capacidad de atención con los mismos recursos",
      "Analítica avanzada para toma de decisiones"
    ],
    cta: "Optimiza tu institución"
  }
};

export default function LandingPage() {
  // Estado para el tipo de usuario seleccionado
  const [userType, setUserType] = useState('patient');
  
  // Estado para el control del video de fondo
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videos = [
    '/videos/hero0.mp4',
    '/videos/hero1.mp4',
    '/videos/hero2.mp4',
    '/videos/hero3.mp4'
  ];

  // Efecto para cambiar el video cada 8 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [videos.length]);

  // Estados para animaciones y efectos visuales
  const [isScrolled, setIsScrolled] = useState(false);

  // Estado para la verificación de seguros
  const [insuranceQuery, setInsuranceQuery] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [insuranceResult, setInsuranceResult] = useState(null);
  const [insuranceSuggestions, setInsuranceSuggestions] = useState([]);
  const [insuranceLoading, setInsuranceLoading] = useState(false);

  // A/B Test para CTAs - esto simula una implementación de testing A/B
  const [ctaVariant, setCtaVariant] = useState(null);

  // Determinar variante del test A/B para CTA al cargar
  useEffect(() => {
    // Simular asignación aleatoria a una variante (en producción usaríamos una herramienta adecuada)
    const variants = ['default', 'urgent', 'benefit-focused'];
    const assignedVariant = variants[Math.floor(Math.random() * variants.length)];
    setCtaVariant(assignedVariant);

    // Aquí se registraría la impresión de la variante en analítica real
    console.log(`A/B Test - CTA Variant: ${assignedVariant}`);
  }, []);

  // Función para registrar conversiones
  const trackConversion = (source, data = {}) => {
    // En producción, esto enviaría datos a Google Analytics u otro servicio
    console.log(`Conversion Tracked: ${source}`, {
      userType,
      ctaVariant,
      ...data,
      timestamp: new Date().toISOString()
    });
  };

  // Obtener el texto del CTA según la variante
  const getCtaTextByVariant = (baseText) => {
    switch (ctaVariant) {
      case 'urgent':
        return `¡${baseText} ahora!`;
      case 'benefit-focused':
        return baseText + ' y mejora tu salud';
      default:
        return baseText;
    }
  };

  // Lista estática de aseguradoras soportadas para simulación
  const SUPPORTED_INSURERS = [
    { name: "Seguros BBVA", coverage: ["basic", "family", "premium"] },
    { name: "MAPFRE Salud", coverage: ["family", "premium"] },
    { name: "AXA Seguros", coverage: ["premium"] },
    { name: "Sanitas", coverage: ["basic", "family", "premium"] },
    { name: "DKV Seguros", coverage: ["basic", "family"] },
    { name: "Mutua Madrileña", coverage: ["family", "premium"] },
    { name: "Asisa", coverage: ["basic", "family", "premium"] },
    { name: "Adeslas", coverage: ["premium"] },
  ];

  // Manejar cambios en el input del seguro
  const handleInsuranceInputChange = (e) => {
    const value = e.target.value;
    setInsuranceQuery(value);
    setSearchPerformed(false);

    // Mostrar sugerencias si hay texto
    if (value.length > 2) {
      const filtered = SUPPORTED_INSURERS.filter(insurer =>
        insurer.name.toLowerCase().includes(value.toLowerCase())
      );
      setInsuranceSuggestions(filtered.slice(0, 5));
    } else {
      setInsuranceSuggestions([]);
    }
  };

  // Manejar clic en una sugerencia de seguro
  const handleInsuranceSuggestionClick = (insurer) => {
    setInsuranceQuery(insurer.name);
    setInsuranceSuggestions([]);
    handleInsuranceSearch(insurer.name);
  };

  // Manejar la búsqueda de seguro
  const handleInsuranceSearch = (searchQuery = insuranceQuery) => {
    if (!searchQuery) return;

    setInsuranceLoading(true);

    // Simular petición a API con un timeout
    setTimeout(() => {
      const foundInsurer = SUPPORTED_INSURERS.find(
        insurer => insurer.name.toLowerCase() === searchQuery.toLowerCase()
      );

      if (foundInsurer) {
        setInsuranceResult({
          found: true,
          insurer: foundInsurer.name,
          coverageDetails: {
            basic: foundInsurer.coverage.includes("basic"),
            family: foundInsurer.coverage.includes("family"),
            premium: foundInsurer.coverage.includes("premium"),
          }
        });
      } else {
        setInsuranceResult({
          found: false,
          message: "No se encontró cobertura con esta aseguradora. Contáctanos para más información."
        });
      }

      setSearchPerformed(true);
      setInsuranceLoading(false);
      setInsuranceSuggestions([]);
    }, 800); // Simular tiempo de respuesta del servidor
  };

  // Función para manejar el scroll y aplicar efectos visuales
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen text-gray-800 bg-gray-50">
      {/* Header optimizado con selector de perfiles */}
      <header className={`sticky top-0 z-50 bg-white shadow-sm transition-all duration-300 ${isScrolled ? 'py-2' : 'py-3'}`}>
        <div className="container flex items-center justify-between px-4 mx-auto md:px-8">
          <Link href="/" className="inline-block">
            <OptimizedImage
              src="/logo-altamedica.png"
              alt="Altamedica Logo"
              width={180}
              height={45}
              priority
              loadingStrategy="eager"
              className="w-auto h-10 md:h-12"
            />
          </Link>

          {/* Selector de perfiles de usuario */}
          <div className="hidden md:flex items-center space-x-6">
            {userProfiles.map((profile) => (
              <button
                key={profile.id}
                onClick={() => setUserType(profile.id)}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${userType === profile.id
                  ? 'bg-sky-100 text-sky-700'
                  : 'text-gray-600 hover:bg-gray-100'
                  }`}
                aria-pressed={userType === profile.id}
              >
                {profile.icon && <profile.icon className="w-5 h-5 mr-2" />}
                <span>{profile.name}</span>
                {userType === profile.id && <CheckIcon className="w-4 h-4 ml-2 text-sky-600" />}
              </button>
            ))}
          </div>

          {/* Menú móvil simplificado */}
          <div className="flex md:hidden">
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              className="py-2 pr-8 pl-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            >
              {userProfiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Hero Section optimizado con contenido personalizado por perfil */}
      <section className="relative px-4 py-16 overflow-hidden text-white md:px-8 md:py-24">
        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
          {videos.map((video, index) => (
            <video
              key={video}
              autoPlay
              muted
              loop
              playsInline
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                index === currentVideoIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <source src={video} type="video/mp4" />
            </video>
          ))}
          {/* Overlay para oscurecer el video y mejorar la legibilidad */}
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          {/* Gradiente suave */}
          <div className="absolute inset-0 bg-gradient-to-r from-sky-500/80 to-sky-700/80 mix-blend-multiply"></div>
        </div>
        <div className="container relative z-10 mx-auto">
          <div className="flex flex-col items-center lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl text-center lg:text-left lg:pr-6">
              <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
                {propuestaDeValor[userType].titulo}
              </h1>
              <p className="mb-8 text-lg md:text-xl">
                {propuestaDeValor[userType].subtitulo}
              </p>

              <ul className="mb-8 space-y-3 text-left">
                {propuestaDeValor[userType].beneficios.map((beneficio, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircleIcon className="flex-shrink-0 w-6 h-6 mr-2 text-yellow-300" />
                    <span>{beneficio}</span>
                  </li>
                ))}
              </ul>

              {/* CTA principal simplificado y enfocado */}
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 lg:justify-start justify-center">
                <Link
                  href="/auth/register"
                  className={`px-8 py-4 text-lg font-semibold text-center transition-all duration-300 rounded-lg shadow-md text-sky-900 hover:shadow-lg focus:ring-2 focus:ring-offset-2 focus:outline-none
                    ${ctaVariant === 'urgent' ? 'bg-red-400 hover:bg-red-300 focus:ring-red-500' :
                      ctaVariant === 'benefit-focused' ? 'bg-green-400 hover:bg-green-300 focus:ring-green-500' :
                        'bg-yellow-400 hover:bg-yellow-300 focus:ring-yellow-500'}`}
                  onClick={() => trackConversion('hero_cta', { action: 'register_click' })}
                >
                  {getCtaTextByVariant(propuestaDeValor[userType].cta)}
                  <ChevronRightIcon className="inline-block w-5 h-5 ml-2" />
                </Link>
                <Link
                  href="/features"
                  className="px-8 py-4 text-lg font-semibold text-center text-white transition-all duration-300 border-2 border-white rounded-lg hover:bg-white/10 focus:ring-2 focus:ring-offset-2 focus:ring-white focus:outline-none"
                  onClick={() => trackConversion('hero_secondary_cta', { action: 'features_click' })}
                >
                  Ver todas las funciones
                </Link>
              </div>
            </div>

            {/* Imagen de dashboard optimizada */}
            <div className="relative mt-12 lg:mt-0 max-w-lg">
              <div className="rounded-xl overflow-hidden shadow-2xl">
                <OptimizedImage
                  src={propuestaDeValor[userType].imagen}
                  alt={`Dashboard para ${userProfiles.find(p => p.id === userType).name}`}
                  width={580}
                  height={360}
                  loadingStrategy="eager"
                  className="w-full h-auto rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Decoración de fondo (versión ligera) */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white/5 to-transparent"></div>
      </section>

      {/* Features Section optimizada y enfocada */}
      <section className="px-4 py-16 bg-white md:px-8 md:py-24">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-sky-700 md:text-4xl">
              Plataforma integral de salud digital
            </h2>
            <p className="text-xl text-gray-600">
              Conectamos todas las piezas del ecosistema de salud para una experiencia fluida y efectiva
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Telemedicina de alta calidad",
                description: "Consultas por video HD con especialistas sin salir de casa, con herramientas avanzadas para una mejor experiencia médica.",
                icon: ChatBubbleLeftRightIcon,
                color: "text-emerald-600",
                bgColor: "bg-emerald-50"
              },
              {
                title: "Diagnóstico asistido por IA",
                description: "Tecnología de inteligencia artificial que ayuda a detectar patrones y condiciones médicas en etapas tempranas.",
                icon: LightBulbIcon,
                color: "text-purple-600",
                bgColor: "bg-purple-50"
              },
              {
                title: "Monitoreo remoto continuo",
                description: "Seguimiento de pacientes crónicos mediante dispositivos conectados con alertas automáticas ante cambios importantes.",
                icon: ClockIcon,
                color: "text-amber-600",
                bgColor: "bg-amber-50"
              },
              {
                title: "Seguridad y privacidad",
                description: "Plataforma con certificaciones de seguridad, cumpliendo estándares HIPAA y RGPD para proteger tus datos médicos.",
                icon: ShieldCheckIcon,
                color: "text-red-600",
                bgColor: "bg-red-50"
              },
              {
                title: "Expediente clínico inteligente",
                description: "Historial médico completo con análisis automático y recomendaciones basadas en tu perfil de salud.",
                icon: CheckCircleIcon,
                color: "text-sky-600",
                bgColor: "bg-sky-50"
              },
              {
                title: "Gestión institucional eficiente",
                description: "Herramientas administrativas y analíticas para optimizar procesos y recursos en centros médicos.",
                icon: BriefcaseIcon,
                color: "text-indigo-600",
                bgColor: "bg-indigo-50"
              }
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="p-6 transition-all duration-300 bg-white rounded-xl shadow hover:shadow-lg border border-gray-100"
                >
                  <div className="flex items-center mb-4">
                    <div className={`p-3 mr-4 rounded-lg ${feature.bgColor}`}>
                      {Icon && <Icon className={`w-7 h-7 ${feature.color}`} />}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">{feature.title}</h3>
                  </div>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Sección de demostración visual interactiva */}
      <section className="px-4 py-16 bg-gray-50 md:px-8 md:py-24">
        <div className="container mx-auto">
          <div className="flex flex-col items-center lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl lg:pr-12">
              <h2 className="mb-6 text-3xl font-bold text-sky-700 md:text-4xl">
                Experimenta Altamedica sin registro
              </h2>
              <p className="mb-8 text-lg text-gray-600">
                Prueba nuestras principales funcionalidades con estas demostraciones interactivas antes de crear tu cuenta.
              </p>

              <div className="space-y-6">
                {[
                  {
                    title: "Dashboard personalizado",
                    description: "Visualiza cómo es tener toda tu información médica organizada en un solo lugar.",
                    link: "/demo/dashboard"
                  },
                  {
                    title: "Consulta de telemedicina",
                    description: "Experimenta nuestra plataforma de videoconsultas con funciones médicas avanzadas.",
                    link: "/demo/telemedicine"
                  },
                  {
                    title: "Evaluación de síntomas por IA",
                    description: "Prueba nuestro asistente de anamnesis inteligente que te guía paso a paso.",
                    link: "/demo/symptoms"
                  }
                ].map((demo, index) => (
                  <div key={index} className="p-5 bg-white rounded-lg shadow-sm border border-gray-100">
                    <h3 className="mb-2 text-xl font-semibold text-gray-800">{demo.title}</h3>
                    <p className="mb-3 text-gray-600">{demo.description}</p>
                    <Link
                      href={demo.link}
                      className="inline-flex items-center text-sky-600 hover:text-sky-800 group"
                      onClick={() => trackConversion('demo_interaction', {
                        demo_type: demo.title,
                        action: 'demo_click'
                      })}
                    >
                      <span className="relative">
                        Probar ahora
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-sky-600 group-hover:w-full transition-all duration-300"></span>
                      </span>
                      <ArrowRightIcon className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mt-12 lg:mt-0 w-full max-w-md">
              <OptimizedImage
                src="/images/demo-interactive.webp"
                alt="Demostración interactiva de Altamedica"
                width={500}
                height={600}
                className="rounded-lg shadow-xl"
                loadingStrategy="lazy"
              />

              {/* Indicador de interactividad */}
              <div className="absolute top-4 right-4 flex items-center px-3 py-1.5 bg-emerald-500 text-white text-sm font-medium rounded-full">
                <span className="block w-2 h-2 mr-2 bg-white rounded-full animate-ping"></span>
                Demo en vivo
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de testimonios accesible y mejorada */}
      <section className="px-4 py-16 bg-white md:px-8 md:py-24" id="testimonios">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-sky-700 md:text-4xl">
              Lo que dicen nuestros usuarios
            </h2>
            <p className="text-xl text-gray-600">
              Testimonios de personas que ya están transformando su experiencia en salud
            </p>
          </div>

          {/* Testimonios sin carrusel automático, accesibles */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimoniosPorTipo[userType].map((testimonio, index) => (
              <div
                key={index}
                className="p-6 bg-white rounded-lg shadow border border-gray-100 flex flex-col h-full"
                tabIndex="0"
              >
                <div className="flex items-center mb-4">
                  <div className="relative flex-shrink-0 w-16 h-16 mr-4">
                    <OptimizedImage
                      src={testimonio.avatar || "/images/avatars/default-avatar.webp"}
                      alt={`Foto de ${testimonio.nombre}`}
                      fill
                      className="object-cover rounded-full"
                      sizes="(max-width: 768px) 100vw, 64px"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{testimonio.nombre}</h3>
                    <p className="text-sm text-gray-500">{testimonio.cargo}</p>
                  </div>
                </div>
                <blockquote className="flex-grow">
                  <p className="text-gray-600 italic leading-relaxed">"{testimonio.comentario}"</p>
                </blockquote>
              </div>
            ))}
          </div>

          {/* Selector de perfiles para testimonios en móvil */}
          <div className="flex justify-center mt-8 md:hidden">
            <div className="inline-flex p-1 bg-gray-100 rounded-lg">
              {userProfiles.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => setUserType(profile.id)}
                  className={`px-4 py-2 text-sm font-medium rounded ${userType === profile.id
                    ? 'bg-white shadow text-sky-700'
                    : 'text-gray-600'
                    }`}
                  aria-pressed={userType === profile.id}
                >
                  {profile.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sección de planes y precios mejorada */}
      <section id="pricing-section" className="px-4 py-16 bg-gray-50 md:px-8 md:py-24">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-sky-700 md:text-4xl">
              Planes diseñados para cada necesidad
            </h2>
            <p className="text-xl text-gray-600">
              Elige el plan que mejor se adapte a tus requisitos específicos
            </p>
          </div>

          {/* Selector de tipo de usuario para planes */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex p-1 bg-white rounded-lg shadow border border-gray-200">
              {userProfiles.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => setUserType(profile.id)}
                  className={`px-6 py-3 text-base font-medium rounded transition-all ${userType === profile.id
                    ? 'bg-sky-500 text-white shadow'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  aria-pressed={userType === profile.id}
                >
                  {profile.name}
                </button>
              ))}
            </div>
          </div>

          {/* Mostrar planes específicos según el tipo de usuario */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {userType === 'patient' && (
              <>
                <div className="p-8 bg-white rounded-lg shadow-lg border border-gray-200">
                  <div className="mb-6">
                    <h3 className="mb-2 text-2xl font-bold text-gray-800">Básico</h3>
                    <p className="text-gray-600">Para usuarios individuales con necesidades puntuales</p>
                  </div>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">$19</span>
                    <span className="text-gray-600">/mes</span>
                  </div>
                  <ul className="mb-8 space-y-3">
                    <li className="flex items-center">
                      <CheckIcon className="flex-shrink-0 w-5 h-5 mr-2 text-green-500" />
                      <span>3 consultas de telemedicina/mes</span>
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="flex-shrink-0 w-5 h-5 mr-2 text-green-500" />
                      <span>Historial médico digital básico</span>
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="flex-shrink-0 w-5 h-5 mr-2 text-green-500" />
                      <span>Evaluación de síntomas por IA</span>
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="flex-shrink-0 w-5 h-5 mr-2 text-green-500" />
                      <span>Soporte por chat</span>
                    </li>
                  </ul>
                  <Link
                    href="/auth/register?plan=basic&type=patient"
                    className="block w-full py-3 text-center font-medium text-sky-700 bg-sky-100 rounded-lg hover:bg-sky-200 transition-colors"
                  >
                    Comenzar ahora
                  </Link>
                </div>

                <div className="p-8 bg-white rounded-lg shadow-lg border-2 border-sky-500 relative">
                  <div className="absolute top-0 right-0 px-3 py-1 text-xs font-semibold text-white bg-sky-500 rounded-bl rounded-tr">
                    POPULAR
                  </div>
                  <div className="mb-6">
                    <h3 className="mb-2 text-2xl font-bold text-gray-800">Familiar</h3>
                    <p className="text-gray-600">Ideal para familias de hasta 4 miembros</p>
                  </div>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">$49</span>
                    <span className="text-gray-600">/mes</span>
                  </div>
                  <ul className="mb-8 space-y-3">
                    <li className="flex items-center">
                      <CheckIcon className="flex-shrink-0 w-5 h-5 mr-2 text-green-500" />
                      <span>8 consultas de telemedicina/mes</span>
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="flex-shrink-0 w-5 h-5 mr-2 text-green-500" />
                      <span>Historial médico familiar compartido</span>
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="flex-shrink-0 w-5 h-5 mr-2 text-green-500" />
                      <span>Monitoreo remoto de condiciones</span>
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="flex-shrink-0 w-5 h-5 mr-2 text-green-500" />
                      <span>Hasta 4 perfiles de usuario</span>
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="flex-shrink-0 w-5 h-5 mr-2 text-green-500" />
                      <span>Soporte prioritario 24/7</span>
                    </li>
                  </ul>
                  <Link
                    href="/auth/register?plan=family&type=patient"
                    className="block w-full py-3 text-center font-medium text-white bg-sky-500 rounded-lg hover:bg-sky-600 transition-colors"
                  >
                    Elegir plan familiar
                  </Link>
                </div>

                <div className="p-8 bg-white rounded-lg shadow-lg border border-gray-200">
                  <div className="mb-6">
                    <h3 className="mb-2 text-2xl font-bold text-gray-800">Premium</h3>
                    <p className="text-gray-600">Para atención médica completa y personalizada</p>
                  </div>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">$79</span>
                    <span className="text-gray-600">/mes</span>
                  </div>
                  <ul className="mb-8 space-y-3">
                    <li className="flex items-center">
                      <CheckIcon className="flex-shrink-0 w-5 h-5 mr-2 text-green-500" />
                      <span>Consultas ilimitadas</span>
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="flex-shrink-0 w-5 h-5 mr-2 text-green-500" />
                      <span>Expediente médico avanzado</span>
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="flex-shrink-0 w-5 h-5 mr-2 text-green-500" />
                      <span>Segunda opinión médica incluida</span>
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="flex-shrink-0 w-5 h-5 mr-2 text-green-500" />
                      <span>Médico personal asignado</span>
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="flex-shrink-0 w-5 h-5 mr-2 text-green-500" />
                      <span>Consultas presenciales con descuento</span>
                    </li>
                  </ul>
                  <Link
                    href="/auth/register?plan=premium&type=patient"
                    className="block w-full py-3 text-center font-medium text-sky-700 bg-sky-100 rounded-lg hover:bg-sky-200 transition-colors"
                  >
                    Obtener Premium
                  </Link>
                </div>
              </>
            )}

            {userType === 'doctor' && (
              <>
                <div className="p-8 bg-white rounded-lg shadow-lg border border-gray-200">
                  <div className="mb-6">
                    <h3 className="mb-2 text-2xl font-bold text-gray-800">Profesional</h3>
                    <p className="text-gray-600">Para médicos individuales</p>
                  </div>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">$99</span>
                    <span className="text-gray-600">/mes</span>
                  </div>
                  <ul className="mb-8 space-y-3">
                    <li className="flex items-center">
                      <CheckIcon className="flex-shrink-0 w-5 h-5 mr-2 text-green-500" />
                      <span>Hasta 100 pacientes activos</span>
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="flex-shrink-0 w-5 h-5 mr-2 text-green-500" />
                      <span>Herramientas de diagnóstico básicas</span>
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="flex-shrink-0 w-5 h-5 mr-2 text-green-500" />
                      <span>Agenda y recordatorios</span>
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="flex-shrink-0 w-5 h-5 mr-2 text-green-500" />
                      <span>Soporte técnico estándar</span>
                    </li>
                  </ul>
                  <Link
                    href="/auth/register?plan=professional&type=doctor"
                    className="block w-full py-3 text-center font-medium text-sky-700 bg-sky-100 rounded-lg hover:bg-sky-200 transition-colors"
                  >
                    Iniciar como profesional
                  </Link>
                </div>

                <div className="p-8 bg-white rounded-lg shadow-lg border-2 border-sky-500 relative">
                  <div className="absolute top-0 right-0 px-3 py-1 text-xs font-semibold text-white bg-sky-500 rounded-bl rounded-tr">
                    RECOMENDADO
                  </div>
                  <div className="mb-6">
                    <h3 className="mb-2 text-2xl font-bold text-gray-800">Consulta Avanzada</h3>
                    <p className="text-gray-600">Para consultorios médicos pequeños</p>
                  </div>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">$199</span>
                    <span className="text-gray-600">/mes</span>
                  </div>
                  <ul className="mb-8 space-y-3">
                    <li className="flex items-center">
                      <CheckIcon className="flex-shrink-0 w-5 h-5 mr-2 text-green-500" />
                      <span>Pacientes ilimitados</span>
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="flex-shrink-0 w-5 h-5 mr-2 text-green-500" />
                      <span>IA de apoyo diagnóstico completa</span>
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="flex-shrink-0 w-5 h-5 mr-2 text-green-500" />
                      <span>Gestión de expedientes avanzada</span>
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="flex-shrink-0 w-5 h-5 mr-2 text-green-500" />
                      <span>Facturación integrada</span>
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="flex-shrink-0 w-5 h-5 mr-2 text-green-500" />
                      <span>Soporte prioritario 24/7</span>
                    </li>
                  </ul>
                  <Link
                    href="/auth/register?plan=advanced&type=doctor"
                    className="block w-full py-3 text-center font-medium text-white bg-sky-500 rounded-lg hover:bg-sky-600 transition-colors"
                  >
                    Elegir plan avanzado
                  </Link>
                </div>

                <div className="p-8 bg-white rounded-lg shadow-lg border border-gray-200">
                  <div className="mb-6">
                    <h3 className="mb-2 text-2xl font-bold text-gray-800">Especialista+</h3>
                    <p className="text-gray-600">Funcionalidades específicas para especialistas</p>
                  </div>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">$299</span>
                    <span className="text-gray-600">/mes</span>
                  </div>
                  <ul className="mb-8 space-y-3">
                    <li className="flex items-center">
                      <CheckIcon className="flex-shrink-0 w-5 h-5 mr-2 text-green-500" />
                      <span>Todo lo del plan avanzado</span>
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="flex-shrink-0 w-5 h-5 mr-2 text-green-500" />
                      <span>Módulos por especialidad médica</span>
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="flex-shrink-0 w-5 h-5 mr-2 text-green-500" />
                      <span>Acceso prioritario a referencias</span>
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="flex-shrink-0 w-5 h-5 mr-2 text-green-500" />
                      <span>Integraciones con equipos médicos</span>
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="flex-shrink-0 w-5 h-5 mr-2 text-green-500" />
                      <span>Consultor de implementación dedicado</span>
                    </li>
                  </ul>
                  <Link
                    href="/auth/register?plan=specialist&type=doctor"
                    className="block w-full py-3 text-center font-medium text-sky-700 bg-sky-100 rounded-lg hover:bg-sky-200 transition-colors"
                  >
                    Comenzar como especialista
                  </Link>
                </div>
              </>
            )}

            {userType === 'business' && (
              <>
                <div className="col-span-1 md:col-span-3 p-8 bg-white rounded-lg shadow-lg border border-gray-200 text-center">
                  <div className="mb-6">
                    <h3 className="mb-2 text-2xl font-bold text-gray-800">Soluciones Empresariales a Medida</h3>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                      Ofrecemos planes personalizados para hospitales, clínicas y empresas según sus necesidades específicas.
                      Nuestro equipo de implementación trabajará con usted para diseñar la solución óptima.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="p-5 border border-gray-200 rounded-lg">
                      <h4 className="text-xl font-semibold mb-3 text-sky-700">Hospitales</h4>
                      <ul className="space-y-2 text-left mb-4">
                        <li className="flex items-start">
                          <CheckIcon className="flex-shrink-0 w-5 h-5 mr-2 text-green-500 mt-0.5" />
                          <span>Integración con sistemas existentes (HIS, LIS, RIS)</span>
                        </li>
                        <li className="flex items-start">
                          <CheckIcon className="flex-shrink-0 w-5 h-5 mr-2 text-green-500 mt-0.5" />
                          <span>Telemedicina para atención ambulatoria y seguimiento</span>
                        </li>
                        <li className="flex items-start">
                          <CheckIcon className="flex-shrink-0 w-5 h-5 mr-2 text-green-500 mt-0.5" />
                          <span>Reducción de readmisiones con seguimiento remoto</span>
                        </li>
                      </ul>
                    </div>

                    <div className="p-5 border border-gray-200 rounded-lg">
                      <h4 className="text-xl font-semibold mb-3 text-sky-700">Clínicas</h4>
                      <ul className="space-y-2 text-left mb-4">
                        <li className="flex items-start">
                          <CheckIcon className="flex-shrink-0 w-5 h-5 mr-2 text-green-500 mt-0.5" />
                          <span>Mixta: consultas presenciales y virtuales integradas</span>
                        </li>
                        <li className="flex items-start">
                          <CheckIcon className="flex-shrink-0 w-5 h-5 mr-2 text-green-500 mt-0.5" />
                          <span>Optimización de agendas y reducción de ausencias</span>
                        </li>
                        <li className="flex items-start">
                          <CheckIcon className="flex-shrink-0 w-5 h-5 mr-2 text-green-500 mt-0.5" />
                          <span>Análisis de datos clínicos para mejora continua</span>
                        </li>
                      </ul>
                    </div>

                    <div className="p-5 border border-gray-200 rounded-lg">
                      <h4 className="text-xl font-semibold mb-3 text-sky-700">Empresas</h4>
                      <ul className="space-y-2 text-left mb-4">
                        <li className="flex items-start">
                          <CheckIcon className="flex-shrink-0 w-5 h-5 mr-2 text-green-500 mt-0.5" />
                          <span>Programas de bienestar corporativo personalizados</span>
                        </li>
                        <li className="flex items-start">
                          <CheckIcon className="flex-shrink-0 w-5 h-5 mr-2 text-green-500 mt-0.5" />
                          <span>Reducción de absentismo laboral</span>
                        </li>
                        <li className="flex items-start">
                          <CheckIcon className="flex-shrink-0 w-5 h-5 mr-2 text-green-500 mt-0.5" />
                          <span>Informes de salud poblacional anonimizados</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex justify-center space-x-4">
                    <Link
                      href="/contact?subject=Enterprise"
                      className="px-6 py-3 text-base font-medium text-white bg-sky-500 rounded-lg hover:bg-sky-600 transition-colors"
                    >
                      Solicitar una consulta
                    </Link>
                    <Link
                      href="/business-solutions.pdf"
                      className="px-6 py-3 text-base font-medium text-sky-700 bg-sky-100 rounded-lg hover:bg-sky-200 transition-colors"
                    >
                      Descargar brochure
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Verificador de cobertura de seguros mejorado */}
          <div className="mt-16 p-6 bg-white rounded-lg shadow-md border border-gray-200 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">¿Tienes seguro médico?</h3>
            <p className="text-gray-600 mb-4">
              Verifica si tu seguro médico tiene convenio con Altamedica para obtener beneficios adicionales.
            </p>

            <div className="relative">
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    value={insuranceQuery}
                    onChange={handleInsuranceInputChange}
                    placeholder="Escribe el nombre de tu aseguradora"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />

                  {/* Sugerencias */}
                  {insuranceSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                      <ul>
                        {insuranceSuggestions.map((insurer, index) => (
                          <li
                            key={index}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleInsuranceSuggestionClick(insurer)}
                          >
                            {insurer.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleInsuranceSearch()}
                  disabled={insuranceLoading || !insuranceQuery}
                  className={`px-6 py-2 text-white rounded-lg transition-colors flex items-center justify-center ${insuranceLoading || !insuranceQuery
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-sky-500 hover:bg-sky-600'
                    }`}
                >
                  {insuranceLoading ? (
                    <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  ) : (
                    <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
                  )}
                  Verificar cobertura
                </button>
              </div>
            </div>

            {/* Resultados */}
            {searchPerformed && insuranceResult && (
              <div className={`mt-4 p-4 rounded-lg ${insuranceResult.found ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'
                }`}>
                {insuranceResult.found ? (
                  <div>
                    <div className="flex items-center">
                      <CheckCircleIcon className="w-6 h-6 text-green-500 mr-2" />
                      <span className="font-medium">
                        {insuranceResult.insurer} tiene convenio con Altamedica
                      </span>
                    </div>
                    <div className="mt-4 space-y-2">
                      <h4 className="font-semibold">Planes cubiertos:</h4>
                      <ul className="space-y-1">
                        <li className="flex items-center">
                          {insuranceResult.coverageDetails.basic ? (
                            <CheckCircleIcon className="w-5 h-5 mr-2 text-green-500" />
                          ) : (
                            <XCircleIcon className="w-5 h-5 mr-2 text-red-500" />
                          )}
                          <span className={insuranceResult.coverageDetails.basic ? "" : "text-gray-500"}>Plan Básico</span>
                        </li>
                        <li className="flex items-center">
                          {insuranceResult.coverageDetails.family ? (
                            <CheckCircleIcon className="w-5 h-5 mr-2 text-green-500" />
                          ) : (
                            <XCircleIcon className="w-5 h-5 mr-2 text-red-500" />
                          )}
                          <span className={insuranceResult.coverageDetails.family ? "" : "text-gray-500"}>Plan Familiar</span>
                        </li>
                        <li className="flex items-center">
                          {insuranceResult.coverageDetails.premium ? (
                            <CheckCircleIcon className="w-5 h-5 mr-2 text-green-500" />
                          ) : (
                            <XCircleIcon className="w-5 h-5 mr-2 text-red-500" />
                          )}
                          <span className={insuranceResult.coverageDetails.premium ? "" : "text-gray-500"}>Plan Premium</span>
                        </li>
                      </ul>
                      <p className="text-sm text-green-600 mt-2">
                        {Object.values(insuranceResult.coverageDetails).some(v => v)
                          ? "¡Buenas noticias! Puedes usar tu seguro en Altamedica."
                          : "Tu seguro no cubre nuestros servicios actualmente."}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start">
                    <XCircleIcon className="w-6 h-6 text-red-500 mr-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium">No encontramos cobertura</p>
                      <p className="text-sm text-gray-600 mt-1">{insuranceResult.message}</p>
                      <p className="text-sm mt-3">
                        <Link href="/contact" className="text-sky-600 font-medium hover:underline">
                          Contáctanos
                        </Link>{' '}
                        para ver opciones especiales o{' '}
                        <button
                          onClick={() => {
                            const pricingSection = document.getElementById('pricing-section');
                            if (pricingSection) pricingSection.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="text-sky-600 font-medium hover:underline"
                        >
                          ver nuestros planes
                        </button>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Sección de llamado a la acción final optimizada */}
      <section className="py-20 bg-gradient-to-r from-sky-500 to-sky-700 text-white">
        <div className="container px-4 mx-auto text-center">
          <h2 className="mb-6 text-3xl font-bold md:text-4xl">
            Comienza tu experiencia con Altamedica hoy mismo
          </h2>
          <p className="max-w-2xl mx-auto mb-8 text-lg">
            Únete a miles de pacientes y profesionales que ya experimentan el futuro de la atención médica.
          </p>
          <Link
            href="/auth/register"
            className={`inline-block px-8 py-4 text-lg font-semibold text-sky-700 transition-all duration-300 rounded-lg shadow-md hover:shadow-lg
              ${ctaVariant === 'urgent' ? 'bg-red-100 hover:bg-red-200' :
                ctaVariant === 'benefit-focused' ? 'bg-green-100 hover:bg-green-200' :
                  'bg-white hover:bg-gray-100'}`}
            onClick={() => trackConversion('footer_cta', { action: 'register_click', placement: 'footer' })}
          >
            {getCtaTextByVariant('Crear mi cuenta gratis')}
          </Link>
          <p className="mt-6 text-sm text-sky-100">
            No se requiere tarjeta de crédito para comenzar. Puedes probar todas las funcionalidades básicas sin costo.
          </p>
        </div>
      </section>

      {/* Footer optimizado para rendimiento y accesibilidad */}
      <footer className="pt-16 pb-8 bg-gray-900 text-gray-400">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 gap-8 mb-12 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <Link href="/" className="inline-block mb-4">
                <OptimizedImage
                  src="/logo-altamedica-white.png"
                  alt="Altamedica Logo"
                  width={180}
                  height={45}
                  className="w-auto h-12"
                  loading="lazy"
                />
              </Link>
              <p className="text-sm">Revolucionando la atención médica con tecnología de vanguardia y un enfoque humano.</p>

              {/* Enlaces a redes sociales */}
              <div className="flex space-x-4 mt-6">
                {[
                  { name: "Facebook", href: "https://facebook.com/altamedica" },
                  { name: "Twitter", href: "https://twitter.com/altamedica" },
                  { name: "LinkedIn", href: "https://linkedin.com/company/altamedica" },
                  { name: "Instagram", href: "https://instagram.com/altamedica" }
                ].map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 hover:bg-sky-600 transition-colors"
                    aria-label={`Visitar ${social.name}`}
                  >
                    <span className="sr-only">{social.name}</span>
                    {/* Aquí se colocaría el ícono de cada red social */}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="mb-4 text-lg font-semibold text-white">Navegación</h4>
              <nav aria-label="Footer navigation">
                <ul className="space-y-3 text-sm">
                  <li><Link href="/about" className="hover:text-sky-400 transition-colors">Sobre Nosotros</Link></li>
                  <li><Link href="/features" className="hover:text-sky-400 transition-colors">Características</Link></li>
                  <li><Link href="/faq" className="hover:text-sky-400 transition-colors">Preguntas Frecuentes</Link></li>
                  <li><Link href="/blog" className="hover:text-sky-400 transition-colors">Blog</Link></li>
                  <li><Link href="/contact" className="hover:text-sky-400 transition-colors">Contacto</Link></li>
                </ul>
              </nav>
            </div>

            <div>
              <h4 className="mb-4 text-lg font-semibold text-white">Legal</h4>
              <nav aria-label="Legal navigation">
                <ul className="space-y-3 text-sm">
                  <li><Link href="/privacy-policy" className="hover:text-sky-400 transition-colors">Política de Privacidad</Link></li>
                  <li><Link href="/terms-of-service" className="hover:text-sky-400 transition-colors">Términos de Servicio</Link></li>
                  <li><Link href="/cookies-policy" className="hover:text-sky-400 transition-colors">Política de Cookies</Link></li>
                  <li><Link href="/accessibility" className="hover:text-sky-400 transition-colors">Accesibilidad</Link></li>
                </ul>
              </nav>
            </div>

            <div>
              <h4 className="mb-4 text-lg font-semibold text-white">Contacto</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-5 h-5 mr-2 text-sky-400">📧</span>
                  <span>info@altamedica.com</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-5 h-5 mr-2 text-sky-400">📞</span>
                  <span>+123 456 7890</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-5 h-5 mr-2 text-sky-400">🏢</span>
                  <span>Av. Innovación 123, Ciudad Tecnológica</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 mt-8 text-sm text-center border-t border-gray-800">
            <p>&copy; {new Date().getFullYear()} Altamedica. Todos los derechos reservados.</p>
            <p className="mt-2">
              <Link href="/sitemap" className="hover:text-sky-400 transition-colors">Mapa del sitio</Link>
              {' • '}
              <Link href="/jobs" className="hover:text-sky-400 transition-colors">Trabaja con nosotros</Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
