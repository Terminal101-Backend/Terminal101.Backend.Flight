/**
 *
 * @param {Array} arr
 * @param {Number} page
 * @param {Number} pageSize
 * @returns {Array}
 */
module.exports.pagination = (arr, page, pageSize) => {
  page = parseInt(page ?? 0);
  pageSize = !!pageSize ? parseInt(pageSize) : config.application.pagination.pageSize;

  const result = {
    page,
    count: arr.length,
    pageSize,
    pageCount: Math.ceil(arr.length / pageSize),
    items: arr.slice(page * pageSize, (page + 1) * pageSize),
  };

  return result;
};

/**
 *
 * @param {Array} arr
 * @param {Object} filters
 * @param {String} sort
 * @returns {Array}
 */
module.exports.filterAndSort = (arr, filters, sort) => {
  if (!filters) {
    filters = {};
  }
  let filteredResult, sortedResult;

  filteredResult = arr.filter(item => {
    let isOk = true;

    for (const [field, value] of Object.entries(filters)) {
      isOk &= item[field] === value;
    }

    return isOk;
  });

  if (!!sort) {
    const descending = (sort[0] === "-");
    if (!!descending) {
      sort = sort.substring(1);
    }

    sortedResult = filteredResult.sort((it1, it2) => (!!descending ? -1 : 1) * ((it1[sort] > it2[sort]) ? 1 : -1));
  } else {
    sortedResult = filteredResult;
  }

  return sortedResult;
};
