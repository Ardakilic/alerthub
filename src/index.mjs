/* eslint no-console: ["error", { allow: ["warn", "error", "log"] }] */

// First, let's require the libraries
import RssFeedEmitter from 'rss-feed-emitter';
import http from 'http';

import alertHubUtils from './utils/alertHub.js';
import pushBulletUtils from './utils/pushBullet.mjs';
import pushOverUtils from './utils/pushOver.mjs';
import emailUtils from './utils/email.mjs';
import RssUtils from './utils/rss.mjs';
import telegramUtils from './utils/telegram.mjs';
import ntfyUtils from './utils/ntfy.mjs';

import config from '../etc/config.js';

// RSS Feed emitter to watch and parse feed
const feeder = new RssFeedEmitter({ userAgent: config.userAgent || 'Mozilla/5.0 (Linux x86_64; rv:76.0) Gecko/20100101 Firefox/76.0' });

const bootDate = new Date();
console.log(`Application booted at ${bootDate.toUTCString()}`);

// GitHub feeds
Object.keys(config.repositories.github).forEach((type) => {
  if (type === 'commits') {
    Object.keys(config.repositories.github[type]).forEach((repository) => {
      config.repositories.github[type][repository].forEach((subType) => {
        if (subType === '*') {
          feeder.add({
            url: alertHubUtils.generateURLForTheFeed(
              {
                resource: 'github', repository, type,
              },
              config
            ),
            refresh: config.interval,
          });
        } else {
          feeder.add({
            url: alertHubUtils.generateURLForTheFeed(
              {
                resource: 'github', repository, type, subType,
              },
              config
            ),
            refresh: config.interval,
          });
        }
      });
    });
  } else if (type === 'issues') {
    Object.keys(config.repositories.github[type]).forEach((repository) => {
      feeder.add({
        url: alertHubUtils.generateURLForTheFeed({
          resource: 'github', repository, type, params: config.repositories.github[type][repository],
        }, config),
        refresh: config.interval,
      });
    });
  } else {
    config.repositories.github[type].forEach((repository) => {
      feeder.add({
        url: alertHubUtils.generateURLForTheFeed({ resource: 'github', repository, type }, config),
        refresh: config.interval,
      });
    });
  }
});

// GitLab feeds
Object.keys(config.repositories.gitlab).forEach((type) => {
  if (type === 'commits') {
    Object.keys(config.repositories.gitlab[type]).forEach((repository) => {
      config.repositories.gitlab[type][repository].forEach((subType) => {
        feeder.add({
          url: alertHubUtils.generateURLForTheFeed({
            resource: 'gitlab', repository, type, subType,
          }, config),
          refresh: config.interval,
        });
      });
    });
  } else {
    config.repositories.gitlab[type].forEach((repository) => {
      feeder.add({
        url: alertHubUtils.generateURLForTheFeed({ resource: 'gitlab', repository, type }, config),
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
    //console.log(item);
	
    const feedData = alertHubUtils.parseFeedData(item);

    // First, try to send the push notifications
    if (config.notifications.pushbullet.enabled === true) {
      await pushBulletUtils.sendPushBulletNotification(config, feedData);
    }
    if (config.notifications.pushover.enabled === true) {
      await pushOverUtils.sendPushOverNotification(config, feedData);
    }
    if (config.notifications.telegram.enabled === true) {
      await telegramUtils.sendTelegramNotification(config, feedData);
    }
    if (config.notifications.ntfy.enabled === true) {
      await ntfyUtils.sendNtfyNotification(config, feedData);
    }
    // Now try to send the email
    if (config.notifications.email.enabled === true) {
      await emailUtils.sendEmailNotification(config, feedData);
    }

    console.log(`Successfully notified about the release: ${item.title}!`);
  }
});
// Notification part END

// Handling errors on feed emitter
feeder.on('error', console.error);
// Error handling, currently done to console

// Let's handle the aggregated RSS part
if (config.rss.enabled === true) {
  const rssUtils = new RssUtils(config);
  http.createServer((_req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/xml' });
    // Upon each request, let's fetch the RSS feed string from util
    rssUtils.createRSSFeed().then((rssFeed) => {
      res.end(rssFeed);
    });
  }).listen(config.rss.port);
  console.log(`AlertHub RSS Feed server running at port ${config.rss.port}`);
}
