import { useAuthStore } from '../store/authStore';
import ParticipantCard from './ParticipantCard';
import { Participant, VoteInfo, GamePhase } from '../types';

interface PokerTableProps {
  participants: Participant[];
  votes: VoteInfo[];
  phase: GamePhase;
}

export default function PokerTable({ participants, votes, phase }: PokerTableProps) {
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
      {/* Outer table rim - wood grain effect */}
      <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-b from-amber-900 via-amber-800 to-amber-950 shadow-2xl" />

      {/* Inner padding */}
      <div className="relative p-3">
        {/* Table felt surface */}
        <div className="poker-table-felt rounded-[1.5rem] p-6 shadow-inner">
          {/* Felt texture overlay */}
          <div className="absolute inset-0 rounded-[1.5rem] opacity-20 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
            }}
          />

          {/* Table edge highlight */}
          <div className="absolute inset-0 rounded-[1.5rem] border-4 border-yellow-600/20 pointer-events-none" />
          <div className="absolute inset-1 rounded-[1.3rem] border border-green-400/10 pointer-events-none" />

          {/* Top row of players */}
          <div className="flex justify-center gap-2 mb-4 relative z-10">
            {topRow.map((participant) => (
              <ParticipantCard
                key={participant.userId}
                participant={participant}
                vote={getVote(participant.userId)}
                isRevealed={isRevealed}
                isCurrentUser={participant.userId === user?.id}
              />
            ))}
          </div>

          {/* Center table area - oval betting area */}
          <div className="relative mx-auto max-w-md">
            {/* Outer oval border */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-yellow-600/30 to-yellow-700/20 blur-sm" />

            {/* Inner betting area */}
            <div className="relative bg-gradient-to-b from-green-800/60 to-green-900/60 rounded-full py-4 px-8 border border-yellow-600/30">
              {/* Inner felt line */}
              <div className="absolute inset-2 rounded-full border border-yellow-500/20" />

              {/* Content */}
              <div className="text-center relative z-10">
                {phase === 'WAITING' && (
                  <p className="text-green-200/70 text-sm font-medium tracking-wide">
                    Waiting for topic...
                  </p>
                )}
                {phase === 'VOTING' && (
                  <div className="flex items-center justify-center gap-3">
                    {/* Chip stack indicator */}
                    <div className="flex -space-x-1">
                      {[...Array(Math.min(votedCount, 5))].map((_, i) => (
                        <div
                          key={i}
                          className="w-3 h-3 rounded-full bg-gradient-to-b from-green-400 to-green-600 border border-green-300 shadow-sm"
                          style={{ transform: `translateY(${i * -1}px)` }}
                        />
                      ))}
                    </div>
                    <div>
                      <span className="text-white font-bold">{votedCount}</span>
                      <span className="text-green-200/70 text-sm mx-1">/</span>
                      <span className="text-green-200/70 text-sm">{totalVoters}</span>
                    </div>
                  </div>
                )}
                {phase === 'REVEALED' && (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                    <p className="text-yellow-400 text-xs font-bold tracking-wider uppercase">
                      Cards Revealed
                    </p>
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom row of players */}
          <div className="flex justify-center gap-2 mt-4 relative z-10">
            {bottomRow.map((participant) => (
              <ParticipantCard
                key={participant.userId}
                participant={participant}
                vote={getVote(participant.userId)}
                isRevealed={isRevealed}
                isCurrentUser={participant.userId === user?.id}
              />
            ))}
          </div>

          {/* Dealer button - decorative */}
          <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-gradient-to-b from-white to-gray-200 border-2 border-gray-400 shadow-lg flex items-center justify-center">
            <span className="text-[10px] font-bold text-gray-700">D</span>
          </div>
        </div>
      </div>

      {/* Observers section */}
      {observers.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700/50">
          <p className="text-xs text-slate-500 text-center mb-3 uppercase tracking-wider">Observers</p>
          <div className="flex justify-center gap-2 flex-wrap">
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
