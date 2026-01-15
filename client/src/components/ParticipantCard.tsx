import { clsx } from 'clsx';
import { User, Crown, Eye, Check } from 'lucide-react';
import { Participant, ParticipantRole } from '../types';

interface ParticipantCardProps {
  participant: Participant;
  vote: string | null;
  isRevealed: boolean;
  isCurrentUser: boolean;
  deckType?: 'FIBONACCI' | 'TSHIRT';
}

// Map high Fibonacci values to face cards (same as Card.tsx)
const fibonacciToRank: Record<string, string> = {
  '13': 'K',
};

// T-Shirt sizes to story points mapping
const tshirtToSP: Record<string, number> = {
  'S': 13,
  'M': 26,
  'L': 52,
  'XL': 104,
};

// Suits rotation for visual variety (same as Card.tsx)
const suits = ['♠', '♥', '♦', '♣'];
const suitColors: Record<string, string> = {
  '♠': 'text-slate-900',
  '♥': 'text-red-600',
  '♦': 'text-red-600',
  '♣': 'text-slate-900',
};

function getSuitForValue(value: string): string {
  const hash = value.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return suits[hash % 4];
}

// T-Shirt SVG component (same as Card.tsx)
function TShirtIcon({ size, className }: { size: string; className?: string }) {
  const scales: Record<string, number> = {
    'S': 0.6,
    'M': 0.7,
    'L': 0.8,
    'XL': 0.9,
  };
  const scale = scales[size] || 0.7;

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

// Get tooltip text for revealed card
function getTooltipText(vote: string | null, isTShirt: boolean): string {
  if (vote === '?') return 'Not sure';
  if (vote === '☕') return 'Need a break';
  if (isTShirt && vote) {
    const sp = tshirtToSP[vote];
    return sp ? `Size ${vote} (${sp} SP)` : `Size ${vote}`;
  }
  return vote ? `${vote} Story Points` : '';
}

export default function ParticipantCard({
  participant,
  vote,
  isRevealed,
  isCurrentUser,
  deckType = 'FIBONACCI',
}: ParticipantCardProps) {
  const roleIcons: Record<ParticipantRole, React.ReactNode> = {
    MODERATOR: <Crown className="h-3 w-3 text-yellow-400" />,
    VOTER: null,
    OBSERVER: <Eye className="h-3 w-3 text-slate-400" />,
  };

  const isTShirt = deckType === 'TSHIRT' || ['S', 'M', 'L', 'XL'].includes(String(vote));
  const isJoker = vote === '?';
  const isCoffee = vote === '☕';

  return (
    <div
      className={clsx(
        'flex flex-col items-center p-2 rounded-lg transition-all',
        isCurrentUser && 'bg-blue-900/30 ring-1 ring-blue-400/50',
        !participant.isOnline && 'opacity-50'
      )}
    >
      {/* Card */}
      <div className="relative mb-2">
        {/* Card shadow */}
        <div className="absolute inset-0 rounded-md bg-black/30 translate-y-0.5 blur-[1px]" />

        <div
          className={clsx(
            'relative w-11 h-16 rounded-md flex items-center justify-center transition-all duration-300 overflow-hidden',
            participant.role === 'OBSERVER'
              ? 'bg-slate-700/80 border border-dashed border-slate-500'
              : participant.hasVoted
              ? isRevealed
                ? 'bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-300'
                : 'bg-gradient-to-br from-red-700 via-red-800 to-red-900 border border-red-600'
              : 'bg-slate-700/80 border border-slate-600'
          )}
        >
          {participant.role === 'OBSERVER' ? (
            <Eye className="h-4 w-4 text-slate-500" />
          ) : participant.hasVoted ? (
            isRevealed ? (
              // Revealed card
              <>
                {/* Inner border */}
                <div className="absolute inset-0.5 rounded border border-gray-200" />

                {isJoker ? (
                  // Joker card - same as deck
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 rounded">
                    <div className="text-lg">🃏</div>
                    <span className="text-[6px] font-bold text-purple-600 tracking-wide">JOKER</span>
                  </div>
                ) : isCoffee ? (
                  // Coffee break card
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-lg">☕</div>
                  </div>
                ) : isTShirt ? (
                  // T-Shirt card - same as deck (shirt icon + size label)
                  <div className="absolute inset-0 flex flex-col items-center justify-center" title={getTooltipText(vote, true)}>
                    <TShirtIcon
                      size={String(vote)}
                      className="w-6 h-6 text-blue-600"
                    />
                    <span className="text-[8px] font-bold text-slate-600 mt-0.5">
                      {vote}
                    </span>
                  </div>
                ) : (
                  // Fibonacci card - same as deck (number/face + suit)
                  (() => {
                    const suit = getSuitForValue(String(vote));
                    const suitColor = suitColors[suit];
                    const rank = fibonacciToRank[String(vote)] || vote;
                    return (
                      <>
                        {/* Top-left rank and suit */}
                        <div className="absolute top-0.5 left-0.5 flex flex-col items-center leading-none">
                          <span className={clsx('font-bold text-[8px]', suitColor)}>{rank}</span>
                          <span className={clsx('text-[7px] -mt-0.5', suitColor)}>{suit}</span>
                        </div>

                        {/* Center suit */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className={clsx('text-xl', suitColor)}>{suit}</span>
                        </div>

                        {/* Bottom-right rank and suit (rotated) */}
                        <div className="absolute bottom-0.5 right-0.5 flex flex-col items-center leading-none rotate-180">
                          <span className={clsx('font-bold text-[8px]', suitColor)}>{rank}</span>
                          <span className={clsx('text-[7px] -mt-0.5', suitColor)}>{suit}</span>
                        </div>
                      </>
                    );
                  })()
                )}
              </>
            ) : (
              // Hidden card - casino back
              <>
                {/* Border */}
                <div className="absolute inset-0.5 rounded border border-red-500/50" />

                {/* Pattern background */}
                <div className="absolute inset-1 rounded bg-gradient-to-br from-red-800 to-red-950"
                  style={{
                    backgroundImage: `repeating-linear-gradient(
                      45deg,
                      transparent,
                      transparent 3px,
                      rgba(255,255,255,0.05) 3px,
                      rgba(255,255,255,0.05) 6px
                    )`
                  }}
                />

                {/* Center emblem */}
                <div className="relative w-5 h-5 rounded-full bg-gradient-to-b from-yellow-400 to-yellow-600 flex items-center justify-center shadow border border-yellow-300">
                  <Check className="h-3 w-3 text-red-900" />
                </div>
              </>
            )
          ) : (
            // Empty card - waiting for vote
            <span className="text-slate-500 text-lg">?</span>
          )}
        </div>
      </div>

      {/* Avatar */}
      <div className="relative">
        {participant.avatarUrl ? (
          <img
            src={participant.avatarUrl}
            alt={participant.displayName}
            className="h-8 w-8 rounded-full border-2 border-slate-600 shadow"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center border-2 border-slate-600 shadow">
            <User className="h-4 w-4 text-slate-400" />
          </div>
        )}
        {roleIcons[participant.role] && (
          <div className="absolute -top-1 -right-1 bg-slate-800 rounded-full p-0.5 shadow">
            {roleIcons[participant.role]}
          </div>
        )}
        {!participant.isOnline && (
          <div className="absolute -bottom-0.5 -right-0.5 bg-red-500 rounded-full w-2.5 h-2.5 border-2 border-slate-900" />
        )}
      </div>

      {/* Name */}
      <span
        className={clsx(
          'mt-1 text-xs font-medium truncate max-w-[70px]',
          isCurrentUser ? 'text-blue-300' : 'text-slate-300'
        )}
        title={participant.displayName}
      >
        {participant.displayName}
      </span>
    </div>
  );
}
