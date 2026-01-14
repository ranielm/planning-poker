import { clsx } from 'clsx';
import { User, Crown, Eye, Check } from 'lucide-react';
import { Participant, ParticipantRole } from '../types';

interface ParticipantCardProps {
  participant: Participant;
  vote: string | null;
  isRevealed: boolean;
  isCurrentUser: boolean;
}

export default function ParticipantCard({
  participant,
  vote,
  isRevealed,
  isCurrentUser,
}: ParticipantCardProps) {
  const roleIcons: Record<ParticipantRole, React.ReactNode> = {
    MODERATOR: <Crown className="h-3 w-3 text-yellow-400" />,
    VOTER: null,
    OBSERVER: <Eye className="h-3 w-3 text-slate-400" />,
  };

  const isSpecialVote = vote === '?' || vote === '☕';

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
              // Revealed card - casino style
              <>
                {/* Inner border */}
                <div className="absolute inset-0.5 rounded border border-gray-200" />

                {/* Top-left corner */}
                <span className={clsx(
                  'absolute top-0.5 left-1 text-[10px] font-bold',
                  isSpecialVote ? 'text-blue-600' : 'text-red-600'
                )}>
                  {vote}
                </span>

                {/* Center value */}
                <span className={clsx(
                  'text-xl font-bold',
                  isSpecialVote ? 'text-blue-600' : 'text-slate-800'
                )}>
                  {vote}
                </span>

                {/* Bottom-right corner */}
                <span className={clsx(
                  'absolute bottom-0.5 right-1 text-[10px] font-bold rotate-180',
                  isSpecialVote ? 'text-blue-600' : 'text-red-600'
                )}>
                  {vote}
                </span>

                {/* Suit decoration */}
                {!isSpecialVote && (
                  <span className="absolute top-0.5 right-1 text-red-600 text-[8px]">♦</span>
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
