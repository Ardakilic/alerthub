import { EventEmitter } from "node:events";
import Parser from "rss-parser";
import logger from "./logger.js";

/**
 * RSS Monitor Class
 * Monitors RSS feeds for changes and emits events for new items
 * Replaces the outdated rss-feed-emitter package
 * Uses modern rss-parser with EventEmitter for real-time feed monitoring
 */
class RssMonitor extends EventEmitter {
  constructor(options = {}) {
    super();

    this.userAgent = options.userAgent || "AlertHub RSS Aggregator";
    this.parser = new Parser({
      headers: {
        "User-Agent": this.userAgent,
      },
      timeout: options.timeout || 60000,
    });

    this.feeds = new Map();
    this.seenItems = new Set();

    logger.info("RSS Monitor initialized");
  }

  /**
   * Add a feed to monitor
   * @param {Object} feedConfig - Feed configuration
   * @param {string} feedConfig.url - RSS feed URL
   * @param {number} feedConfig.refresh - Refresh interval in milliseconds (default: 60000)
   * @param {string} feedConfig.eventName - Custom event name (default: 'new-item')
   */
  add(feedConfig) {
    const { url, refresh = 60000, eventName = "new-item" } = feedConfig;

    if (this.feeds.has(url)) {
      logger.warn({ url }, "Feed already being monitored");
      return;
    }

    const feed = {
      url,
      refresh,
      eventName,
      interval: null,
      lastItems: new Set(),
    };

    this.feeds.set(url, feed);

    // Start monitoring immediately
    this.startMonitoring(feed);

    logger.info({ url, refresh, eventName }, "Added RSS feed for monitoring");
  }

  /**
   * Remove a feed from monitoring
   * @param {string} url - Feed URL to remove
   */
  remove(url) {
    const feed = this.feeds.get(url);
    if (feed) {
      if (feed.interval) {
        clearInterval(feed.interval);
      }
      this.feeds.delete(url);
      logger.info({ url }, "Removed RSS feed from monitoring");
    } else {
      logger.warn({ url }, "Feed not found for removal");
    }
  }

  /**
   * Get list of all monitored feeds
   */
  get list() {
    return Array.from(this.feeds.keys());
  }

  /**
   * Destroy the aggregator and stop all monitoring
   */
  destroy() {
    for (const feed of this.feeds.values()) {
      if (feed.interval) {
        clearInterval(feed.interval);
      }
    }
    this.feeds.clear();
    this.seenItems.clear();
    logger.info("RSS Monitor destroyed");
  }

  /**
   * Start monitoring a specific feed
   * @private
   */
  startMonitoring(feed) {
    // Initial fetch
    this.fetchFeed(feed, true);

    // Set up periodic fetching
    feed.interval = setInterval(() => {
      this.fetchFeed(feed, false);
    }, feed.refresh);
  }

  /**
   * Fetch and process a feed
   * @private
   */
  async fetchFeed(feed, isInitial = false) {
    try {
      logger.debug({ url: feed.url }, "Fetching RSS feed");

      const parsedFeed = await this.parser.parseURL(feed.url);

      if (!parsedFeed.items) {
        logger.warn({ url: feed.url }, "No items found in RSS feed");
        return;
      }

      // Process new items
      for (const item of parsedFeed.items) {
        const itemId = this.generateItemId(item);

        // Check if this is a new item
        if (!feed.lastItems.has(itemId) && !this.seenItems.has(itemId)) {
          // Skip initial items unless configured otherwise
          if (!isInitial) {
            // Emit new item event
            this.emit(feed.eventName, {
              ...item,
              meta: {
                source: feed.url,
                feedTitle: parsedFeed.title,
                feedDescription: parsedFeed.description,
              },
            });

            logger.debug(
              {
                url: feed.url,
                itemTitle: item.title,
                eventName: feed.eventName,
              },
              "Emitted new RSS item",
            );
          }

          // Track this item
          feed.lastItems.add(itemId);
          this.seenItems.add(itemId);
        }
      }

      // Clean up old items to prevent memory leaks (keep last 100)
      if (feed.lastItems.size > 100) {
        const itemsArray = Array.from(feed.lastItems);
        const toRemove = itemsArray.slice(0, itemsArray.length - 100);
        for (const id of toRemove) {
          feed.lastItems.delete(id);
        }
      }

      logger.debug(
        {
          url: feed.url,
          itemCount: parsedFeed.items.length,
        },
        "Successfully processed RSS feed",
      );
    } catch (error) {
      logger.error(
        {
          url: feed.url,
          error: error.message,
        },
        "Failed to fetch RSS feed",
      );

      this.emit("error", {
        url: feed.url,
        error: error.message,
      });
    }
  }

  /**
   * Generate unique ID for RSS items
   * @private
   */
  generateItemId(item) {
    // Use guid first, then link, then title + date as fallback
    return (
      item.guid || item.link || `${item.title}-${item.pubDate || item.isoDate}`
    );
  }
}

export default RssMonitor;
