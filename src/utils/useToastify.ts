import { toast } from 'react-toastify';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

// Toast options interface (since ToastOptions might not be exported)
export interface ToastOptions {
  position?: 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left';
  autoClose?: number | false;
  hideProgressBar?: boolean;
  closeOnClick?: boolean;
  pauseOnHover?: boolean;
  draggable?: boolean;
  theme?: 'light' | 'dark' | 'colored';
  style?: React.CSSProperties;
  className?: string;
  bodyClassName?: string;
  progressClassName?: string;
}

// Default toast options
const defaultOptions: ToastOptions = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "light",
};

export const useToastify = () => {
  const showToast = (type: ToastType, message: string, options?: ToastOptions) => {
    const toastOptions = { ...defaultOptions, ...options };
    
    switch (type) {
      case 'success':
        return toast.success(message, toastOptions);
      case 'error':
        return toast.error(message, toastOptions);
      case 'warning':
        return toast.warning(message, toastOptions);
      case 'info':
        return toast.info(message, toastOptions);
      default:
        return toast.info(message, toastOptions);
    }
  };

  return { showToast };
};

// Direct API functions for convenience
export const toastify = {
  success: (message: string, options?: ToastOptions) => 
    toast.success(message, { ...defaultOptions, ...options }),
  
  error: (message: string, options?: ToastOptions) => 
    toast.error(message, { ...defaultOptions, ...options }),
  
  warning: (message: string, options?: ToastOptions) => 
    toast.warning(message, { ...defaultOptions, ...options }),
  
  info: (message: string, options?: ToastOptions) => 
    toast.info(message, { ...defaultOptions, ...options }),
  
  // Custom toast with full control
  custom: (message: string, options?: ToastOptions) => 
    toast(message, { ...defaultOptions, ...options }),
  
  // Promise-based toasts
  promise: (promise: Promise<any>, messages: {
    pending?: string;
    success?: string;
    error?: string;
  }, options?: ToastOptions) => 
    toast.promise(promise, messages, { ...defaultOptions, ...options }),
  
  // Dismiss all toasts
  dismiss: () => toast.dismiss(),
  
  // Dismiss specific toast
  dismissToast: (toastId: string | number) => toast.dismiss(toastId),
};

// Export the original toast for advanced usage
export { toast };
