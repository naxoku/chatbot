import React from "react";

const VibrantButton = ({
  color = "purple",
  label,
  icon: Icon,
  badge,
  onClick,
  className = "",
  variant = "default",
  size = "default",
  disabled = false,
}) => {
  const colorClasses = {
    purple:
      "bg-white hover:bg-purple-50 text-purple-600 border-2 border-purple-200 hover:border-purple-400 dark:bg-purple-900/10 dark:hover:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800 dark:hover:border-purple-600",
    emerald:
      "bg-white hover:bg-emerald-50 text-emerald-600 border-2 border-emerald-200 hover:border-emerald-400 dark:bg-emerald-900/10 dark:hover:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800 dark:hover:border-emerald-600",
    orange:
      "bg-white hover:bg-orange-50 text-orange-600 border-2 border-orange-200 hover:border-orange-400 dark:bg-orange-900/10 dark:hover:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800 dark:hover:border-orange-600",
    blue: "bg-white hover:bg-blue-50 text-blue-600 border-2 border-blue-200 hover:border-blue-400 dark:bg-blue-900/10 dark:hover:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 dark:hover:border-blue-600",
    pink: "bg-white hover:bg-pink-50 text-pink-600 border-2 border-pink-200 hover:border-pink-400 dark:bg-pink-900/10 dark:hover:bg-pink-900/20 dark:text-pink-400 dark:border-pink-800 dark:hover:border-pink-600",
    teal: "bg-white hover:bg-teal-50 text-teal-600 border-2 border-teal-200 hover:border-teal-400 dark:bg-teal-900/10 dark:hover:bg-teal-900/20 dark:text-teal-400 dark:border-teal-800 dark:hover:border-teal-600",
    amber:
      "bg-white hover:bg-amber-50 text-amber-600 border-2 border-amber-200 hover:border-amber-400 dark:bg-amber-900/10 dark:hover:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800 dark:hover:border-amber-600",
    violet:
      "bg-white hover:bg-violet-50 text-violet-600 border-2 border-violet-200 hover:border-violet-400 dark:bg-violet-900/10 dark:hover:bg-violet-900/20 dark:text-violet-400 dark:border-violet-800 dark:hover:border-violet-600",
    red: "bg-white hover:bg-red-50 text-red-600 border-2 border-red-200 hover:border-red-400 dark:bg-red-900/10 dark:hover:bg-red-900/20 dark:text-red-400 dark:border-red-800 dark:hover:border-red-600",
  };

  const sizeClasses = {
    small: variant === "icon" ? "p-2" : "py-2 px-4 text-sm",
    default: variant === "icon" ? "p-3" : "py-3 px-6",
    large: variant === "icon" ? "p-4" : "py-4 px-8",
  };

  const baseClasses =
    variant === "icon"
      ? `rounded-lg ${colorClasses[color]} inline-flex items-center justify-center transition-all duration-300`
      : `font-medium rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg ${colorClasses[color]} inline-flex items-center space-x-2`;

  const disabledClasses = disabled
    ? "opacity-50 cursor-not-allowed transform-none hover:scale-100"
    : "cursor-pointer";

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses[size]} ${disabledClasses} ${className}`}
    >
      {Icon && <Icon className="w-5 h-5" />}
      {label && <span>{label}</span>}
      {badge && (
        <span className="ml-2 text-xs font-bold text-white bg-red-500 rounded-full px-2 py-1">
          {badge}
        </span>
      )}
    </button>
  );
};

export default VibrantButton;
