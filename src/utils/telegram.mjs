import TelegramBot from 'node-telegram-bot-api';

// Strip tags is to remove HTML before sending to Pushbullet.
import striptags from 'striptags';

// Sends telegram notification
export default class telegramUtils {
  static async sendTelegramNotification(config, feedData) {
    // replace the value below with the Telegram token you receive from @BotFather
    const token = config.notifications.telegram.config.token;
	
    // read the doc from https://github.com/yagop/node-telegram-bot-api to know how to catch the chatId
    const chatId = config.notifications.telegram.config.chatid;
    
    const bot = new TelegramBot(token, { polling: false });
    
	try {
	    let details = { 
		  link: `<a target="_blank" href="${feedData.link}">${feedData.title}</a>`,
		  description: feedData.description
	    };
		
        bot.sendMessage(chatId, `${feedData.link}\n${striptags(feedData.description)}` + '\n\n<pre>' + JSON.stringify(details, null, 2) + '</pre>', {
          parse_mode: 'html'
        });
    } catch (err) {
        console.log('Something went wrong when trying to send a Telegram notification', err);
    }
  }
}
