import { Eye, RotateCcw, Settings } from 'lucide-react';
import { clsx } from 'clsx';
import { DeckType, GamePhase } from '../types';

interface ModeratorControlsProps {
  phase: GamePhase;
  deckType: DeckType;
  votersReady: number;
  totalVoters: number;
  onReveal: () => void;
  onReset: () => void;
  onChangeDeck: (deckType: DeckType) => void;
}

export default function ModeratorControls({
  phase,
  deckType,
  votersReady,
  totalVoters,
  onReveal,
  onReset,
  onChangeDeck,
}: ModeratorControlsProps) {
  const canReveal = phase === 'VOTING' && votersReady > 0;
  const canReset = phase === 'REVEALED';
  const allVoted = votersReady === totalVoters && totalVoters > 0;

  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur rounded-xl p-6 border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <Settings className="h-5 w-5 text-slate-500 dark:text-slate-400" />
        Moderator Controls
      </h3>

      {/* Action buttons */}
      <div className="space-y-3 mb-6">
        <button
          onClick={onReveal}
          disabled={!canReveal}
          className={clsx(
            'w-full px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2',
            canReveal
              ? allVoted
                ? 'bg-poker-gold text-slate-900 hover:bg-yellow-500 animate-pulse-soft'
                : 'bg-primary-600 hover:bg-primary-700 text-white'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
          )}
        >
          <Eye className="h-5 w-5" />
          Reveal Cards
          {phase === 'VOTING' && (
            <span className="text-sm opacity-80">
              ({votersReady}/{totalVoters})
            </span>
          )}
        </button>

        <button
          onClick={onReset}
          disabled={!canReset}
          className={clsx(
            'w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2',
            canReset
              ? 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white'
              : 'bg-slate-100 dark:bg-slate-700/50 text-slate-400 dark:text-slate-600 cursor-not-allowed'
          )}
        >
          <RotateCcw className="h-5 w-5" />
          Start New Round
        </button>
      </div>

      {/* Deck selector */}
      <div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Deck Type</p>
        <div className="flex gap-2">
          <button
            onClick={() => onChangeDeck('FIBONACCI')}
            className={clsx(
              'flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              deckType === 'FIBONACCI'
                ? 'bg-primary-600 text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
            )}
          >
            Fibonacci
          </button>
          <button
            onClick={() => onChangeDeck('TSHIRT')}
            className={clsx(
              'flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              deckType === 'TSHIRT'
                ? 'bg-primary-600 text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
            )}
          >
            T-Shirt
          </button>
        </div>
      </div>
    </div>
  );
}
