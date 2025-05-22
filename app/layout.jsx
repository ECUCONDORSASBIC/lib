import { Outfit, Raleway } from 'next/font/google';
import { cookies } from 'next/headers';
import ClientLayout from './ClientLayout';
import { ToastProvider } from './components/ui/Toast';
import { GenkitProvider } from './contexts/GenkitContext';
import './globals.css';
import { fallbackLng, languages } from './i18n-options';

// Define the fonts
const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
});

const raleway = Raleway({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-raleway',
});

export const metadata = {
  title: 'Altamedica | Telemedicina Avanzada e Inteligencia Artificial',
  description: 'Acceso inmediato a especialistas, diagnósticos precisos y cuidado personalizado con nuestra plataforma de telemedicina potenciada por IA para pacientes, médicos y empresas.',
  keywords: 'telemedicina, inteligencia artificial, salud digital, consulta médica online, monitoreo remoto, diagnóstico IA, Altamedica, Ecuador, Latinoamérica',
  authors: [{ name: 'Altamedica Team', url: 'https://www.altamedica.com' }],
  creator: 'Altamedica',
  publisher: 'Altamedica',
  openGraph: {
    title: 'Altamedica - Revolucionando la Atención Médica con IA',
    description: 'Plataforma integral de telemedicina y gestión de salud potenciada por Inteligencia Artificial. Conectamos pacientes, médicos y empresas para un cuidado más eficiente y personalizado.',
    url: 'https://www.altamedica.com',
    siteName: 'Altamedica',
    images: [
      {
        url: 'https://www.altamedica.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Altamedica - Telemedicina e IA para la Salud',
      },
      {
        url: 'https://www.altamedica.com/og-image-alt.jpg',
        width: 800,
        height: 800,
        alt: 'Logo Altamedica',
      },
    ],
    locale: 'es_EC',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Altamedica | Telemedicina Avanzada e IA',
    description: 'Descubre cómo Altamedica está transformando la salud con telemedicina inteligente y diagnósticos precisos potenciados por IA.',
    siteId: '@altamedica',
    creator: '@altamedica_user',
    images: ['https://www.altamedica.com/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
    // other: {
    //   rel: 'apple-touch-icon-precomposed',
    //   url: '/apple-touch-icon-precomposed.png',
    // },
  },
  // manifest: '/site.webmanifest',
  // alternates: {
  //   canonical: 'https://www.altamedica.com',
  //   languages: {
  //     'es-EC': 'https://www.altamedica.com/es-EC',
  //     'en-US': 'https://www.altamedica.com/en-US',
  //   },
  // },
  // verification: {
  //   google: 'YOUR_GOOGLE_SITE_VERIFICATION_CODE',
  //   yandex: 'YOUR_YANDEX_SITE_VERIFICATION_CODE',
  //   other: {
  //     me: ['my-email@example.com', 'my-link-to-profile.com'],
  //   },
  // },
  // appleWebApp: {
  //   title: 'Altamedica',
  //   statusBarStyle: 'black-translucent',
  //   startupImage: [
  //     '/assets/startup/apple-touch-startup-image-768x1004.png',
  //     {
  //       url: '/assets/startup/apple-touch-startup-image-1536x2008.png',
  //       media: '(device-width: 768px) and (device-height: 1024px)',
  //     },
  //   ],
  // },
  // category: 'technology health medical',
};

export default function RootLayout({ children }) {
  // Get the preferred language from cookies or use fallback
  const cookieStore = cookies();
  const lang = cookieStore.get('i18next')?.value || fallbackLng;
  const validLanguage = languages.includes(lang) ? lang : fallbackLng;

  return (
    <html lang={validLanguage} className={`${outfit.variable} ${raleway.variable}`} dir="ltr">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {/* Force page refresh on language change to ensure all content is properly translated */}
        <meta httpEquiv="Content-Language" content={validLanguage} />
      </head>
      <body className="min-h-screen font-sans text-gray-900 bg-gray-100 dark:bg-slate-900 dark:text-slate-50">
        <ToastProvider>
          <GenkitProvider>
            <ClientLayout>{children}</ClientLayout>
          </GenkitProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
