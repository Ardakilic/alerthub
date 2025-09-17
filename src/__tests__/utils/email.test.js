import { beforeEach, describe, expect, jest, test } from "@jest/globals";

// Mock nodemailer with ES modules approach
const mockTransporter = {
  sendMail: jest.fn(),
};

const mockNodemailer = {
  createTransport: jest.fn(() => mockTransporter),
};

// Mock striptags
const mockStriptags = jest.fn((input) => input.replace(/<[^>]*>/g, ""));

// Use ES modules mocking BEFORE imports
jest.unstable_mockModule("nodemailer", () => mockNodemailer);
jest.unstable_mockModule("striptags", () => ({
  default: mockStriptags,
}));

// Import AFTER mocking
const emailUtils = await import("../../utils/email.js");

describe("Email Utils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTransporter.sendMail.mockClear();
    mockNodemailer.createTransport.mockClear();
    mockStriptags.mockClear();
  });

  describe("sendEmailNotification", () => {
    const mockConfig = {
      config: {
        host: "smtp.example.com",
        port: 587,
        secure: false,
        auth: {
          user: "test@example.com",
          pass: "password",
        },
      },
      mailOptions: {
        from: '"AlertHub" <test@example.com>',
        to: "recipient@example.com",
        subjectPrefix: "AlertHub",
      },
    };

    const mockFeedData = {
      title: "New Release v1.0.0",
      link: "https://github.com/owner/repo/releases/tag/v1.0.0",
      description: "<p>This is a <strong>test</strong> release</p>",
      date: "2023-01-01T00:00:00Z",
    };

    test("should create transporter with provided config", async () => {
      mockTransporter.sendMail.mockImplementation((_options, callback) => {
        callback(null, { messageId: "test-message-id" });
      });

      await emailUtils.default.sendEmailNotification(mockConfig, mockFeedData);

      expect(mockNodemailer.createTransport).toHaveBeenCalledWith(
        mockConfig.config,
      );
    });

    test("should send email with correct options including subject prefix", async () => {
      mockTransporter.sendMail.mockImplementation((_options, callback) => {
        callback(null, { messageId: "test-message-id" });
      });

      await emailUtils.default.sendEmailNotification(mockConfig, mockFeedData);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: '"AlertHub" <test@example.com>',
          to: "recipient@example.com",
          subject: "AlertHub - New Release v1.0.0",
          text: expect.stringContaining(
            "https://github.com/owner/repo/releases/tag/v1.0.0",
          ),
          html: expect.stringContaining(
            '<a target="_blank" href="https://github.com/owner/repo/releases/tag/v1.0.0">New Release v1.0.0</a>',
          ),
        }),
        expect.any(Function),
      );
    });

    test("should send email without subject prefix when prefix is empty", async () => {
      const configWithoutPrefix = {
        ...mockConfig,
        mailOptions: {
          ...mockConfig.mailOptions,
          subjectPrefix: "",
        },
      };

      mockTransporter.sendMail.mockImplementation((_options, callback) => {
        callback(null, { messageId: "test-message-id" });
      });

      await emailUtils.default.sendEmailNotification(
        configWithoutPrefix,
        mockFeedData,
      );

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: "New Release v1.0.0",
        }),
        expect.any(Function),
      );
    });

    test("should strip HTML tags from description in text version", async () => {
      mockTransporter.sendMail.mockImplementation((_options, callback) => {
        callback(null, { messageId: "test-message-id" });
      });

      await emailUtils.default.sendEmailNotification(mockConfig, mockFeedData);

      expect(mockStriptags).toHaveBeenCalledWith(mockFeedData.description);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining("This is a test release"),
        }),
        expect.any(Function),
      );
    });

    test("should include HTML version with original formatting", async () => {
      mockTransporter.sendMail.mockImplementation((_options, callback) => {
        callback(null, { messageId: "test-message-id" });
      });

      await emailUtils.default.sendEmailNotification(mockConfig, mockFeedData);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining(
            "<p>This is a <strong>test</strong> release</p>",
          ),
        }),
        expect.any(Function),
      );
    });

    test("should handle email sending errors gracefully", async () => {
      const error = new Error("SMTP connection failed");
      mockTransporter.sendMail.mockImplementation((_options, callback) => {
        callback(error, null);
      });

      const result = await emailUtils.default.sendEmailNotification(
        mockConfig,
        mockFeedData,
      );

      expect(result).toBe(false);
    });

    test("should return success info when email is sent successfully", async () => {
      const successInfo = { messageId: "test-message-id" };
      mockTransporter.sendMail.mockImplementation((_options, callback) => {
        callback(null, successInfo);
      });

      const result = await emailUtils.default.sendEmailNotification(
        mockConfig,
        mockFeedData,
      );

      expect(result).toBe(successInfo);
    });
  });
});
