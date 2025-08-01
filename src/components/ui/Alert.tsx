import { cva, type VariantProps } from 'class-variance-authority';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon, 
  InformationCircleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

const alertVariants = cva(
  'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        success: 'border-green-200 bg-green-50 text-green-800 [&>svg]:text-green-600',
        warning: 'border-yellow-200 bg-yellow-50 text-yellow-800 [&>svg]:text-yellow-600',
        error: 'border-red-200 bg-red-50 text-red-800 [&>svg]:text-red-600',
        info: 'border-blue-200 bg-blue-50 text-blue-800 [&>svg]:text-blue-600',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const iconMap = {
  success: CheckCircleIcon,
  warning: ExclamationTriangleIcon,
  error: XCircleIcon,
  info: InformationCircleIcon,
  default: InformationCircleIcon,
};

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string;
  description?: string;
  showIcon?: boolean;
  dismissible?: boolean;
  onDismiss?: () => void;
}

export function Alert({
  className,
  variant = 'default',
  title,
  description,
  children,
  showIcon = true,
  dismissible = false,
  onDismiss,
  ...props
}: AlertProps) {
  const Icon = iconMap[variant || 'default'];

  return (
    <div className={cn(alertVariants({ variant }), className)} {...props}>
      {showIcon && <Icon className="h-5 w-5" />}
      
      {dismissible && (
        <button
          onClick={onDismiss}
          className="absolute right-2 top-2 rounded-lg p-1 hover:bg-black/10 transition-colors"
        >
          <XMarkIcon className="h-4 w-4" />
          <span className="sr-only">Dismiss</span>
        </button>
      )}

      <div className={cn(dismissible && 'pr-8')}>
        {title && (
          <h5 className="mb-1 font-medium leading-none tracking-tight">
            {title}
          </h5>
        )}
        
        {description && (
          <div className="text-sm opacity-90">
            {description}
          </div>
        )}
        
        {children && (
          <div className="text-sm opacity-90">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

// Convenience components for each variant
export const SuccessAlert = (props: Omit<AlertProps, 'variant'>) => (
  <Alert variant="success" {...props} />
);

export const WarningAlert = (props: Omit<AlertProps, 'variant'>) => (
  <Alert variant="warning" {...props} />
);

export const ErrorAlert = (props: Omit<AlertProps, 'variant'>) => (
  <Alert variant="error" {...props} />
);

export const InfoAlert = (props: Omit<AlertProps, 'variant'>) => (
  <Alert variant="info" {...props} />
); 