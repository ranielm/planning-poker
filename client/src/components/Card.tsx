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

// Map high Fibonacci values to face cards for visual appeal
// 13 = K (King) - keeps the playing card aesthetic
const fibonacciToRank: Record<number, string> = {
  13: 'K',
};

// T-Shirt sizes to story points mapping
const tshirtToSP: Record<string, number> = {
  'S': 13,
  'M': 26,
  'L': 52,
  'XL': 104,
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

// T-Shirt SVG component
function TShirtIcon({ size, className }: { size: string; className?: string }) {
  // Scale based on t-shirt size
  const scales: Record<string, number> = {
    'S': 0.65,
    'M': 0.75,
    'L': 0.85,
    'XL': 1.0,
  };
  const scale = scales[size] || 0.75;

  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      style={{ transform: `scale(${scale})` }}
    >
      <path d="M16 21H8a1 1 0 0 1-1-1v-9H3.5a1 1 0 0 1-.7-1.71l4-4a1 1 0 0 1 .7-.29h2a2.5 2.5 0 0 0 5 0h2a1 1 0 0 1 .7.29l4 4a1 1 0 0 1-.7 1.71H17v9a1 1 0 0 1-1 1z"/>
    </svg>
  );
}

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
  const isCoffee = value === '☕';

  // Generate tooltip text
  const getTooltipText = () => {
    if (isJoker) return 'Not sure';
    if (isCoffee) return 'Need a break';
    if (isTShirt) {
      const sp = tshirtToSP[String(value)];
      return sp ? `Size ${value} (${sp} SP)` : `Size ${value}`;
    }
    return `${value} Story Points`;
  };

  // For Fibonacci deck - map to face card if applicable, otherwise show value
  const numValue = typeof value === 'number' ? value : parseInt(String(value), 10);
  const rank = fibonacciToRank[numValue] || String(value);
  const suit = getSuitForValue(String(value));
  const suitColor = suitColors[suit];

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
              // Joker card - stylized design
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
                <div className="text-3xl">🃏</div>
                <span className="text-[9px] font-bold text-purple-600 mt-0.5 tracking-wide">JOKER</span>
              </div>
            ) : isCoffee ? (
              // Coffee break card
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-2xl">☕</div>
              </div>
            ) : isTShirt ? (
              // T-Shirt card - show shirt icon
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <TShirtIcon
                  size={String(value)}
                  className="w-10 h-10 text-blue-600"
                />
                <span className="text-[10px] font-bold text-slate-600 mt-0.5">
                  {value}
                </span>
              </div>
            ) : (
              // Regular playing card (Fibonacci)
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
