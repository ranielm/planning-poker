import { clsx } from 'clsx';
import { Trophy, BarChart3 } from 'lucide-react';
import { VotingResult, FibonacciResult, TShirtResult } from '../types';

interface ResultsPanelProps {
  results: VotingResult;
}

export default function ResultsPanel({ results }: ResultsPanelProps) {
  if (results.type === 'fibonacci') {
    return <FibonacciResults results={results} />;
  }
  return <TShirtResults results={results} />;
}

function FibonacciResults({ results }: { results: FibonacciResult }) {
  const maxCount = Math.max(...Object.values(results.distribution), 1);

  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur rounded-xl p-6 border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-primary-500 dark:text-primary-400" />
        Results
      </h3>

      {/* Main result */}
      <div className="text-center mb-6">
        {results.isConsensus ? (
          <div className="flex items-center justify-center gap-2">
            <Trophy className="h-6 w-6 text-poker-gold" />
            <span className="text-2xl font-bold text-poker-gold">
              Consensus: {results.consensusValue}
            </span>
          </div>
        ) : (
          <div>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Average</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{results.average}</p>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
              Suggested: <span className="text-primary-600 dark:text-primary-400 font-medium">{results.roundedAverage}</span>
            </p>
          </div>
        )}
      </div>

      {/* Distribution chart */}
      <div className="space-y-2">
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Vote Distribution</p>
        {Object.entries(results.distribution)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([value, count]) => (
            <div key={value} className="flex items-center gap-3">
              <span className="w-8 text-right font-medium text-slate-700 dark:text-slate-300">{value}</span>
              <div className="flex-1 h-6 bg-slate-200 dark:bg-slate-700 rounded overflow-hidden">
                <div
                  className={clsx(
                    'h-full transition-all duration-500',
                    results.isConsensus ? 'bg-poker-gold' : 'bg-primary-500'
                  )}
                  style={{ width: `${(count / maxCount) * 100}%` }}
                />
              </div>
              <span className="w-8 text-slate-500 dark:text-slate-400">{count}</span>
            </div>
          ))}
      </div>

      {/* Stats */}
      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between text-sm text-slate-500 dark:text-slate-400">
        <span>Total votes: {results.totalVotes}</span>
        {results.skippedVotes > 0 && (
          <span>Skipped: {results.skippedVotes}</span>
        )}
      </div>
    </div>
  );
}

function TShirtResults({ results }: { results: TShirtResult }) {
  const maxCount = Math.max(...Object.values(results.distribution), 1);
  const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur rounded-xl p-6 border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-primary-500 dark:text-primary-400" />
        Results
      </h3>

      {/* Main result */}
      <div className="text-center mb-6">
        {results.isConsensus ? (
          <div className="flex items-center justify-center gap-2">
            <Trophy className="h-6 w-6 text-poker-gold" />
            <span className="text-2xl font-bold text-poker-gold">
              Consensus: {results.consensusValue}
            </span>
          </div>
        ) : (
          <div>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Most Voted</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{results.mode}</p>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
              {results.modeCount} vote{results.modeCount !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>

      {/* Distribution chart */}
      <div className="space-y-2">
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Vote Distribution</p>
        {sizeOrder
          .filter((size) => results.distribution[size])
          .map((size) => (
            <div key={size} className="flex items-center gap-3">
              <span className="w-10 text-right font-medium text-slate-700 dark:text-slate-300">{size}</span>
              <div className="flex-1 h-6 bg-slate-200 dark:bg-slate-700 rounded overflow-hidden">
                <div
                  className={clsx(
                    'h-full transition-all duration-500',
                    results.isConsensus
                      ? 'bg-poker-gold'
                      : size === results.mode
                      ? 'bg-primary-500'
                      : 'bg-slate-400 dark:bg-slate-500'
                  )}
                  style={{ width: `${(results.distribution[size] / maxCount) * 100}%` }}
                />
              </div>
              <span className="w-8 text-slate-500 dark:text-slate-400">{results.distribution[size]}</span>
            </div>
          ))}
      </div>

      {/* Stats */}
      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between text-sm text-slate-500 dark:text-slate-400">
        <span>Total votes: {results.totalVotes}</span>
        {results.skippedVotes > 0 && (
          <span>Skipped: {results.skippedVotes}</span>
        )}
      </div>
    </div>
  );
}
