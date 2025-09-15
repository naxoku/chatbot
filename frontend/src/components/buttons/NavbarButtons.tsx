import React, { type ReactNode } from "react";

type NavbarButtonColor =
  | "purple"
  | "red"
  | "gray"
  | "emerald"
  | "orange"
  | "blue";

interface NavbarButtonProps {
  children: ReactNode;
  onClick?: () => void;
  color?: NavbarButtonColor;
  className?: string;
  ariaLabel?: string;
  badge?: ReactNode;
}

const colorClasses: Record<NavbarButtonColor, string> = {
  purple:
    "text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-200 dark:hover:border-purple-700",
  red: "text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 dark:hover:border-red-700",
  gray: "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-gray-200 dark:hover:border-gray-600",
  emerald:
    "text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-200 dark:hover:border-emerald-700",
  orange:
    "text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-200 dark:hover:border-orange-700",
  blue: "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-700",
};

const badgeColorClasses: Record<NavbarButtonColor, string> = {
  purple:
    "bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-300",
  red: "bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-300",
  gray: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300",
  emerald:
    "bg-emerald-100 dark:bg-emerald-800 text-emerald-600 dark:text-emerald-300",
  orange:
    "bg-orange-100 dark:bg-orange-800 text-orange-600 dark:text-orange-300",
  blue: "bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300",
};

const NavbarButton: React.FC<NavbarButtonProps> = ({
  children,
  onClick,
  color = "gray",
  className = "",
  ariaLabel,
  badge,
}) => {
  return (
    <div className="relative">
      <button
        onClick={onClick}
        aria-label={ariaLabel}
        className={`
          flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 
          border border-transparent text-sm font-medium
          ${colorClasses[color]}
          ${className}
        `}
        type="button"
      >
        {children}
        {badge && (
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-semibold ml-1 ${badgeColorClasses[color]}`}
          >
            {badge}
          </span>
        )}
      </button>
    </div>
  );
};

export default NavbarButton;
