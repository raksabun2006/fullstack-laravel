const StatCard = ({ title, value, icon: Icon, color = 'blue', description }) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    purple: 'bg-purple-50 text-purple-600',
    rose: 'bg-rose-50 text-rose-600',
  };

  return (
    <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs flex items-center justify-between">
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
          {title}
        </span>
        <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {value}
        </span>
        {description && (
          <p className="text-[11px] text-slate-500 mt-1">{description}</p>
        )}
      </div>

      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colorMap[color] || colorMap.blue}`}>
        <Icon size={24} />
      </div>
    </div>
  );
};

export default StatCard;
