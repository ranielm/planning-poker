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

  return (
    <div className="poker-table rounded-3xl p-8 shadow-2xl border-4 border-poker-gold/30">
      {/* Top row */}
      <div className="flex justify-center gap-4 mb-8">
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

      {/* Center - Table felt */}
      <div className="bg-poker-felt/50 rounded-full h-32 mx-auto max-w-xl border-4 border-poker-gold/20 flex items-center justify-center">
        <div className="text-center">
          {phase === 'WAITING' && (
            <p className="text-slate-400 text-lg">Waiting for topic...</p>
          )}
          {phase === 'VOTING' && (
            <div>
              <p className="text-white text-lg font-medium">
                {voters.filter((p) => p.hasVoted).length} / {voters.length}
              </p>
              <p className="text-slate-400 text-sm">votes cast</p>
            </div>
          )}
          {phase === 'REVEALED' && (
            <p className="text-poker-gold text-lg font-medium">Cards Revealed!</p>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="flex justify-center gap-4 mt-8">
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

      {/* Observers section */}
      {observers.length > 0 && (
        <div className="mt-8 pt-6 border-t border-slate-600/50">
          <p className="text-sm text-slate-400 text-center mb-4">Observers</p>
          <div className="flex justify-center gap-4 flex-wrap">
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
