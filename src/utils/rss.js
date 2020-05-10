const rssBraider = require('rss-braider');
const path = require('path');

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
    Object.keys(config.repositories.github).forEach((type) => {
      if (type === 'commits') {
        Object.keys(config.repositories.github[type]).forEach((feed) => {
          config.repositories.github[type][feed].forEach((subType) => {
            if (subType === '*') {
              AlertHubFeeds.alertHub.sources.push({
                name: `github-${type}-${feed}-all`,
                count: config.rss.includeFromEachRepository,
                feed_url: `https://github.com/${feed}/${type}.atom`,
              });
            } else {
              AlertHubFeeds.alertHub.sources.push({
                name: `github-${type}-${feed}-${subType}`,
                count: config.rss.includeFromEachRepository,
                feed_url: `https://github.com/${feed}/${type}/${subType}.atom`,
              });
            }
          });
        });
      } else {
        config.repositories.github[type].forEach((feed) => {
          AlertHubFeeds.alertHub.sources.push({
            name: `github-${type}-${feed}`,
            count: config.rss.includeFromEachRepository,
            feed_url: `https://github.com/${feed}/${type}.atom`,
          });
        });
      }
    });

    // GitLab feeds
    Object.keys(config.repositories.gitlab).forEach((type) => {
      if (type === 'commits') {
        Object.keys(config.repositories.gitlab[type]).forEach((feed) => {
          config.repositories.gitlab[type][feed].forEach((subType) => {
            AlertHubFeeds.alertHub.sources.push({
              name: `gitlab-${type}-${feed}-${subType}`,
              count: config.rss.includeFromEachRepository,
              feed_url: `https://gitlab.com/${feed}/-/${type}/${subType}?format=atom`,
            });
          });
        });
      } else {
        config.repositories.gitlab[type].forEach((feed) => {
          AlertHubFeeds.alertHub.sources.push({
            name: `gitlab-${type}-${feed}`, // this is actually the user/repo string
            count: config.rss.includeFromEachRepository,
            feed_url: `https://gitlab.com/${feed}/-/${type}?format=atom`,
          });
        });
      }
    });

    config.extras.forEach((feed) => {
      AlertHubFeeds.alertHub.sources.push({
        name: Math.random().toString(26).slice(2), // Well, there's no name, so here goes randomness
        count: config.rss.includeFromEachRepository,
        feed_url: feed,
      });
    });

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

module.exports = {
  createRSSFeed,
};
