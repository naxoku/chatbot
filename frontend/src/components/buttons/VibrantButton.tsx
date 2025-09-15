import { type ReactNode } from "react";

type Color =
  | "purple"
  | "emerald"
  | "orange"
  | "teal"
  | "blue"
  | "pink"
  | "amber"
  | "violet"
  | "red";

interface VibrantButtonProps {
  color?: Color;
  label?: string;
  icon?: ReactNode;
  badge?: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "default" | "icon";
  ariaLabel?: string;
}

const colorClasses: Record<Color, string> = {
  purple:
    "bg-white hover:bg-purple-50 text-purple-600 border-2 border-purple-200 hover:border-purple-400",
  emerald:
    "bg-white hover:bg-emerald-50 text-emerald-600 border-2 border-emerald-200 hover:border-emerald-400",
  orange:
    "bg-white hover:bg-orange-50 text-orange-600 border-2 border-orange-200 hover:border-orange-400",
  teal: "bg-white hover:bg-teal-50 text-teal-600 border-2 border-teal-200 hover:border-teal-400",
  blue: "bg-white hover:bg-blue-50 text-blue-600 border-2 border-blue-200 hover:border-blue-400",
  pink: "bg-white hover:bg-pink-50 text-pink-600 border-2 border-pink-200 hover:border-pink-400",
  amber:
    "bg-white hover:bg-amber-50 text-amber-600 border-2 border-amber-200 hover:border-amber-400",
  violet:
    "bg-white hover:bg-violet-50 text-violet-600 border-2 border-violet-200 hover:border-violet-400",
  red: "bg-white hover:bg-red-50 text-red-600 border-2 border-red-200 hover:border-red-400",
};

export default function VibrantButton({
  color = "purple",
  label,
  icon,
  badge,
  onClick,
  className = "",
  variant = "default",
  ariaLabel,
}: VibrantButtonProps) {
  const base =
    variant === "icon"
      ? `p-3 rounded-lg ${colorClasses[color]} inline-flex items-center justify-center`
      : `font-medium py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 glow-hover shadow-lg ${colorClasses[color]} inline-flex items-center`;

  return (
    <button
      onClick={onClick}
      className={`${base} ${className}`}
      aria-label={ariaLabel}
    >
      <div className="flex items-center justify-center space-x-3">
        {icon && <span className="w-5 h-5">{icon}</span>}
        <span>{label}</span>
      </div>
    </button>
  );
}
