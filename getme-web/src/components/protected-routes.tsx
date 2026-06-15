import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { useAuthStore } from '@/stores/authStore';

interface ProtectedRouteProps {
  allowedRoles?: ('client' | 'rider' | 'admin')[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  // ✅ Selector patterns guarantee React tracks updates dynamically
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (useAuthStore.persist?.hasHydrated()) {
      setIsHydrated(true);
      return;
    }

    const unsubFinish = useAuthStore.persist?.onFinishHydration(() => {
      setIsHydrated(true);
    });

    return () => {
      if (unsubFinish) unsubFinish();
    };
  }, []);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mt-4">
          Syncing secure environment...
        </p>
      </div>
    );
  }

  // Safe Check: If hydration finished and we truly lack a session, bounce to auth start
  if (!isAuthenticated || !user) {
    console.warn('ProtectedRoute: Session unauthenticated. Blocking node entry.');
    return <Navigate to={ROUTES.LOGIN_INIT} replace />;
  }

  // Authorization Check: Match user role array access parameters
  if (allowedRoles && !allowedRoles.includes(user.role as any)) {
    console.warn(`ProtectedRoute: Access denied for role "${user.role}".`);
    return <Navigate to={ROUTES.CLIENT_HOME} replace />;
  }

  return <Outlet />;
}