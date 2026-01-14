import { useState, useCallback } from 'react';
import { api } from '../services/api';
import { JiraIssue } from '../types';

interface UseJiraReturn {
  isAvailable: boolean | null;
  isLoading: boolean;
  error: string | null;
  issue: JiraIssue | null;
  checkStatus: () => Promise<void>;
  fetchIssue: (keyOrUrl: string) => Promise<JiraIssue | null>;
  clearError: () => void;
}

export function useJira(): UseJiraReturn {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [issue, setIssue] = useState<JiraIssue | null>(null);

  const checkStatus = useCallback(async () => {
    try {
      const response = await api.get<{ available: boolean }>('/jira/status');
      setIsAvailable(response.data.available);
    } catch (err) {
      setIsAvailable(false);
    }
  }, []);

  const fetchIssue = useCallback(async (keyOrUrl: string): Promise<JiraIssue | null> => {
    if (!keyOrUrl.trim()) {
      setError('Please enter a Jira issue key or URL');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<{ success: boolean; data: JiraIssue }>(
        `/jira/issue?key=${encodeURIComponent(keyOrUrl)}`
      );

      if (response.data.success && response.data.data) {
        setIssue(response.data.data);
        return response.data.data;
      } else {
        setError('Issue not found');
        return null;
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to fetch Jira issue';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isAvailable,
    isLoading,
    error,
    issue,
    checkStatus,
    fetchIssue,
    clearError,
  };
}
