import { createContext, useContext, useState, type ReactNode } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info' | 'warn';
  message: string;
  referenceId?: string;
}

interface ToastContextType {
  toasts: ToastItem[];
  addToast: (message: string, type?: ToastItem['type'], referenceId?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (message: string, type: ToastItem['type'] = 'info', referenceId?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastItem = { id, type, message, referenceId };
    setToasts(prev => [...prev, newToast]);

    // Errors persist until dismissed; others auto-dismiss in 5s
    if (type !== 'error') {
      setTimeout(() => {
        removeToast(id);
      }, 5000);
    }
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div
        className="toast-container"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          maxWidth: 420,
        }}
      >
        {toasts.map(toast => {
          const bg =
            toast.type === 'error'
              ? 'var(--status-bad-tint)'
              : toast.type === 'success'
              ? 'var(--status-ok-tint)'
              : toast.type === 'warn'
              ? 'var(--status-warn-tint)'
              : 'var(--status-info-tint)';
          const text =
            toast.type === 'error'
              ? 'var(--status-bad-text)'
              : toast.type === 'success'
              ? 'var(--status-ok-text)'
              : toast.type === 'warn'
              ? 'var(--status-warn-text)'
              : 'var(--status-info-text)';
          const border =
            toast.type === 'error'
              ? 'var(--status-bad-border)'
              : toast.type === 'success'
              ? 'var(--status-ok-border)'
              : toast.type === 'warn'
              ? 'var(--status-warn-border)'
              : 'var(--status-info-border)';

          return (
            <div
              key={toast.id}
              role="alert"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: '12px 16px',
                background: bg,
                color: text,
                border: `1px solid ${border}`,
                borderRadius: 8,
                boxShadow: 'var(--shadow-md)',
                fontSize: 13,
                lineHeight: 1.4,
              }}
            >
              <div style={{ flexShrink: 0, marginTop: 1 }}>
                {toast.type === 'error' ? (
                  <AlertCircle size={18} />
                ) : toast.type === 'success' ? (
                  <CheckCircle size={18} />
                ) : (
                  <Info size={18} />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div>{toast.message}</div>
                {toast.referenceId && (
                  <div style={{ fontSize: 11, opacity: 0.85, marginTop: 4, fontFamily: 'monospace' }}>
                    Ref: {toast.referenceId}
                  </div>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                aria-label="Dismiss toast"
                style={{
                  background: 'transparent',
                  border: 0,
                  color: 'inherit',
                  cursor: 'pointer',
                  padding: 2,
                  margin: -2,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
