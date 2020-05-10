const mail = require('nodemailer');
const striptags = require('striptags');

// Sends and e-mail notification to provided user
async function sendEmailNotification(config, feedData) {
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

module.exports = {
  sendEmailNotification,
};
