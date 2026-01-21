import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface JiraIssue {
  key: string;
  summary: string;
  description?: string;
  url: string;
  status?: string;
  issueType?: string;
  priority?: string;
  assignee?: string;
  storyPoints?: number;
}

@Injectable()
export class JiraService {
  private readonly logger = new Logger(JiraService.name);
  private readonly domain: string | undefined;
  private readonly email: string | undefined;
  private readonly apiToken: string | undefined;
  private readonly defaultProject: string | undefined;
  private readonly isConfigured: boolean;

  constructor(private readonly configService: ConfigService) {
    this.domain = this.configService.get<string>('JIRA_DOMAIN');
    this.email = this.configService.get<string>('JIRA_EMAIL');
    this.apiToken = this.configService.get<string>('JIRA_API_TOKEN');
    this.defaultProject = this.configService.get<string>('JIRA_DEFAULT_PROJECT');

    this.isConfigured = !!(this.domain && this.email && this.apiToken);

    if (!this.isConfigured) {
      this.logger.warn(
        'Jira integration not configured. Set JIRA_DOMAIN, JIRA_EMAIL, and JIRA_API_TOKEN environment variables.',
      );
    }
  }

  /**
   * Check if Jira integration is available
   */
  isAvailable(): boolean {
    return this.isConfigured;
  }

  /**
   * Fetch a Jira issue by key or URL
   */
  async getIssue(issueKeyOrUrl: string): Promise<JiraIssue> {
    if (!this.isConfigured) {
      throw new ServiceUnavailableException(
        'Jira integration is not configured. Please contact your administrator.',
      );
    }

    const issueKey = this.extractIssueKey(issueKeyOrUrl);
    if (!issueKey) {
      throw new Error('Invalid Jira issue key or URL');
    }

    try {
      const response = await this.makeRequest(`/rest/api/3/issue/${issueKey}`, {
        fields: 'summary,description,status,issuetype,priority,assignee,customfield_10016', // customfield_10016 is often story points
      });

      const data = await response.json();

      if (!response.ok) {
        this.logger.error(`Jira API error: ${JSON.stringify(data)}`);
        throw new Error(data.errorMessages?.[0] || 'Failed to fetch Jira issue');
      }

      return this.mapJiraResponse(data);
    } catch (error) {
      this.logger.error(`Failed to fetch Jira issue ${issueKey}:`, error);
      throw error;
    }
  }

  /**
   * Search for Jira issues using JQL
   */
  async searchIssues(jql: string, maxResults = 10): Promise<JiraIssue[]> {
    if (!this.isConfigured) {
      throw new ServiceUnavailableException('Jira integration is not configured');
    }

    try {
      const response = await this.makeRequest('/rest/api/3/search', {
        jql,
        maxResults: maxResults.toString(),
        fields: 'summary,description,status,issuetype,priority',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.errorMessages?.[0] || 'Search failed');
      }

      return data.issues.map((issue: any) => this.mapJiraResponse(issue));
    } catch (error) {
      this.logger.error('Jira search failed:', error);
      throw error;
    }
  }

  /**
   * Extract issue key from a URL or return the key if already in correct format
   * Supports: PROJ-123, 123 (with default project), or Jira URLs
   */
  private extractIssueKey(input: string): string | null {
    const trimmed = input.trim();

    // Already a key format (e.g., PROJ-123)
    const keyPattern = /^[A-Z][A-Z0-9_]+-\d+$/i;
    if (keyPattern.test(trimmed)) {
      return trimmed.toUpperCase();
    }

    // Numeric only (e.g., 6050) - prepend default project if configured
    const numericPattern = /^\d+$/;
    if (numericPattern.test(trimmed) && this.defaultProject) {
      return `${this.defaultProject.toUpperCase()}-${trimmed}`;
    }

    // Extract from URL
    // Supports formats like:
    // - https://company.atlassian.net/browse/PROJ-123
    // - https://company.atlassian.net/jira/software/projects/PROJ/boards/1?selectedIssue=PROJ-123
    const urlPatterns = [
      /\/browse\/([A-Z][A-Z0-9_]+-\d+)/i,
      /selectedIssue=([A-Z][A-Z0-9_]+-\d+)/i,
      /\/([A-Z][A-Z0-9_]+-\d+)(?:\?|$)/i,
    ];

    for (const pattern of urlPatterns) {
      const match = input.match(pattern);
      if (match) {
        return match[1].toUpperCase();
      }
    }

    return null;
  }

  /**
   * Make an authenticated request to Jira API
   */
  private async makeRequest(
    endpoint: string,
    params?: Record<string, string>,
  ): Promise<Response> {
    const url = new URL(`https://${this.domain}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const auth = Buffer.from(`${this.email}:${this.apiToken}`).toString('base64');

    return fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Map Jira API response to our JiraIssue interface
   */
  private mapJiraResponse(data: any): JiraIssue {
    const fields = data.fields || {};

    // Extract description text from Atlassian Document Format
    let description: string | undefined;
    if (fields.description?.content) {
      description = this.extractTextFromADF(fields.description);
    }

    return {
      key: data.key,
      summary: fields.summary || '',
      description,
      url: `https://${this.domain}/browse/${data.key}`,
      status: fields.status?.name,
      issueType: fields.issuetype?.name,
      priority: fields.priority?.name,
      assignee: fields.assignee?.displayName,
      storyPoints: fields.customfield_10016, // Common story points field
    };
  }

  /**
   * Extract plain text from Atlassian Document Format (ADF)
   */
  private extractTextFromADF(adf: any): string {
    if (!adf || !adf.content) {
      return '';
    }

    const extractText = (node: any): string => {
      if (node.type === 'text') {
        return node.text || '';
      }
      if (node.content && Array.isArray(node.content)) {
        return node.content.map(extractText).join('');
      }
      return '';
    };

    return adf.content
      .map(extractText)
      .join('\n')
      .trim()
      .substring(0, 500); // Limit description length
  }
}
