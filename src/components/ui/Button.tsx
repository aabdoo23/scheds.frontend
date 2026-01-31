import type { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'text-white bg-[var(--light-blue)] hover:bg-[var(--dark-blue)] disabled:opacity-50 disabled:cursor-not-allowed border-none',
  secondary:
    'bg-[var(--lighter)] text-[var(--light-text)] border border-white/10 hover:bg-white/10',
  danger:
    'bg-[#dc3545] text-white border-none hover:bg-[#c82333] disabled:opacity-50 disabled:cursor-not-allowed',
  ghost:
    'bg-transparent text-[var(--light-text)] border border-[var(--light-text)] hover:bg-[#dc3545] hover:border-[#dc3545] disabled:opacity-50 disabled:cursor-not-allowed',
};

export function Button({
  variant = 'primary',
  fullWidth,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`min-h-[44px] px-5 py-3 rounded-lg font-semibold cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--light-blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--lighter-dark)] ${variantClasses[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
