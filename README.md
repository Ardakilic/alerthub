AlertHub
--------

```
   _   _           _                _
  /_\ | | ___ _ __| |_  /\  /\_   _| |__
 //_\\| |/ _ \ '__| __|/ /_/ / | | | '_ \
/  _  \ |  __/ |  | |_/ __  /| |_| | |_) |
\_/ \_/_|\___|_|   \__\/ /_/  \__,_|_.__/
```

AlertHub is a simple tool written with NodeJS to get alerted from GitHub releases.

When you watch a release, you also auto watch the issues and comments etc., however if you want to only follow new releases, there isn't a way to achieve this from GitHub directly.

There's been a service called sibbell.com, but they'll be shutting down on 15th May, 2018. That's why, I decided to make one for myself.

This simple cli tool watches the releases set in config, and notifies you with E-mail or PushBullet.

Requirements
--------
* NodeJS 8.x or newer
* (Optional) PushBullet Api Key
* (Optional) SMTP credentials

Either one of the PushBullet or the SMTP credentials are required to get notifications.

Installation
--------
You can install and run alerthub with some simple steps:

1. Clone this repository or get the latest release version
2. Navigate to the folder, and run `npm install` to install dependencies
3. Run `npm run init` to copy the configuration file
4. Edit `etc/config.js`, and fill your credentials.
5. Run `npm start` or something like `pm2 start npm -- start` and run the application.

Installation
--------
You can also run alerthub through a Docker container. See [kmlucy/docker-alerthub](https://github.com/kmlucy/docker-alerthub).

TODOs
--------
* A portable storage solution such as SQLite etc.
* Multi user feature
* [You say!](https://github.com/Ardakilic/alerthub/issues/new)

License
--------
MIT

Buy me a coffee or beer!
--------
Donations are kindly accepted to help develop my projects further.

BTC: 1QFHeSrhWWVhmneDBkArKvpmPohRjpf7p6

ETH / ERC20 Tokens: 0x3C2b0AC49257300DaB96dF8b49d254Bb696B3458

NEO / Nep5 Tokens: AYbHEah5Y4J6BV8Y9wkWJY7cCyHQameaHc
