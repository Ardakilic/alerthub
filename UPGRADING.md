# Upgrading Guide

## 2.0.0 to 2.1.0
- Stop the aplication
- Copy the `githubToken` key from example to your current config
- Copy the `repositories.github.issues` section from example to your current config
- Re-start the application.

## 1.3.0 to 2.0.0
- Stop the application
- Backup your configuration file to somewhere outside the application
- Download the new version, install the dependencies
- Publish the new configuration file
- Paste your current repositories to according sections
- Re-start the application

## 1.2.1 to 1.3.0

- Stop the application.
- Copy the `notifications.pushover` section from the example config, and alter your configuration file and update for your needs.
- Re-start the application.

## 1.1.0 to 1.2.0

- Stop the application.
- Check the `repositories` section from your config, and alter your configuration file based on `/etc/config.example.js` and update for your needs.
- Re-start the application.

## 1.0.0 to 1.1.0

- Stop the application.
- Add the `rss` section to your config from `/etc/config.example.js` and edit for your needs.
- Run `npm install` to install new dependencies.
- Re-start the application.
