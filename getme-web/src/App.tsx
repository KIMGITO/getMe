// src/App.tsx
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EchoProvider } from './provider/EchoProvider';
import { ToastContainer } from './components/UI/ToastContainer';
import { router } from './routes/AppRoutes';

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
    <QueryClientProvider client={queryClient}>
      <EchoProvider>
        <RouterProvider router={router} />
        <ToastContainer />
      </EchoProvider>
    </QueryClientProvider>
  );
}
