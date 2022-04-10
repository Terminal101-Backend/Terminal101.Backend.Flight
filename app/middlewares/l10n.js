const { common } = require("../services");

exports.translate = async (req, res, next) => {
  try {
    let translated = false;
    let resSend = res.send;

    res.send = async function () {
      try {
        let args = Array.from(arguments);
        if (!translated) {
          args = await common.translate(args, req.header("language"));
          translated = true;
        }
        return resSend.apply(res, args);
      } catch (e) {
        res
          .status(500)
          .header({ "Content-Type": "application/json" })
          .end(
            JSON.stringify({
              status: false,
              message: e.message,
              data: {},
            })
          );
      }
    };

    next();
  } catch (e) {
    next(e);
  }
}
