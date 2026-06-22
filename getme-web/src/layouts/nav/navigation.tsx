import {
  BiBell,
  BiSearch,
  BiHome,
  BiWallet,
  BiUser,
  BiPackage,
  BiX,
  BiLogOut,
} from 'react-icons/bi';
import { HiStar, HiSun, HiMoon } from 'react-icons/hi';
import { LuMapPinCheckInside } from 'react-icons/lu';
import { useState, useMemo } from 'react';
import { MdSecurity } from 'react-icons/md';
import { NavLink } from '@/components/UI/nav-link';
import { useUIStore } from '@/stores/uiStore';
import { useNavStore } from '@/stores/useNavStore';
import { useLocation, Link } from 'react-router-dom';
import Logo from '@/assets/branding/logo';
import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/stores/authStore';
import { Avatar } from '@/components/UI/Avatar';
import { useCurrentLocation } from '@/stores/useCurrentLocation';
import LogoutButton from '@/components/UI/rider/LogoutButton';

export default function Navigation() {
  const { theme, setTheme } = useUIStore();
  const customNavItems = useNavStore((state) => state.customNavItems);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const location = useLocation();

  const isDark = theme === 'dark';
  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');
  const { city, country, loading } = useCurrentLocation();

  const isClient = useAuthStore((state) => state.isClient);
  const isRider = useAuthStore((state) => state.isRider);
  const user = useAuthStore((state) => state.user);

  const logOut = () => {
    useAuthStore.getState().logout();
  };

  // ==========================================
  // UNIFIED ROLE-BASED NAVIGATION ENGINE
  // ==========================================
  const navItems = useMemo(() => {
    if (isRider) {
      return [
        { path: ROUTES.RIDER_HOME, label: 'Home', icon: BiHome },
        { path: ROUTES.WALLET, label: 'Wallet', icon: BiWallet },
        { path: ROUTES.RIDER_PROFILE, label: 'Profile', icon: BiUser },
      ];
    }

    // Default Fallback to Client Track
    return [
      { path: ROUTES.CLIENT_HOME, label: 'Home', icon: BiHome },  
      { path: ROUTES.SHOPPING_LIST, label: 'Shop', icon: BiPackage },
      { path: ROUTES.WALLET, label: 'Wallet', icon: BiWallet },
      { path: ROUTES.CLIENT_PROFILE, label: 'Profile', icon: BiUser },
    ];
  }, [isRider]);

  // Dynamic profile target string for mobile navigation targets
  const profileTarget = isRider ? ROUTES.RIDER_PROFILE : ROUTES.CLIENT_PROFILE;

  return (
    <>
      {/* Primary Global Navigation Header bar */}
      <div className="bg-surface border-b border-outline-variant px-4 py-3 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center justify-between gap-3 max-w-screen-xl mx-auto">
          <Link to={ROUTES.LANDING} className="shrink-0">
            <Logo />
          </Link>

          {/* Desktop Navigation Link Track */}
          <div className="hidden lg:flex items-center flex-1 justify-center max-w-xl px-2">
            <div className="w-full overflow-x-auto scrollbar-none py-1">
              <div className="flex items-center gap-2 min-w-max mx-auto">
                {customNavItems && customNavItems.length > 0 ? (
                  customNavItems.map((item, index) => {
                    const isTabActive =
                      item.active ?? location.pathname === item.path;
                    const styleClass = `w-[120px] text-center py-1.5 px-3 rounded-full text-xs font-black tracking-wide uppercase transition-all whitespace-nowrap border shrink-0 cursor-pointer ${
                      isTabActive
                        ? 'bg-primary text-on-primary border-primary shadow-sm'
                        : 'bg-surface-container-low text-on-surface-variant border-outline-variant hover:border-outline'
                    }`;

                    return item.onClick ? (
                      <button
                        key={index}
                        onClick={item.onClick}
                        className={styleClass}
                      >
                        {item.label}
                      </button>
                    ) : (
                      <Link key={index} to={item.path} className={styleClass}>
                        {item.label}
                      </Link>
                    );
                  })
                ) : (
                  <div className="font-extrabold text-on-surface-variant">
                    {/* Reuses the unified array setup seamlessly */}
                    <NavLink textSize="base" navItems={navItems} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Search Engine Bar */}
          <div className="hidden md:block flex-1 max-w-xs xl:max-w-md">
            <div className="relative">
              <BiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant" />
              <input
                type="text"
                placeholder="Search errands, items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-container-low border border-outline rounded-full py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none text-on-surface placeholder:text-on-surface-variant"
              />
            </div>
          </div>

          {/* Location Context Module Node */}
          <div className="hidden xl:flex flex-col items-start shrink-0">
            <div className="flex items-center gap-1 text-sm text-on-surface whitespace-nowrap">
              <LuMapPinCheckInside className="text-primary shrink-0" />
              {loading ? (
                <div className="h-4 w-24 bg-surface-variant/60 animate-pulse rounded" />
              ) : (
                <span className="font-bold tracking-wide w-30 truncate">
                  {city}, {country}
                </span>
              )}
            </div>
            {!loading && (
              <div className="text-xs text-on-surface-variant flex items-center gap-1 whitespace-nowrap">
                <MdSecurity className="text-primary shrink-0" /> Secure
              </div>
            )}
          </div>

          {/* Interactive Utility Control Clusters */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsMobileSearchOpen(true)}
              className="md:hidden text-on-surface-variant hover:text-primary p-2"
            >
              <BiSearch size={20} />
            </button>

            {/* Notification Bell (Fixed: Removed accidental logOut function binding) */}
            <button className="relative text-on-surface-variant hover:text-primary p-2">
              <BiBell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
            </button>

            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full cursor-pointer transition-colors ${
                isDark
                  ? 'bg-amber-100/80 text-amber-600'
                  : 'bg-primary-container text-primary'
              }`}
            >
              {isDark ? <HiSun size={18} /> : <HiMoon size={18} />}
            </button>

            {/* Desktop Account Context Block */}
            <div className="hidden lg:flex items-center gap-2.5 ml-1">
              <Avatar
                name={user?.name}
                size="md"
                src="https://plus.unsplash.com/premium_photo-1732757787588-29df717691f4?w=500&auto=format&fit=crop&q=60"
              />

              <div className="hidden xl:block text-left">
                <div className="text-xs font-bold capitalize text-on-surface whitespace-nowrap leading-tight">
                  {user?.name}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-on-surface-variant whitespace-nowrap font-medium">
                  <span>
                    {user?.role === 'client'
                      ? 'Customer'
                      : user?.role || 'Customer'}
                  </span>
                  <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                    <HiStar /> 4.9
                  </span>
                </div>
              </div>

             <LogoutButton />
            </div>

            {/* Mobile View Profile Gateway Target */}
            <Link to={profileTarget} className="lg:hidden shrink-0">
              <Avatar
                name={user?.name}
                size="md"
                src="https://plus.unsplash.com/premium_photo-1732757787588-29df717691f4?w=500&auto=format&fit=crop&q=60"
              />
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Search Overlay Drawer */}
      {isMobileSearchOpen && (
        <div className="fixed inset-0 bg-background/95 h-3/4 z-50 border-b border-outline-variant lg:hidden">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 relative">
                <BiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant" />
                <input
                  type="text"
                  placeholder="Search errands, items or riders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline rounded-full py-2.5 pl-10 pr-4 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none text-on-surface"
                  autoFocus
                />
              </div>
              <button
                onClick={() => setIsMobileSearchOpen(false)}
                className="text-on-surface-variant p-1"
              >
                <BiX size={24} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Bottom Mobile Control Layout Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface rounded-t-2xl border-t border-outline-variant z-40 shadow-lg pb-safe-bottom">
        <div className="flex items-center justify-around px-2 py-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const isProfile = item.label === 'Profile';
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex flex-col items-center justify-center px-3 py-2 rounded-xl transition-all min-w-16 ${
                  isActive
                    ? 'text-primary font-bold'
                    : 'text-on-surface-variant'
                }`}
              >
                {isProfile ? (
                  /* Profile Tab: Displays the Avatar image exclusively */
                  <div
                    className={`rounded-full transition-all p-0.5 border-2 ${
                      isActive
                        ? 'border-primary scale-105 shadow-sm'
                        : 'border-transparent'
                    }`}
                  >
                    <Avatar
                      name={user?.name}
                      size="sm" // Using 'sm' here keeps it compact enough for the mobile navigation bar
                      src="https://plus.unsplash.com/premium_photo-1732757787588-29df717691f4?w=500&auto=format&fit=crop&q=60"
                    />
                  </div>
                ) : (
                  /* Standard Tabs: Displays the normal Icon + Label configuration */
                  <>
                    <Icon size={20} />
                    <span className="text-[10px] tracking-tight mt-1">
                      {item.label}
                    </span>
                  </>
                )}

                {/* Persistent Active Top Strip Indicator */}
                {isActive && (
                  <div className="absolute top-0 w-6 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
