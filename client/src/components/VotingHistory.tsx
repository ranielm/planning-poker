import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, History, Clock, Users, ExternalLink, X, BarChart3, Info } from 'lucide-react';
import { VotingHistoryItem, VotingResult, FibonacciResult, TShirtResult } from '../types';
import { useI18n } from '../i18n';

interface VotingHistoryProps {
  getHistory: (limit?: number) => Promise<VotingHistoryItem[]>;
  onRefresh?: boolean;
}

function getResultDisplay(result: VotingResult): string {
  if (result.type === 'fibonacci') {
    if (result.isConsensus && result.consensusValue !== undefined) {
      return `${result.consensusValue} SP`;
    }
    return `~${result.roundedAverage} SP`;
  } else {
    if (result.isConsensus && result.consensusValue) {
      return result.consensusValue;
    }
    return result.mode;
  }
}

// T-Shirt sizes to story points mapping
const tshirtToSP: Record<string, number> = {
  'S': 13,
  'M': 26,
  'L': 52,
  'XL': 104,
};

// Detail Modal Component
interface VotingDetailModalProps {
  item: VotingHistoryItem;
  onClose: () => void;
}

function VotingDetailModal({ item, onClose }: VotingDetailModalProps) {
  const { t } = useI18n();
  const result = item.finalResult;
  const isFibonacci = result.type === 'fibonacci';

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get distribution entries sorted by value
  const getDistributionEntries = () => {
    if (isFibonacci) {
      const fibResult = result as FibonacciResult;
      return Object.entries(fibResult.distribution)
        .map(([key, count]) => ({ value: key, count, label: `${key} SP` }))
        .sort((a, b) => Number(a.value) - Number(b.value));
    } else {
      const tshirtResult = result as TShirtResult;
      const sizeOrder = ['S', 'M', 'L', 'XL'];
      return Object.entries(tshirtResult.distribution)
        .map(([key, count]) => ({
          value: key,
          count,
          label: tshirtToSP[key] ? `${key} (${tshirtToSP[key]} SP)` : key
        }))
        .sort((a, b) => {
          const aIndex = sizeOrder.indexOf(a.value);
          const bIndex = sizeOrder.indexOf(b.value);
          if (aIndex === -1 && bIndex === -1) return 0;
          if (aIndex === -1) return 1;
          if (bIndex === -1) return -1;
          return aIndex - bIndex;
        });
    }
  };

  const distributionEntries = getDistributionEntries();
  const maxCount = Math.max(...distributionEntries.map(e => e.count), 1);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-slate-500" />
            <span className="font-semibold text-slate-900 dark:text-white">
              Voting Details
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Topic Info */}
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
            {item.topic ? (
              <>
                <div className="flex items-start gap-2 mb-2">
                  {item.topic.jiraKey && (
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs rounded font-mono font-bold">
                      {item.topic.jiraKey}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                  {item.topic.title}
                </h3>
                {item.topic.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    {item.topic.description}
                  </p>
                )}
                {item.topic.jiraUrl && (
                  <a
                    href={item.topic.jiraUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open in Jira
                  </a>
                )}
              </>
            ) : (
              <span className="text-slate-500 dark:text-slate-400 italic">
                {t.history.untitledRound}
              </span>
            )}
          </div>

          {/* Final Result */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {t.results.title}
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1.5 rounded-lg font-bold ${
                  result.isConsensus
                    ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                    : 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                }`}
              >
                {getResultDisplay(result)}
              </span>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  result.isConsensus
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                }`}
              >
                {result.isConsensus ? t.results.consensus : t.results.noConsensus}
              </span>
            </div>
          </div>

          {/* Distribution Chart */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="h-4 w-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {t.results.distribution}
              </span>
            </div>
            <div className="space-y-2">
              {distributionEntries.map(({ value, count, label }) => (
                <div key={value} className="flex items-center gap-3">
                  <span className="w-16 text-xs font-medium text-slate-600 dark:text-slate-400 text-right">
                    {label}
                  </span>
                  <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-4 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300"
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 text-xs font-bold text-slate-700 dark:text-slate-300">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-slate-500 mb-1">
                <Users className="h-4 w-4" />
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                {result.totalVotes}
              </div>
              <div className="text-xs text-slate-500">
                {t.history.votes}
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-slate-500 mb-1">
                <Clock className="h-4 w-4" />
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {formatDateTime(item.revealedAt)}
              </div>
              <div className="text-xs text-slate-500">
                Revealed
              </div>
            </div>
          </div>

          {/* Skipped votes info */}
          {result.skippedVotes > 0 && (
            <div className="text-center text-sm text-slate-500 dark:text-slate-400">
              {result.skippedVotes} {t.results.skipped}
            </div>
          )}

          {/* Average for Fibonacci */}
          {isFibonacci && (
            <div className="text-center text-sm text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 pt-3">
              {t.results.average}: {(result as FibonacciResult).average.toFixed(1)} SP | {t.results.rounded}: {(result as FibonacciResult).roundedAverage} SP
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VotingHistory({ getHistory, onRefresh }: VotingHistoryProps) {
  const { t } = useI18n();
  const [history, setHistory] = useState<VotingHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedItem, setSelectedItem] = useState<VotingHistoryItem | null>(null);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const items = await getHistory(10);
      setHistory(items);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isExpanded && history.length === 0) {
      loadHistory();
    }
  }, [isExpanded]);

  // Refresh when onRefresh changes (after reveal)
  useEffect(() => {
    if (onRefresh && isExpanded) {
      loadHistory();
    }
  }, [onRefresh]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-left text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <div className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span className="text-sm font-medium">{t.history.title}</span>
            {history.length > 0 && (
              <span className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs">
                {history.length}
              </span>
            )}
          </div>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {isExpanded && (
          <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-4 text-slate-500 text-sm">
                {t.common.loading}
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-4 text-slate-500 text-sm">
                {t.history.noHistory}
              </div>
            ) : (
              history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="w-full text-left bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg p-3 text-sm transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      {item.topic ? (
                        <div className="flex items-center gap-2">
                          {item.topic.jiraKey && (
                            <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs rounded font-mono">
                              {item.topic.jiraKey}
                            </span>
                          )}
                          <span className="text-slate-900 dark:text-white truncate">
                            {item.topic.title}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-500 dark:text-slate-400 italic">
                          {t.history.untitledRound}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded font-bold text-xs ${
                          item.finalResult.isConsensus
                            ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                            : 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                        }`}
                      >
                        {getResultDisplay(item.finalResult)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {item.voteCount} {t.history.votes}
                    </span>
                    {item.revealedAt && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(item.revealedAt)}
                      </span>
                    )}
                    <span className="ml-auto text-blue-500 dark:text-blue-400 text-xs">
                      Click for details
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <VotingDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </>
  );
}
