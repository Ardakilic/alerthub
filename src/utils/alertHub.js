import querystring from "node:querystring";
import URL from "node:url";

export default {
  // Because there are also feeds,
  // we need this method to check whether the feed is from GitHub or not
  isFeedFromGitHub(item) {
    if (
      item.guid !== undefined &&
      item.guid !== null &&
      typeof item.guid === "string"
    ) {
      if (item.guid.substring(0, 14) === "tag:github.com") {
        return true;
      }
    }
    return false;
  },

  isFeedFromGitLab(item) {
    if (!item.url || typeof item.url !== "string") {
      return false;
    }
    const parsedURL = URL.parse(item.url);
    if (!parsedURL || !parsedURL.hostname) {
      return false;
    }
    return (
      parsedURL.hostname === "gitlab.com" ||
      parsedURL.hostname.includes("gitlab")
    );
  },

  getReleaseNameFromGitHubAndGitLabFeedLink(url) {
    if (!url || typeof url !== "string") return "unknown/repo";

    const parsedURL = URL.parse(url);
    if (!parsedURL || !parsedURL.pathname) return "unknown/repo";

    const pathParts = parsedURL.pathname.split("/").filter((part) => part);

    if (pathParts.length >= 2) {
      return `${pathParts[0]}/${pathParts[1]}`;
    }

    return "unknown/repo";
  },

  // Standardize the new feed element
  parseFeedData(feedData) {
    const parsedFeed = {
      title: feedData.title,
      link: feedData.link,
      description: feedData.description,
      // summary: feedData.summary,
      date: feedData.date,
    };

    // We need to prepend release name to the title
    if (
      this.isFeedFromGitHub(feedData) === true ||
      this.isFeedFromGitLab(feedData) === true
    ) {
      parsedFeed.title = `${this.getReleaseNameFromGitHubAndGitLabFeedLink(feedData.link)} - ${feedData.title}`;
    }

    return parsedFeed;
  },

  // Generates the RSS feed URL with given parameters honoring the configuration
  generateURLForTheFeed(options /*, config*/) {
    if (options.resource === "github") {
      // TODO: Implement GitHub token support
      // const optionalGitHubAccessToken = config.githubToken !== null ? `?token=${config.githubToken}` : '';
      if (options.type === "issues") {
        return `https://issue-tracker-rss.now.sh/${options.repository}?${querystring.encode(options.params)}`;
      }
      if (Object.hasOwn(options, "subType")) {
        return `https://www.github.com/${options.repository}/${options.type}/${options.subType}.atom`; //${optionalGitHubAccessToken}`;
      }
      return `https://www.github.com/${options.repository}/${options.type}.atom`; //${optionalGitHubAccessToken}`;
    }

    if (options.resource === "gitlab") {
      if (Object.hasOwn(options, "subType")) {
        return `https://gitlab.com/${options.repository}/-/${options.type}/${options.subType}?format=atom`;
      }
      return `https://gitlab.com/${options.repository}/-/${options.type}?format=atom`;
    }

    return "";
  },
};
