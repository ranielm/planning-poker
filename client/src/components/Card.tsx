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

// Map story point values to playing card ranks
const valueToRank: Record<string, string> = {
  '0': 'A',
  '1': '2',
  '2': '3',
  '3': '4',
  '5': '5',
  '8': '6',
  '13': '7',
  '21': '8',
  '34': '9',
  '55': '10',
  '89': 'J',
  '?': 'JOKER',
  '☕': '☕',
  // T-Shirt sizes
  'S': '2',
  'M': '5',
  'L': '8',
  'XL': 'K',
};

// Suits rotation for visual variety
const suits = ['♠', '♥', '♦', '♣'];
const suitColors: Record<string, string> = {
  '♠': 'text-slate-900',
  '♥': 'text-red-600',
  '♦': 'text-red-600',
  '♣': 'text-slate-900',
};

// Get consistent suit based on value
function getSuitForValue(value: string): string {
  const hash = value.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return suits[hash % 4];
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
    sm: 'w-12 h-[68px]',
    md: 'w-14 h-20',
    lg: 'w-16 h-24',
  };

  const isSpecial = value === '?' || value === '☕';
  const isJoker = value === '?';
  const isCoffee = value === '☕';
  const rank = valueToRank[String(value)] || String(value);
  const suit = getSuitForValue(String(value));
  const suitColor = suitColors[suit];

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      title={`${value} Story Points`}
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
        {value} SP
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
          // Front of card - real playing card style
          <>
            {/* Inner border */}
            <div className="absolute inset-[3px] rounded border border-gray-200" />

            {isJoker ? (
              // Joker card
              <>
                <div className="absolute top-1 left-1.5 text-purple-600 font-bold text-[10px] leading-none">
                  ?
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-2xl">🃏</div>
                </div>
                <div className="absolute bottom-1 right-1.5 text-purple-600 font-bold text-[10px] leading-none rotate-180">
                  ?
                </div>
              </>
            ) : isCoffee ? (
              // Coffee break card
              <>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-2xl">☕</div>
                </div>
              </>
            ) : (
              // Regular playing card
              <>
                {/* Top-left rank and suit */}
                <div className="absolute top-1 left-1.5 flex flex-col items-center leading-none">
                  <span className={clsx('font-bold text-[11px]', suitColor)}>{rank}</span>
                  <span className={clsx('text-[10px] -mt-0.5', suitColor)}>{suit}</span>
                </div>

                {/* Center suit pattern */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={clsx('text-3xl', suitColor)}>{suit}</span>
                </div>

                {/* Bottom-right rank and suit (rotated) */}
                <div className="absolute bottom-1 right-1.5 flex flex-col items-center leading-none rotate-180">
                  <span className={clsx('font-bold text-[11px]', suitColor)}>{rank}</span>
                  <span className={clsx('text-[10px] -mt-0.5', suitColor)}>{suit}</span>
                </div>
              </>
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
