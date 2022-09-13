const mapFilterCondition = (key, condition = "=") => value => {
  if (/^".*"$/.test(value)) {
    value = value.replace(/^"(.*)"$/, "$1");
  } else if ((value == "false") || (value == "true")) {
    value = (value == "true");
  } else if (value === "undefined") {
    value = undefined;
  } else {
    value = parseFloat(value);
  }

  switch (condition) {
    case "=":
      return {[key]: value};
      break;

    case "!":
      return {
        $expr: {
          $ne: ["$" + key, value]
        }
      };
      break;

    case "<":
      return {
        $expr: {
          $lt: ["$" + key, value]
        }
      };
      break;

    case ">":
      return {
        $expr: {
          $gt: ["$" + key, value]
        }
      };
      break;

    case "<=":
      return {
        $expr: {
          $le: ["$" + key, value]
        }
      };
      break;

    case ">=":
      return {
        $expr: {
          $ge: ["$" + key, value]
        }
      };
      break;
  }
};

/**
 *
 * @param {Aggregate} aggregate
 * @param {Object} filters
 * @param {String} sort
 * @returns {Aggregate}
 */
module.exports.filterAndSort = async (aggregate, filters, sort) => {
  const andFilters = [];

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

    andFilters.push({
      $or: [...keys.reduce((res, cur) => {
        let condition = "=";
        if (cur.endsWith("!")) {
          cur = cur.substring(0, cur.length - 1);
          condition = "!";
        } else if (cur.endsWith("<")) {
          cur = cur.substring(0, cur.length - 1);
          condition = "<";
        } else if (cur.endsWith("<=")) {
          cur = cur.substring(0, cur.length - 2);
          condition = "<=";
        } else if (cur.endsWith(">")) {
          cur = cur.substring(0, cur.length - 1);
          condition = ">";
        } else if (cur.endsWith(">=")) {
          cur = cur.substring(0, cur.length - 2);
          condition = ">=";
        }

        return [
          ...res,
          ...((condition === "!") ?
            [{$and: values.map(mapFilterCondition(cur, condition))}]
            :
            values.map(mapFilterCondition(cur, condition))),
        ]
      }, [])]
    });
  });

  if (andFilters.length > 0) {
    aggregate.append({
      $match: {
        $and: andFilters
      }
    });
  }
  if (!!sort) {
    aggregate.append({
      $sort: sort
    });
  }

  return aggregate;
};
