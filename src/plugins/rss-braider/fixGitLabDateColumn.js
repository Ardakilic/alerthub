/* eslint no-param-reassign: ["error",{
  "props": true, "ignorePropertyModificationsFor": ["itemOptions"]
 }]
*/
module.exports = (item, itemOptions /* , source */) => {
  if (
    itemOptions.date === null
    && item.meta !== undefined
    && item.meta.date !== undefined
    && item.meta.date !== null
  ) {
    itemOptions.date = new Date(item.meta.date);
  }
  return itemOptions;
};
