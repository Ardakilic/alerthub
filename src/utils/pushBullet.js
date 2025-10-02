import PushBullet from "pushbullet";

// Strip tags is to remove HTML before sending to Pushbullet.
import striptags from "striptags";
import logger from "./logger.js";

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
            logger.error({ error }, "Failed to send PushBullet notification");
            resolve(false);
          } else {
            logger.info("PushBullet notification sent successfully");
            resolve(response);
          }
        },
      );
    });
  },
};
