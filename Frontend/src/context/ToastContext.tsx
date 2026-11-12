import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Автоматичне зникнення через 3.5 секунди
    setTimeout(() => {
      removeToast(id);
    }, 3500);
  }, [removeToast]);

  const toastHelpers = {
    success: (msg: string) => addToast(msg, 'success'),
    error: (msg: string) => addToast(msg, 'error'),
    info: (msg: string) => addToast(msg, 'info'),
  };

  return (
    <ToastContext.Provider value={{ toast: toastHelpers }}>
      {children}

      {/* Контейнер для спливаючих сповіщень */}
      <div className="fixed bottom-6 right-6 z-[999] flex flex-col gap-2.5 pointer-events-none max-w-sm w-full px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl ${
                t.type === 'success'
                  ? 'bg-[#180C14]/90 border-amber-400/30 text-amber-200 shadow-[0_0_20px_rgba(251,191,36,0.15)]'
                  : t.type === 'error'
                  ? 'bg-[#1E0A12]/95 border-rose-500/40 text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.2)]'
                  : 'bg-[#160B12]/90 border-rose-500/20 text-rose-100 shadow-[0_0_15px_rgba(244,63,94,0.1)]'
              }`}
            >
              <div className="flex items-center gap-2.5 text-xs font-semibold">
                <span className="text-base">
                  {t.type === 'success' ? '✨' : t.type === 'error' ? '⚠️' : 'ℹ️'}
                </span>
                <span>{t.message}</span>
              </div>

              <button
                onClick={() => removeToast(t.id)}
                className="w-5 h-5 rounded-full hover:bg-white/10 flex items-center justify-center text-xs opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
              >
                ✕
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};