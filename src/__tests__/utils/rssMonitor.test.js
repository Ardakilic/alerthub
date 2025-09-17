import { EventEmitter } from "node:events";
import { afterEach, describe, expect, test } from "@jest/globals";

describe("RssMonitor", () => {
  let rssMonitor;

  afterEach(() => {
    if (rssMonitor) {
      rssMonitor.destroy();
    }
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

    const feedConfig1 = { url: "https://example1.com/feed.xml" };
    const feedConfig2 = { url: "https://example2.com/feed.xml" };

    rssMonitor.add(feedConfig1);
    rssMonitor.add(feedConfig2);

    expect(rssMonitor.feeds.size).toBe(2);

    rssMonitor.destroy();

    expect(rssMonitor.feeds.size).toBe(0);
  });
});
