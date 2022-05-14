module.exports = (app) => {
  app.use("/flight/book", require("./bookFlightRoute"));
  app.use("/flight/ticket", require("./flightTicketRoute"));
  app.use("/flight", require("./flightRoute"));
  app.use("/waypoint", require("./waypointRoute"));
  app.use("/country", require("./countryRoute"));
  app.use("/country", require("./cityRoute"));
  app.use("/country/:countryCode/city", require("./airportRoute"));
  app.use("/restriction", require("./restrictionRoute"));


  app.use("/temp", require("./tempRoute"));


  app.use((req, res, next) => {
    res.status(404).send("oops ! 404");
  });
};
