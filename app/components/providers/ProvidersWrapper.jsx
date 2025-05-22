'use client';

import { ToastProvider } from '../ui/Toast';

export default function ProvidersWrapper({ children }) {
  return (
    <ToastProvider>
      {children}
    </ToastProvider>
  );
}
