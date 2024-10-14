import mail from 'nodemailer';
import striptags from 'striptags';

export default {
  // Sends and e-mail notification to provided user
  async sendEmailNotification(config, feedData) {
    const transporter = mail.createTransport(config.config);

    /* await smtp.verify((error, success) => {
      if (error) {
        // console.log(error);
        return false;
      }
      // successful smtp
    }); */
    // E-mail options that will be used by nodemailer
    const mailOptions = {
      from: config.mailOptions.from,
      to: config.mailOptions.to,
      subject: config.mailOptions.subjectPrefix.length > 0 ? `${config.mailOptions.subjectPrefix} - ${feedData.title}` : feedData.title,
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
      // return Promise.resolve(info);
      return info;
    });
  },
}
