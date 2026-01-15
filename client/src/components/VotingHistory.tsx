import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, History, Clock, Users } from 'lucide-react';
import { VotingHistoryItem, VotingResult } from '../types';
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

export default function VotingHistory({ getHistory, onRefresh }: VotingHistoryProps) {
  const { t } = useI18n();
  const [history, setHistory] = useState<VotingHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

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

  if (history.length === 0 && !isExpanded) {
    return null;
  }

  return (
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
              <div
                key={item.id}
                className="bg-slate-100 dark:bg-slate-700/50 rounded-lg p-3 text-sm"
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
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
