import { beforeEach, describe, expect, jest, test } from "@jest/globals";

// Mock node-telegram-bot-api with proper ES modules approach - MUST be before imports
const mockBot = {
  sendMessage: jest.fn(),
};

const mockTelegramBot = jest.fn(() => mockBot);

// Use ES modules mocking BEFORE any imports
jest.unstable_mockModule("node-telegram-bot-api", () => ({
  default: mockTelegramBot,
}));

// Import AFTER mocking
const telegramUtils = await import("../../utils/telegram.js");

describe("Telegram Utils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockBot.sendMessage.mockClear();
    mockTelegramBot.mockClear();

    // Setup default successful response
    mockBot.sendMessage.mockResolvedValue({ message_id: 123 });
  });

  describe("sendTelegramNotification", () => {
    const mockConfig = {
      config: {
        token: "test-bot-token",
        chatId: "test-chat-id",
      },
    };

    const mockFeedData = {
      title: "New Release v1.0.0",
      link: "https://github.com/owner/repo/releases/tag/v1.0.0",
      description: "This is a test release with some details",
      date: "2023-01-01T00:00:00Z",
    };

    test("should create TelegramBot instance with correct config", async () => {
      await telegramUtils.default.sendTelegramNotification(
        mockConfig,
        mockFeedData,
      );

      expect(mockTelegramBot).toHaveBeenCalledWith("test-bot-token", {
        polling: false,
      });
    });

    test("should send message with correct format", async () => {
      await telegramUtils.default.sendTelegramNotification(
        mockConfig,
        mockFeedData,
      );

      expect(mockBot.sendMessage).toHaveBeenCalledWith(
        "test-chat-id",
        "New Release v1.0.0\n\nThis is a test release with some details\n\nhttps://github.com/owner/repo/releases/tag/v1.0.0",
      );
    });

    test("should return result on successful message send", async () => {
      const mockResult = { message_id: 123 };
      mockBot.sendMessage.mockResolvedValue(mockResult);

      const result = await telegramUtils.default.sendTelegramNotification(
        mockConfig,
        mockFeedData,
      );

      expect(result).toBe(mockResult);
    });

    test("should handle empty description", async () => {
      const feedDataWithEmptyDescription = {
        ...mockFeedData,
        description: "",
      };

      mockBot.sendMessage.mockResolvedValue({ message_id: 123 });

      await telegramUtils.default.sendTelegramNotification(
        mockConfig,
        feedDataWithEmptyDescription,
      );

      expect(mockBot.sendMessage).toHaveBeenCalledWith(
        "test-chat-id",
        "New Release v1.0.0\n\n\n\nhttps://github.com/owner/repo/releases/tag/v1.0.0",
      );
    });

    test("should handle long messages properly", async () => {
      const feedDataWithLongDescription = {
        ...mockFeedData,
        description: "A".repeat(4000), // Very long description
      };

      mockBot.sendMessage.mockResolvedValue({ message_id: 123 });

      await telegramUtils.default.sendTelegramNotification(
        mockConfig,
        feedDataWithLongDescription,
      );

      expect(mockBot.sendMessage).toHaveBeenCalledWith(
        "test-chat-id",
        expect.stringContaining("New Release v1.0.0"),
      );
    });

    test("should handle special characters in message", async () => {
      const feedDataWithSpecialChars = {
        ...mockFeedData,
        title: 'Release with <special> & "chars"',
        description: "Description with <html> tags & entities",
      };

      mockBot.sendMessage.mockResolvedValue({ message_id: 123 });

      await telegramUtils.default.sendTelegramNotification(
        mockConfig,
        feedDataWithSpecialChars,
      );

      expect(mockBot.sendMessage).toHaveBeenCalledWith(
        "test-chat-id",
        'Release with <special> & "chars"\n\nDescription with <html> tags & entities\n\nhttps://github.com/owner/repo/releases/tag/v1.0.0',
      );
    });

    test("should return false when sendMessage throws an error", async () => {
      mockBot.sendMessage.mockRejectedValue(new Error("Telegram API error"));

      const result = await telegramUtils.default.sendTelegramNotification(
        mockConfig,
        mockFeedData,
      );

      expect(result).toBe(false);
    });

    test("should handle missing config properties gracefully", async () => {
      const incompleteConfig = {
        config: {
          token: "test-bot-token",
          // missing chatId
        },
      };

      mockBot.sendMessage.mockResolvedValue({ message_id: 123 });

      await telegramUtils.default.sendTelegramNotification(
        incompleteConfig,
        mockFeedData,
      );

      expect(mockBot.sendMessage).toHaveBeenCalledWith(
        undefined,
        expect.any(String),
      );
    });
  });
});
