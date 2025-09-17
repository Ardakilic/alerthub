import { Feed } from "feed";
import Parser from "rss-parser";
import alertHubUtils from "./alertHub.js";
import logger from "./logger.js";

/**
 * RSS Generator Class
 * Generates RSS feeds from repository data using modern libraries
 * Replaces rss-braider with direct implementation using rss-parser and feed
 */
class RssGenerator {
  constructor(config = null) {
    this.config = config;
    this.parser = new Parser({
      headers: {
        "User-Agent": config?.userAgent || "AlertHub RSS Generator",
      },
      timeout: 30000,
    });
  }

  /**
   * Create RSS feed from configuration
   * Replaces rss-braider functionality with modern approach
   */
  async createRSSFeed(config = null) {
    const rssConfig = config || this.config;

    if (!rssConfig.rss.enabled) {
      return Promise.resolve("");
    }

    try {
      // Initialize the Feed generator
      const feed = new Feed({
        title: rssConfig.rss.title,
        description: rssConfig.rss.description,
        id: rssConfig.rss.siteUrl,
        link: rssConfig.rss.siteUrl,
        generator: "AlertHub",
        feedLinks: {
          rss: rssConfig.rss.feedUrl,
        },
        updated: new Date(),
      });

      // Collect all RSS items from various sources
      const allItems = [];

      // Process GitHub feeds
      await this.processGitHubFeeds(rssConfig, allItems);

      // Process GitLab feeds
      await this.processGitLabFeeds(rssConfig, allItems);

      // Process extra feeds
      await this.processExtraFeeds(rssConfig, allItems);

      // Sort items by date (newest first)
      allItems.sort((a, b) => new Date(b.date) - new Date(a.date));

      // Add items to feed (limit to configured count)
      const itemsToAdd = allItems.slice(0, rssConfig.rss.count);

      for (const item of itemsToAdd) {
        // Apply plugins (basic transformations)
        const processedItem = this.applyPlugins(item, rssConfig);

        feed.addItem({
          title: processedItem.title,
          id: processedItem.link,
          link: processedItem.link,
          description: processedItem.description,
          date: new Date(processedItem.date),
          author: processedItem.author
            ? [{ name: processedItem.author }]
            : undefined,
        });
      }

      logger.info(
        {
          itemCount: itemsToAdd.length,
          totalSources: this.countSources(rssConfig),
        },
        "Generated RSS feed",
      );

      return feed.rss2();
    } catch (error) {
      logger.error({ error: error.message }, "Failed to create RSS feed");
      throw error;
    }
  }

  /**
   * Process GitHub repository feeds
   * @private
   */
  async processGitHubFeeds(rssConfig, allItems) {
    const github = rssConfig.repositories.github;

    for (const type of Object.keys(github)) {
      if (type === "commits") {
        for (const repository of Object.keys(github[type])) {
          for (const branch of github[type][repository]) {
            const feedUrl = alertHubUtils.generateURLForTheFeed({
              resource: "github",
              repository,
              type,
              subType: branch === "*" ? undefined : branch,
            });

            await this.fetchAndProcessFeed(
              feedUrl,
              allItems,
              rssConfig.rss.includeFromEachRepository,
              `github-${type}-${repository}-${branch}`,
            );
          }
        }
      } else if (type === "issues") {
        for (const repository of Object.keys(github[type])) {
          const feedUrl = alertHubUtils.generateURLForTheFeed({
            resource: "github",
            repository,
            type,
            params: github[type][repository],
          });

          await this.fetchAndProcessFeed(
            feedUrl,
            allItems,
            rssConfig.rss.includeFromEachRepository,
            `github-${type}-${repository}`,
          );
        }
      } else {
        for (const repository of github[type]) {
          const feedUrl = alertHubUtils.generateURLForTheFeed({
            resource: "github",
            repository,
            type,
          });

          await this.fetchAndProcessFeed(
            feedUrl,
            allItems,
            rssConfig.rss.includeFromEachRepository,
            `github-${type}-${repository}`,
          );
        }
      }
    }
  }

