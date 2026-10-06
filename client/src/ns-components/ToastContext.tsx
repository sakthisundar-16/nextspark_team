import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

interface ToastContextType {
  toast: (title: string, message?: string, type?: Toast['type']) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((title: string, message?: string, type: Toast['type'] = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev.slice(-3), { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const value = {
    toast: addToast,
    success: (t: string, m?: string) => addToast(t, m, 'success'),
    error: (t: string, m?: string) => addToast(t, m, 'error'),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-portal-container" aria-live="polite">
        {toasts.map(t => {
          const Icon = t.type === 'error' ? AlertTriangle : t.type === 'info' ? Info : CheckCircle2;
          return (
            <div key={t.id} className={`toast-card toast-${t.type} animate-slide-up`}>
              <div className="toast-icon-wrap">
                <Icon size={18} />
              </div>
              <div className="toast-content">
                <div className="toast-title">{t.title}</div>
                {t.message && <div className="toast-message">{t.message}</div>}
              </div>
              <button onClick={() => removeToast(t.id)} className="toast-close-btn" aria-label="Close notification">
                <X size={14} />
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
    return {
      toast: () => {},
      success: () => {},
      error: () => {},
    };
  }
  return context;
}
