import { IconType } from 'react-icons';

interface ItemCardProps {
  title: string;
  description?: string;
  Icon: IconType;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
}

const variantMap = {
  primary: {
    iconBg: 'bg-primary-container',
    iconText: 'text-on-primary-container',
    title: 'text-primary',
    border: 'border-primary',
  },
  secondary: {
    iconBg: 'bg-secondary-container',
    iconText: 'text-on-secondary-container',
    title: 'text-secondary',
    border: 'border-secondary',
  },
  success: {
    iconBg: 'bg-success-container',
    iconText: 'text-on-success-container',
    title: 'text-success',
    border: 'border-success',
  },
  warning: {
    iconBg: 'bg-warning-container',
    iconText: 'text-on-warning-container',
    title: 'text-warning',
    border: 'border-warning',
  },
  error: {
    iconBg: 'bg-error-container',
    iconText: 'text-on-error-container',
    title: 'text-error',
    border: 'border-error',
  },
  info: {
    iconBg: 'bg-info-container',
    iconText: 'text-on-info-container',
    title: 'text-info',
    border: 'border-info',
  },
};

function ItemCard({
  title,
  description,
  Icon,
  onClick,
  className = '',
  variant = 'primary',
}: ItemCardProps) {
  const styles = variantMap[variant];

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`
        card-elevated
        elevation-5
        rounded-2xl
        flex
        items-center
        gap-3
        p-6
        transition-all
        duration-200
        hover:scale-[1.01]
        hover:shadow-md
        cursor-pointer
        border-b border-r-2
        ${className}
      `}
    >
      {/* Icon */}
      <div className={`w-11 h-11 flex items-center justify-center rounded-full ${styles.iconBg}`}>
        <Icon className={`${styles.iconText} text-lg`} />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <h3 className={`font-black-tight truncate ${styles.title}`}>
          {title}
        </h3>

        {description && (
          <p className="text-sm text-on-surface-variant mt-0.5 truncate">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

export default ItemCard;