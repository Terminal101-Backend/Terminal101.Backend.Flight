const database = require("./database");
const application = require("./application");
module.exports = {
    database,
    application,
    port: process.env.APPLICATION_PORT,
};