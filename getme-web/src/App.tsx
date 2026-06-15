import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from 'react-router-dom';
import { ROUTES } from './constants/routes';

import RootLayout from './layouts/root-layout';
import ProtectedRoute from './components/protected-routes';

// View Imports
import WalletPage from './money/wallet-page';
import AddressForm from './pages/address-form';
import Identifie from './pages/auth/identifier';
import OTP from './pages/auth/otp';
import Password from './pages/auth/password';
import Register from './pages/auth/register';
import ClientProfile from './pages/ClientProfile';
import MarketOrderForm from './pages/shopping';
import UserHomePage from './pages/UserHome';
import LandingPage from './pages/Landing';
import { ToastContainer } from './components/UI/ToastContainer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      // Public Route Mappings
      { path: ROUTES.LANDING, element: <LandingPage /> },

      // Guest Auth Flow Blocks
      { path: ROUTES.LOGIN_INIT, element: <Identifie /> },
      { path: ROUTES.SIGNUP, element: <Register /> },
      { path: ROUTES.OTP, element: <OTP /> },
      { path: ROUTES.PASSWORD, element: <Password /> },

      // Secure Session Client Gate Paths
      {
        element: <ProtectedRoute allowedRoles={['client']} />,
        children: [
          { path: ROUTES.CLIENT_HOME, element: <UserHomePage /> },
          { path: ROUTES.HOME, element: <UserHomePage /> },

          { path: ROUTES.SHOPPINGLIST, element: <MarketOrderForm /> },
          { path: ROUTES.ACCOUNT, element: <ClientProfile /> },
          { path: ROUTES.WALLET, element: <WalletPage /> },
          { path: ROUTES.CHECKOUT, element: <AddressForm /> },
        ],
      },

      // Fallback Safety Redirection Engine Handler
      { path: '*', element: <Navigate to={ROUTES.LANDING} replace /> },
    ],
  },
]);

export default function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <ToastContainer />
      </QueryClientProvider>
    </>
  );
}
