import PushBullet from "pushbullet";

// Strip tags is to remove HTML before sending to Pushbullet.
import striptags from "striptags";

// Send the push notification.
export default {
  async sendPushBulletNotification(config, feedData) {
    const pusher = new PushBullet(config.accessToken);

    return new Promise((resolve, _reject) => {
      pusher.link(
        {},
        feedData.title,
        feedData.link,
        striptags(feedData.description),
        (error, response) => {
          if (error) {
            resolve(false);
          } else {
            // console.log('Push notification sent successfully!');
            resolve(response);
          }
        },
      );
    });
  },
};
