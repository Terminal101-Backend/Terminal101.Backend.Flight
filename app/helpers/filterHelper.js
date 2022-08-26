/**
 * 
 * @param {Aggregate} aggregate 
 * @param {Object} filters 
 * @param {String} sort 
 * @returns {Aggregate}
 */
module.exports.filterAndSort = async (aggregate, filters, sort) => {
  aggregate.append({
    $match: {
      ...filters
    }
  });
  aggregate.append({
    $sort: sort
  });

  return aggregate;
};
