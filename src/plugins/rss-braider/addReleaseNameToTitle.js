// We need a plug-in to add release name to the title.
const utils = require('../../utils/alertHub.js');

module.exports = (_item, itemOptions, /* source */) => {
  if (
    utils.isFeedFromGitHub(itemOptions) === true
    || utils.isFeedFromGitLab(itemOptions) === true
  ) {
    itemOptions.title = `${utils.getReleaseNameFromGitHubAndGitLabFeedLink(itemOptions.url)} - ${itemOptions.title}`;
  }
  return itemOptions;
};
