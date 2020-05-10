/* eslint no-console: ["error", { allow: ["warn", "error", "log"] }] */

// First, let's require the libraries
const RssFeedEmitter = require('rss-feed-emitter');
const http = require('http');

const config = require('../etc/config');
const alertHubUtils = require('./utils/alertHub');
const pushBulletUtils = require('./utils/pushBullet');
const pushOverUtils = require('./utils/pushOver');
const emailUtils = require('./utils/email');
const rssUtils = require('./utils/rss');

// RSS Feed emitter to watch and parse feed
const feeder = new RssFeedEmitter({ userAgent: config.userAgent || 'Mozilla/5.0 (Linux x86_64; rv:76.0) Gecko/20100101 Firefox/76.0' });

const bootDate = new Date();
console.log(`Application booted at ${bootDate}`);

// GitHub feeds
Object.keys(config.repositories.github).forEach((type) => {
  if (type === 'commits') {
    Object.keys(config.repositories.github[type]).forEach((feed) => {
      config.repositories.github[type][feed].forEach((subType) => {
        if (subType === '*') {
          feeder.add({
            url: `https://github.com/${feed}/${type}.atom`,
            refresh: config.interval,
          });
        } else {
          feeder.add({
            url: `https://github.com/${feed}/${type}/${subType}.atom`,
            refresh: config.interval,
          });
        }
      });
    });
  } else {
    config.repositories.github[type].forEach((feed) => {
      feeder.add({
        url: `https://github.com/${feed}/${type}.atom`,
        refresh: config.interval,
      });
    });
  }
});

// GitLab feeds
Object.keys(config.repositories.gitlab).forEach((type) => {
  if (type === 'commits') {
    Object.keys(config.repositories.gitlab[type]).forEach((feed) => {
      config.repositories.gitlab[type][feed].forEach((subType) => {
        feeder.add({
          url: `https://gitlab.com/${feed}/-/${type}/${subType}?format=atom`,
          refresh: config.interval,
        });
      });
    });
  } else {
    config.repositories.gitlab[type].forEach((feed) => {
      feeder.add({
        url: `https://gitlab.com/${feed}/-/${type}?format=atom`,
        refresh: config.interval,
      });
    });
  }
});

config.extras.forEach((feed) => {
  feeder.add({
    url: feed,
    refresh: config.interval,
  });
});

// Dummy feed that updates regularly
/* feeder.add({
  url: 'https://lorem-rss.herokuapp.com/feed?unit=second&interval=10',
  refresh: 2000,
}); */

// First, the notification part to alert the user
feeder.on('new-item', async (item) => {
  // console.log(item);

  // Past (Current) feeds are also pushed to feed on initial boot
  // This may cause serious notification/mail traffic after a possible crash
  // That's why we make a simple time check to make sure feeds are new
  const date = new Date(item.date);
  // Let's compare the dates and make sure the feed is a new feed.
  if (date.getTime() > bootDate.getTime()) {
    console.log(`New release found! ${item.title}!`);

    const feedData = alertHubUtils.parseFeedData(item);

    // First, try to send the push notifications
    if (config.notifications.pushbullet.enabled === true) {
      await pushBulletUtils.sendPushBulletNotification(config, feedData);
    }
    if (config.notifications.pushover.enabled === true) {
      await pushOverUtils.sendPushOverNotification(config, feedData);
    }
    // Now try to send the email
    if (config.notifications.email.enabled === true) {
      await emailUtils.sendEmailNotification(config, feedData);
    }

    console.log(`Successfully notified about the release: ${item.title}!`);
  }
});
// Notification part END

// Let's handle the aggregated RSS part
if (config.rss.enabled === true) {
  http.createServer((_req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/xml' });
    // Upon each request, let's fetch the RSS feed string from util
    rssUtils.createRSSFeed(config).then((rssFeed) => {
      res.end(rssFeed);
    });
  }).listen(config.rss.port);
  console.log(`AlertHub RSS Feed server running at port ${config.rss.port}`);
}
