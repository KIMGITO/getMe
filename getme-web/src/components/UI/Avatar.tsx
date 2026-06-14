import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

// Map clean layout scale tokens matching your design token engine
const sizeClasses = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl font-black',
};

// Pure utility helper to parse a string profile name down to exactly 2 initials
function getInitials(name: string): string {
  if (!name) return '??';
  
  const tokens = name.trim().split(/\s+/);
  if (tokens.length === 1) {
    return tokens[0].substring(0, 2).toUpperCase();
  }
  
  const firstInitial = tokens[0][0] || '';
  const lastInitial = tokens[tokens.length - 1][0] || '';
  return (firstInitial + lastInitial).toUpperCase();
}

export function Avatar({ src, name = 'User', size = 'md', className = '' }: AvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setImageFailed(false);
    setIsLoaded(false);
  }, [src]);

  const initials = getInitials(name);
  const activeSizeClass = sizeClasses[size];

  return (
    <div 
      className={`relative flex items-center justify-center rounded-full shrink-0 select-none overflow-hidden font-bold ${activeSizeClass} ${className}`}
    >
      <AnimatePresence mode="popLayout">
        {src && !imageFailed ? (
          <motion.img
            key="avatar-image"
            src={src}
            alt={name}
            onError={() => setImageFailed(true)}
            onLoad={() => setIsLoaded(true)}
            initial={{ opacity: 0 }}
            animate={{ opacity: isLoaded ? 1 : 0 }}
            exit={{ opacity: 0 }}
            className="w-full h-full object-cover rounded-full"
          />
        ) : null}

        {(!src || imageFailed || !isLoaded) && (
          <motion.div
            key="avatar-fallback"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 w-full h-full flex items-center justify-center rounded-full bg-primary-container text-primary uppercase tracking-wider"
          >
            {initials}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}