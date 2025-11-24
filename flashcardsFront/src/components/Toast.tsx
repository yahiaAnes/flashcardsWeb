import { useToastStore } from '../store/useToastStore';

export const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  const typeStyles = {
    success: 'bg-green-500 dark:bg-green-600 text-white',
    error: 'bg-red-500 dark:bg-red-600 text-white',
    info: 'bg-blue-500 dark:bg-blue-600 text-white',
    warning: 'bg-yellow-500 dark:bg-yellow-600 text-white',
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${typeStyles[toast.type]} px-4 py-3 rounded-lg shadow-lg flex items-center justify-between min-w-[300px] animate-slide-in`}
        >
          <p className="text-sm font-medium">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-4 text-white hover:text-gray-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
};

