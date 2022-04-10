/**
 * 
 * @param {Array} arr 
 * @param {Number} page 
 * @returns {Array}
 */
module.exports.pagination = (arr, page) => {
  const pageSize = config.application.pagination.pageSize;

  const result = {
    page,
    count: arr.length,
    pageSize,
    pageCount: Math.ceil(arr.length / pageSize),
    items: arr.slice(page * pageSize, (page + 1) * pageSize),
  }

  return result;
};
