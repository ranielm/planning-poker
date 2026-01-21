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
      {/* THE TABLE SURFACE */}
      <div className="
        relative
        w-full max-w-4xl
        aspect-[2/1] md:aspect-[2.5/1]
        bg-emerald-900/80
        border-[12px] border-emerald-800/50
        rounded-[100px]
        shadow-2xl
        flex items-center justify-center
        backdrop-blur-sm
        mx-auto
      ">
        {/* Felt texture overlay */}
        <div className="absolute inset-0 rounded-[88px] opacity-20 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
          }}
        />

        {/* Table Logo */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="text-emerald-100 font-bold text-4xl sm:text-6xl uppercase tracking-widest select-none">
            POKER
          </div>
        </div>

        {/* Content Container - Needs to break out of flex center for positioning */}
        <div className="absolute inset-0">
          {/* Top row of players */}
          <div className="absolute -top-12 left-0 right-0 flex justify-center gap-4 flex-wrap z-10 px-8">
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

          {/* Center Info Area */}
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="bg-emerald-950/50 rounded-full px-8 py-4 border border-emerald-500/30 backdrop-blur-md">
              <div className="text-center relative z-10">
                {phase === 'WAITING' && (
                  <p className="text-emerald-200/80 text-sm font-medium tracking-wide">
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
                      <span className="text-emerald-200/50 text-sm">/</span>
                      <span className="text-emerald-200/50 text-sm">{totalVoters}</span>
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
          <div className="absolute -bottom-12 left-0 right-0 flex justify-center gap-4 flex-wrap z-10 px-8">
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
          <div className="absolute top-[40%] right-[5%] w-8 h-8 rounded-full bg-gradient-to-b from-white to-gray-100 border-2 border-gray-300 shadow-lg flex items-center justify-center z-10">
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
