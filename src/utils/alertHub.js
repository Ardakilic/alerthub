const URL = require('url');
const querystring = require('querystring');
// Because there are also feeds,
// we need this method to check whether the feed is from GitHub or not
function isFeedFromGitHub(item) {
  if (item.guid !== undefined && item.guid !== null && typeof item.guid === 'string') {
    if (item.guid.substring(0, 14) === 'tag:github.com') {
      return true;
    }
  }
  return false;
}

function isFeedFromGitLab(item) {
  const parsedURL = URL.parse(item.url);
  if (parsedURL.hostname === 'gitlab.com') {
    return true;
  }
  return false;
}

// Because there's no release name in GitHub feed, we steal from URL
function getReleaseNameFromGitHubAndGitLabFeedLink(link) {
  const parts = link.split('/');
  return `${parts[3]}/${parts[4]}`;
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
  if (isFeedFromGitHub(feedData) === true || isFeedFromGitLab(true)) {
    parsedFeed.title = `${getReleaseNameFromGitHubAndGitLabFeedLink(feedData.link)} - ${feedData.title}`;
  }

  return parsedFeed;
}

// Generates the RSS feed URL with given parameters honoring the configuration
function generateURLForTheFeed(options, config) {
  if (options.resource === 'github') {
    const optionalGitHubAccessToken = config.githubToken !== null ? `?token=${config.githubToken}` : '';
    if (options.type === 'issues') {
      return `https://issue-tracker-rss.now.sh/${options.repository}?${querystring.encode(options.params)}`;
    }
    if (Object.prototype.hasOwnProperty.call(options, 'subType')) {
      return `https://www.github.com/${options.repository}/${options.type}/${options.subType}.atom${optionalGitHubAccessToken}`;
    }
    return `https://www.github.com/${options.repository}/${options.type}.atom${optionalGitHubAccessToken}`;
  }

  if (options.resource === 'gitlab') {
    if (Object.prototype.hasOwnProperty.call(options, 'subType')) {
      return `https://gitlab.com/${options.repository}/-/${options.type}/${options.subType}?format=atom`;
    }
    return `https://gitlab.com/${options.repository}/-/${options.type}?format=atom`;
  }

  return '';
}

module.exports = {
  parseFeedData,
  generateURLForTheFeed,
  // These bottom  methods are for rss braider plugin to prepend release name to feed title
  isFeedFromGitHub,
  isFeedFromGitLab,
  getReleaseNameFromGitHubAndGitLabFeedLink,
};
