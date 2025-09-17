AlertHub
--------

```
   _   _           _                _
  /_\ | | ___ _ __| |_  /\  /\_   _| |__
 //_\\| |/ _ \ '__| __|/ /_/ / | | | '_ \
/  _  \ |  __/ |  | |_/ __  /| |_| | |_) |
\_/ \_/_|\___|_|   \__\/ /_/  \__,_|_.__/
```

AlertHub is a simple tool written with NodeJS to get alerted from GitHub and GitLab releases, tags and commits.

When you watch a release over GitHub, you also auto watch the issues and comments etc., however if you want to only follow new releases, or only commits or tags, there isn't a way to achieve this from GitHub directly.

There's been a service called sibbell.com, but they shut down on 15th May, 2018. That's why, I decided to make one for myself.

This simple cli tool watches the releases set in config, and notifies you with E-mail or PushBullet, and provides you an aggregated RSS feed which you can use in IFTTT or your personal feed reader.

**Update 2018.11.28:** GitHub now supports following the repositories' releases, however, it's still buggy for me, and they still don't cover the push notification feature which this tool offers.

## Features

Some people still wonder why this tool, which was released before GitHub release feature announced, yet exists, so I wanted to list the features as a bullet list:

* You can watch GitHub releases, tags, commits and issues
* ~~You can also watch private GitHub repositories by providing an access token~~
* You can watch GitLab tags and commits
* You can watch 3rd party releases which are neither from GitHub nor GitLab
* You can get notified with e-mail when a new update to your watch list is published
* You can also get notified with push notification, using services PushBullet and / or PushOver
* You can also get notified using Telegram bots. Just put your bot to the channels, or get your chat id, provide the bot token and your updates will be carried through the Telegram bot.
* You can generate an aggreagated RSS feed with this tool for all your watches, which is sorted by date, and use this aggregated feed to source to your favorite news reader application, or to pipe to services such as IFTTT etc.
* Self-hosted. Also, no GUI. You can simply set it and forget it

## Requirements

* NodeJS 20.x or newer
* (Optional) PushBullet Api Key
* (Optional) PushOver Api Key
* (Optional) SMTP credentials to dispatch e-mail
* (Optional) Telegram API key and Chat ID for the messages to be dispatched.

## Installation

You can install and run AlertHub with some simple steps:

1. Clone this repository or get the latest release version.
2. Navigate to the repository's folder, and run `npm install` to install dependencies.
3. Copy `.env.example` to `.env` and fill in your configuration values.
4. Run `npm start` or something like `pm2 start npm -- start` and run the application.

## Configuration

AlertHub now uses environment variables for configuration. Copy the `.env.example` file to `.env` and modify the values according to your needs:

```bash
cp .env.example .env
```

### Environment Variables

The configuration supports the following environment variables:

#### Application Settings
- `INTERVAL`: Feed check interval in milliseconds (default: 60000)
- `USER_AGENT`: User agent string for HTTP requests
- `GITHUB_TOKEN`: GitHub token to bypass rate limits and access private repos
- `LOG_LEVEL`: Logging level (debug, info, warn, error) (default: info)

#### Notification Settings
**PushBullet:**
- `PUSHBULLET_ENABLED`: Enable PushBullet notifications (true/false)
- `PUSHBULLET_ACCESS_TOKEN`: Your PushBullet access token

**PushOver:**
- `PUSHOVER_ENABLED`: Enable PushOver notifications (true/false)
- `PUSHOVER_USER`: PushOver user key
- `PUSHOVER_TOKEN`: PushOver application token

**Email:**
- `EMAIL_ENABLED`: Enable email notifications (true/false, default: true)
- `EMAIL_HOST`: SMTP server hostname
- `EMAIL_PORT`: SMTP server port (default: 465)
- `EMAIL_SECURE`: Use secure connection (true/false, default: true)
- `EMAIL_AUTH_USER`: SMTP username
- `EMAIL_AUTH_PASS`: SMTP password
- `EMAIL_FROM`: From email address
- `EMAIL_TO`: Recipient email address(es)
- `EMAIL_SUBJECT_PREFIX`: Subject line prefix

