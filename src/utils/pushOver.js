const PushOver = require('pushover-notifications');

// Strip tags is to remove HTML before sending to Pushbullet.
const striptags = require('striptags');

// Send the push notification.
// Todo: why bother with async / await at all ?
async function sendPushNotification(config, feedData) {
  return await new Promise((resolve, reject) => {
    const pusher = new PushOver({
      user: config.notifications.pushover.config.user,
      token: config.notifications.pushover.config.token,
    });
    const msg = {
      message: striptags(feedData.description) + "\n\n" + feedData.link,
      title: feedData.title,
    };
    pusher.send(msg, (err, result) => {
      if (err) {
        reject(err);
        //throw err
        return false;
      }
      resolve(result);
      return result;
    });
  });
}

module.exports = {
  sendPushNotification,
};
