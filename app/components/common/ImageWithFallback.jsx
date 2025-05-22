'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

const ImageWithFallback = ({
  src,
  alt,
  fallbackSrc = '/default-avatar.png',
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (src && !error) {
      setCurrentSrc(src);
      setError(false);
    } else if (!src) {
      setCurrentSrc(fallbackSrc);
      setError(false);
    }
  }, [src, fallbackSrc, error]);

  const handleError = () => {
    if (!error) {
      setError(true);
      setCurrentSrc(fallbackSrc);
    }
  };

  return (
    <Image
      src={currentSrc}
      alt={alt}
      onError={handleError}
      {...props}
    />
  );
};

export default ImageWithFallback;
