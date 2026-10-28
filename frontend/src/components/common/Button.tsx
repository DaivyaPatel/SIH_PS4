import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'secondary',
      size = 'md',
      isLoading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      style,
      className,
      ...props
    },
    ref
  ) => {
    const isPrimary = variant === 'primary';
    const isDestructive = variant === 'destructive';
    const isGhost = variant === 'ghost';

    const bg = isPrimary
      ? 'var(--accent)'
      : isDestructive
      ? 'var(--status-bad-solid)'
      : isGhost
      ? 'transparent'
      : 'var(--bg-surface)';

    const color = isPrimary || isDestructive ? 'var(--text-inverse)' : 'var(--text-primary)';
    const border = isPrimary || isDestructive || isGhost ? 'none' : '1px solid var(--border-strong)';

    const padding =
      size === 'sm' ? '6px 12px' : size === 'lg' ? '11px 22px' : '8px 16px';
    const fontSize = size === 'sm' ? 12 : size === 'lg' ? 14 : 13;

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          background: bg,
          color,
          border,
          borderRadius: 8,
          padding,
          fontSize,
          fontWeight: 600,
          cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
          opacity: disabled || isLoading ? 0.6 : 1,
          transition: 'background 0.15s ease, border-color 0.15s ease, transform 0.12s ease, box-shadow 0.15s ease',
          boxShadow: isPrimary ? '0 1px 3px rgba(37, 99, 235, 0.25)' : isDestructive ? '0 1px 3px rgba(220, 38, 38, 0.25)' : 'var(--shadow-sm)',
          whiteSpace: 'nowrap',
          ...style,
        }}
        {...props}
      >
        {isLoading && <Loader2 size={fontSize + 2} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />}
        {!isLoading && leftIcon}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
