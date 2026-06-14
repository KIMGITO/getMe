import Logo from '@/assets/branding/logo';
import { LoginButton, SignupButton } from '@/components/UI/AuthButtons';
import { NavLink } from '@/components/UI/nav-link';
import { ROUTES } from '@/constants/routes';
import { useUIStore } from '@/stores/uiStore';
import { BiBell } from 'react-icons/bi';
import { HiSun, HiMoon } from 'react-icons/hi';
import { LuCircleHelp } from 'react-icons/lu';
import { Link } from 'react-router-dom';

function GuestNavigation() {
  const { theme, setTheme } = useUIStore();
  const isDark = theme === 'dark';

  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  };
  return (
    <div className="w-full sticky top-0 z-50">
      <div className="bg-surface elevation-5 px-4 py-3 ">
        <div className="flex items-center justify-between gap-3">
          {/* Logo - Always visible */}
          <Link to={ROUTES.LANDING} className="shrink-0">
            <Logo />
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm font-bold text-on-surface-variant">
                <Link
                  to={ROUTES.PRODUCTS}
                  className="hover:text-primary transition-colors"
                >
                  Browse Market
                </Link>
                <a
                  href="#features"
                  className="hover:text-primary transition-colors"
                >
                  How It Works
                </a>
              </div>

          {/* Actions - Always visible on right */}
          <div className="flex items-center gap-2">
            

            {/* Desktop Profile - visible on large screens */}
            <div className=" items-center gap-3 ml-2">
              

              {/* Public Authentication Gate Actions */}
              <div className="flex items-center gap-2">
                <LoginButton />
                <SignupButton />
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={`
                p-1 rounded-full flex items-center justify-center hover:cursor-pointer transition-colors hover:opacity-70
                ${isDark ? 'bg-amber-50' : 'bg-on-primary-container'}
              `}
            >
              {isDark ? (
                <HiSun className="text-amber-500 text-sm md:text-base" />
              ) : (
                <HiMoon className="text-surface text-sm md:text-base" />
              )}
            </button>
            <button className=" btn opacity-50 rounded-full  transition-colors hover:opacity-90">
              <LuCircleHelp className="text-2xl text-warning" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GuestNavigation;
