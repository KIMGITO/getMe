import { useEffect } from 'react';
import { configureEcho } from '@laravel/echo-react';
import { useAuthStore } from '@/stores/authStore';

export const EchoProvider = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAuthStore();

  useEffect(() => {
    if (!token) return;

    console.log('📡 Initializing Echo with active auth token...');

    configureEcho({
      broadcaster: 'reverb',
      key: import.meta.env.VITE_REVERB_APP_KEY || 'getme-key',
      wsHost: import.meta.env.VITE_REVERB_HOST || '127.0.0.1',
      wsPort: parseInt(import.meta.env.VITE_REVERB_PORT ?? '8080'),
      wssPort: parseInt(import.meta.env.VITE_REVERB_PORT ?? '8080'),
      forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'http') === 'https',
      enabledTransports: ['ws', 'wss'],
      authorizer: (channel) => {
        return {
          authorize: (socketId, callback) => {
            fetch(`${import.meta.env.VITE_API_BASE_URL}/broadcasting/auth`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`, 
                'Accept': 'application/json',
                'ngrok-skip-browser-warning': 'true'
              },
              body: JSON.stringify({
                socket_id: socketId,
                channel_name: channel.name
              })
            })
            .then((res) => {
              if (!res.ok) throw new Error(`Auth status: ${res.status}`);
              return res.json();
            })
            .then((data) => callback(null, data))
            .catch((err) => callback(err instanceof Error ? err : new Error(String(err)), null));
          }
        };
      }
    });
  }, [token]); 

  return <>{children}</>;
};