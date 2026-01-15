import { useState, useEffect } from 'react';
import { ExternalLink, Search, Loader2, AlertCircle } from 'lucide-react';
import { useJira } from '../hooks/useJira';
import { ActiveTopic, VotingHistoryItem } from '../types';
import VotingHistory from './VotingHistory';
import { useI18n } from '../i18n';

interface TopicPanelProps {
  currentTopic: ActiveTopic | null;
  onSetTopic: (topic: ActiveTopic) => void;
  isModerator: boolean;
  phase: string;
  getVotingHistory: (limit?: number) => Promise<VotingHistoryItem[]>;
}

export default function TopicPanel({
  currentTopic,
  onSetTopic,
  isModerator,
  phase,
  getVotingHistory,
}: TopicPanelProps) {
  const { t } = useI18n();
  const [input, setInput] = useState('');
  const [showForm, setShowForm] = useState(false);
  const { isAvailable, isLoading, error, fetchIssue, checkStatus, clearError } = useJira();

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!input.trim()) return;

    // Check if it looks like a Jira key/URL
    const isJiraInput = /^[A-Z]+-\d+$/i.test(input.trim()) || input.includes('atlassian.net');

    if (isJiraInput && isAvailable) {
      const issue = await fetchIssue(input);
      if (issue) {
        onSetTopic({
          title: issue.summary,
          description: issue.description,
          jiraKey: issue.key,
          jiraUrl: issue.url,
        });
        setInput('');
        setShowForm(false);
      }
    } else {
      // Manual topic
      onSetTopic({
        title: input.trim(),
      });
      setInput('');
      setShowForm(false);
    }
  };

  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur rounded-xl p-6 border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Current Topic</h3>

      {currentTopic && !showForm ? (
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            {currentTopic.jiraKey && (
              <span className="px-2 py-1 bg-blue-500/20 text-blue-600 dark:text-blue-400 text-sm rounded font-mono">
                {currentTopic.jiraKey}
              </span>
            )}
            <h4 className="text-slate-900 dark:text-white font-medium flex-1">{currentTopic.title}</h4>
          </div>

          {currentTopic.description && (
            <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3">{currentTopic.description}</p>
          )}

          {currentTopic.jiraUrl && (
            <a
              href={currentTopic.jiraUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary-600 dark:text-primary-400 text-sm hover:underline"
            >
              View in Jira
              <ExternalLink className="h-3 w-3" />
            </a>
          )}

          {isModerator && phase === 'REVEALED' && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full mt-4 px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg transition-colors"
            >
              Set New Topic
            </button>
          )}
        </div>
      ) : isModerator ? (
        <div>
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full px-4 py-3 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-slate-500 dark:text-slate-400 hover:border-primary-500 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
            >
              + Add Topic to Estimate
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-600 dark:text-slate-400 mb-2">
                  {isAvailable
                    ? 'Enter Jira issue key, URL, or custom topic'
                    : 'Enter topic to estimate'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={isAvailable ? 'PROJ-123 or topic name...' : 'Topic name...'}
                    className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    autoFocus
                  />
                  {isLoading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-500 dark:text-primary-400 animate-spin" />
                  )}
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-500 dark:text-red-400 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}

              {!isAvailable && (
                <p className="text-sm text-slate-500">
                  Jira integration not configured. Enter topics manually.
                </p>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      Set Topic
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setInput('');
                    clearError();
                  }}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <p className="text-slate-600 dark:text-slate-400 text-center py-4">
          {t.topic.waitingForModerator}
        </p>
      )}

      {/* Voting History */}
      <VotingHistory
        getHistory={getVotingHistory}
        onRefresh={phase === 'REVEALED'}
      />
    </div>
  );
}
