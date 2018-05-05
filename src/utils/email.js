const mail = require('nodemailer');
const striptags = require('striptags');

// Sends and e-mail notification to provided user
async function sendEmailNotification(config, feedData) {
  const transporter = mail.createTransport(config.notifications.smtp.config);

  /* await smtp.verify((error, success) => {
    if (error) {
      // console.log(error);
      return false;
    }
    // successful smtp
  }); */
  // E-mail options that will be used by nodemailer
  const mailOptions = {
    from: config.notifications.smtp.mailOptions.from,
    to: config.notifications.smtp.mailOptions.to,
    subject: config.notifications.smtp.mailOptions.subjectPrefix.length > 0 ? `${config.notifications.smtp.mailOptions.subjectPrefix} - ${feedData.title}` : feedData.title,
    text: `${feedData.link}\n${striptags(feedData.description)}`,
    html: `<a target="_blank" href="${feedData.link}">${feedData.title}</a><br><br>${feedData.description}`,
  };

  // send mail with defined transport object
  await transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      // console.log(error);
      return false;
    }
    // console.log('Message sent: %s', info.messageId);
    return info;
  });
}

module.exports = {
  sendEmailNotification,
};
