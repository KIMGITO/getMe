// src/routes/AppRoutes.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes'; // Adjust relative path if needed

import RootLayout from '../layouts/root-layout';
import ProtectedRoute from '../components/protected-routes';

// View Imports
import WalletPage from '../money/wallet-page';
import Identifie from '../pages/auth/identifier';
import OTP from '../pages/auth/otp';
import Password from '../pages/auth/password';
import Register from '../pages/auth/register';
import ClientProfile from '../pages/ClientProfile';
import MarketOrderForm from '../pages/shopping';
import UserHomePage from '../pages/UserHome';
import LandingPage from '../pages/Landing';
import RiderHomePage from '../pages/rider/RiderHomePage';
import RiderProfileForm from '../pages/rider/RiderProfileForm';
import IntegratedOrderPage from '@/pages/order-page';

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      // ==========================================
      // 1. PUBLIC & GUEST GATEWAYS
      // ==========================================
      { path: ROUTES.LANDING, element: <LandingPage /> },
      { path: ROUTES.LOGIN_INIT, element: <Identifie /> },
      { path: ROUTES.SIGNUP, element: <Register /> },
      { path: ROUTES.OTP, element: <OTP /> },
      { path: ROUTES.PASSWORD, element: <Password /> },

      // ==========================================
      // 2. SHARED PROTECTED CHANNELS
      // ==========================================
      {
        element: <ProtectedRoute allowedRoles={['client', 'rider']} />,
        children: [
          { path: ROUTES.WALLET, element: <WalletPage /> },
        ],
      },

      // ==========================================
      // 3. RIDER EXCLUSIVE OPERATIONS
      // ==========================================
      {
        element: <ProtectedRoute allowedRoles={['rider']} />,
        children: [
          { path: ROUTES.RIDER_HOME, element: <RiderHomePage /> },
          { path: ROUTES.RIDER_PROFILE, element: <RiderProfileForm /> },
        ],
      },

      // ==========================================
      // 4. CLIENT EXCLUSIVE CONTEXTS
      // ==========================================
      {
        element: <ProtectedRoute allowedRoles={['client']} />,
        children: [
          { path: ROUTES.CLIENT_HOME, element: <UserHomePage /> },
          { path: ROUTES.CLIENT_PROFILE, element: <ClientProfile /> },
          { path: ROUTES.SHOPPING_LIST, element: <IntegratedOrderPage /> },
        ],
      },

      // ==========================================
      // 5. SAFETY FALLBACK INTERCEPTOR
      // ==========================================
      { path: '*', element: <Navigate to={ROUTES.LANDING} replace /> },
    ],
  },
]);