import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavLinkProps {
  textSize?: 'sm' | 'base' | 'lg' | 'xl';
  fontWeight?: 'normal' | 'semibold' | 'bold' | 'extrabold';
  borderWidth?: 'sm' | 'md' | 'lg';
  navItems: { path: string; label: string }[];
  gap?: number;
}

export const NavLink: React.FC<NavLinkProps> = ({
  textSize = 'base',
  fontWeight = 'extrabold',
  borderWidth = 'md',
  gap = 6,
  navItems,
}) => {
  // ✅ Dynamic Location Tracker: Automatically grabs the real-time path position
  const location = useLocation();

  const textSizeClass = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  }[textSize];

  const fontWeightClass = {
    normal: 'font-normal',
    semibold: 'font-semibold',
    bold: 'font-bold',
    extrabold: 'font-extrabold',
  }[fontWeight];

  const borderClass = {
    sm: 'border-b',
    md: 'border-b-2',
    lg: 'border-b-[3px]',
  }[borderWidth];

  // Map arbitrary gap integers safely to standard Tailwind class compiling engines
  const gapClass: Record<number, string> = {
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
    6: 'gap-6',
    8: 'gap-8',
  };

  return (
    <div className={`flex items-center ${gapClass[gap] || 'gap-6'}`}>
      {navItems.map((item) => {
        // ✅ Match against the user's active screen location route path
        const isActive = location.pathname === item.path;

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`
              ${textSizeClass}
              ${fontWeightClass}
              py-2 transition-all duration-200
              ${isActive
                ? `text-primary ${borderClass} border-primary`
                : 'text-on-surface-variant border-b-2 border-transparent hover:text-primary hover:border-primary'
              }
            `}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
};