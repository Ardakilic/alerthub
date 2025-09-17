import { afterEach, describe, expect, jest, test } from "@jest/globals";

describe("RssGenerator", () => {
  let rssGenerator;

  afterEach(() => {
    rssGenerator = null;
    jest.clearAllMocks();
  });

  test("should create instance successfully", async () => {
    const { default: RssGenerator } = await import(
      "../../utils/rssGenerator.js"
    );
    rssGenerator = new RssGenerator();

    expect(rssGenerator).toBeInstanceOf(RssGenerator);
    expect(typeof rssGenerator.createRSSFeed).toBe("function");
  });

  test("should initialize with custom config", async () => {
    const { default: RssGenerator } = await import(
      "../../utils/rssGenerator.js"
    );
    const config = { userAgent: "Custom Agent" };
    rssGenerator = new RssGenerator(config);

    expect(rssGenerator.config).toEqual(config);
    expect(rssGenerator.parser.options.headers["User-Agent"]).toBe(
      "Custom Agent",
    );
  });

  test("should return empty string for disabled RSS", async () => {
    const { default: RssGenerator } = await import(
      "../../utils/rssGenerator.js"
    );
    rssGenerator = new RssGenerator();

    const config = { rss: { enabled: false } };
    const result = await rssGenerator.createRSSFeed(config);

    expect(result).toBe("");
  });

  test("should create RSS feed successfully", async () => {
    const { default: RssGenerator } = await import(
      "../../utils/rssGenerator.js"
    );
    rssGenerator = new RssGenerator();

    // Mock the parser parseURL method
    jest.spyOn(rssGenerator.parser, "parseURL").mockResolvedValue({
      items: [
        {
          title: "Test Item",
          link: "https://example.com/test",
          description: "Test description",
          pubDate: new Date().toISOString(),
          author: "Test Author",
        },
      ],
    });

    const config = {
      rss: {
        enabled: true,
        title: "Test Feed",
        description: "Test Description",
        siteUrl: "https://example.com",
        feedUrl: "https://example.com/feed.xml",
        count: 10,
        includeFromEachRepository: 5,
      },
      repositories: {
        github: {
          releases: ["test/repo"],
        },
        gitlab: {},
      },
      extras: [],
    };

    const result = await rssGenerator.createRSSFeed(config);

    expect(typeof result).toBe("string");
    expect(result).toContain("<?xml");
    expect(result).toContain("Test Feed");
  });

  test("should handle GitHub repositories correctly", async () => {
    const { default: RssGenerator } = await import(
      "../../utils/rssGenerator.js"
    );
    rssGenerator = new RssGenerator();

    jest.spyOn(rssGenerator, "fetchAndProcessFeed").mockResolvedValue();

    const config = {
      rss: {
        enabled: true,
        title: "Test Feed",
        description: "Test Description",
        siteUrl: "https://example.com",
        feedUrl: "https://example.com/feed.xml",
        count: 10,
        includeFromEachRepository: 5,
      },
      repositories: {
        github: {
          releases: ["test/repo"],
        },
        gitlab: {}, // Empty GitLab config
      },
      extras: [],
    };

    const result = await rssGenerator.createRSSFeed(config);

    expect(typeof result).toBe("string");
    expect(result).toContain("Test Feed");
  });

  test("should handle empty repositories config", async () => {
    const { default: RssGenerator } = await import(
      "../../utils/rssGenerator.js"
    );
    rssGenerator = new RssGenerator();

    const config = {
      rss: {
        enabled: true,
        title: "Test Feed",
        description: "Test Description",
        siteUrl: "https://example.com",
        feedUrl: "https://example.com/feed.xml",
        count: 10,
      },
      repositories: {
        github: {}, // Empty GitHub config
        gitlab: {}, // Empty GitLab config
      },
      extras: [],
    };

    const result = await rssGenerator.createRSSFeed(config);

    expect(typeof result).toBe("string");
    expect(result).toContain("Test Feed");
  });

  test("should handle fetchAndProcessFeed with errors", async () => {
    const { default: RssGenerator } = await import(
      "../../utils/rssGenerator.js"
    );
    rssGenerator = new RssGenerator();

    // Mock parseURL to throw an error
    jest
      .spyOn(rssGenerator.parser, "parseURL")
      .mockRejectedValue(new Error("Parse error"));

    // fetchAndProcessFeed should handle the error and return nothing (undefined)
    const result = await rssGenerator.fetchAndProcessFeed(
      "invalid-url",
      [],
      5,
      "test-source",
    );

    expect(result).toBeUndefined();
  });

  test("should handle missing feed fields", async () => {
    const { default: RssGenerator } = await import(
      "../../utils/rssGenerator.js"
    );
    rssGenerator = new RssGenerator();

    const mockItems = [
      {
        title: "Test Item",
        // Missing link, description, etc.
      },
    ];

    jest.spyOn(rssGenerator.parser, "parseURL").mockResolvedValue({
      items: mockItems,
    });

    const allItems = [];
    await rssGenerator.fetchAndProcessFeed(
      "https://example.com/feed.xml",
      allItems,
      5,
      "test-source",
    );

    expect(allItems).toHaveLength(1);
    expect(allItems[0].title).toBe("Test Item");
    expect(allItems[0].link).toBeUndefined();
  });

  test("should apply plugins to item", async () => {
    const { default: RssGenerator } = await import(
      "../../utils/rssGenerator.js"
    );
    rssGenerator = new RssGenerator();

    const item = {
      title: "v1.0.0",
      source: "github-releases-test/repo",
      date: "2023-01-01",
    };

    const rssConfig = {};

    const result = rssGenerator.applyPlugins(item, rssConfig);

    // Should apply fixGitLabDateColumn and addReleaseNameToTitle
    expect(result.title).toBe("Release: v1.0.0");
  });

  test("should handle addReleaseNameToTitle plugin", async () => {
    const { default: RssGenerator } = await import(
      "../../utils/rssGenerator.js"
    );
    rssGenerator = new RssGenerator();

    const item = { title: "v1.0.0", source: "github-releases-test/repo" };
    const result = rssGenerator.addReleaseNameToTitle(item);

    expect(result.title).toBe("Release: v1.0.0");
  });

  test("should not modify title if not from releases", async () => {
    const { default: RssGenerator } = await import(
      "../../utils/rssGenerator.js"
    );
    rssGenerator = new RssGenerator();

    const item = { title: "v1.0.0", source: "github-commits-test/repo" };
    const result = rssGenerator.addReleaseNameToTitle(item);

    expect(result.title).toBe("v1.0.0");
  });

  test("should not modify title if already contains 'release'", async () => {
    const { default: RssGenerator } = await import(
      "../../utils/rssGenerator.js"
    );
    rssGenerator = new RssGenerator();

    const item = {
      title: "Release v1.0.0",
      source: "github-releases-test/repo",
    };
    const result = rssGenerator.addReleaseNameToTitle(item);

    expect(result.title).toBe("Release v1.0.0");
  });

  test("should handle invalid date in fixGitLabDateColumn", async () => {
    const { default: RssGenerator } = await import(
      "../../utils/rssGenerator.js"
    );
    rssGenerator = new RssGenerator();

    const item = {
      title: "Test Item",
      pubDate: "invalid-date",
    };

    const result = rssGenerator.fixGitLabDateColumn(item);

    expect(result.pubDate).toBe("invalid-date"); // Should remain unchanged
  });

  test("should handle processExtraFeeds successfully", async () => {
    const { default: RssGenerator } = await import(
      "../../utils/rssGenerator.js"
    );
    rssGenerator = new RssGenerator();

    jest.spyOn(rssGenerator, "fetchAndProcessFeed").mockResolvedValue();

    const rssConfig = {
      extras: ["https://example.com/extra-feed.xml"],
      rss: { includeFromEachRepository: 5 },
    };

    const allItems = [];
    await rssGenerator.processExtraFeeds(rssConfig, allItems);

    expect(rssGenerator.fetchAndProcessFeed).toHaveBeenCalledWith(
      "https://example.com/extra-feed.xml",
      allItems,
      5,
      expect.stringContaining("extra-"),
    );
  });

  test("should handle empty extras array", async () => {
    const { default: RssGenerator } = await import(
      "../../utils/rssGenerator.js"
    );
    rssGenerator = new RssGenerator();

    const fetchSpy = jest.spyOn(rssGenerator, "fetchAndProcessFeed");

    const rssConfig = { extras: [] };
    const allItems = [];

    await rssGenerator.processExtraFeeds(rssConfig, allItems);

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  test("should handle null extras", async () => {
    const { default: RssGenerator } = await import(
      "../../utils/rssGenerator.js"
    );
    rssGenerator = new RssGenerator();

    const fetchSpy = jest.spyOn(rssGenerator, "fetchAndProcessFeed");

    const rssConfig = { extras: null };
    const allItems = [];

    await rssGenerator.processExtraFeeds(rssConfig, allItems);

    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
