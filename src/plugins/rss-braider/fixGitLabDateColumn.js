export default (item, itemOptions, /* source */) => {
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
