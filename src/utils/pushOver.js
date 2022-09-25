import PushOver from 'pushover-notifications';
import striptags from 'striptags';

export default class PushOverUtils {
  // Send the push notification.
  // Todo: why bother with async / await at all ?
  static async sendPushOverNotification(config, feedData) {
    return new Promise((resolve, reject) => {
      const pusher = new PushOver({
        user: config.notifications.pushover.config.user,
        token: config.notifications.pushover.config.token,
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
  }
}
