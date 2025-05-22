'use client';

// Import polyfills first to ensure they're loaded before any other code
// Use the absolute path alias to ensure consistent loading
import '@/app/polyfills.js';

import { ToastProvider } from './components/ui/Toast';
import { AuthProvider } from './contexts/AuthContext';
import { TranslationProvider } from './i18n';
import CallManager from './components/CallManager';

export default function ClientLayout({ children }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <TranslationProvider>
          {children}
          {/* Gestor de videollamadas (disponible globalmente) */}
          <CallManager />
        </TranslationProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
