import path from "node:path";
import { fileURLToPath } from "node:url";
import rssBraider from "rss-braider";
import alertHubUtils from "./alertHub.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Creates a RSS feed from the configuration provided
class RssUtils {
  constructor(config = null) {
    this.config = config;
  }

  async createRSSFeed(config = null) {
    const rssConfig = config || this.config;

    if (rssConfig.rss.enabled === true) {
      const AlertHubFeeds = {
        alertHub: {
          feed_name: "AlertHub",
          default_count: 1,
          no_cdata_fields: [], // Don't wrap these fields in CDATA tags
          plugins: ["fixGitLabDateColumn", "addReleaseNameToTitle"],
          meta: {
            title: rssConfig.rss.title,
            description: rssConfig.rss.description,
            generator: "AlertHub",
            site_url: rssConfig.rss.siteUrl,
            feed_url: rssConfig.rss.feedUrl,
          },
          sources: [], // this will be filled below
        },
      };

      // GitHub feeds
      for (const type of Object.keys(rssConfig.repositories.github)) {
        if (type === "commits") {
          for (const repository of Object.keys(
            rssConfig.repositories.github[type],
          )) {
            for (const subType of rssConfig.repositories.github[type][
              repository
            ]) {
              if (subType === "*") {
                AlertHubFeeds.alertHub.sources.push({
                  name: `github-${type}-${repository}-all`,
                  count: rssConfig.rss.includeFromEachRepository,
                  feed_url: alertHubUtils.generateURLForTheFeed(
                    {
                      resource: "github",
                      repository,
                      type,
                    } /*config*/,
                  ),
                });
              } else {
                AlertHubFeeds.alertHub.sources.push({
                  name: `github-${type}-${repository}-${subType}`,
                  count: rssConfig.rss.includeFromEachRepository,
                  feed_url: alertHubUtils.generateURLForTheFeed(
                    {
                      resource: "github",
                      repository,
                      type,
                      subType,
                    } /*config*/,
                  ),
                });
              }
            }
          }
        } else if (type === "issues") {
          for (const repository of Object.keys(
            rssConfig.repositories.github[type],
          )) {
            AlertHubFeeds.alertHub.sources.push({
              name: `github-${type}-${repository}`,
              count: rssConfig.rss.includeFromEachRepository,
              feed_url: alertHubUtils.generateURLForTheFeed(
                {
                  resource: "github",
                  repository,
                  type,
                  params: rssConfig.repositories.github[type][repository],
                } /*config*/,
              ),
            });
          }
        } else {
          for (const repository of rssConfig.repositories.github[type]) {
            AlertHubFeeds.alertHub.sources.push({
              name: `github-${type}-${repository}`,
              count: rssConfig.rss.includeFromEachRepository,
              feed_url: alertHubUtils.generateURLForTheFeed(
                {
                  resource: "github",
                  repository,
                  type,
                } /*config*/,
              ),
            });
          }
        }
      }

      // GitLab feeds
      for (const type of Object.keys(rssConfig.repositories.gitlab)) {
        if (type === "commits") {
          for (const repository of Object.keys(
            rssConfig.repositories.gitlab[type],
          )) {
            for (const subType of rssConfig.repositories.gitlab[type][
              repository
            ]) {
              AlertHubFeeds.alertHub.sources.push({
                name: `gitlab-${type}-${repository}-${subType}`,
                count: rssConfig.rss.includeFromEachRepository,
                feed_url: alertHubUtils.generateURLForTheFeed(
                  {
                    resource: "gitlab",
                    repository,
                    type,
                    subType,
                  } /*config*/,
                ),
              });
            }
          }
        } else {
          for (const repository of rssConfig.repositories.gitlab[type]) {
            AlertHubFeeds.alertHub.sources.push({
              name: `gitlab-${type}-${repository}`,
              count: rssConfig.rss.includeFromEachRepository,
              feed_url: alertHubUtils.generateURLForTheFeed(
                {
                  resource: "gitlab",
                  repository,
                  type,
                } /*config*/,
              ),
            });
          }
        }
      }

      // Extra feeds
      for (const feed of rssConfig.rss.extras) {
        AlertHubFeeds.alertHub.sources.push({
          name: Math.random().toString(26).slice(2), // Well, there's no name, so here goes randomness
          count: rssConfig.rss.includeFromEachRepository,
          feed_url: feed,
        });
      }

      const braiderOptions = {
        feeds: AlertHubFeeds,
        indent: "    ",
        date_sort_order: "desc", // Newest first
        log_level: "info",
        plugins_directories: [
          path.join(__dirname, "..", "plugins", "rss-braider"),
        ],
      };

      const rssClient = rssBraider.createClient(braiderOptions);

      // Override logging level (debug, info, warn, err, off)
      rssClient.logger.level(rssConfig.rss.logLevel || "info");

      // Let's make a promise
      const process = new Promise((resolve, reject) => {
        rssClient.processFeed("alertHub", "rss", (err, data) => {
          if (err) {
            // console.log(err);
            reject(err);

            return;
          }
          // console.log(data);
          resolve(data);
        });
      });

      return process;
    }

    // If RSS output is disabled, empty string will be returned
    return Promise.resolve("");
  }
}

export default RssUtils;
