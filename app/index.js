//Node_modules
const express = require('express');
const path = require("path");
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");
const yaml = require('yamljs');
const fs = require("fs");
const { l10n } = require("./middlewares");
const timeout = require('connect-timeout');
// const pdf = require("express-pdf");

require("dotenv").config();

global.config = require("./config");

const apiRouter = require("./routes");
const BaseValidator = require("./core/baseValidator");

// NOTE: Express setup
app.use(cors());
app.use(express.urlencoded({
    extended: false
}));
app.use(express.json({
    type: "application/json"
}));
app.use(timeout("50s"));
// app.use(pdf);

// NOTE: Swagger
const swaggerUi = require('swagger-ui-express');
swaggerDocument = yaml.load('./app/swagger.yaml');
// swaggerDocument.host = "localhost:" + process.env.PORT;

app.use("/public", express.static(path.join(__dirname, 'static')));
if (!fs.existsSync("app/static/tickets")) {
    fs.mkdirSync("app/static/tickets", { recursive: true });
}

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, { customJs: "/public/scripts/swagger.js" }));

app.use(l10n.translate);

// NOTE: Routes
apiRouter(app);

app.use(BaseValidator.errors);

// NOTE: Views
app.get('/example', (req, res) => {
    res.sendFile(path.resolve("example") + '/index.html');
});

module.exports = app;