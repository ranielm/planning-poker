import { clsx } from 'clsx';
import { CardValue } from '../types';

interface CardProps {
  value: CardValue;
  isSelected?: boolean;
  isRevealed?: boolean;
  isDisabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export default function Card({
  value,
  isSelected = false,
  isRevealed = true,
  isDisabled = false,
  size = 'md',
  onClick,
}: CardProps) {
  const sizeClasses = {
    sm: 'w-12 h-16 text-lg',
    md: 'w-16 h-24 text-2xl',
    lg: 'w-20 h-28 text-3xl',
  };

  const displayValue = value === '☕' ? '☕' : value;

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={clsx(
        'relative rounded-lg font-bold transition-all duration-200 transform',
        sizeClasses[size],
        isRevealed
          ? 'bg-white text-slate-900 border-2 border-slate-300'
          : 'bg-gradient-to-br from-primary-600 to-primary-800 text-transparent border-2 border-primary-500',
        isSelected && 'ring-4 ring-poker-gold ring-offset-2 ring-offset-slate-900 -translate-y-2',
        !isDisabled && 'hover:scale-105 cursor-pointer',
        isDisabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {/* Card face */}
      {isRevealed ? (
        <span className="absolute inset-0 flex items-center justify-center">
          {displayValue}
        </span>
      ) : (
        <span className="absolute inset-0 flex items-center justify-center">
          {/* Card back pattern */}
          <svg
            className="w-8 h-8 text-primary-300 opacity-50"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </span>
      )}
    </button>
  );
}
