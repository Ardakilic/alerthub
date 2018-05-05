/* eslint no-param-reassign: ["error",{
  "props": true, "ignorePropertyModificationsFor": ["itemOptions"]
 }]
*/
// We need a plug-in to add release name to the title.
const utils = require('../../utils/alertHub');

module.exports = (item, itemOptions /* , source */) => {
  if (itemOptions.title !== null) {
    // console.log('title var');
    // console.log(itemOptions.guid);
    if (utils.isFeedFromGitHub(itemOptions) === true) {
      itemOptions.title = `${utils.getReleaseNameFromGitHubFeedLink(itemOptions.url)} - ${itemOptions.title}`;
    }
  }

  return itemOptions;
};

