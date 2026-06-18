import { Outlet } from 'react-router-dom';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import Navigation from '@/layouts/nav/navigation';
import GuestNavigation from '@/layouts/nav/guest-navigation'; // Import your new guest bar component
import { useAuthStore } from '@/stores/authStore';

export default function RootLayout() {
  useDocumentTitle();


  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <div className="min-h-[100dvh] bg-background text-on-surface flex flex-col">
      {/* Dynamic Navigation Switch */}
      {isAuthenticated ? <Navigation /> : <GuestNavigation />}
      
      <main className="flex-1 w-full flex flex-col items-center  mb-20 lg:mb-2">
        <Outlet />
      </main>
    </div>
  );
}