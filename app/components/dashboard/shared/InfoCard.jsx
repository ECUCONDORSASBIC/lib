import React from 'react';

const InfoCard = ({
  title,
  value,
  icon,
  footerText,
  footerAction,
  bgColor = 'bg-white',
  textColor = 'text-gray-800',
  iconBgColor = 'bg-blue-500',
  children,
  className = '',
}) => {
  return (
    <div className={`rounded-lg shadow-lg p-6 ${bgColor} ${textColor} ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          {title && <h3 className="text-sm font-medium tracking-wider text-gray-500 uppercase">{title}</h3>}
          {value && <p className="mt-1 text-3xl font-semibold">{value}</p>}
        </div>
        {icon && (
          <div className={`p-3 rounded-full ${iconBgColor} text-white`}>
            {React.cloneElement(icon, { className: 'h-6 w-6' })}
          </div>
        )}
      </div>
      {children && <div className="mt-4">{children}</div>}
      {(footerText || footerAction) && (
        <div className="pt-4 mt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            {footerText && <p className="text-gray-600">{footerText}</p>}
            {footerAction && (
              <button
                onClick={footerAction.onClick}
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                {footerAction.label}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InfoCard;
