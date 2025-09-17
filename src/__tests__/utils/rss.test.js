import { describe, test, expect, jest, beforeEach } from '@jest/globals';

// Mock rss-braider and alertHub with ES modules approach BEFORE imports
const mockRssClient = {
  logger: {
    level: jest.fn()
  },
  processFeed: jest.fn()
};

const mockRssBraider = {
  createClient: jest.fn(() => mockRssClient)
};

const mockAlertHubUtils = {
  generateURLForTheFeed: jest.fn(() => 'https://example.com/feed.atom')
};

// Use ES modules mocking BEFORE imports
jest.unstable_mockModule('rss-braider', () => ({
  default: mockRssBraider
}));
jest.unstable_mockModule('../../utils/alertHub.js', () => ({
  default: mockAlertHubUtils
}));

// Import AFTER mocking
const RssUtils = await import('../../utils/rss.js');

describe('RSS Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRssClient.logger.level.mockClear();
    mockRssClient.processFeed.mockClear();
    mockRssBraider.createClient.mockClear();
    mockAlertHubUtils.generateURLForTheFeed.mockClear();

    // Reset return values
    mockAlertHubUtils.generateURLForTheFeed.mockReturnValue('https://example.com/feed.atom');
  });

  describe('constructor', () => {
    test('should create instance with provided config', () => {
      const config = { rss: { enabled: true } };
      const rssUtils = new RssUtils.default(config);

      expect(rssUtils.config).toBe(config);
    });

    test('should create instance with null config', () => {
      const rssUtils = new RssUtils.default();

      expect(rssUtils.config).toBeNull();
    });
  });

  describe('createRSSFeed', () => {
    const mockConfig = {
      rss: {
        enabled: true,
        title: 'Test RSS Feed',
        description: 'Test Description',
        siteUrl: 'https://example.com',
        feedUrl: 'https://example.com/feed.xml',
        includeFromEachRepository: 10,
        logLevel: 'info',
        extras: ['https://external-feed.com/rss']
      },
      repositories: {
        github: {
          releases: ['owner/repo1', 'owner/repo2'],
          tags: ['owner/repo3'],
          commits: {
            'owner/repo4': ['main', 'develop'],
            'owner/repo5': ['*']
          },
          issues: {
            'owner/repo6': {
              state: 'open',
              labels: 'bug'
            }
          }
        },
        gitlab: {
          tags: ['owner/gitlab-repo'],
          commits: {
            'owner/gitlab-commits': ['main']
          }
        }
      }
    };

    test('should return empty string when RSS is disabled', async () => {
      const disabledConfig = {
        ...mockConfig,
        rss: { enabled: false }
      };

      const rssUtils = new RssUtils.default(disabledConfig);
      const result = await rssUtils.createRSSFeed();

      expect(result).toBe('');
    });

    test('should use constructor config when no parameter provided', async () => {
      mockRssClient.processFeed.mockImplementation((feedName, format, callback) => {
        callback(null, '<rss>test feed</rss>');
      });

      const rssUtils = new RssUtils.default(mockConfig);
      await rssUtils.createRSSFeed();

      expect(mockRssBraider.createClient).toHaveBeenCalled();
    });

    test('should use parameter config over constructor config', async () => {
      mockRssClient.processFeed.mockImplementation((feedName, format, callback) => {
        callback(null, '<rss>test feed</rss>');
      });

      const constructorConfig = { rss: { enabled: false } };
      const parameterConfig = mockConfig;

      const rssUtils = new RssUtils.default(constructorConfig);
      await rssUtils.createRSSFeed(parameterConfig);

      expect(mockRssBraider.createClient).toHaveBeenCalled();
    });

    test('should create RSS client with correct configuration', async () => {
      mockRssClient.processFeed.mockImplementation((feedName, format, callback) => {
        callback(null, '<rss>test feed</rss>');
      });

      const rssUtils = new RssUtils.default(mockConfig);
      await rssUtils.createRSSFeed();

      expect(mockRssBraider.createClient).toHaveBeenCalledWith(
        expect.objectContaining({
          feeds: expect.objectContaining({
            alertHub: expect.objectContaining({
              feed_name: 'AlertHub',
              meta: expect.objectContaining({
                title: 'Test RSS Feed',
                description: 'Test Description'
              })
            })
          }),
          indent: '    ',
          date_sort_order: 'desc',
          log_level: 'info'
        })
      );
    });

    test('should generate URLs for GitHub releases', async () => {
      mockRssClient.processFeed.mockImplementation((feedName, format, callback) => {
        callback(null, '<rss>test feed</rss>');
      });

      const rssUtils = new RssUtils.default(mockConfig);
      await rssUtils.createRSSFeed();

      expect(mockAlertHubUtils.generateURLForTheFeed).toHaveBeenCalledWith({
        resource: 'github',
        repository: 'owner/repo1',
        type: 'releases'
      });

      expect(mockAlertHubUtils.generateURLForTheFeed).toHaveBeenCalledWith({
        resource: 'github',
        repository: 'owner/repo2',
        type: 'releases'
      });
    });

    test('should generate URLs for GitHub commits with branches', async () => {
      mockRssClient.processFeed.mockImplementation((feedName, format, callback) => {
        callback(null, '<rss>test feed</rss>');
      });

      const rssUtils = new RssUtils.default(mockConfig);
      await rssUtils.createRSSFeed();

      expect(mockAlertHubUtils.generateURLForTheFeed).toHaveBeenCalledWith({
        resource: 'github',
        repository: 'owner/repo4',
        type: 'commits',
        subType: 'main'
      });

      expect(mockAlertHubUtils.generateURLForTheFeed).toHaveBeenCalledWith({
        resource: 'github',
        repository: 'owner/repo4',
        type: 'commits',
        subType: 'develop'
      });
    });

    test('should generate URLs for GitHub commits with wildcard', async () => {
      mockRssClient.processFeed.mockImplementation((feedName, format, callback) => {
        callback(null, '<rss>test feed</rss>');
      });

      const rssUtils = new RssUtils.default(mockConfig);
      await rssUtils.createRSSFeed();

      expect(mockAlertHubUtils.generateURLForTheFeed).toHaveBeenCalledWith({
        resource: 'github',
        repository: 'owner/repo5',
        type: 'commits'
      });
    });

    test('should generate URLs for GitHub issues', async () => {
      mockRssClient.processFeed.mockImplementation((feedName, format, callback) => {
        callback(null, '<rss>test feed</rss>');
      });

      const rssUtils = new RssUtils.default(mockConfig);
      await rssUtils.createRSSFeed();

      expect(mockAlertHubUtils.generateURLForTheFeed).toHaveBeenCalledWith({
        resource: 'github',
        repository: 'owner/repo6',
        type: 'issues',
        params: { state: 'open', labels: 'bug' }
      });
    });

    test('should generate URLs for GitLab repositories', async () => {
      mockRssClient.processFeed.mockImplementation((feedName, format, callback) => {
        callback(null, '<rss>test feed</rss>');
      });

      const rssUtils = new RssUtils.default(mockConfig);
      await rssUtils.createRSSFeed();

      expect(mockAlertHubUtils.generateURLForTheFeed).toHaveBeenCalledWith({
        resource: 'gitlab',
        repository: 'owner/gitlab-repo',
        type: 'tags'
      });

      expect(mockAlertHubUtils.generateURLForTheFeed).toHaveBeenCalledWith({
        resource: 'gitlab',
        repository: 'owner/gitlab-commits',
        type: 'commits',
        subType: 'main'
      });
    });

    test('should include extra feeds in sources', async () => {
      mockRssClient.processFeed.mockImplementation((feedName, format, callback) => {
        const clientConfig = mockRssBraider.createClient.mock.calls[0][0];
        const sources = clientConfig.feeds.alertHub.sources;

        expect(sources.some(source => source.feed_url === 'https://external-feed.com/rss')).toBe(true);

        callback(null, '<rss>test feed</rss>');
      });

      const rssUtils = new RssUtils.default(mockConfig);
      await rssUtils.createRSSFeed();
    });

    test('should set logger level', async () => {
      mockRssClient.processFeed.mockImplementation((feedName, format, callback) => {
        callback(null, '<rss>test feed</rss>');
      });

      const rssUtils = new RssUtils.default(mockConfig);
      await rssUtils.createRSSFeed();

      expect(mockRssClient.logger.level).toHaveBeenCalledWith('info');
    });

    test('should process feed and return result', async () => {
      const expectedResult = '<rss><channel><title>Test Feed</title></channel></rss>';
      mockRssClient.processFeed.mockImplementation((feedName, format, callback) => {
        callback(null, expectedResult);
      });

      const rssUtils = new RssUtils.default(mockConfig);
      const result = await rssUtils.createRSSFeed();

      expect(mockRssClient.processFeed).toHaveBeenCalledWith('alertHub', 'rss', expect.any(Function));
      expect(result).toBe(expectedResult);
    });

    test('should reject promise when RSS processing fails', async () => {
      const error = new Error('RSS processing failed');
      mockRssClient.processFeed.mockImplementation((feedName, format, callback) => {
        callback(error, null);
      });

      const rssUtils = new RssUtils.default(mockConfig);

      await expect(rssUtils.createRSSFeed()).rejects.toThrow('RSS processing failed');
    });

    test('should use default log level when not specified', async () => {
      const configWithoutLogLevel = {
        ...mockConfig,
        rss: {
          ...mockConfig.rss,
          logLevel: undefined
        }
      };

      mockRssClient.processFeed.mockImplementation((feedName, format, callback) => {
        callback(null, '<rss>test feed</rss>');
      });

      const rssUtils = new RssUtils.default(configWithoutLogLevel);
      await rssUtils.createRSSFeed();

      expect(mockRssClient.logger.level).toHaveBeenCalledWith('info');
    });
  });
});
