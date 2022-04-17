/**
 * 
 * @param {Array} arr 
 * @param {Number} page 
 * @param {Number} pageSize 
 * @returns {Array}
 */
module.exports.pagination = (arr, page, pageSize) => {
  pageSize = !!pageSize ? parseInt(pageSize) : config.application.pagination.pageSize;

  const result = {
    page,
    count: arr.length,
    pageSize,
    pageCount: Math.ceil(arr.length / pageSize),
    items: arr.slice(page * pageSize, (page + 1) * pageSize),
  }

  return result;
};
