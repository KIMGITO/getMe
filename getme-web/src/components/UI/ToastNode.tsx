import { motion } from 'framer-motion';
import { HiCheckCircle, HiExclamationCircle, HiInformationCircle, HiX } from 'react-icons/hi';
import { IconType } from 'react-icons';
import { ToastMessage, ToastVariant, useToastStore } from '@/stores/useToastStore';

const variantConfig: Record<ToastVariant, { icon: IconType; styles: string }> = {
  success: { icon: HiCheckCircle, styles: 'bg-success border-on-success text-on-success' },
  error: { icon: HiExclamationCircle, styles: 'bg-error-container border-error/30 text-error' },
  warning: { icon: HiExclamationCircle, styles: 'bg-warning border-warning/30 text-on-warning' },
  info: { icon: HiInformationCircle, styles: 'bg-info border-outline-variant text-on-info' },
};

export function ToastNode({ toast }: { toast: ToastMessage }) {
  const dismiss = useToastStore((state) => state.dismiss);
  const config = variantConfig[toast.variant || 'info'];
  const Icon = config.icon;

  const isTop = toast.position.startsWith('top');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: isTop ? -24 : 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
      className={`relative flex items-start gap-3 w-full max-w-sm p-4 pr-8 rounded-2xl border shadow-elevation-3 ${config.styles}`}
    >
      <Icon className="text-xl shrink-0 mt-0.5" />

      <div className="flex-1 min-w-0 text-left">
        <p className="title-sm  font-bold leading-snug">
          {toast.message}
        </p>
        {toast.description && (
          <p className="body-sm  mt-0.5 leading-normal">
            {toast.description}
          </p>
        )}
      </div>

      <button
        onClick={() => dismiss(toast.id)}
        className="absolute top-3 right-3 p-1 rounded-full  hover:text-on-surface hover:bg-surface-variant/40 transition-colors shrink-0 cursor-pointer"
      >
        <HiX className="text-base" />
      </button>
    </motion.div>
  );
}