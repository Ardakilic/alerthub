const PushBullet = require('pushbullet');

// Strip tags is to remove HTML before sending to Pushbullet.
const striptags = require('striptags');

// Send the push notification.
// Todo why bother with async / await at all ?
async function sendPushNotification(config, feedData) {
  const pusher = new PushBullet(config.notifications.pushbullet.accessToken);
  await pusher.link(
    {},
    feedData.title, feedData.link,
    striptags(feedData.description),
    (error, response) => {
      if (error) {
        return false;
      }
      // console.log('Push notification sent successfully!');
      return response;
    }
  );
}

module.exports = {
  sendPushNotification,
};
