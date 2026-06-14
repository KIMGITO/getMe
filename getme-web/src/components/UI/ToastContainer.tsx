import { AnimatePresence } from 'framer-motion';
import { useToastStore, ToastPosition, ToastMessage } from '@/stores/useToastStore';
import { ToastNode } from './ToastNode';

const positionContainers: Record<ToastPosition, string> = {
  'top-left': 'top-6 left-6 items-start',
  'top-center': 'top-6 left-1/2 -translate-x-1/2 items-center',
  'top-right': 'top-6 right-6 items-end',
  'bottom-left': 'bottom-6 left-6 items-start',
  'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2 items-center',
  'bottom-right': 'bottom-6 right-6 items-end',
};

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);

  // Group all active notifications by their specified placement coordinates
  const positions: ToastPosition[] = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'];

  return (
    <>
      {positions.map((pos) => {
        const matchingToasts = toasts.filter((t) => t.position === pos);
        if (matchingToasts.length === 0) return null;

        // Invert layout flow directions for top-anchored stacks
        const isTop = pos.startsWith('top');
        const organizedToasts = isTop ? [...matchingToasts].reverse() : matchingToasts;

        return (
          <div
            key={pos}
            className={`fixed z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none ${positionContainers[pos]}`}
          >
            <div className="flex flex-col gap-3 w-full max-w-sm pointer-events-auto">
              <AnimatePresence mode="popLayout">
                {organizedToasts.map((toast) => (
                  <ToastNode  key={toast.id} toast={toast} />
                ))}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
    </>
  );
}