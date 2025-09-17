// CommonJS wrapper for alertHub utils for use by rss-braider plugins
const URL = require('node:url');
const querystring = require('node:querystring');

module.exports = {
  // Because there are also feeds,
  // we need this method to check whether the feed is from GitHub or not
  isFeedFromGitHub(item) {
    if (item.guid !== undefined && item.guid !== null && typeof item.guid === 'string') {
      if (item.guid.substring(0, 14) === 'tag:github.com') {
        return true;
      }
    }
    return false;
  },

  isFeedFromGitLab(item) {
    if (!item.url || typeof item.url !== 'string') {
      return false;
    }
    const parsedURL = URL.parse(item.url);
    return parsedURL && (
      parsedURL.hostname === 'gitlab.com'
      || (parsedURL.hostname && parsedURL.hostname.includes('gitlab'))
    );
  },

  getReleaseNameFromGitHubAndGitLabFeedLink(url) {
    if (!url || typeof url !== 'string') return 'unknown/repo';

    const parsedURL = URL.parse(url);
    if (!parsedURL || !parsedURL.pathname) return 'unknown/repo';

    const pathParts = parsedURL.pathname.split('/').filter(part => part);

    if (pathParts.length >= 2) {
      return `${pathParts[0]}/${pathParts[1]}`;
    }

    return 'unknown/repo';
  },

  // Generate different GitHub/GitLab feed URLs based on configuration
  createGitHubReleaseRSSFeed(user, repo, options = {}) {
    const { branch, type = 'releases' } = options;

    if (type === 'commits' && branch) {
      return `https://github.com/${user}/${repo}/commits/${branch}.atom`;
    } else if (type === 'issues') {
      return `https://github.com/${user}/${repo}/issues.atom`;
    }

    return `https://github.com/${user}/${repo}/releases.atom`;
  },

  createGitLabRSSFeed(user, repo, options = {}) {
    const { project_id, type = 'releases' } = options;

    if (project_id && type === 'releases') {
      return `https://gitlab.com/${user}/${repo}/-/tags?format=atom`;
    }

    return `https://gitlab.com/${user}/${repo}/-/commits/main?format=atom`;
  },

  // Parse GitHub/GitLab configurations from various formats
  parseGitHubConfig(item) {
    if (typeof item === 'string') {
      if (item.includes('|')) {
        const [user, repo] = item.split('|');
        return { user: user.trim(), repo: repo.trim() };
      }
      return { url: item };
    }
    return item;
  },

  parseGitLabConfig(item) {
    if (typeof item === 'string') {
      if (item.includes('|')) {
        const [user, repo] = item.split('|');
        return { user: user.trim(), repo: repo.trim() };
      }
      return { url: item };
    }
    return item;
  },

  // Generate RSS feed URL based on configuration
  generateFeedURL(config, type) {
    const query = querystring.stringify(config.query || {});
    const queryString = query ? `?${query}` : '';

    if (type === 'github') {
      return this.createGitHubReleaseRSSFeed(config.user, config.repo, config) + queryString;
    } else if (type === 'gitlab') {
      return this.createGitLabRSSFeed(config.user, config.repo, config) + queryString;
    }

    return config.url + queryString;
  }
};
