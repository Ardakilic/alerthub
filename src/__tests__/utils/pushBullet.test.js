import { describe, test, expect, jest, beforeEach } from '@jest/globals';

// Mock pushbullet and striptags with ES modules approach
const mockPusher = {
  link: jest.fn()
};

const mockPushBullet = jest.fn(() => mockPusher);
const mockStriptags = jest.fn(input => input.replace(/<[^>]*>/g, ''));

// Use ES modules mocking BEFORE imports
jest.unstable_mockModule('pushbullet', () => ({
  default: mockPushBullet
}));

jest.unstable_mockModule('striptags', () => ({
  default: mockStriptags
}));

// Import AFTER mocking
const pushBulletUtils = await import('../../utils/pushBullet.js');

describe('PushBullet Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPusher.link.mockClear();
    mockPushBullet.mockClear();
    mockStriptags.mockClear();

    // Set up default successful response
    mockPusher.link.mockImplementation((linkData, title, url, body, callback) => {
      callback(null, { iden: 'test-push-id' });
    });
  });

  describe('sendPushBulletNotification', () => {
    const mockConfig = {
      accessToken: 'test-access-token'
    };

    const mockFeedData = {
      title: 'New Release v1.0.0',
      link: 'https://github.com/owner/repo/releases/tag/v1.0.0',
      description: '<p>This is a <strong>test</strong> release</p>',
      date: '2023-01-01T00:00:00Z'
    };

    test('should create PushBullet instance with access token', async () => {
      await pushBulletUtils.default.sendPushBulletNotification(mockConfig, mockFeedData);

      expect(mockPushBullet).toHaveBeenCalledWith('test-access-token');
    });

    test('should send link notification with correct parameters', async () => {
      await pushBulletUtils.default.sendPushBulletNotification(mockConfig, mockFeedData);

      expect(mockPusher.link).toHaveBeenCalledWith(
        {},
        'New Release v1.0.0',
        'https://github.com/owner/repo/releases/tag/v1.0.0',
        'This is a test release',
        expect.any(Function)
      );
    });

    test('should strip HTML tags from description', async () => {

      await pushBulletUtils.default.sendPushBulletNotification(mockConfig, mockFeedData);

      expect(mockStriptags).toHaveBeenCalledWith(mockFeedData.description);
    });

    test('should return false when push notification fails', async () => {
      const error = new Error('PushBullet API error');
      mockPusher.link.mockImplementation((options, title, link, body, callback) => {
        callback(error, null);
      });

      const result = await pushBulletUtils.default.sendPushBulletNotification(mockConfig, mockFeedData);

      expect(result).toBe(false);
    });

    test('should return response when push notification succeeds', async () => {
      const successResponse = { success: true, iden: 'test-iden' };
      mockPusher.link.mockImplementation((options, title, link, body, callback) => {
        callback(null, successResponse);
      });

      const result = await pushBulletUtils.default.sendPushBulletNotification(mockConfig, mockFeedData);

      expect(result).toBe(successResponse);
    });

    test('should handle empty description', async () => {
      const feedDataWithEmptyDescription = {
        ...mockFeedData,
        description: ''
      };

      mockPusher.link.mockImplementation((options, title, link, body, callback) => {
        callback(null, { success: true });
      });

      await pushBulletUtils.default.sendPushBulletNotification(mockConfig, feedDataWithEmptyDescription);

      expect(mockPusher.link).toHaveBeenCalledWith(
        {},
        'New Release v1.0.0',
        'https://github.com/owner/repo/releases/tag/v1.0.0',
        '',
        expect.any(Function)
      );
    });
  });
});