**Telegram:**
- `TELEGRAM_ENABLED`: Enable Telegram notifications (true/false)
- `TELEGRAM_TOKEN`: Telegram bot token
- `TELEGRAM_CHAT_ID`: Telegram chat ID

#### RSS Feed Settings
- `RSS_ENABLED`: Enable RSS feed server (true/false, default: true)
- `RSS_PORT`: RSS server port (default: 3444)
- `RSS_TITLE`: RSS feed title
- `RSS_DESCRIPTION`: RSS feed description
- `RSS_INCLUDE_FROM_EACH_REPOSITORY`: Number of releases per repository (default: 10)
- `RSS_COUNT`: Total number of items in feed (default: 50)
- `RSS_SITE_URL`: Site URL for the RSS feed
- `RSS_FEED_URL`: Feed URL for self-reference

#### Repository Configuration
For repositories, you can use JSON format in environment variables:

- `GITHUB_RELEASES`: JSON array of GitHub repositories for releases
- `GITHUB_TAGS`: JSON array of GitHub repositories for tags
- `GITHUB_COMMITS`: JSON object mapping repositories to branch arrays
- `GITHUB_ISSUES`: JSON object mapping repositories to issue filter objects
- `GITLAB_TAGS`: JSON array of GitLab repositories for tags
- `GITLAB_COMMITS`: JSON object mapping repositories to branch arrays
- `EXTRAS`: JSON array of direct RSS feed URLs

Example:
```bash
GITHUB_RELEASES='["Ardakilic/alerthub","expressjs/express"]'
GITHUB_COMMITS='{"laravel/laravel":["*"],"acikkaynak/acikkaynak":["master"]}'
```

## Docker Container

### Using Environment Variables (Recommended)

Create a `.env` file with your configuration and run:

```bash
docker run --name alerthub -d --env-file .env -p 3444:3444 ghcr.io/ardakilic/alerthub:2
```

### Using Individual Environment Variables

```bash
docker run --name alerthub -d \
  -e GITHUB_RELEASES='["Ardakilic/alerthub","expressjs/express"]' \
  -e EMAIL_ENABLED=true \
  -e EMAIL_HOST=smtp.example.com \
  -e EMAIL_AUTH_USER=your@email.com \
  -e EMAIL_AUTH_PASS=yourpassword \
  -e EMAIL_TO=recipient@email.com \
  -p 3444:3444 \
  ghcr.io/ardakilic/alerthub:2
```

## Changelog

I'll keep track of each release in the [CHANGELOG.md](./CHANGELOG.md).

## Upgrading

Please refer to [UPGRADING.md](./UPGRADING.md).

## TODOs / Plans

* ~~Telegram Notifications~~
* ~~Following GitLab releases~~
* Following BitBucket releases
* Multi user feature
* Per-repository webhooks
* ~~Aggregated RSS~~
* ~~Following commits and tags in addition to releases~~
* ~~PushOver integration~~
* ~~Following commits from a specific branch (GitHub and GitLab)~~
* Find a way to bring back GitHub private repositories support [#80](https://github.com/Ardakilic/alerthub/issues/80)
* Gitea support [#88](https://github.com/Ardakilic/alerthub/issues/88)
* [You say!](https://github.com/Ardakilic/alerthub/issues/new)

## License

[MIT](./LICENSE)

## Buy me a coffee or beer!

Donations are kindly accepted to help develop my projects further.

BTC: 1QFHeSrhWWVhmneDBkArKvpmPohRjpf7p6

ETH / ERC20 Tokens: 0x3C2b0AC49257300DaB96dF8b49d254Bb696B3458

Stellar (XLM): GBTYNE5RDGH44E7VH4DNYB4NV72GCV5VUH6PJLCJY27JZRO2K7XUML2Q
