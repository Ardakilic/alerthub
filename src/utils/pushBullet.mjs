import PushBullet from 'pushbullet';

// Strip tags is to remove HTML before sending to Pushbullet.
import striptags from 'striptags';

// Send the push notification.
// Todo: why bother with async / await at all ?
export default class PushBulletUtils {
  static async sendPushBulletNotification(config, feedData) {
    const pusher = new PushBullet(config.notifications.pushbullet.accessToken);
    // @ts-ignore
    await pusher.link(
      {},
      feedData.title,
      feedData.link,
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
}
