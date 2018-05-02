// Strip tags is to remove HTML before sending to Pushbullet.
const striptags = require('striptags');
const PushBullet = require('pushbullet');
const mail = require('nodemailer');

// Because there's external feeds supported
// we need this method to check whether the feed is from GitHub or not
function isFeedFromGitHub(item) {
  if (item.guid !== undefined && item.guid !== null && typeof item.guid === 'string') {
    if (item.guid.substring(0, 14) === 'tag:github.com') {
      return true;
    }
  }
  return false;
}

// Because there's no release name in GitHub feed, we steal from URL
function getReleaseNameFromGitGubFeedData(item) {
  // if (isFeedFromGitHub(item)) {
  const parts = item.link.split('/');
  return `${parts[3]}/${parts[4]}`;
  // }
  // return '';
}

// Standardize the new feed element
function parseFeedData(feedData) {
  const parsedFeed = {
    title: feedData.title,
    link: feedData.link,
    description: feedData.description,
    // summary: feedData.summary,
    date: feedData.date,
  };

  // We need to prepend release name to the title
  if (isFeedFromGitHub(feedData)) {
    parsedFeed.title = `${getReleaseNameFromGitGubFeedData(feedData)} - ${feedData.title}`;
  }

  return parsedFeed;
}

// Send the push notification.
// Todo why bother with async / await at all ?
async function sendPushNotification(config, feedData) {
  if (config.notifications.pushbullet.enabled === true) {
    const pusher = new PushBullet(config.notifications.pushbullet.accessToken);
    await pusher.link(
      {},
      feedData.title, feedData.link,
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

  return false;
}

// Sends and e-mail notification to provided user
async function sendEmailNotification(config, feedData) {
  if (config.notifications.smtp.enabled === true) {
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

  return false;
}

module.exports = {
  parseFeedData,
  sendPushNotification,
  sendEmailNotification,
};
