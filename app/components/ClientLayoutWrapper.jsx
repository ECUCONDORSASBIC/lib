'use client';

import { useEffect } from 'react';
import DevModeIndicator from './DevModeIndicator';

export default function ClientLayoutWrapper({ children }) {
  // Here you can add any client-side only functionality
  useEffect(() => {
    // Client-side initialization if needed
  }, []);

  return (
    <>
      <DevModeIndicator />
      {children}
    </>
  );
}
