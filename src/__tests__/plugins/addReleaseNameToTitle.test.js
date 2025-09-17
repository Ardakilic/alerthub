import { describe, test, expect, jest, beforeEach } from '@jest/globals';

// Mock alertHub utils with ES modules approach
const mockUtils = {
  isFeedFromGitHub: jest.fn(),
  isFeedFromGitLab: jest.fn(),
  getReleaseNameFromGitHubAndGitLabFeedLink: jest.fn()
};

// Use ES modules mocking for the alertHub module
jest.unstable_mockModule('../../utils/alertHub.js', () => mockUtils);

// Import the plugin AFTER setting up mocks
const { default: addReleaseNameToTitle } = await import('../../plugins/rss-braider/addReleaseNameToTitle.js');

describe('addReleaseNameToTitle Plugin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUtils.isFeedFromGitHub.mockClear();
    mockUtils.isFeedFromGitLab.mockClear();
    mockUtils.getReleaseNameFromGitHubAndGitLabFeedLink.mockClear();
  });

  test('should add release name to title for GitHub feeds', () => {
    const item = {};
    const itemOptions = {
      title: 'v1.0.0',
      url: 'https://github.com/owner/repo/releases/tag/v1.0.0'
    };

    mockUtils.isFeedFromGitHub.mockReturnValue(true);
    mockUtils.isFeedFromGitLab.mockReturnValue(false);
    mockUtils.getReleaseNameFromGitHubAndGitLabFeedLink.mockReturnValue('owner/repo');

    const result = addReleaseNameToTitle(item, itemOptions);

    expect(mockUtils.isFeedFromGitHub).toHaveBeenCalledWith(itemOptions);
    expect(mockUtils.getReleaseNameFromGitHubAndGitLabFeedLink).toHaveBeenCalledWith(itemOptions.url);
    expect(result.title).toBe('owner/repo - v1.0.0');
  });

  test('should add release name to title for GitLab feeds', () => {
    const item = {};
    const itemOptions = {
      title: 'Release v2.0.0',
      url: 'https://gitlab.com/owner/repo/-/releases/v2.0.0'
    };

    mockUtils.isFeedFromGitHub.mockReturnValue(false);
    mockUtils.isFeedFromGitLab.mockReturnValue(true);
    mockUtils.getReleaseNameFromGitHubAndGitLabFeedLink.mockReturnValue('owner/repo');

    const result = addReleaseNameToTitle(item, itemOptions);

    expect(mockUtils.isFeedFromGitLab).toHaveBeenCalledWith(itemOptions);
    expect(mockUtils.getReleaseNameFromGitHubAndGitLabFeedLink).toHaveBeenCalledWith(itemOptions.url);
    expect(result.title).toBe('owner/repo - Release v2.0.0');
  });

  test('should not modify title for non-GitHub/GitLab feeds', () => {
    const item = {};
    const itemOptions = {
      title: 'Some other feed title',
      url: 'https://example.com/feed/item'
    };

    mockUtils.isFeedFromGitHub.mockReturnValue(false);
    mockUtils.isFeedFromGitLab.mockReturnValue(false);

    const result = addReleaseNameToTitle(item, itemOptions);

    expect(result.title).toBe('Some other feed title');
    expect(mockUtils.getReleaseNameFromGitHubAndGitLabFeedLink).not.toHaveBeenCalled();
  });

  test('should handle feeds that are both GitHub and GitLab (edge case)', () => {
    const item = {};
    const itemOptions = {
      title: 'Edge case title',
      url: 'https://github.com/owner/repo/releases/tag/v1.0.0'
    };

    mockUtils.isFeedFromGitHub.mockReturnValue(true);
    mockUtils.isFeedFromGitLab.mockReturnValue(true);
    mockUtils.getReleaseNameFromGitHubAndGitLabFeedLink.mockReturnValue('owner/repo');

    const result = addReleaseNameToTitle(item, itemOptions);

    expect(result.title).toBe('owner/repo - Edge case title');
  });

  test('should preserve other itemOptions properties', () => {
    const item = {};
    const itemOptions = {
      title: 'v1.0.0',
      url: 'https://github.com/owner/repo/releases/tag/v1.0.0',
      description: 'Release description',
      date: '2023-01-01T00:00:00Z',
      author: 'test-author'
    };

    mockUtils.isFeedFromGitHub.mockReturnValue(true);
    mockUtils.isFeedFromGitLab.mockReturnValue(false);
    mockUtils.getReleaseNameFromGitHubAndGitLabFeedLink.mockReturnValue('owner/repo');

    const result = addReleaseNameToTitle(item, itemOptions);

    expect(result.description).toBe('Release description');
    expect(result.date).toBe('2023-01-01T00:00:00Z');
    expect(result.author).toBe('test-author');
    expect(result.url).toBe('https://github.com/owner/repo/releases/tag/v1.0.0');
  });

  test('should handle empty title', () => {
    const item = {};
    const itemOptions = {
      title: '',
      url: 'https://github.com/owner/repo/releases/tag/v1.0.0'
    };

    mockUtils.isFeedFromGitHub.mockReturnValue(true);
    mockUtils.isFeedFromGitLab.mockReturnValue(false);
    mockUtils.getReleaseNameFromGitHubAndGitLabFeedLink.mockReturnValue('owner/repo');

    const result = addReleaseNameToTitle(item, itemOptions);

    expect(result.title).toBe('owner/repo - ');
  });

  test('should handle missing URL', () => {
    const item = {};
    const itemOptions = {
      title: 'v1.0.0'
      // missing url
    };

    mockUtils.isFeedFromGitHub.mockReturnValue(true);
    mockUtils.isFeedFromGitLab.mockReturnValue(false);
    mockUtils.getReleaseNameFromGitHubAndGitLabFeedLink.mockReturnValue('unknown/repo');

    const result = addReleaseNameToTitle(item, itemOptions);

    expect(result.title).toBe('unknown/repo - v1.0.0');
  });
});
