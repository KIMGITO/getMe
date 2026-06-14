import { useUIStore } from '@/stores/uiStore';
import logo_dark from '@/assets/branding/favicon-dark-bg.png';
import logo_light from '@/assets/branding/favicon-light-bg.png';

function Logo() {
  const { theme } = useUIStore();
  const isDark = theme === 'dark';
  return (
    <img
      src={isDark ? logo_dark : logo_light}
      alt="logo"
      className="w-32 h-12 object-contain"
    />
  );
}

export default Logo;
