module.exports = (app) => {
  // app.use("/setting", require("./settingRoute"));

  app.use((req, res, next) => {
    res.status(404).send("oops ! 404");
  });
};