  /**
   * Process GitLab repository feeds
   * @private
   */
  async processGitLabFeeds(rssConfig, allItems) {
    const gitlab = rssConfig.repositories.gitlab;

    for (const type of Object.keys(gitlab)) {
      if (type === "commits") {
        for (const repository of Object.keys(gitlab[type])) {
          for (const branch of gitlab[type][repository]) {
            const feedUrl = alertHubUtils.generateURLForTheFeed({
              resource: "gitlab",
              repository,
              type,
              subType: branch,
            });

            await this.fetchAndProcessFeed(
              feedUrl,
              allItems,
              rssConfig.rss.includeFromEachRepository,
              `gitlab-${type}-${repository}-${branch}`,
            );
          }
        }
      } else {
        for (const repository of gitlab[type]) {
          const feedUrl = alertHubUtils.generateURLForTheFeed({
            resource: "gitlab",
            repository,
            type,
          });

          await this.fetchAndProcessFeed(
            feedUrl,
            allItems,
            rssConfig.rss.includeFromEachRepository,
            `gitlab-${type}-${repository}`,
          );
        }
      }
    }
  }

  /**
   * Process extra RSS feeds
   * @private
   */
  async processExtraFeeds(rssConfig, allItems) {
    for (const feedUrl of rssConfig.extras || []) {
      await this.fetchAndProcessFeed(
        feedUrl,
        allItems,
        rssConfig.rss.includeFromEachRepository,
        `extra-${Math.random().toString(36).substr(2, 9)}`,
      );
    }
  }

  /**
   * Fetch and process individual RSS feed
   * @private
   */
  async fetchAndProcessFeed(feedUrl, allItems, maxItems, sourceName) {
    try {
      logger.debug({ feedUrl, sourceName }, "Fetching RSS feed");

      const parsedFeed = await this.parser.parseURL(feedUrl);

      if (!parsedFeed.items) {
        logger.warn({ feedUrl, sourceName }, "No items found in feed");
        return;
      }

      // Take only the requested number of items
      const items = parsedFeed.items.slice(0, maxItems);

      for (const item of items) {
        allItems.push({
          title: item.title,
          link: item.link,
          description: item.contentSnippet || item.description,
          date: item.isoDate || item.pubDate || new Date().toISOString(),
          author: item.creator || item.author,
          source: sourceName,
          feedTitle: parsedFeed.title,
        });
      }

      logger.debug(
        {
          feedUrl,
          sourceName,
          itemsAdded: items.length,
        },
        "Successfully processed feed",
      );
    } catch (error) {
      logger.warn(
        {
          feedUrl,
          sourceName,
          error: error.message,
        },
        "Failed to fetch RSS feed",
      );
    }
  }

  /**
   * Apply plugin transformations (simplified version of rss-braider plugins)
   * @private
   */
  applyPlugins(item, _rssConfig) {
    let processedItem = { ...item };

    // Apply fixGitLabDateColumn plugin equivalent
    if (item.source?.includes("gitlab")) {
      processedItem = this.fixGitLabDateColumn(processedItem);
    }

    // Apply addReleaseNameToTitle plugin equivalent
    processedItem = this.addReleaseNameToTitle(processedItem);

    return processedItem;
  }

  /**
   * Fix GitLab date column formatting
   * @private
   */
  fixGitLabDateColumn(item) {
    // GitLab date fixing logic would go here
    // For now, just ensure we have a valid date
    if (!item.date || item.date === "Invalid Date") {
      item.date = new Date().toISOString();
    }
    return item;
  }

  /**
   * Add release name to title
   * @private
   */
  addReleaseNameToTitle(item) {
    // If the item is from a releases feed and doesn't have "Release" in title
    if (item.source?.includes("releases") && item.title) {
      if (!item.title.toLowerCase().includes("release")) {
        item.title = `Release: ${item.title}`;
      }
    }
    return item;
  }

  /**
   * Count total number of sources
   * @private
   */
  countSources(rssConfig) {
    let count = 0;

    // GitHub sources
    const github = rssConfig.repositories.github;
    for (const type of Object.keys(github)) {
      if (type === "commits" || type === "issues") {
        count += Object.keys(github[type]).length;
      } else {
        count += github[type].length;
      }
    }

    // GitLab sources
    const gitlab = rssConfig.repositories.gitlab;
    for (const type of Object.keys(gitlab)) {
      if (type === "commits") {
        count += Object.keys(gitlab[type]).length;
      } else {
        count += gitlab[type].length;
      }
    }

    // Extra sources
    count += (rssConfig.extras || []).length;

    return count;
  }
}

export default RssGenerator;
