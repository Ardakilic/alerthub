const rssBraider = require('rss-braider');
const path = require('node:path');
const alertHubUtils = require('./alertHub');

// Creates a RSS feed from the configuration provided
function createRSSFeed(config) {
  if (config.rss.enabled === true) {
    const AlertHubFeeds = {
      alertHub: {
        feed_name: 'AlertHub',
        default_count: 1,
        no_cdata_fields: [], // Don't wrap these fields in CDATA tags
        plugins: ['fixGitLabDateColumn', 'addReleaseNameToTitle'],
        meta: {
          title: config.rss.title,
          description: config.rss.description,
          generator: 'AlertHub',
          site_url: config.rss.siteUrl,
          feed_url: config.rss.feedUrl,
        },
        sources: [], // this will be filled below
      },
    };

    // GitHub feeds
    for(type of Object.keys(config.repositories.github)) {
      if (type === 'commits') {
        for(repository of Object.keys(config.repositories.github[type])) {
          for(subType of config.repositories.github[type][repository]) {
            if (subType === '*') {
              AlertHubFeeds.alertHub.sources.push({
                name: `github-${type}-${repository}-all`,
                count: config.rss.includeFromEachRepository,
                feed_url: alertHubUtils.generateURLForTheFeed({
                  resource: 'github',
                  repository,
                  type,
                }, /*config*/),
              });
            } else {
              AlertHubFeeds.alertHub.sources.push({
                name: `github-${type}-${repository}-${subType}`,
                count: config.rss.includeFromEachRepository,
                feed_url: alertHubUtils.generateURLForTheFeed({
                  resource: 'github',
                  repository,
                  type,
                  subType,
                }, /*config*/),
              });
            }
          }
        }
      } else if (type === 'issues') {
        for(repository of Object.keys(config.repositories.github[type])) {
          AlertHubFeeds.alertHub.sources.push({
            name: `github-${type}-${repository}`,
            count: config.rss.includeFromEachRepository,
            feed_url: alertHubUtils.generateURLForTheFeed({
              resource: 'github',
              repository,
              type,
              params: config.repositories.github[type][repository],
            }, /*config*/),
          });
        }
      } else {
        for(repository of config.repositories.github[type]) {
          AlertHubFeeds.alertHub.sources.push({
            name: `github-${type}-${repository}`,
            count: config.rss.includeFromEachRepository,
            feed_url: alertHubUtils.generateURLForTheFeed({
              resource: 'github',
              repository,
              type,
            }, /*config*/),
          });
        }
      }
    }

    // GitLab feeds
    for(type of Object.keys(config.repositories.gitlab)) {
      if (type === 'commits') {
        for(repository of Object.keys(config.repositories.gitlab[type])) {
          for(subType of config.repositories.gitlab[type][repository]) {
            AlertHubFeeds.alertHub.sources.push({
              name: `gitlab-${type}-${repository}-${subType}`,
              count: config.rss.includeFromEachRepository,
              feed_url: alertHubUtils.generateURLForTheFeed({
                resource: 'gitlab',
                repository,
                type,
                subType,
              }, /*config*/),
            });
          }
        }
      } else {
        for(repository of config.repositories.gitlab[type]) {
          AlertHubFeeds.alertHub.sources.push({
            name: `gitlab-${type}-${repository}`,
            count: config.rss.includeFromEachRepository,
            feed_url: alertHubUtils.generateURLForTheFeed({
              resource: 'gitlab',
              repository,
              type,
            }, /*config*/),
          });
        }
      }
    }

    // Extra feeds
    for(feed of config.rss.extras) {
      AlertHubFeeds.alertHub.sources.push({
        name: Math.random().toString(26).slice(2), // Well, there's no name, so here goes randomness
        count: config.rss.includeFromEachRepository,
        feed_url: feed,
      });
    }

    const braiderOptions = {
      feeds: AlertHubFeeds,
      indent: '    ',
      date_sort_order: 'desc', // Newest first
      log_level: 'info',
      plugins_directories: [path.join(__dirname, '..', 'plugins', 'rss-braider')],
    };

    const rssClient = rssBraider.createClient(braiderOptions);

    // Override logging level (debug, info, warn, err, off)
    rssClient.logger.level(config.rss.logLevel || 'info');

    // Let's make a promise
    const process = new Promise((resolve, reject) => {
      rssClient.processFeed('alertHub', 'rss', (err, data) => {
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
  return Promise.resolve('');
}

export default {
  createRSSFeed,
};
