/**
 *
 * @param {Aggregate} aggregate
 * @param {Object} filters
 * @param {String} sort
 * @returns {Aggregate}
 */
module.exports.filterAndSort = async (aggregate, filters, sort) => {
  let objFilters = {};

  if (!!sort) {
    if (sort[0] === "-") {
      sort = {[sort.substring(1)]: -1};
    } else {
      sort = {sort: 1};
    }
  }

  Object.entries((filters ?? {})).forEach(([key, value]) => {
    const keys = key.split("|");
    const values = value.split("|");

    objFilters = {
      ...objFilters,
      $or: [...keys.reduce((res, cur) => {
        if (cur.endsWith("!")) {
          cur = cur.substring(0, cur.length - 1);

        } else if (cur.endsWith("<")) {
          cur = cur.substring(0, cur.length - 1);

        } else if (cur.endsWith("<=")) {
          cur = cur.substring(0, cur.length - 2);

        } else if (cur.endsWith(">")) {
          cur = cur.substring(0, cur.length - 1);

        } else if (cur.endsWith(">=")) {
          cur = cur.substring(0, cur.length - 2);

        } else {

        }
        switch (cur.substring(cur.length - 1)) {
          case "!":
            break;

          case "<":
            cur = cur.substring(0, cur.length - 1);
            break;

          case "<=":
            cur = cur.substring(0, cur.length - 2);
            break;

          case ">":
            cur = cur.substring(0, cur.length - 1);
            break;

          case ">=":
            cur = cur.substring(0, cur.length - 2);
            break;

          default:
        }
      }, [])],
    }
  });

  aggregate.append({
    $match: {
      ...objFilters
    }
  });
  if (!!sort) {
    aggregate.append({
      $sort: sort
    });
  }

  return aggregate;
};
