const { Aggregate } = require("mongoose");

const limit_offset = (aggregate, itemIndex, page, fields) => {
  const pageSize = config.application.pagination.pageSize;
  const skip = page * pageSize;

  fields.forEach(field => {
    aggregate.append({
      $addFields: {
        [field + "_pagination_result"]: {
          items: {
            $slice: [`$${field}`, skip, pageSize],
          },
          count: {
            $size: `$${field}`
          },
          page,
          pageSize,
          pageCount: {
            $ceil: {
              $divide: [
                { $size: `$${field}` },
                pageSize
              ]
            }
          }
        }
      }
    });

    aggregate.append({
      $project: {
        [field]: 0,
      }
    });

    aggregate.append({
      $addFields: {
        [field]: `$${field}_pagination_result`,
      }
    });

    aggregate.append({
      $project: {
        [field + "_pagination_result"]: 0,
      }
    });
  });
};

module.exports.rootPagination = async (aggregate, page) => {
  // const pageSize = config.application.pagination.pageSize;
  // const skip = page * pageSize;

  aggregate.append({
    $group: {
      _id: "",
      result: {
        $push: "$$CURRENT",
      },
    }
  });

  limit_offset(aggregate, 0, page, ["result"]);

  aggregate.append({
    $replaceRoot: {
      newRoot: "$result"
    }
  });

  const result = await aggregate.exec();

  return result[0];
};

/**
 * 
 * @param {Aggregate} aggregate 
 * @param {Number} itemIndex 
 * @param {Number} page 
 * @param  {...String} fields 
 * @returns {Promise<any[]>}
 */
module.exports.fieldsPagination = async (aggregate, itemIndex, page, ...fields) => {
  fields.forEach(field => {
    const fieldSplited = field.split(".");
    fieldSplited.splice(fieldSplited.length - 1)
    const fieldParentPath = fieldSplited.join(".");
    let sortField = fieldParentPath;
    if (fieldParentPath !== "") {
      sortField += ".";
    }
    sortField += "_id";
    aggregate.append({
      $sort: {
        [sortField]: -1,
      },
    });
  });

  limit_offset(aggregate, itemIndex, page, fields);

  const result = await aggregate.exec();
  return result;
};
