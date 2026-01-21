import { useAuthStore } from '../store/authStore';
import ParticipantCard from './ParticipantCard';
import { Participant, VoteInfo, GamePhase } from '../types';

interface PokerTableProps {
  participants: Participant[];
  votes: VoteInfo[];
  phase: GamePhase;
  deckType?: 'FIBONACCI' | 'TSHIRT';
  isModerator?: boolean;
  dealerId?: string | null;
  onAssignDealer?: (userId: string) => void;
}

export default function PokerTable({ participants, votes, phase, deckType = 'FIBONACCI', isModerator, dealerId, onAssignDealer }: PokerTableProps) {
  const { user } = useAuthStore();
  const isRevealed = phase === 'REVEALED';

  // Get vote value for a participant
  const getVote = (userId: string): string | null => {
    const vote = votes.find((v) => v.userId === userId);
    return vote?.value || null;
  };

  // Separate voters and observers
  const voters = participants.filter((p) => p.role !== 'OBSERVER');
  const observers = participants.filter((p) => p.role === 'OBSERVER');

  // Split voters into two rows for the table layout
  const topRow = voters.filter((_, i) => i % 2 === 0);
  const bottomRow = voters.filter((_, i) => i % 2 === 1);

  const votedCount = voters.filter((p) => p.hasVoted).length;
  const totalVoters = voters.length;

  return (
    <div className="relative">
      {/* Outer table rim - dark brown wood */}
      <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-b from-[#4a3728] via-[#3d2d20] to-[#2a1f16] shadow-2xl" />

      {/* Inner wood rim highlight */}
      <div className="absolute inset-1 rounded-[2.3rem] bg-gradient-to-b from-[#5c4332] to-[#3d2d20] opacity-50" />

      {/* Gold/brass edge */}
      <div className="absolute inset-2 rounded-[2.1rem] border-2 border-[#8B7355]/40" />

      {/* Inner padding */}
      <div className="relative p-4">
        {/* Table felt surface */}
        <div className="poker-table-felt rounded-[1.8rem] p-8 min-h-[280px] shadow-inner relative">
          {/* Felt texture overlay */}
          <div className="absolute inset-0 rounded-[1.8rem] opacity-10 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
            }}
          />

          {/* Inner felt border - subtle gold line */}
          <div className="absolute inset-3 rounded-[1.5rem] border border-[#8B7355]/20 pointer-events-none" />

          {/* Top row of players */}
          <div className="flex justify-center gap-3 mb-6 relative z-10 flex-wrap">
            {topRow.map((participant) => (
              <ParticipantCard
                key={participant.userId}
                participant={participant}
                vote={getVote(participant.userId)}
                isRevealed={isRevealed}
                isCurrentUser={participant.userId === user?.id}
                deckType={deckType}
                isDealer={participant.userId === dealerId}
                isModeratorView={isModerator}
                onAssignDealer={onAssignDealer}
              />
            ))}
          </div>

          {/* Center table area - oval betting area */}
          <div className="relative mx-auto max-w-lg mb-6 mt-6">
            {/* ... (center content) ... */}
            <div className="absolute inset-0 rounded-full bg-[#1a5a3a]/50 blur-md" />

            {/* Inner betting area */}
            <div className="relative bg-gradient-to-b from-[#1e6b45]/70 to-[#145535]/70 rounded-full py-5 px-10 border border-[#8B7355]/30">
              {/* Inner decorative line */}
              <div className="absolute inset-3 rounded-full border border-[#8B7355]/15" />

              {/* Content */}
              <div className="text-center relative z-10">
                {phase === 'WAITING' && (
                  <p className="text-green-200/60 text-sm font-medium tracking-wide">
                    Waiting for topic...
                  </p>
                )}
                {phase === 'VOTING' && (
                  <div className="flex items-center justify-center gap-4">
                    {/* Chip stack indicator */}
                    <div className="flex -space-x-1">
                      {[...Array(Math.min(votedCount, 5))].map((_, i) => (
                        <div
                          key={i}
                          className="w-4 h-4 rounded-full bg-gradient-to-b from-red-500 to-red-700 border-2 border-white/30 shadow"
                          style={{ transform: `translateY(${i * -2}px)` }}
                        />
                      ))}
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-white font-bold text-xl">{votedCount}</span>
                      <span className="text-green-200/50 text-sm">/</span>
                      <span className="text-green-200/50 text-sm">{totalVoters}</span>
                    </div>
                  </div>
                )}
                {phase === 'REVEALED' && (
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-yellow-400 text-lg">★</span>
                    <p className="text-yellow-400 text-sm font-bold tracking-wider uppercase">
                      Cards Revealed
                    </p>
                    <span className="text-yellow-400 text-lg">★</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom row of players */}
          <div className="flex justify-center gap-3 relative z-10 flex-wrap">
            {bottomRow.map((participant) => (
              <ParticipantCard
                key={participant.userId}
                participant={participant}
                vote={getVote(participant.userId)}
                isRevealed={isRevealed}
                isCurrentUser={participant.userId === user?.id}
                deckType={deckType}
                isDealer={participant.userId === dealerId}
                isModeratorView={isModerator}
                onAssignDealer={onAssignDealer}
              />
            ))}
          </div>

          {/* Dealer button - decorative */}
          <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-gradient-to-b from-white to-gray-100 border-2 border-gray-300 shadow-lg flex items-center justify-center">
            <span className="text-xs font-bold text-gray-700">D</span>
          </div>
        </div>
      </div>

      {/* Observers section */}
      {observers.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700/50">
          <p className="text-xs text-slate-500 text-center mb-3 uppercase tracking-wider">Observers</p>
          <div className="flex justify-center gap-3 flex-wrap">
            {observers.map((participant) => (
              <ParticipantCard
                key={participant.userId}
                participant={participant}
                vote={null}
                isRevealed={false}
                isCurrentUser={participant.userId === user?.id}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
