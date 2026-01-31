import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  'aria-label'?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full py-3 px-4 bg-[var(--dark)] border-2 border-white/10 rounded-lg text-[var(--light-text)] text-base outline-none focus:border-[var(--light-blue)] disabled:opacity-50 ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
