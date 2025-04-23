import React from 'react';
import { VariantProps, cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const buttonVariants = cva(
  'flex w-max px-2 py-1 rounded items-center gap-2 transition-colors duration-200',
  {
    variants: {
      variant: {
        default: 'bg-white text-black hover:bg-neutral-200 active:bg-neutral-400',
        accent: 'text-blue-500',
        ghost: 'hover:bg-white bg-transparent hover:text-gray-600'
      },
      defaultVariants: {
        variant: 'default',
        size: 'md'
      },
      size: {
        sm: 'px-2 py-1 text-xs',
        md: 'px-4 py-2 text-sm'
      }
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  href?: string;
  tab?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, href, tab, variant, ...props }, ref) => {
    if (href) {
      return (
        <button ref={ref} {...props}>
          <Link
            className={cn(buttonVariants({ variant }), className)}
            href={href}
            target={tab ? '_blank' : ''}
            referrerPolicy={'no-referrer'}
          >
            <span className="group-hover:text-muted">{children}</span>
          </Link>
        </button>
      );
    }

    return (
      <button className={cn(buttonVariants({ variant }), className)} ref={ref} {...props}>
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
