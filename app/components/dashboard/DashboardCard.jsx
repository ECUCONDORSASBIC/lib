const DashboardCard = ({ children, className = '' }) => (
  <div className={`bg-white rounded shadow p-4 mb-4 ${className}`}>
    {children}
  </div>
);

DashboardCard.Header = function Header({ children, className = '' }) {
  return <div className={`mb-2 ${className}`}>{children}</div>;
};

DashboardCard.Body = function Body({ children, className = '' }) {
  return <div className={className}>{children}</div>;
};

export default DashboardCard;
