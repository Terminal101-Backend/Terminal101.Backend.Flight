const response = require("../helpers/responseHelper");
const request = require("../helpers/requestHelper");
const token = require("../helpers/tokenHelper");
const { flightInfoRepository, bookedFlightRepository } = require("../repositories");
const { wallet, amadeus } = require("../services");
const { EBookedFlightStatus } = require("../constants");
let pdf = require("pdf-creator-node");
let fs = require("fs");
let path = require("path");

// NOTE: Flight tickets
// NOTE: Get flight tickets
module.exports.getFlightTickets = async (req, res) => {
  try {
    const bookedFlight = await bookedFlightRepository.getBookedFlight(req.params.bookedFlightCode);
    // TODO: Get lead and passengers' informations by account management service

    let templatePath = path.join(process.env.TEMPLATE_TICKET_VERIFICATION_FILE);
    let template = fs.readFileSync(templatePath, "utf8");

    let options = {
      phantomPath: "./node_modules/phantomjs-prebuilt/bin/phantomjs",
      format: "A4",
      orientation: "portrait",
      border: "10mm",
      header: {
        height: "45mm",
        contents: '<div style="text-align: center;">Test</div>'
      },
      footer: {
        height: "28mm",
        contents: {
          first: 'Cover page',
          2: 'Second page', // Any page number is working. 1-based index
          default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
          last: 'Last Page'
        }
      }
    };

    let document = {
      html: template,
      data: {
        passengers: bookedFlight.passengers
      },
      path: path.join(path.resolve("app/static/tickets"), `${req.params.bookedFlightCode}.pdf`),
      type: "",
    };

    await pdf.create(document, options);

    res.sendFile(path.join(path.resolve("app/static/tickets"), `${req.params.bookedFlightCode}.pdf`));
  } catch (e) {
    response.exception(res, e);
  }
};

// NOTE: Get other user's flight tickets
module.exports.getUserFlightTickets = async (req, res) => {
  try {
    const bookedFlight = await bookedFlightRepository.getBookedFlight(req.params.bookedFlightCode);

    response.success(res, {

    });
  } catch (e) {
    response.exception(res, e);
  }
};
