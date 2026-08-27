import React from 'react';
import { useNavigate } from 'react-router-dom';
import { type LucideIcon, ArrowRight } from 'lucide-react';

export type ButtonVariant = 'indigo' | 'gold' | 'red' | 'green' | 'slate';

interface ActionButtonProps {
  title: string;
  icon: LucideIcon;
  to?: string;
  onClick?: () => void;
  subtitle?: string;
  variant?: ButtonVariant;
}

// Color theme definitions using matching hue backgrounds & focus rings
const variantStyles: Record<ButtonVariant, {
  bg: string;
  bgHover: string;
  border: string;
  borderHover: string;
  focusRing: string;
  iconBox: string;
  iconText: string;
  arrowHover: string;
}> = {
  indigo: {
    bg: 'bg-indigo-950/30',
    bgHover: 'hover:bg-indigo-950/60',
    border: 'border-indigo-900/40',
    borderHover: 'hover:border-indigo-500/60',
    focusRing: 'focus:ring-indigo-500/40',
    iconBox: 'bg-indigo-950/80 border-indigo-800/50 group-hover:bg-indigo-900/80 group-hover:border-indigo-500/50',
    iconText: 'text-indigo-400 group-hover:text-indigo-300',
    arrowHover: 'group-hover:text-indigo-400',
  },
  gold: {
    bg: 'bg-yellow-950/30',
    bgHover: 'hover:bg-yellow-950/60',
    border: 'border-yellow-900/40',
    borderHover: 'hover:border-yellow-500/60',
    focusRing: 'focus:ring-yellow-500/40',
    iconBox: 'bg-yellow-950/80 border-yellow-800/50 group-hover:bg-yellow-900/80 group-hover:border-yellow-500/50',
    iconText: 'text-yellow-400 group-hover:text-yellow-300',
    arrowHover: 'group-hover:text-yellow-400',
  },
  red: {
    bg: 'bg-red-950/30',
    bgHover: 'hover:bg-red-950/60',
    border: 'border-red-900/40',
    borderHover: 'hover:border-red-500/60',
    focusRing: 'focus:ring-red-500/40',
    iconBox: 'bg-red-950/80 border-red-800/50 group-hover:bg-red-900/80 group-hover:border-red-500/50',
    iconText: 'text-red-400 group-hover:text-red-300',
    arrowHover: 'group-hover:text-red-400',
  },
  green: {
    bg: 'bg-emerald-950/30',
    bgHover: 'hover:bg-emerald-950/60',
    border: 'border-emerald-900/40',
    borderHover: 'hover:border-emerald-500/60',
    focusRing: 'focus:ring-emerald-500/40',
    iconBox: 'bg-emerald-950/80 border-emerald-800/50 group-hover:bg-emerald-900/80 group-hover:border-emerald-500/50',
    iconText: 'text-emerald-400 group-hover:text-emerald-300',
    arrowHover: 'group-hover:text-emerald-400',
  },
  slate: {
    bg: 'bg-gray-900/60',
    bgHover: 'hover:bg-gray-800/80',
    border: 'border-gray-800',
    borderHover: 'hover:border-gray-600',
    focusRing: 'focus:ring-gray-500/40',
    iconBox: 'bg-gray-800 border-gray-700 group-hover:bg-gray-700 group-hover:border-gray-600',
    iconText: 'text-gray-300 group-hover:text-white',
    arrowHover: 'group-hover:text-gray-300',
  },
};

export const ActionButton: React.FC<ActionButtonProps> = ({
  title,
  icon: Icon,
  to,
  onClick,
  subtitle,
  variant = 'indigo',
}) => {
  const navigate = useNavigate();
  const theme = variantStyles[variant];

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (to) {
      navigate(to);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`group relative w-full flex items-center justify-between p-4 ${theme.bg} ${theme.bgHover} border ${theme.border} ${theme.borderHover} rounded-xl shadow-lg transition-all duration-200 ease-out active:scale-[0.98] focus:outline-none focus:ring-2 ${theme.focusRing}`}
    >
      {/* Left side: Icon & Text content */}
      <div className="flex items-center space-x-3.5">
        <div className={`p-2.5 rounded-lg border ${theme.iconBox} ${theme.iconText} transition-colors shadow-inner`}>
          <Icon className="w-5 h-5" />
        </div>

        <div className="text-left">
          <span className="text-sm font-bold text-gray-100 group-hover:text-white tracking-wide transition-colors block">
            {title}
          </span>
          {subtitle && (
            <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right side: Arrow Indicator */}
      <div className={`text-gray-500 ${theme.arrowHover} group-hover:translate-x-1 transition-all duration-200`}>
        <ArrowRight className="w-4 h-4" />
      </div>
    </button>
  );
};