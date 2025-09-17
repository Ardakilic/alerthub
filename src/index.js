// First, let's require the libraries

import http from "node:http";
import config from "../etc/config.js";
import alertHubUtils from "./utils/alertHub.js";
import emailUtils from "./utils/email.js";
import logger from "./utils/logger.js";
import pushBulletUtils from "./utils/pushBullet.js";
import pushOverUtils from "./utils/pushOver.js";
import RssGenerator from "./utils/rssGenerator.js";
import RssMonitor from "./utils/rssMonitor.js";
import telegramUtils from "./utils/telegram.js";

// RSS Monitor to watch and parse feeds
const feeder = new RssMonitor({
  userAgent:
    config.userAgent ||
    "Mozilla/5.0 (Linux x86_64; rv:76.0) Gecko/20100101 Firefox/76.0",
});

const bootDate = new Date();
logger.info({ timestamp: bootDate.toUTCString() }, "Application booted");

// GitHub feeds
for (const type of Object.keys(config.repositories.github)) {
  if (type === "commits") {
    for (const repository of Object.keys(config.repositories.github[type])) {
      for (const subType of config.repositories.github[type][repository]) {
        if (subType === "*") {
          feeder.add({
            url: alertHubUtils.generateURLForTheFeed(
              {
                resource: "github",
                repository,
                type,
              },
              // config,
            ),
            refresh: config.interval,
          });
        } else {
          feeder.add({
            url: alertHubUtils.generateURLForTheFeed(
              {
                resource: "github",
                repository,
                type,
                subType,
              },
              // config,
            ),
            refresh: config.interval,
          });
        }
      }
    }
  } else if (type === "issues") {
    for (const repository of Object.keys(config.repositories.github[type])) {
      feeder.add({
        url: alertHubUtils.generateURLForTheFeed(
          {
            resource: "github",
            repository,
            type,
            params: config.repositories.github[type][repository],
          },
          // config,
        ),
        refresh: config.interval,
      });
    }
  } else {
    for (const repository of config.repositories.github[type]) {
      feeder.add({
        url: alertHubUtils.generateURLForTheFeed(
          {
            resource: "github",
            repository,
            type,
          },
          // config,
        ),
        refresh: config.interval,
      });
    }
  }
}

// GitLab feeds
for (const type of Object.keys(config.repositories.gitlab)) {
  if (type === "commits") {
    for (const repository of Object.keys(config.repositories.gitlab[type])) {
      for (const subType of config.repositories.gitlab[type][repository]) {
        if (subType === "*") {
          feeder.add({
            url: alertHubUtils.generateURLForTheFeed(
              {
                resource: "gitlab",
                repository,
                type,
              },
              // config,
            ),
            refresh: config.interval,
          });
        } else {
          feeder.add({
            url: alertHubUtils.generateURLForTheFeed(
              {
                resource: "gitlab",
                repository,
                type,
                subType,
              },
              // config,
            ),
            refresh: config.interval,
          });
        }
      }
    }
  } else {
    for (const repository of config.repositories.gitlab[type]) {
      feeder.add({
        url: alertHubUtils.generateURLForTheFeed(
          {
            resource: "gitlab",
            repository,
            type,
          },
          // config,
        ),
        refresh: config.interval,
      });
    }
  }
}

for (const feed of config.extras) {
  feeder.add({
    url: feed,
    refresh: config.interval,
  });
}

// Dummy feed that updates regularly
/* feeder.add({
  url: 'https://lorem-rss.herokuapp.com/feed?unit=second&interval=10',
  refresh: 2000,
}); */

// First, the notification part to alert the user
feeder.on("new-item", async (item) => {
  // console.log(item);

  // Past (Current) feeds are also pushed to feed on initial boot
  // This may cause serious notification/mail traffic after a possible crash
  // That's why we make a simple time check to make sure feeds are new
  const date = new Date(item.date);
  // Let's compare the dates and make sure the feed is a new feed.
  if (date.getTime() > bootDate.getTime()) {
    logger.info({ title: item.title, date: item.date }, "New release found");

    const feedData = alertHubUtils.parseFeedData(item);

    // First, try to send the push notifications
    if (config.notifications.pushbullet.enabled === true) {
      await pushBulletUtils.sendPushBulletNotification(
        config.notifications.pushbullet,
        feedData,
      );
    }
    if (config.notifications.pushover.enabled === true) {
      await pushOverUtils.sendPushOverNotification(
        config.notifications.pushover,
        feedData,
      );
    }
    // Now try to send the email
    if (config.notifications.email.enabled === true) {
      await emailUtils.sendEmailNotification(
        config.notifications.email,
        feedData,
      );
    }
    // Now try to send the Telegram notification
    if (config.notifications.telegram.enabled === true) {
      await telegramUtils.sendTelegramNotification(
        config.notifications.telegram,
        feedData,
      );
    }

    logger.info(
      { title: item.title },
      "Successfully notified about the release",
    );
  }
});
// Notification part END

// Handling errors on feed emitter
feeder.on("error", (error) => {
  logger.error({ error }, "Feed emitter error");
});
// Error handling, currently done to console

// Let's handle the aggregated RSS part
if (config.rss.enabled === true) {
  const rssUtils = new RssGenerator(config);
  http
    .createServer((_req, res) => {
      res.writeHead(200, { "Content-Type": "application/xml" });
      // Upon each request, let's fetch the RSS feed string from util
      rssUtils
        .createRSSFeed(config)
        .then((rssFeed) => {
          res.end(rssFeed);
        })
        .catch((error) => {
          logger.error({ error: error.message }, "Failed to generate RSS feed");
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Internal Server Error");
        });
    })
    .listen(config.rss.port);
  logger.info({ port: config.rss.port }, "AlertHub RSS Feed server running");
}
