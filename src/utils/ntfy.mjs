// https://www.npmjs.com/package/ntfy
import {publish, MessagePriority} from 'ntfy';

// Strip tags is to remove HTML before sending to Pushbullet.
import striptags from 'striptags';

// Send the push notification.
// Todo: why bother with async / await at all ?
export default class ntfyUtils {
  static async sendNtfyNotification(config, feedData) {

    // subject: config.notifications.email.mailOptions.subjectPrefix.length > 0 ? `${config.notifications.email.mailOptions.subjectPrefix} - ${feedData.title}` : feedData.title,
    // text: `${feedData.link}\n${striptags(feedData.description)}`,
    // html: `<a target="_blank" href="${feedData.link}">${feedData.title}</a><br><br>${feedData.description}`,

	//'dantesbr_alerts'

    // @ts-ignore
	await publish({
		topic: config.notifications.ntfy.config.topic,
		priority: config.notifications.ntfy.config.priority.length > 0 ? config.notifications.ntfy.config.priority : MessagePriority.DEFAULT,
		title: feedData.title,
		message: `${feedData.link}\n${striptags(feedData.description)}`,
		tags: ['warning', 'computer'],
		//iconURL: '',
		//clickURL: feedData.link,
		actions: [{
			clear: false,
			label: `Open ${feedData.title}`,
			type: 'view',
			url: feedData.link
		}]
	});
  }
}
