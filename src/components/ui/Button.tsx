import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transform hover:scale-105 active:scale-95',
  {
    variants: {
      variant: {
        primary:
          'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg hover:shadow-xl hover:from-primary-600 hover:to-secondary-600',
        secondary:
          'bg-white border-2 border-primary-500 text-primary-500 hover:bg-primary-50 hover:border-primary-600 hover:text-primary-600',
        outline:
          'border-2 border-gray-300 bg-transparent hover:bg-gray-50 hover:border-gray-400',
        ghost:
          'text-gray-600 hover:text-primary-600 hover:bg-primary-50',
        destructive:
          'bg-error text-white hover:bg-red-600 shadow-lg hover:shadow-xl',
        success:
          'bg-success text-white hover:bg-green-600 shadow-lg hover:shadow-xl',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 py-2',
        lg: 'h-12 px-6 py-3',
        xl: 'h-14 px-8 py-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants }; 