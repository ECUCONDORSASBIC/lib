const StatsCard = ({ stat }) => {
  const { name, value, icon: Icon, color } = stat;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 flex items-center">
      <div className={`${color} p-2 rounded-lg mr-3`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{name}</p>
        <p className="text-2xl font-semibold">{value}</p>
      </div>
    </div>
  );
};

export default StatsCard;
