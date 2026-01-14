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
    sm: 'w-11 h-16',
    md: 'w-14 h-20',
    lg: 'w-16 h-24',
  };

  const fontSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const displayValue = value === '☕' ? '☕' : value;
  const isSpecial = value === '?' || value === '☕';

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={clsx(
        'relative rounded-lg font-bold transition-all duration-200 transform group',
        sizeClasses[size],
        isSelected && '-translate-y-3 scale-105',
        !isDisabled && 'hover:-translate-y-1 hover:scale-102 cursor-pointer',
        isDisabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {/* Card shadow */}
      <div className="absolute inset-0 rounded-lg bg-black/40 translate-y-1 blur-sm" />

      {/* Card body */}
      <div
        className={clsx(
          'relative h-full w-full rounded-lg overflow-hidden',
          isRevealed
            ? 'bg-gradient-to-br from-white via-gray-50 to-gray-100'
            : 'bg-gradient-to-br from-red-700 via-red-800 to-red-900'
        )}
      >
        {/* Card border/frame */}
        <div
          className={clsx(
            'absolute inset-0 rounded-lg',
            isSelected
              ? 'ring-2 ring-yellow-400 shadow-lg shadow-yellow-400/50'
              : 'ring-1 ring-black/20'
          )}
        />

        {isRevealed ? (
          // Front of card - casino style
          <>
            {/* Inner border */}
            <div className="absolute inset-1 rounded border border-gray-300" />

            {/* Top-left value */}
            <div className={clsx(
              'absolute top-1 left-1.5 font-bold leading-none',
              fontSizes[size],
              isSpecial ? 'text-blue-600' : 'text-red-600'
            )}>
              {displayValue}
            </div>

            {/* Center value */}
            <div className={clsx(
              'absolute inset-0 flex items-center justify-center font-bold',
              size === 'sm' ? 'text-2xl' : size === 'md' ? 'text-3xl' : 'text-4xl',
              isSpecial ? 'text-blue-600' : 'text-slate-800'
            )}>
              {displayValue}
            </div>

            {/* Bottom-right value (rotated) */}
            <div className={clsx(
              'absolute bottom-1 right-1.5 font-bold leading-none rotate-180',
              fontSizes[size],
              isSpecial ? 'text-blue-600' : 'text-red-600'
            )}>
              {displayValue}
            </div>

            {/* Suit decorations for numbers */}
            {!isSpecial && (
              <>
                <div className="absolute top-1 right-1.5 text-red-600 text-xs">♦</div>
                <div className="absolute bottom-1 left-1.5 text-red-600 text-xs rotate-180">♦</div>
              </>
            )}
          </>
        ) : (
          // Back of card - casino pattern
          <>
            {/* Outer border */}
            <div className="absolute inset-1 rounded border-2 border-red-600/50" />

            {/* Diamond pattern */}
            <div className="absolute inset-2 rounded bg-gradient-to-br from-red-900 to-red-950">
              <div className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: `repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 4px,
                    rgba(255,255,255,0.1) 4px,
                    rgba(255,255,255,0.1) 8px
                  )`
                }}
              />
              {/* Center emblem */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg">
                  <span className="text-red-900 font-bold text-xs">PP</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </button>
  );
}
