import { Navigate, Outlet } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

interface ProtectedRouteProps {
  allowedRoles?: ('client' | 'rider' | 'admin')[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  // Replace this placeholder logic with your actual state managers (Zustand, Redux, Context)
  const isAuthenticated = true; 
  const userRole: 'client' | 'rider' | 'admin' = 'client';

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN_INIT} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Redirect to their respective correct root profile workspace home if access is denied
    return <Navigate to={`/${userRole}/home`} replace />;
  }

  return <Outlet />;
}