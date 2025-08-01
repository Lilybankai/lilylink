import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        success: 'border-transparent bg-green-100 text-green-800',
        warning: 'border-transparent bg-yellow-100 text-yellow-800',
        error: 'border-transparent bg-red-100 text-red-800',
        info: 'border-transparent bg-blue-100 text-blue-800',
        outline: 'border-gray-200 text-gray-700 bg-white',
        purple: 'border-transparent bg-purple-100 text-purple-800',
        pink: 'border-transparent bg-pink-100 text-pink-800',
      },
      size: {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-2 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
}

export function Badge({ className, variant, size, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {children}
    </div>
  );
}

// Convenience components for common use cases
export const SuccessBadge = ({ children, ...props }: Omit<BadgeProps, 'variant'>) => (
  <Badge variant="success" {...props}>{children}</Badge>
);

export const WarningBadge = ({ children, ...props }: Omit<BadgeProps, 'variant'>) => (
  <Badge variant="warning" {...props}>{children}</Badge>
);

export const ErrorBadge = ({ children, ...props }: Omit<BadgeProps, 'variant'>) => (
  <Badge variant="error" {...props}>{children}</Badge>
);

export const InfoBadge = ({ children, ...props }: Omit<BadgeProps, 'variant'>) => (
  <Badge variant="info" {...props}>{children}</Badge>
);

// Status Badge with dot indicator
interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: 'active' | 'inactive' | 'pending' | 'error';
}

export function StatusBadge({ status, children, className, ...props }: StatusBadgeProps) {
  const statusConfig = {
    active: { variant: 'success' as const, dot: 'bg-green-500' },
    inactive: { variant: 'outline' as const, dot: 'bg-gray-400' },
    pending: { variant: 'warning' as const, dot: 'bg-yellow-500' },
    error: { variant: 'error' as const, dot: 'bg-red-500' },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={cn('gap-1.5', className)} {...props}>
      <div className={cn('h-2 w-2 rounded-full', config.dot)} />
      {children}
    </Badge>
  );
}

// Count Badge (for notifications, etc.)
interface CountBadgeProps extends Omit<BadgeProps, 'children'> {
  count: number;
  max?: number;
}

export function CountBadge({ count, max = 99, className, ...props }: CountBadgeProps) {
  const displayCount = count > max ? `${max}+` : count.toString();
  
  return (
    <Badge 
      variant="error" 
      size="sm" 
      className={cn('min-w-[20px] justify-center', className)} 
      {...props}
    >
      {displayCount}
    </Badge>
  );
} 