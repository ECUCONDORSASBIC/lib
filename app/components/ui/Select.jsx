
const Select = ({ className = '', children, ...props }) => {
  return (
    <select
      className={"w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 " + className}
      {...props}
    >
      {children}
    </select>
  );
};

export default Select;
