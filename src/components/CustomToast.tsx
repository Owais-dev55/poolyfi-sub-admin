import { useCustomToast, type Toast } from '../utils/useCustomToast';

// Carpooling-themed SVG icons
const CarIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
  </svg>
);

const CheckIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
  </svg>
);

const XIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>
);

const WarningIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
  </svg>
);

const InfoIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
  </svg>
);

const ToastItem = ({ toast }: { toast: Toast }) => {
  const { dismissToast } = useCustomToast();
  
  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-white border-gray-300  text-gray-900';
      case 'error':
        return 'bg-gradient-to-r from-red-500 to-red-600 border-red-700 shadow-red-200';
      case 'warning':
        return 'bg-gradient-to-r from-yellow-400 to-yellow-500 border-yellow-600 shadow-yellow-200';
      case 'info':
        return 'bg-gradient-to-r from-blue-500 to-blue-600 border-blue-700 shadow-blue-200';
      default:
        return 'bg-white border-gray-300 shadow-gray-200 text-gray-900';
    }
  };
  
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckIcon className="w-5 h-5" />;
      case 'error':
        return <XIcon className="w-5 h-5" />;
      case 'warning':
        return <WarningIcon className="w-5 h-5" />;
      case 'info':
        return <InfoIcon className="w-5 h-5" />;
      default:
        return <CarIcon className="w-5 h-5" />;
    }
  };
  
  const getIconBg = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-100';
      case 'error':
        return 'bg-white/20';
      case 'warning':
        return 'bg-white/20';
      case 'info':
        return 'bg-white/20';
      default:
        return 'bg-green-100';
    }
  };
  
  return (
    <div className={`
      ${getToastStyles()} 
      ${toast.type === 'success' ? 'text-gray-900' : 'text-white'} px-6 py-4 rounded-xl shadow-2xl border-l-4 mb-3 
      flex items-center justify-between min-w-80 max-w-96 
      transform transition-all duration-300 ease-in-out
      hover:scale-105 hover:shadow-3xl
      backdrop-blur-sm
    `}>
      <div className="flex items-center space-x-4">
        <div className={`${getIconBg()} p-2 rounded-full`}>
          {getIcon()}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold leading-relaxed">{toast.message}</p>
          {toast.description && (
            <p className={`text-xs mt-1 ${toast.type === 'success' ? 'text-gray-600' : 'text-white/80'}`}>{toast.description}</p>
          )}
        </div>
      </div>
      <button
        onClick={() => dismissToast(toast.id)}
        className={`${toast.type === 'success' ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100' : 'text-white/80 hover:text-white hover:bg-white/20'} transition-all duration-200 ml-3 p-1 rounded-full`}
      >
        <XIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

const CustomToastContainer = () => {
  const { toasts } = useCustomToast();
  
  if (toasts.length === 0) return null;
  
  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-3 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="animate-in slide-in-from-right-full duration-300"
        >
          <ToastItem toast={toast} />
        </div>
      ))}
    </div>
  );
};

export default CustomToastContainer;
