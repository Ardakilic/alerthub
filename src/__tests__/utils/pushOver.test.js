import { describe, test, expect, jest, beforeEach } from '@jest/globals';

// Mock pushover-notifications and striptags with ES modules approach - must be at top
const mockPusher = {
  send: jest.fn()
};

const mockPushOver = jest.fn(() => mockPusher);
const mockStriptags = jest.fn(input => input.replace(/<[^>]*>/g, ''));

// Use ES modules mocking BEFORE any imports
jest.unstable_mockModule('pushover-notifications', () => ({
  default: mockPushOver
}));

jest.unstable_mockModule('striptags', () => ({
  default: mockStriptags
}));

// Import AFTER mocking
const pushOverUtils = await import('../../utils/pushOver.js');

describe('PushOver Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPusher.send.mockClear();
    mockPushOver.mockClear();
    mockStriptags.mockClear();

    // Set up default successful response
    mockPusher.send.mockImplementation((message, callback) => {
      callback(null, { success: true });
    });
  });

  describe('sendPushOverNotification', () => {
    const mockConfig = {
      config: {
        user: 'test-user-key',
        token: 'test-app-token'
      }
    };

    const mockFeedData = {
      title: 'New Release v1.0.0',
      link: 'https://github.com/owner/repo/releases/tag/v1.0.0',
      description: '<p>This is a <strong>test</strong> release</p>',
      date: '2023-01-01T00:00:00Z'
    };

    test('should create PushOver instance with user and token', async () => {
      await pushOverUtils.default.sendPushOverNotification(mockConfig, mockFeedData);

      expect(mockPushOver).toHaveBeenCalledWith({
        user: 'test-user-key',
        token: 'test-app-token'
      });
    });

    test('should send notification with correct message format', async () => {
      await pushOverUtils.default.sendPushOverNotification(mockConfig, mockFeedData);

      expect(mockPusher.send).toHaveBeenCalledWith(
        {
          message: 'This is a test release\n\nhttps://github.com/owner/repo/releases/tag/v1.0.0',
          title: 'New Release v1.0.0'
        },
        expect.any(Function)
      );
    });

    test('should strip HTML tags from description', async () => {
      mockPusher.send.mockImplementation((message, callback) => {
        callback(null, { success: true });
      });

      await pushOverUtils.default.sendPushOverNotification(mockConfig, mockFeedData);

      expect(mockStriptags).toHaveBeenCalledWith(mockFeedData.description);
    });

    test('should resolve with result when notification succeeds', async () => {
      const successResult = { success: true, request: 'test-request-id' };
      mockPusher.send.mockImplementation((message, callback) => {
        callback(null, successResult);
      });

      const result = await pushOverUtils.default.sendPushOverNotification(mockConfig, mockFeedData);

      expect(result).toBe(successResult);
    });

    test('should reject with error when notification fails', async () => {
      const error = new Error('PushOver API error');
      mockPusher.send.mockImplementation((message, callback) => {
        callback(error, null);
      });

      await expect(pushOverUtils.default.sendPushOverNotification(mockConfig, mockFeedData))
        .rejects.toThrow('PushOver API error');
    });

    test('should handle empty description', async () => {
      const feedDataWithEmptyDescription = {
        ...mockFeedData,
        description: ''
      };

      await pushOverUtils.default.sendPushOverNotification(mockConfig, feedDataWithEmptyDescription);

      expect(mockPusher.send).toHaveBeenCalledWith(
        {
          message: '\n\nhttps://github.com/owner/repo/releases/tag/v1.0.0',
          title: 'New Release v1.0.0'
        },
        expect.any(Function)
      );
    });

    test('should include link in message body', async () => {
      await pushOverUtils.default.sendPushOverNotification(mockConfig, mockFeedData);

      const callArgs = mockPusher.send.mock.calls[0][0];
      expect(callArgs.message).toContain(mockFeedData.link);
    });
  });
});
