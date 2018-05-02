module.exports = {
  interval: 6000, // Feed check interval
  notifications: {
    pushbullet: {
      enabled: false,
      accessToken: 'XXX',
    },
    smtp: {
      enabled: true,
      config: { // Nodemailer configuration
        host: 'smtp.service.com',
        port: 465,
        secure: true,
        auth: {
          user: 'smtp@user.com',
          pass: 'password',
        },
      },
      mailOptions: {
        from: '"AlertHub" <smtp@user.com>', // from field, can be pure e-mail or "Name" <e-mail> format
        to: 'your@email.com', // Your Email, can add more e-mails by commas
        subjectPrefix: 'New GitHub Release', // Subject prefix
      },
    },
  },
  repositories: [
    'ardakilic/alerthub', // can be resolved as https://github.com/ardakilic/alerthub
    'expressjs/express',
    'Unitech/pm2',
    'facebook/react',
  ],
  extras: [
    // direct rss links from other sources if you want to watch in this tool
  ],
};
