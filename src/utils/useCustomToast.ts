import { useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
  duration?: number;
}

export interface ToastOptions {
  duration?: number;
  description?: string;
  position?: 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left';
}

// Global toast state
let toastState: Toast[] = [];
let toastListeners: ((toasts: Toast[]) => void)[] = [];

const notifyListeners = () => {
  toastListeners.forEach(listener => listener([...toastState]));
};

const addToast = (toast: Omit<Toast, 'id'>) => {
  const id = Math.random().toString(36).substr(2, 9);
  const newToast: Toast = { ...toast, id };
  
  toastState.push(newToast);
  notifyListeners();
  
  // Auto remove after duration
  const duration = toast.duration || 3000;
  if (duration > 0) {
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }
  
  return id;
};

const removeToast = (id: string) => {
  toastState = toastState.filter(toast => toast.id !== id);
  notifyListeners();
};

const clearAllToasts = () => {
  toastState = [];
  notifyListeners();
};

export const useCustomToast = () => {
  const [toasts, setToasts] = useState<Toast[]>(toastState);
  
  const subscribe = useCallback((listener: (toasts: Toast[]) => void) => {
    toastListeners.push(listener);
    return () => {
      toastListeners = toastListeners.filter(l => l !== listener);
    };
  }, []);
  
  // Subscribe to toast changes
  useState(() => {
    const unsubscribe = subscribe(setToasts);
    return unsubscribe;
  });
  
  const showToast = useCallback((type: ToastType, message: string, options?: ToastOptions) => {
    return addToast({ 
      type, 
      message, 
      description: options?.description,
      duration: options?.duration 
    });
  }, []);
  
  const dismissToast = useCallback((id: string) => {
    removeToast(id);
  }, []);
  
  const dismissAll = useCallback(() => {
    clearAllToasts();
  }, []);
  
  return {
    toasts,
    showToast,
    dismissToast,
    dismissAll,
  };
};

// Direct API functions for convenience
export const customToast = {
  success: (message: string, options?: ToastOptions) => 
    addToast({ 
      type: 'success', 
      message, 
      description: options?.description,
      duration: options?.duration 
    }),
  
  error: (message: string, options?: ToastOptions) => 
    addToast({ 
      type: 'error', 
      message, 
      description: options?.description,
      duration: options?.duration 
    }),
  
  warning: (message: string, options?: ToastOptions) => 
    addToast({ 
      type: 'warning', 
      message, 
      description: options?.description,
      duration: options?.duration 
    }),
  
  info: (message: string, options?: ToastOptions) => 
    addToast({ 
      type: 'info', 
      message, 
      description: options?.description,
      duration: options?.duration 
    }),
  
  dismiss: (id: string) => removeToast(id),
  dismissAll: () => clearAllToasts(),
};
