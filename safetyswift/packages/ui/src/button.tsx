import { clsx } from 'clsx';
import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const baseStyles =
  'inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60';

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline-blue-600',
  secondary: 'bg-white text-slate-900 ring-1 ring-inset ring-slate-200 hover:bg-slate-100 focus-visible:outline-slate-400'
};

export function buttonVariants({
  variant = 'primary',
  className
}: {
  variant?: ButtonVariant;
  className?: string;
}) {
  return clsx(baseStyles, variantStyles[variant], className);
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', className, children, ...props },
  ref
) {
  return (
    <button ref={ref} className={buttonVariants({ variant, className })} {...props}>
      {children}
    </button>
  );
});
