import { describe, test, expect } from '@jest/globals';
import alertHubUtils from '../../utils/alertHub.js';

describe('AlertHub Utils', () => {
  describe('isFeedFromGitHub', () => {
    test('should return true for GitHub feed with valid guid', () => {
      const item = {
        guid: 'tag:github.com,2008:Repository/123456/v1.0.0'
      };
      expect(alertHubUtils.isFeedFromGitHub(item)).toBe(true);
    });

    test('should return false for non-GitHub feed', () => {
      const item = {
        guid: 'https://example.com/feed/123'
      };
      expect(alertHubUtils.isFeedFromGitHub(item)).toBe(false);
    });

    test('should return false when guid is undefined', () => {
      const item = {};
      expect(alertHubUtils.isFeedFromGitHub(item)).toBe(false);
    });

    test('should return false when guid is null', () => {
      const item = {
        guid: null
      };
      expect(alertHubUtils.isFeedFromGitHub(item)).toBe(false);
    });

    test('should return false when guid is not a string', () => {
      const item = {
        guid: 123
      };
      expect(alertHubUtils.isFeedFromGitHub(item)).toBe(false);
    });
  });

  describe('isFeedFromGitLab', () => {
    test('should return true for GitLab feed', () => {
      const item = {
        url: 'https://gitlab.com/user/repo/-/releases/v1.0.0'
      };
      expect(alertHubUtils.isFeedFromGitLab(item)).toBe(true);
    });

    test('should return false for non-GitLab feed', () => {
      const item = {
        url: 'https://github.com/user/repo/releases/tag/v1.0.0'
      };
      expect(alertHubUtils.isFeedFromGitLab(item)).toBe(false);
    });

    test('should return false for invalid URL', () => {
      const item = {
        url: 'not-a-valid-url'
      };
      expect(alertHubUtils.isFeedFromGitLab(item)).toBe(false);
    });
  });

  describe('getReleaseNameFromGitHubAndGitLabFeedLink', () => {
    test('should extract repository name from GitHub URL', () => {
      const link = 'https://github.com/owner/repo/releases/tag/v1.0.0';
      expect(alertHubUtils.getReleaseNameFromGitHubAndGitLabFeedLink(link)).toBe('owner/repo');
    });

    test('should extract repository name from GitLab URL', () => {
      const link = 'https://gitlab.com/owner/repo/-/releases/v1.0.0';
      expect(alertHubUtils.getReleaseNameFromGitHubAndGitLabFeedLink(link)).toBe('owner/repo');
    });

    test('should handle complex repository names', () => {
      const link = 'https://github.com/org-name/project-name/releases/tag/v2.1.0';
      expect(alertHubUtils.getReleaseNameFromGitHubAndGitLabFeedLink(link)).toBe('org-name/project-name');
    });
  });

  describe('parseFeedData', () => {
    test('should parse feed data without modification for non-GitHub/GitLab feeds', () => {
      const feedData = {
        title: 'Test Release',
        link: 'https://example.com/release/1.0.0',
        description: 'Test description',
        date: '2023-01-01T00:00:00Z'
      };

      const result = alertHubUtils.parseFeedData(feedData);

      expect(result).toEqual({
        title: 'Test Release',
        link: 'https://example.com/release/1.0.0',
        description: 'Test description',
        date: '2023-01-01T00:00:00Z'
      });
    });

    test('should prepend repository name for GitHub feeds', () => {
      const feedData = {
        title: 'v1.0.0',
        link: 'https://github.com/owner/repo/releases/tag/v1.0.0',
        description: 'Release description',
        date: '2023-01-01T00:00:00Z',
        guid: 'tag:github.com,2008:Repository/123456/v1.0.0'
      };

      const result = alertHubUtils.parseFeedData(feedData);

      expect(result.title).toBe('owner/repo - v1.0.0');
      expect(result.link).toBe('https://github.com/owner/repo/releases/tag/v1.0.0');
      expect(result.description).toBe('Release description');
      expect(result.date).toBe('2023-01-01T00:00:00Z');
    });

    test('should prepend repository name for GitLab feeds', () => {
      const feedData = {
        title: 'v2.0.0',
        link: 'https://gitlab.com/owner/repo/-/releases/v2.0.0',
        description: 'GitLab release',
        date: '2023-02-01T00:00:00Z',
        url: 'https://gitlab.com/owner/repo/-/releases/v2.0.0'
      };

      const result = alertHubUtils.parseFeedData(feedData);

      expect(result.title).toBe('owner/repo - v2.0.0');
    });
  });

  describe('generateURLForTheFeed', () => {
    describe('GitHub URLs', () => {
      test('should generate GitHub releases URL', () => {
        const options = {
          resource: 'github',
          repository: 'owner/repo',
          type: 'releases'
        };

        const result = alertHubUtils.generateURLForTheFeed(options);
        expect(result).toBe('https://www.github.com/owner/repo/releases.atom');
      });

      test('should generate GitHub tags URL', () => {
        const options = {
          resource: 'github',
          repository: 'owner/repo',
          type: 'tags'
        };

        const result = alertHubUtils.generateURLForTheFeed(options);
        expect(result).toBe('https://www.github.com/owner/repo/tags.atom');
      });

      test('should generate GitHub commits URL with subType', () => {
        const options = {
          resource: 'github',
          repository: 'owner/repo',
          type: 'commits',
          subType: 'main'
        };

        const result = alertHubUtils.generateURLForTheFeed(options);
        expect(result).toBe('https://www.github.com/owner/repo/commits/main.atom');
      });

      test('should generate GitHub issues URL', () => {
        const options = {
          resource: 'github',
          repository: 'owner/repo',
          type: 'issues',
          params: {
            state: 'open',
            labels: 'bug'
          }
        };

        const result = alertHubUtils.generateURLForTheFeed(options);
        expect(result).toBe('https://issue-tracker-rss.now.sh/owner/repo?state=open&labels=bug');
      });
    });

    describe('GitLab URLs', () => {
      test('should generate GitLab tags URL', () => {
        const options = {
          resource: 'gitlab',
          repository: 'owner/repo',
          type: 'tags'
        };

        const result = alertHubUtils.generateURLForTheFeed(options);
        expect(result).toBe('https://gitlab.com/owner/repo/-/tags?format=atom');
      });

      test('should generate GitLab commits URL with subType', () => {
        const options = {
          resource: 'gitlab',
          repository: 'owner/repo',
          type: 'commits',
          subType: 'main'
        };

        const result = alertHubUtils.generateURLForTheFeed(options);
        expect(result).toBe('https://gitlab.com/owner/repo/-/commits/main?format=atom');
      });
    });

    describe('Invalid resource', () => {
      test('should return empty string for invalid resource', () => {
        const options = {
          resource: 'invalid',
          repository: 'owner/repo',
          type: 'releases'
        };

        const result = alertHubUtils.generateURLForTheFeed(options);
        expect(result).toBe('');
      });
    });
  });
});
