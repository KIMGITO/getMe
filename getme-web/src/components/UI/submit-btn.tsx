import { cn } from '@/lib/utils'; // adjust import path
import { RiLoader2Fill } from 'react-icons/ri';

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  label: string;
  loading?: boolean;
}

function SubmitButton({
  children,
  label,
  loading = false,
  disabled = false,
  className,
  ...props
}: SubmitButtonProps) {
  return (
    <button
      disabled={loading || disabled}
      type="submit"
      className={cn(
        'btn gap-2 flex items-center w-full bg-secondary brightness-80 active:brightness-90 text-on-secondary title-sm rounded-full py-3 justify-center',
        (loading || disabled) && 'opacity-50 cursor-not-allowed',
        className
      )}
      {...props}
    >
      {loading && <RiLoader2Fill className="animate-spin" />}
      {label}
      {children}
    </button>
  );
}

export default SubmitButton;