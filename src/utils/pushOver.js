import PushOver from "pushover-notifications";
import striptags from "striptags";

export default {
  // Send the push notification.
  async sendPushOverNotification(config, feedData) {
    return new Promise((resolve, reject) => {
      const pusher = new PushOver({
        user: config.config.user,
        token: config.config.token,
      });
      const msg = {
        message: `${striptags(feedData.description)}\n\n${feedData.link}`,
        title: feedData.title,
      };
      pusher.send(msg, (err, result) => {
        if (err) {
          reject(err);
          // throw err;
          return false;
        }
        resolve(result);
        return result;
      });
    });
  },
};
