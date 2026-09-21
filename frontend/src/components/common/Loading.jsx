import { Loader2 } from 'lucide-react';

const Loading = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 gap-3">
      <Loader2 className="animate-spin text-blue-600" size={32} />
      <p className="text-sm font-medium text-slate-500">{message}</p>
    </div>
  );
};

export default Loading;
