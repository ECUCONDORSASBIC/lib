'use client';

import { AuthProvider } from '@/app/contexts/AuthContext';

export function AuthProviderWrapper({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}
