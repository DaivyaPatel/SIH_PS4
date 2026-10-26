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
      size === 'sm' ? '6px 10px' : size === 'lg' ? '12px 20px' : '8px 14px';
    const fontSize = size === 'sm' ? 12 : size === 'lg' ? 15 : 13;

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
          borderRadius: 6,
          padding,
          fontSize,
          fontWeight: 500,
          cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
          opacity: disabled || isLoading ? 0.6 : 1,
          transition: 'all 0.15s ease',
          boxShadow: isPrimary || isDestructive ? 'var(--shadow-sm)' : 'none',
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
