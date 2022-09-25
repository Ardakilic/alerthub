/* eslint no-param-reassign: ["error",{
  "props": true, "ignorePropertyModificationsFor": ["itemOptions"]
 }]
*/
// We need a plug-in to add release name to the title.
import utils from '../../utils/alertHub.js';

export default (_item, itemOptions, /* source */) => {
  if (
    utils.isFeedFromGitHub(itemOptions) === true
    || utils.isFeedFromGitLab(itemOptions) === true
  ) {
    itemOptions.title = `${utils.getReleaseNameFromGitHubAndGitLabFeedLink(itemOptions.url)} - ${itemOptions.title}`;
  }
  return itemOptions;
};
