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
    MODERATOR: <Crown className="h-4 w-4 text-poker-gold" />,
    VOTER: null,
    OBSERVER: <Eye className="h-4 w-4 text-slate-400" />,
  };

  return (
    <div
      className={clsx(
        'flex flex-col items-center p-4 rounded-xl transition-all',
        isCurrentUser && 'bg-primary-900/30 ring-2 ring-primary-500',
        !participant.isOnline && 'opacity-50'
      )}
    >
      {/* Card */}
      <div
        className={clsx(
          'w-14 h-20 rounded-lg flex items-center justify-center mb-3 transition-all duration-300',
          participant.role === 'OBSERVER'
            ? 'bg-slate-700 border-2 border-dashed border-slate-600'
            : participant.hasVoted
            ? isRevealed
              ? 'bg-white text-slate-900 font-bold text-xl border-2 border-slate-300'
              : 'bg-gradient-to-br from-green-500 to-green-700 border-2 border-green-400'
            : 'bg-slate-700 border-2 border-slate-600'
        )}
      >
        {participant.role === 'OBSERVER' ? (
          <Eye className="h-5 w-5 text-slate-500" />
        ) : participant.hasVoted ? (
          isRevealed ? (
            <span>{vote}</span>
          ) : (
            <Check className="h-6 w-6 text-white" />
          )
        ) : (
          <span className="text-slate-500 text-sm">?</span>
        )}
      </div>

      {/* Avatar */}
      <div className="relative">
        {participant.avatarUrl ? (
          <img
            src={participant.avatarUrl}
            alt={participant.displayName}
            className="h-10 w-10 rounded-full border-2 border-slate-600"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center border-2 border-slate-600">
            <User className="h-5 w-5 text-slate-400" />
          </div>
        )}
        {roleIcons[participant.role] && (
          <div className="absolute -top-1 -right-1 bg-slate-800 rounded-full p-0.5">
            {roleIcons[participant.role]}
          </div>
        )}
        {!participant.isOnline && (
          <div className="absolute -bottom-1 -right-1 bg-red-500 rounded-full w-3 h-3 border-2 border-slate-900" />
        )}
      </div>

      {/* Name */}
      <span
        className={clsx(
          'mt-2 text-sm font-medium truncate max-w-[80px]',
          isCurrentUser ? 'text-primary-300' : 'text-slate-300'
        )}
        title={participant.displayName}
      >
        {participant.displayName}
        {isCurrentUser && ' (You)'}
      </span>
    </div>
  );
}
