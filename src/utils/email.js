import * as mail from "nodemailer";
import striptags from "striptags";
import logger from "./logger.js";

export default {
  // Sends and e-mail notification to provided user
  async sendEmailNotification(config, feedData) {
    const transporter = mail.createTransport(config.config);

    /* await smtp.verify((error, success) => {
      if (error) {
        logger.error({ error }, 'SMTP verification failed');
        return false;
      }
      // successful smtp
    }); */
    // E-mail options that will be used by nodemailer
    const mailOptions = {
      from: config.mailOptions.from,
      to: config.mailOptions.to,
      subject:
        config.mailOptions.subjectPrefix.length > 0
          ? `${config.mailOptions.subjectPrefix} - ${feedData.title}`
          : feedData.title,
      text: `${feedData.link}\n${striptags(feedData.description)}`,
      html: `<a target="_blank" href="${feedData.link}">${feedData.title}</a><br><br>${feedData.description}`,
    };

    // send mail with defined transport object
    return new Promise((resolve, _reject) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          logger.error({ error }, "Failed to send email");
          resolve(false);
        } else {
          logger.info({ messageId: info.messageId }, "Email sent successfully");
          resolve(info);
        }
      });
    });
  },
};
