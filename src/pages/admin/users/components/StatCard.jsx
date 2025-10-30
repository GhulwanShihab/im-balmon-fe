const StatCard = ({ title, value }) => {
  return (
    <div className="bg-white shadow rounded-xl p-4 text-center">
      <p className="text-sm text-gray-500">{title}</p>
      <h3 className="text-xl font-bold">{value}</h3>
    </div>
  );
};

export default StatCard;
