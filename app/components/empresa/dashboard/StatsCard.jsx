const StatsCard = ({ title, value, icon, bgColorClass }) => {
  return (
    <div className={`p-5 rounded-xl shadow-lg flex items-center space-x-4 ${bgColorClass}`}>
      <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-full bg-white bg-opacity-30">
        {icon && <span className="h-6 w-6 text-white">{icon}</span>}
      </div>
      <div>
        <p className="text-sm font-medium text-white uppercase">{title}</p>
        <p className="text-2xl font-semibold text-white">{value}</p>
      </div>
    </div>
  );
};

export default StatsCard;
