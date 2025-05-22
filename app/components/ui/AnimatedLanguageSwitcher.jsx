'use client';

import { useTranslation } from '@/app/i18n';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

/**
 * Animated Language Switcher Component
 * This component provides a sleek, simple animated toggle button for switching between English and Spanish
 */
export default function AnimatedLanguageSwitcher({ className = '' }) {
  const { language, changeLanguage } = useTranslation();
  const router = useRouter();
  const currentLanguage = language || 'en';

  // Animation states
  const [isAnimating, setIsAnimating] = useState(false);

  // Toggle language between English and Spanish
  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'en' ? 'es' : 'en';
    setIsAnimating(true);

    // Slight delay to allow animation to play
    setTimeout(() => {
      changeLanguage(newLanguage);
      router.refresh();

      // Reset animation state after change
      setTimeout(() => {
        setIsAnimating(false);
      }, 300);
    }, 150);
  };

  // Language options with flags and labels
  const languages = useMemo(() => ({
    en: { flag: '🇺🇸', label: 'EN' },
    es: { flag: '🇪🇸', label: 'ES' }
  }), []);

  return (
    <button
      onClick={toggleLanguage}
      disabled={isAnimating}
      className={`flex items-center justify-center space-x-1 px-3 py-2 rounded-full transition-all
        ${isAnimating ? 'scale-95 opacity-80' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}
        ${className}`}
      aria-label={`Switch to ${currentLanguage === 'en' ? 'Spanish' : 'English'}`}
    >
      <span
        className={`text-lg ${isAnimating ? 'animate-spin-quick' : ''}`}
        aria-hidden="true"
      >
        {languages[currentLanguage].flag}
      </span>
      <span
        className={`text-sm font-medium ${isAnimating ? 'animate-pulse' : ''}`}
      >
        {languages[currentLanguage].label}
      </span>
    </button>
  );
}
