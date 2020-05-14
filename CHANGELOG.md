# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2020-05-10
### Added
- You can now track GitHub issues, thanks to [kadir96/issue-tracker-rss](https://github.com/kadir96/issue-tracker-rss) 🎉
- You can now track private GitHub repositories' feeds by providing a personal access token 🎉

## [2.0.0] - 2020-05-10
### Added
- You can now track GitLab repositories with this tool 🎉
- You can now follow specific branches' commits from GitHub and GitLab 🎉
- `config.rss.logLevel` variable added for console output when a new release is found. Values are debug, `info`, `warn`, `err`, `off`
- `config.userAgent` variable added to bypass the public fetch limit of RSS feeds from GitHub etc.

### Fixed
- All dependencies updated.

### Changed
- Configuration file changed a bit, so it's strongly suggested to backup the old one, re-publish the new one with `npm run init` and re-fill the required information. Mostly, the `repositories` section now holds separate subsections for GitHub and GitLab.

## [1.3.0] - 2020-01-18
### Added
- PushOver feature implemented.

### Fixed
- RSS Feed Emitter is currently required from master branch until a new release is published to prevent the sub-dependency vulnerabilities to be carried along here.
- All dependencies updated.

## [1.2.1] - 2018-11-28
### Fixed
- Updated dependency due to CVE-2018-1000620. [Details here](https://github.com/filipedeschamps/rss-feed-emitter/pull/173).

### Changed
- Other dependencies are updated to newer versions.

## [1.2.0] - 2018-05-16
### Added
- You can now follow tags and commits in addition to GitHub releases! 🎉


## [1.1.0] - 2018-05-05
### Added
- RSS feature added! 🎉 You can also track the changes from RSS feed with your favourite tool or connect to a service such as IFTTT!

### Changed
- Utils are splitted more more splitted.

### Fixed
- Readme was telling wrong file to edit. Typo fixed.
- The code is now %100 Eslint AirBNB standards compatible.

## [1.0.0] - 2018-05-03
### Initial Release
- Initial Release
