import { afterEach, describe, expect, test } from "@jest/globals";

describe("RssGenerator", () => {
  let rssGenerator;

  afterEach(() => {
    rssGenerator = null;
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

  test("should have applyPlugins method", async () => {
    const { default: RssGenerator } = await import(
      "../../utils/rssGenerator.js"
    );
    rssGenerator = new RssGenerator();

    const item = { title: "Test", source: "test" };
    const result = rssGenerator.applyPlugins(item);

    expect(result).toBeDefined();
    expect(result.title).toBe("Test");
  });

  test("should count sources correctly for empty config", async () => {
    const { default: RssGenerator } = await import(
      "../../utils/rssGenerator.js"
    );
    rssGenerator = new RssGenerator();

    const config = {
      repositories: {
        github: {},
        gitlab: {},
      },
    };

    const count = rssGenerator.countSources(config);
    expect(count).toBe(0);
  });

  test("should count sources correctly for github repositories", async () => {
    const { default: RssGenerator } = await import(
      "../../utils/rssGenerator.js"
    );
    rssGenerator = new RssGenerator();

    const config = {
      repositories: {
        github: {
          releases: ["repo1", "repo2"],
          commits: { repo3: "main" },
          issues: { repo4: "all" },
        },
        gitlab: {},
      },
    };

    const count = rssGenerator.countSources(config);
    expect(count).toBe(4); // 2 releases + 1 commit repo + 1 issue repo
  });

  test("should apply fixGitLabDateColumn plugin", async () => {
    const { default: RssGenerator } = await import(
      "../../utils/rssGenerator.js"
    );
    rssGenerator = new RssGenerator();

    const item = { date: "Invalid Date" };
    const result = rssGenerator.fixGitLabDateColumn(item);

    expect(result.date).toBeDefined();
    expect(typeof result.date).toBe("string");
    expect(result.date).not.toBe("Invalid Date");
  });

  test("should apply addReleaseNameToTitle plugin", async () => {
    const { default: RssGenerator } = await import(
      "../../utils/rssGenerator.js"
    );
    rssGenerator = new RssGenerator();

    const item = { title: "v1.0.0", source: "github-releases-test/repo" };
    const result = rssGenerator.addReleaseNameToTitle(item);

    expect(result.title).toBe("Release: v1.0.0");
  });
});
