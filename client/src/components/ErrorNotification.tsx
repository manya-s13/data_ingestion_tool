import React from "react";

interface ErrorNotificationProps {
  error: string;
  onDismiss: () => void;
}

const ErrorNotification: React.FC<ErrorNotificationProps> = ({ error, onDismiss }) => {
  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border-l-4 border-error p-4 w-80 z-50">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-error" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 w-full">
          <h3 className="text-sm font-medium text-error-dark">Error</h3>
          <div className="mt-1 text-sm text-neutral-400">
            {error}
          </div>
          <div className="mt-2 flex justify-end">
            <button 
              onClick={onDismiss}
              className="text-sm font-medium text-error hover:text-error-dark"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorNotification;
