import { EventEmitter } from "node:events";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  jest,
  test,
} from "@jest/globals";

describe("RssMonitor", () => {
  let rssMonitor;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (rssMonitor) {
      rssMonitor.destroy();
    }
    jest.clearAllMocks();
  });

  test("should create instance successfully", async () => {
    const { default: RssMonitor } = await import("../../utils/rssMonitor.js");
    rssMonitor = new RssMonitor();

    expect(rssMonitor).toBeInstanceOf(RssMonitor);
    expect(rssMonitor).toBeInstanceOf(EventEmitter);
  });

  test("should initialize with default options", async () => {
    const { default: RssMonitor } = await import("../../utils/rssMonitor.js");
    rssMonitor = new RssMonitor();

    expect(rssMonitor.userAgent).toBe("AlertHub RSS Aggregator");
    expect(typeof rssMonitor.add).toBe("function");
    expect(typeof rssMonitor.remove).toBe("function");
    expect(typeof rssMonitor.destroy).toBe("function");
  });

  test("should initialize with custom options", async () => {
    const { default: RssMonitor } = await import("../../utils/rssMonitor.js");
    rssMonitor = new RssMonitor({
      userAgent: "Custom Agent",
      timeout: 30000,
    });

    expect(rssMonitor.userAgent).toBe("Custom Agent");
  });

  test("should add feed successfully", async () => {
    const { default: RssMonitor } = await import("../../utils/rssMonitor.js");
    rssMonitor = new RssMonitor();

    // Mock startMonitoring instead of fetchFeed to prevent intervals
    jest.spyOn(rssMonitor, "startMonitoring").mockImplementation(() => {});

    // Add error handler to prevent unhandled errors
    rssMonitor.on("error", () => {});

    const feedConfig = {
      url: "https://example.com/feed.xml",
      refresh: 30000,
      eventName: "custom-event",
    };

    rssMonitor.add(feedConfig);

    expect(rssMonitor.feeds.has(feedConfig.url)).toBe(true);
  });
  test("should use default values when adding feed", async () => {
    const { default: RssMonitor } = await import("../../utils/rssMonitor.js");
    rssMonitor = new RssMonitor();

    // Mock fetchFeed to prevent network calls
    jest.spyOn(rssMonitor, "startMonitoring").mockImplementation(() => {});

    // Add error handler to prevent unhandled errors
    rssMonitor.on("error", () => {});

    const feedConfig = {
      url: "https://example.com/feed.xml",
    };

    rssMonitor.add(feedConfig);

    const feed = rssMonitor.feeds.get(feedConfig.url);
    expect(feed.refresh).toBe(60000); // Default refresh
    expect(feed.eventName).toBe("new-item"); // Default event name
  });

  test("should remove feed successfully", async () => {
    const { default: RssMonitor } = await import("../../utils/rssMonitor.js");
    rssMonitor = new RssMonitor();

    // Mock fetchFeed to prevent network calls
    jest.spyOn(rssMonitor, "startMonitoring").mockImplementation(() => {});

    // Add error handler to prevent unhandled errors
    rssMonitor.on("error", () => {});

    const feedConfig = {
      url: "https://example.com/feed.xml",
    };

    rssMonitor.add(feedConfig);
    rssMonitor.remove(feedConfig.url);

    expect(rssMonitor.feeds.has(feedConfig.url)).toBe(false);
  });

  test("should provide list of monitored feeds", async () => {
    const { default: RssMonitor } = await import("../../utils/rssMonitor.js");
    rssMonitor = new RssMonitor();

    // Mock fetchFeed to prevent network calls
    jest.spyOn(rssMonitor, "startMonitoring").mockImplementation(() => {});

    // Add error handler to prevent unhandled errors
    rssMonitor.on("error", () => {});

    const feedConfig1 = { url: "https://example1.com/feed.xml" };
    const feedConfig2 = { url: "https://example2.com/feed.xml" };

    rssMonitor.add(feedConfig1);
    rssMonitor.add(feedConfig2);

    const list = rssMonitor.list;
    expect(list).toHaveLength(2);
    expect(list).toContain(feedConfig1.url);
    expect(list).toContain(feedConfig2.url);
  });

  test("should generate unique item IDs correctly", async () => {
    const { default: RssMonitor } = await import("../../utils/rssMonitor.js");
    rssMonitor = new RssMonitor();

    const item1 = { guid: "guid-1", link: "link-1", title: "Title 1" };
    const item2 = { link: "link-2", title: "Title 2" };
    const item3 = { title: "Title 3", pubDate: "2023-01-01" };

    expect(rssMonitor.generateItemId(item1)).toBe("guid-1");
    expect(rssMonitor.generateItemId(item2)).toBe("link-2");
    expect(rssMonitor.generateItemId(item3)).toBe("Title 3-2023-01-01");
  });

  test("should destroy all feeds and clear intervals", async () => {
    const { default: RssMonitor } = await import("../../utils/rssMonitor.js");
    rssMonitor = new RssMonitor();

    // Mock fetchFeed to prevent network calls
    jest.spyOn(rssMonitor, "startMonitoring").mockImplementation(() => {});

    // Add error handler to prevent unhandled errors
    rssMonitor.on("error", () => {});

    const feedConfig1 = { url: "https://example1.com/feed.xml" };
    const feedConfig2 = { url: "https://example2.com/feed.xml" };

    rssMonitor.add(feedConfig1);
    rssMonitor.add(feedConfig2);

    expect(rssMonitor.feeds.size).toBe(2);

    rssMonitor.destroy();

    expect(rssMonitor.feeds.size).toBe(0);
  });

  test("should handle startMonitoring method", async () => {
    const { default: RssMonitor } = await import("../../utils/rssMonitor.js");
    rssMonitor = new RssMonitor();

    const feed = {
      url: "https://example.com/feed.xml",
      refresh: 60000,
      eventName: "new-item",
      lastItems: new Map(),
    };

    // Mock fetchFeed to avoid actual network calls
    jest.spyOn(rssMonitor, "fetchFeed").mockResolvedValue();

    rssMonitor.startMonitoring(feed);

    expect(rssMonitor.fetchFeed).toHaveBeenCalledWith(feed, true);
    expect(feed.interval).toBeDefined();

    // Clear the interval to avoid memory leaks
    clearInterval(feed.interval);
  });

  test("should handle fetchFeed with successful response", async () => {
    const { default: RssMonitor } = await import("../../utils/rssMonitor.js");
    rssMonitor = new RssMonitor();

    // Add error handler FIRST to prevent unhandled errors
    rssMonitor.on("error", () => {});

    const mockItems = [
      {
        title: "Test Item",
        link: "https://example.com/item1",
        description: "Test description",
        pubDate: new Date().toISOString(),
        guid: "item-1",
      },
    ];

    // Mock the parser parseURL method
    jest.spyOn(rssMonitor.parser, "parseURL").mockResolvedValue({
      items: mockItems,
    });

    const feed = {
      url: "https://example.com/feed.xml",
      eventName: "new-item",
      lastItems: new Map(), // Correct property name
    };

    // Mock emit to verify events are fired
    const emitSpy = jest.spyOn(rssMonitor, "emit");

    await rssMonitor.fetchFeed(feed, false);

    expect(rssMonitor.parser.parseURL).toHaveBeenCalledWith(feed.url);
    expect(emitSpy).toHaveBeenCalledWith(
      "new-item",
      expect.objectContaining({
        title: "Test Item",
        link: "https://example.com/item1",
      }),
    );
  });

  test("should handle fetchFeed with initial load", async () => {
    const { default: RssMonitor } = await import("../../utils/rssMonitor.js");
    rssMonitor = new RssMonitor();

    // Add error handler FIRST to prevent unhandled errors
    rssMonitor.on("error", () => {});

    const mockItems = [
      {
        title: "Initial Item",
        link: "https://example.com/initial",
        guid: "initial-1",
      },
    ];

    jest.spyOn(rssMonitor.parser, "parseURL").mockResolvedValue({
      items: mockItems,
    });

    const feed = {
      url: "https://example.com/feed.xml",
      eventName: "new-item",
      lastItems: new Map(),
    };

    // Mock emit to verify no events are fired on initial load
    const emitSpy = jest.spyOn(rssMonitor, "emit");

    await rssMonitor.fetchFeed(feed, true);

    // Should not emit events on initial load
    expect(emitSpy).not.toHaveBeenCalledWith("new-item", expect.anything());
    // But should mark items as seen
    expect(feed.lastItems.has("initial-1")).toBe(true);
  });

  test("should handle fetchFeed error gracefully", async () => {
    const { default: RssMonitor } = await import("../../utils/rssMonitor.js");
    rssMonitor = new RssMonitor();

    // Add error handler FIRST to prevent unhandled errors
    const errorHandler = jest.fn();
    rssMonitor.on("error", errorHandler);

    // Mock the parser parseURL to throw an error
    jest
      .spyOn(rssMonitor.parser, "parseURL")
      .mockRejectedValue(new Error("Network error"));

    const feed = {
      url: "https://example.com/invalid-feed.xml",
      eventName: "new-item",
      lastItems: new Map(),
    };

    // Mock emit to verify error event
    const emitSpy = jest.spyOn(rssMonitor, "emit");

    await rssMonitor.fetchFeed(feed, false);

    expect(emitSpy).toHaveBeenCalledWith("error", expect.any(Object));
    expect(errorHandler).toHaveBeenCalledWith(expect.any(Object));
  });

  test("should generate item ID with fallback to title and date", async () => {
    const { default: RssMonitor } = await import("../../utils/rssMonitor.js");
    rssMonitor = new RssMonitor();

    const item = { title: "Fallback Title", pubDate: "2023-01-01" };

    expect(rssMonitor.generateItemId(item)).toBe("Fallback Title-2023-01-01");
  });

  test("should handle missing properties in generateItemId", async () => {
    const { default: RssMonitor } = await import("../../utils/rssMonitor.js");
    rssMonitor = new RssMonitor();

    const item = { title: "Only Title" };

    expect(rssMonitor.generateItemId(item)).toBe("Only Title-undefined");
  });

  test("should handle add feed that already exists", async () => {
    const { default: RssMonitor } = await import("../../utils/rssMonitor.js");
    rssMonitor = new RssMonitor();

    const feedConfig = { url: "https://example.com/feed.xml" };

    // Mock startMonitoring to avoid actual intervals
    jest.spyOn(rssMonitor, "startMonitoring").mockImplementation(() => {});

    rssMonitor.add(feedConfig);
    expect(rssMonitor.feeds.size).toBe(1);

    // Adding the same feed again should not increase the count
    rssMonitor.add(feedConfig);
    expect(rssMonitor.feeds.size).toBe(1);
  });

  test("should remove non-existent feed gracefully", async () => {
    const { default: RssMonitor } = await import("../../utils/rssMonitor.js");
    rssMonitor = new RssMonitor();

    expect(rssMonitor.feeds.size).toBe(0);

    // Should not throw error when removing non-existent feed
    rssMonitor.remove("https://non-existent.com/feed.xml");

    expect(rssMonitor.feeds.size).toBe(0);
  });

  test("should handle destroy with active intervals", async () => {
    const { default: RssMonitor } = await import("../../utils/rssMonitor.js");
    rssMonitor = new RssMonitor();

    const feedConfig = {
      url: "https://example.com/feed.xml",
      refresh: 1000,
    };

    // Prevent real network and potential unhandled error event
    jest.spyOn(rssMonitor.parser, "parseURL").mockResolvedValue({ items: [] });
    // Add a no-op error handler so emitting errors during interval won't crash
    rssMonitor.on("error", () => {});

    // Add a feed with interval
    rssMonitor.add(feedConfig);

    expect(rssMonitor.feeds.size).toBe(1);

    // Destroy should clear all feeds and intervals
    rssMonitor.destroy();

    expect(rssMonitor.feeds.size).toBe(0);
  });

  test("should handle feed without guid using generateItemId", async () => {
    const { default: RssMonitor } = await import("../../utils/rssMonitor.js");
    rssMonitor = new RssMonitor();

    // Add error handler FIRST to prevent unhandled errors
    rssMonitor.on("error", () => {});

    const mockItems = [
      {
        title: "Item without GUID",
        link: "https://example.com/no-guid",
        description: "No GUID item",
        pubDate: new Date().toISOString(),
        // No guid property
      },
    ];

    jest.spyOn(rssMonitor.parser, "parseURL").mockResolvedValue({
      items: mockItems,
    });

    const feed = {
      url: "https://example.com/feed.xml",
      eventName: "new-item",
      lastItems: new Map(),
    };

    const emitSpy = jest.spyOn(rssMonitor, "emit");

    await rssMonitor.fetchFeed(feed, false);

    // Should still emit event using generated ID
    expect(emitSpy).toHaveBeenCalledWith(
      "new-item",
      expect.objectContaining({
        title: "Item without GUID",
      }),
    );
  });

  test("should not emit duplicate items on subsequent fetches", async () => {
    const { default: RssMonitor } = await import("../../utils/rssMonitor.js");
    rssMonitor = new RssMonitor();

    // Add error handler FIRST to prevent unhandled errors
    rssMonitor.on("error", () => {});

    const mockItems = [
      {
        title: "Duplicate Item",
        link: "https://example.com/duplicate",
        guid: "duplicate-1",
      },
    ];

    jest.spyOn(rssMonitor.parser, "parseURL").mockResolvedValue({
      items: mockItems,
    });

    const feed = {
      url: "https://example.com/feed.xml",
      eventName: "new-item",
      lastItems: new Map(),
    };

    const emitSpy = jest.spyOn(rssMonitor, "emit");

    // First fetch - should emit
    await rssMonitor.fetchFeed(feed, false);
    expect(emitSpy).toHaveBeenCalledTimes(1);

    // Reset spy
    emitSpy.mockClear();

    // Second fetch with same item - should not emit
    await rssMonitor.fetchFeed(feed, false);
    expect(emitSpy).not.toHaveBeenCalledWith("new-item", expect.anything());
  });

  test("should handle empty feed items", async () => {
    const { default: RssMonitor } = await import("../../utils/rssMonitor.js");
    rssMonitor = new RssMonitor();

    // Add error handler FIRST to prevent unhandled errors
    rssMonitor.on("error", () => {});

    jest.spyOn(rssMonitor.parser, "parseURL").mockResolvedValue({
      items: [],
    });

    const feed = {
      url: "https://example.com/empty-feed.xml",
      eventName: "new-item",
      lastItems: new Map(),
    };

    const emitSpy = jest.spyOn(rssMonitor, "emit");

    await rssMonitor.fetchFeed(feed, false);

    expect(emitSpy).not.toHaveBeenCalledWith("new-item", expect.anything());
  });

  test("should use default refresh rate when not specified", async () => {
    const { default: RssMonitor } = await import("../../utils/rssMonitor.js");
    rssMonitor = new RssMonitor();

    const feedConfig = { url: "https://example.com/feed.xml" };

    jest.spyOn(rssMonitor, "startMonitoring").mockImplementation(() => {});

    rssMonitor.add(feedConfig);

    const addedFeed = rssMonitor.feeds.get(feedConfig.url);
    expect(addedFeed.refresh).toBe(60000); // Default 60 seconds
  });

  test("should handle custom user agent in constructor", async () => {
    const { default: RssMonitor } = await import("../../utils/rssMonitor.js");
    const customAgent = "Custom Test Agent";
    rssMonitor = new RssMonitor({ userAgent: customAgent });

    expect(rssMonitor.userAgent).toBe(customAgent);
    expect(rssMonitor.parser.options.headers["User-Agent"]).toBe(customAgent);
  });
});
