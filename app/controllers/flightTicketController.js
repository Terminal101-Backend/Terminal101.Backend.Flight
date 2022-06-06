const response = require("../helpers/responseHelper");
const request = require("../helpers/requestHelper");
const token = require("../helpers/tokenHelper");
const { flightInfoRepository, bookedFlightRepository } = require("../repositories");
const { wallet, amadeus } = require("../services");
const { EBookedFlightStatus } = require("../constants");
let pdf = require("pdf-creator-node");
let htmlPdf = require("html-pdf");
let ejs = require("ejs");
let fs = require("fs");
let path = require("path");


// NOTE: Flight tickets
// NOTE: Get flight tickets
module.exports.getFlightTickets = async (req, res) => {
  try {
    const bookedFlight = await bookedFlightRepository.getBookedFlight(req.params.bookedFlightCode);
    // TODO: Get lead and passengers' informations by account management service
    const filePath = path.join(path.resolve("app/static/tickets"), `${req.params.bookedFlightCode}.pdf`);

    if (true || !fs.existsSync(filePath)) {
      if (fs.existsSync(filePath)) {
        fs.rmSync(filePath);
      }

      const templatePath = path.join(process.env.TEMPLATE_TICKET_VERIFICATION_FILE);
      // const template = fs.readFileSync(templatePath, "utf8");

      const template = await ejs.renderFile(
        templatePath,
        {
          invoiceNumber: 201543502291,
          date: new Date().toLocaleDateString(),
          pickUpDatetime: new Date().toLocaleDateString(),
          returnDatetime: new Date().toLocaleDateString(),
          pickUpLocation: 'jakarta',
          returnLocation: 'jakarta',
          payments: [{ description: 'oke', durationPerHours: 20, rentPerHours: 10, amount: 2000 }],
          discount: 'RM ' + 1000,
          totalPayment: 'RM ' + 5000,
          fullName: 'john doe',
          phoneNumber: '+6287887242891'
        },
        {
          beautify: true,
          async: true
        }
      );

      // res.pdfFromHTML({
      //   filename: filePath,
      //   htmlContent: template,
      //   options: {
      //     format: 'A5',
      //     // httpHeaders: { 'content-type': 'application/pdf' },
      //     // quality: '100',
      //     orientation: 'landscape',
      //     // type: 'pdf'
      //   }
      // });

      // htmlPdf
      //   .create(template, {
      //     format: 'A2',
      //     httpHeaders: { 'content-type': 'application/pdf' },
      //     quality: '100',
      //     orientation: 'landscape',
      //     type: 'pdf'
      //   })
      //   .toFile(filePath, (e, response) => {
      //     if (!!e) {
      //       throw e;
      //     } else {
      //       res.sendFile(filePath);
      //       console.log(response);
      //     }
      //   });

      // let options = {
      //   phantomPath: "./node_modules/phantomjs-prebuilt/bin/phantomjs",
      //   format: "A4",
      //   orientation: "landscape",
      //   border: "10mm",
      //   // header: {
      //   //   height: "45mm",
      //   //   contents: '<div style="text-align: center;">Test</div>'
      //   // },
      //   footer: {
      //     height: "28mm",
      //     contents: {
      //       // first: 'Cover page',
      //       // 2: 'Second page',
      //       default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>',
      //       // last: 'Last Page'
      //     }
      //   }
      // };

      // let document = {
      //   html: template,
      //   data: {
      //     passengers: bookedFlight.passengers
      //   },
      //   path: filePath,
      //   type: "",
      // };

      // await pdf.create(document, options);
      res.send(template)
    } else {
      res.sendFile(filePath);
    }
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
