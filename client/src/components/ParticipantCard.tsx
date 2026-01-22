import { clsx } from 'clsx';
import { Crown, Eye, Check, UserCog, UserX } from 'lucide-react';
import { Participant, ParticipantRole } from '../types';
import { getAvatarUrl, getAvatarName } from '../utils/batmanAvatars';

interface ParticipantCardProps {
  participant: Participant;
  vote: string | null;
  isRevealed: boolean;
  isCurrentUser: boolean;
  deckType?: 'FIBONACCI' | 'TSHIRT';
  isDealer?: boolean;
  isModeratorView?: boolean;
  onAssignDealer?: (userId: string) => void;
  onKick?: (userId: string) => void;
}

// No face card mapping - show actual numbers

// T-Shirt sizes to story points mapping
const tshirtToSP: Record<string, number> = {
  'S': 13,
  'M': 26,
  'L': 52,
  'XL': 104,
};



// Get tooltip text for revealed card
function getTooltipText(vote: string | null, isTShirt: boolean): string {
  if (vote === '?') return 'Not sure';
  if (vote === '☕' || vote === 'BRB') return 'Be Right Back';
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
  isDealer,
  isModeratorView,
  onAssignDealer,
  onKick,
}: ParticipantCardProps) {
  const roleIcons: Record<ParticipantRole, React.ReactNode> = {
    MODERATOR: <Crown className="h-3 w-3 text-yellow-400" />,
    VOTER: null,
    OBSERVER: <Eye className="h-3 w-3 text-slate-400" />,
  };

  const isTShirt = deckType === 'TSHIRT' || ['S', 'M', 'L', 'XL'].includes(String(vote));
  const isJoker = vote === '?';
  const isBrb = vote === '☕' || vote === 'BRB';

  return (
    <div
      className={clsx(
        'flex flex-col items-center p-2 rounded-lg transition-all group relative',
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
                  // Joker card - Heath Ledger style
                  <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded">
                    <img src="/joker.png" alt="Joker" className="w-full h-full object-cover" />
                  </div>
                ) : isBrb ? (
                  // BRB card
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-100 to-orange-200 rounded">
                    <span className="text-lg font-bold text-amber-600">BRB</span>
                  </div>
                ) : isTShirt ? (
                  // T-Shirt card - show only the size letter large and centered
                  <div className="absolute inset-0 flex items-center justify-center" title={getTooltipText(vote, true)}>
                    <span className="text-2xl font-bold text-slate-700">
                      {vote}
                    </span>
                  </div>
                ) : (
                  // Fibonacci card - show only the number large and centered
                  <div className="absolute inset-0 flex items-center justify-center" title={getTooltipText(vote, false)}>
                    <span className={clsx(
                      'font-bold text-slate-700',
                      String(vote).length === 1 ? 'text-3xl' : 'text-2xl'
                    )}>
                      {vote}
                    </span>
                  </div>
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
        <img
          src={getAvatarUrl(participant.avatarUrl, participant.userId)}
          alt={participant.avatarUrl ? participant.displayName : getAvatarName(participant.userId)}
          className="h-8 w-8 rounded-full border-2 border-slate-600 shadow object-cover"
        />
        {roleIcons[participant.role] && (
          <div className="absolute -top-1 -right-1 bg-slate-800 rounded-full p-0.5 shadow">
            {roleIcons[participant.role]}
          </div>
        )}
        {isDealer && (
          <div className="absolute -top-1 -left-1 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full p-1 shadow border border-white/20" title="Dealer">
            <span className="block w-2 h-2 bg-white rounded-full" />
          </div>
        )}
        {!participant.isOnline && (
          <div className="absolute -bottom-0.5 -right-0.5 bg-red-500 rounded-full w-2.5 h-2.5 border-2 border-slate-900" />
        )}
      </div>

      {/* Moderator actions */}
      {isModeratorView && !isCurrentUser && (
        <div className="absolute -right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 flex flex-col gap-1 z-20">
          {/* Assign Dealer button */}
          {!isDealer && onAssignDealer && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Assign Dealer role to ${participant.displayName}?`)) {
                  onAssignDealer(participant.userId);
                }
              }}
              className="p-1.5 bg-indigo-600 text-white rounded-full shadow-lg hover:scale-110 hover:bg-indigo-500 transition-all"
              title="Assign Dealer"
            >
              <UserCog className="h-3 w-3" />
            </button>
          )}
          {/* Kick button - only for non-moderators */}
          {participant.role !== 'MODERATOR' && onKick && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Remove ${participant.displayName} from the room?`)) {
                  onKick(participant.userId);
                }
              }}
              className="p-1.5 bg-red-600 text-white rounded-full shadow-lg hover:scale-110 hover:bg-red-500 transition-all"
              title="Remove from room"
            >
              <UserX className="h-3 w-3" />
            </button>
          )}
        </div>
      )}

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
