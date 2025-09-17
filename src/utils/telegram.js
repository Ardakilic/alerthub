import TelegramBot from 'node-telegram-bot-api';

export default {
  // Sends a Telegram notification to the provided user
  async sendTelegramNotification(config, feedData) {
    const bot = new TelegramBot(config.config.token, { polling: false });

    try {
      const result = await bot.sendMessage(config.config.chatId, `${feedData.title}\n\n${feedData.description}\n\n${feedData.link}`);
      return result;
    } catch (error) {
      console.error('Telegram notification failed:', error);
      return false;
    }
  }
}
