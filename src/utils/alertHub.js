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
function getReleaseNameFromGitHubFeedLink(link) {
  // if (isFeedFromGitHub(item)) {
  const parts = link.split('/');
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
  if (isFeedFromGitHub(feedData) === true) {
    parsedFeed.title = `${getReleaseNameFromGitHubFeedLink(feedData.link)} - ${feedData.title}`;
  }

  return parsedFeed;
}

module.exports = {
  parseFeedData,
  // These bottom two are for rss braider plugin to prepend release name to feed title
  isFeedFromGitHub,
  getReleaseNameFromGitHubFeedLink,
};
