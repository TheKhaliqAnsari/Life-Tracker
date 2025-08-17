"use client";

import { createContext, useContext, useCallback, useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";

const ToastContext = createContext({ addToast: /** @type {(t:{type?:'success'|'error', message:string, id?:string})=>void} */(() => {}) });

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((input) => {
    const id = input.id || Math.random().toString(36).slice(2);
    const toast = { type: input.type || "success", message: input.message, id };
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => removeToast(id), 3000);
  }, [removeToast]);

  const value = useMemo(() => ({ addToast }), [addToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              role="status"
              aria-live="polite"
              className={`max-w-sm rounded-lg shadow-lg px-4 py-3 text-sm ${
                t.type === "error"
                  ? "bg-red-600 text-white"
                  : "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
              }`}
            >
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
} 