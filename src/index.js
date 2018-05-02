// First, let's require the libraries
const config = require('../etc/config');
const utils = require('./utils/alertHubUtils');
const RssFeedEmitter = require('rss-feed-emitter');

// RSS Feed emitter to watch and parse feed
const feeder = new RssFeedEmitter();

const bootTime = new Date();
console.log(`Application booted at ${bootTime}`);

// First, let's add all the feed lists
config.repositories.forEach((feed) => {
  feeder.add({
    url: `https://github.com/${feed}/releases.atom`,
    refresh: config.interval,
  });
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

feeder.on('new-item', async (item) => {
  // console.log(item);
  console.log(`New release found! ${item.title}!`);

  // Past (Current) feeds are also pushed to feed on initial boot
  // This may cause serious notification/mail traffic after a possible crash
  // That's why we make a simple time check to make sure feeds are new
  const date = new Date(item.date);
  // Let's compare the dates and make sure the feed a new feed.
  if (date.getTime() > bootTime.getTime()) {
    const feedData = utils.parseFeedData(item);
    // First, try to send the push notification
    await utils.sendPushNotification(config, feedData);

    // Now try to send the email
    await utils.sendEmailNotification(config, feedData);

    console.log(`Successfully notified about the release: ${item.title}!`);
  }
});

