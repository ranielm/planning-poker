import {
  Controller,
  Get,
  Query,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { JiraService } from './jira.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('jira')
@Controller('jira')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class JiraController {
  constructor(private readonly jiraService: JiraService) {}

  @Get('status')
  @ApiOperation({ summary: 'Check if Jira integration is configured' })
  @ApiResponse({ status: 200, description: 'Returns Jira integration status' })
  getStatus() {
    return {
      available: this.jiraService.isAvailable(),
      message: this.jiraService.isAvailable()
        ? 'Jira integration is configured and ready'
        : 'Jira integration is not configured. Manual topic entry will be used.',
    };
  }

  @Get('issue')
  @ApiOperation({ summary: 'Fetch a Jira issue by key or URL' })
  @ApiQuery({
    name: 'key',
    description: 'Jira issue key (e.g., PROJ-123) or full URL',
    example: 'PROJ-123',
  })
  @ApiResponse({ status: 200, description: 'Returns Jira issue details' })
  @ApiResponse({ status: 404, description: 'Issue not found' })
  @ApiResponse({ status: 503, description: 'Jira integration not configured' })
  async getIssue(@Query('key') key: string) {
    if (!key) {
      throw new HttpException('Issue key is required', HttpStatus.BAD_REQUEST);
    }

    try {
      const issue = await this.jiraService.getIssue(key);
      return {
        success: true,
        data: issue,
      };
    } catch (error: any) {
      if (error.status === 503) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          error: error.message || 'Failed to fetch Jira issue',
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Get('search')
  @ApiOperation({ summary: 'Search Jira issues using JQL' })
  @ApiQuery({
    name: 'jql',
    description: 'JQL query string',
    example: 'project = PROJ AND status = "To Do"',
  })
  @ApiQuery({
    name: 'maxResults',
    description: 'Maximum number of results',
    required: false,
    example: 10,
  })
  async searchIssues(
    @Query('jql') jql: string,
    @Query('maxResults') maxResults?: number,
  ) {
    if (!jql) {
      throw new HttpException('JQL query is required', HttpStatus.BAD_REQUEST);
    }

    try {
      const issues = await this.jiraService.searchIssues(jql, maxResults);
      return {
        success: true,
        data: issues,
        count: issues.length,
      };
    } catch (error: any) {
      throw new HttpException(
        {
          success: false,
          error: error.message || 'Search failed',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
