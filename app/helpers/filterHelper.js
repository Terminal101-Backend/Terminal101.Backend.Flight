/**
 * 
 * @param {Aggregate} aggregate 
 * @param {Object} filters 
 * @param {String} sort 
 * @returns {Aggregate}
 */
module.exports.filterAndSort = async (aggregate, filters, sort) => {
  if (!!sort) {
    if (sort[0] === "-") {
      sort = { [sort.substring(1)]: -1 };
    } else {
      sort = { sort: 1 };
    }
  }

  aggregate.append({
    $match: {
      ...filters
    }
  });
  if (!!sort) {
    aggregate.append({
      $sort: sort
    });
  }

  return aggregate;
};
