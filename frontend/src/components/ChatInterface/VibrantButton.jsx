import React from "react";

const VibrantButton = ({
  label,
  icon: Icon,
  onClick,
  className = "",
  disabled = false,
}) => {
  const baseClasses = `
    w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg 
    font-medium text-gray-700 dark:text-gray-200 
    bg-gray-100 dark:bg-gray-700 
    hover:bg-gray-200 dark:hover:bg-gray-600 
    border border-gray-200 dark:border-gray-600
    transition-all duration-200 focus:outline-none 
    focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500
  `;

  const disabledClasses = disabled
    ? "opacity-50 cursor-not-allowed"
    : "cursor-pointer";

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`${baseClasses} ${disabledClasses} ${className}`}
    >
      {Icon && <Icon className="w-5 h-5" />}
      {label && <span>{label}</span>}
    </button>
  );
};

export default VibrantButton;
