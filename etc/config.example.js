const config = {
  interval: 60000, // Feed check interval, in miliseconds
  userAgent: 'Mozilla/5.0 (Linux x86_64; rv:76.0) Gecko/20100101 Firefox/76.0', // Experimental: User agent string to bypass possible fetching limits on GitHub
  /**
   * Provide your GitHub token below to bypass the rate limit
   * and to get notified from private repositories
   */
  githubToken: null,
  notifications: {
    pushbullet: {
      enabled: false,
      accessToken: 'PUSHBULLET_TOKEN',
    },
    pushover: {
      enabled: false,
      config: {
        user: 'PUSHOVER_USER',
        token: 'PUSHOVER_TOKEN',
      },
    },
    email: {
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
        to: 'your@email.com', // Your e-mail, can add more e-mails by commas
        subjectPrefix: 'New GitHub Release', // Subject prefix
      },
    },
  },
  rss: {
    enabled: true,
    port: 3444,
    title: 'AlertHub RSS', // Feed Title
    description: 'My Awesome GitHub Release Aggregator', // Feed Description
    includeFromEachRepository: 10, // How many releases/items will be fetched from each repository
    count: 50, // How many elements will be there in the feed
    siteUrl: 'https://github.com/Ardakilic/alerthub', // Site url shown on the feed
    feedUrl: null, // Fills: <atom:link href="feedurl" rel="self" type="application/rss+xml"/>
    logLevel: 'info', // debug, info, warn, err, off
  },
  repositories: {
    github: {
      releases: [
        'Ardakilic/alerthub', // can be resolved as https://github.com/Ardakilic/alerthub
        'expressjs/express',
        'Unitech/pm2',
        'facebook/react',
      ],
      tags: [

      ],
      commits: {
        'laravel/laravel': ['*'], // All commits of https://github.com/Laravel/laravel regardless of the branch
        'acikkaynak/acikkaynak': ['master'], // only commits at master branch of https://github.com/acikkaynak/acikkaynak
        'acikkaynak/acikkaynak-website': ['master', 'development'], // master and development branches of https://github.com/acikkaynak/acikkaynak-website
      },
      issues: {
        'denoland/deno': { // The below will be converted to GitHub API querystring parameters, feel free to edit accordingly
          state: 'all', // all, open, closed
          labels: '', // leave blank for all labels, or add comma for multiple labels
        },
      },
    },
    gitlab: {
      // releases: [], // Gitlab doesn't support this yet. Use tags instead for the time being
      tags: [
        'gitlab-org/gitlab-foss', // Can be resolved as https://gitlab.com/gitlab-org/gitlab-foss/
      ],
      commits: {
        'gitlab-org/gitlab-foss': ['master'], // resolves as https://gitlab.com/gitlab-org/gitlab-foss/-/commits/master . You can follow multiple branches this way.
      },
    },
  },
  extras: [
    // direct rss links from other sources if you want to watch with this tool
  ],
};
export { config }
