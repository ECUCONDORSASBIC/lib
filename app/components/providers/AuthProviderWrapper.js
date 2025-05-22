'use client';

import { AuthProvider } from '@/app/contexts/AuthContext';
import { useEffect, useState } from 'react';

export function AuthProviderWrapper({ children }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Puedes mostrar un loader global aquí si lo deseas, o nada.
    // Esto asegura que AuthProvider solo se renderice en el cliente.
    return null;
  }

  return <AuthProvider>{children}</AuthProvider>;
}
