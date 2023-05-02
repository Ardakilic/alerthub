// todo tomorrow

const TelegramBot = require('node-telegram-bot-api');

// replace the value below with the Telegram token you receive from @BotFather
const token = YOUR_TOKEN;
// read the doc from https://github.com/yagop/node-telegram-bot-api to know how to catch the chatId
const chatId = CHAT_ID;

const bot = new TelegramBot(token, { polling: false });

const telegrambot = (message, json) => {
  try {
    bot.sendMessage(chatId, message + '\n\n<pre>' + JSON.stringify(json, null, 2) + '</pre>', {
      parse_mode: 'html'
    });
  } catch (err) {
    console.log('Something went wrong when trying to send a Telegram notification', err);
  }
}

const ACTIONS = {
  NEW_USER: '🙋‍♂️new user',
  NEW_MONITOR: '🖥 new monitor',
  LATENCY: '👨‍💻 somebody has used the latency tool',
  NEW_STATUS_PAGE: '📈 new status page',
  NEW_SUBSCRIPTION: '💰💰💰 a user has subscribed!',
  NEW_PAYMENT: '🤑 a payment has processed',
  WEEKLY_REPORTS_SENDING: '✴️ Weekly reports are being sent',
  WEEKLY_REPORTS_SENT: '✅ Weekly reports have been sent',
  END_TRIAL_USERS: '✋ end of trial users today',
  TRIAL_USERS_SOON_END: '👀 users that end their trials in 3 days',
}

module.exports = {
  telegrambot,
  ACTIONS
}

export default class telegramUtils {
  // Sends telegram notification
  static async sendTelegramNotification(config, feedData) {
    const transporter = mail.createTransport(config.notifications.email.config);

    /* await smtp.verify((error, success) => {
      if (error) {
        // console.log(error);
        return false;
      }
      // successful smtp
    }); */
    // E-mail options that will be used by nodemailer
    const mailOptions = {
      from: config.notifications.email.mailOptions.from,
      to: config.notifications.email.mailOptions.to,
      subject: config.notifications.email.mailOptions.subjectPrefix.length > 0 ? `${config.notifications.email.mailOptions.subjectPrefix} - ${feedData.title}` : feedData.title,
      text: `${feedData.link}\n${striptags(feedData.description)}`,
      html: `<a target="_blank" href="${feedData.link}">${feedData.title}</a><br><br>${feedData.description}`,
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        // console.log(error);
        return false;
      }
      // console.log('Message sent: %s', info.messageId);
      return info;
    });
  }
}
