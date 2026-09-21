import { AlertCircle } from 'lucide-react';

const ErrorMessage = ({ message = 'An error occurred while fetching data.', onRetry }) => {
  return (
    <div className="flex items-start gap-3 p-4 my-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
      <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-red-900">Error Encountered</h4>
        <p className="text-sm text-red-700 mt-0.5 mb-2">{message}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-md bg-white border border-red-300 text-red-700 hover:bg-red-50 transition cursor-pointer"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
