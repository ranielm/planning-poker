import { clsx } from 'clsx';
import { CardValue } from '../types';

interface CardProps {
  value: CardValue;
  isSelected?: boolean;
  isRevealed?: boolean;
  isDisabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  deckType?: 'FIBONACCI' | 'TSHIRT';
  onClick?: () => void;
}

// No face card mapping - show actual numbers

// T-Shirt sizes to story points mapping
const tshirtToSP: Record<string, number> = {
  'S': 13,
  'M': 26,
  'L': 52,
  'XL': 104,
};


export default function Card({
  value,
  isSelected = false,
  isRevealed = true,
  isDisabled = false,
  size = 'md',
  deckType = 'FIBONACCI',
  onClick,
}: CardProps) {
  const sizeClasses = {
    sm: 'w-12 h-[68px]',
    md: 'w-14 h-20',
    lg: 'w-16 h-24',
  };

  const isTShirt = deckType === 'TSHIRT' || ['S', 'M', 'L', 'XL'].includes(String(value));
  const isJoker = value === '?';
  const isBrb = value === '☕' || value === 'BRB';

  // Generate tooltip text
  const getTooltipText = () => {
    if (isJoker) return 'Not sure';
    if (isBrb) return 'Be Right Back';
    if (isTShirt) {
      const sp = tshirtToSP[String(value)];
      return sp ? `Size ${value} (${sp} SP)` : `Size ${value}`;
    }
    return `${value} Story Points`;
  };



  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      title={getTooltipText()}
      className={clsx(
        'relative rounded-lg font-bold transition-all duration-200 transform group',
        sizeClasses[size],
        isSelected && '-translate-y-3 scale-105',
        !isDisabled && 'hover:-translate-y-1 cursor-pointer',
        isDisabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {/* Tooltip */}
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg">
        {getTooltipText()}
      </div>

      {/* Card shadow */}
      <div className="absolute inset-0 rounded-lg bg-black/40 translate-y-1 blur-sm" />

      {/* Card body */}
      <div
        className={clsx(
          'relative h-full w-full rounded-lg overflow-hidden',
          isRevealed
            ? 'bg-gradient-to-br from-white via-gray-50 to-gray-100'
            : 'bg-gradient-to-br from-blue-800 via-blue-900 to-blue-950'
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
          // Front of card
          <>
            {/* Inner border */}
            <div className="absolute inset-[3px] rounded border border-gray-200" />

            {isJoker ? (
              // Joker card - Heath Ledger style
              <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded">
                <img
                  src="/joker.png"
                  alt="Joker"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : isBrb ? (
              // BRB (Be Right Back) card
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
                <span className="text-2xl font-bold text-amber-600">BRB</span>
                <span className="text-[8px] text-amber-500 mt-0.5">Be Right Back</span>
              </div>
            ) : isTShirt ? (
              // T-Shirt card - show only the size letter large and centered
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-5xl font-bold text-slate-700">
                  {value}
                </span>
              </div>
            ) : (
              // Regular card (Fibonacci) - show only the number large and centered
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={clsx(
                  'font-bold text-slate-700',
                  String(value).length === 1 ? 'text-5xl' : 'text-4xl'
                )}>
                  {value}
                </span>
              </div>
            )}
          </>
        ) : (
          // Back of card - classic blue pattern
          <>
            {/* Outer border */}
            <div className="absolute inset-[3px] rounded border border-blue-400/30" />

            {/* Pattern background */}
            <div className="absolute inset-2 rounded bg-gradient-to-br from-blue-700 to-blue-900 overflow-hidden">
              {/* Diamond pattern */}
              <div className="absolute inset-0"
                style={{
                  backgroundImage: `
                    repeating-linear-gradient(
                      45deg,
                      transparent,
                      transparent 5px,
                      rgba(255,255,255,0.05) 5px,
                      rgba(255,255,255,0.05) 10px
                    ),
                    repeating-linear-gradient(
                      -45deg,
                      transparent,
                      transparent 5px,
                      rgba(255,255,255,0.05) 5px,
                      rgba(255,255,255,0.05) 10px
                    )
                  `
                }}
              />
              {/* Center oval decoration */}
              <div className="absolute inset-2 rounded-full border border-white/10" />
              <div className="absolute inset-4 rounded-full border border-white/10" />

              {/* Center emblem */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                  <span className="text-white/50 text-[8px] font-bold">PP</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </button>
  );
}
