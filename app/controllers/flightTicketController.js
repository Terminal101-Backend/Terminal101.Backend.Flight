const response = require("../helpers/responseHelper");
const request = require("../helpers/requestHelper");
const token = require("../helpers/tokenHelper");
const { flightInfoRepository, bookedFlightRepository } = require("../repositories");
const { wallet, accountManagement, amadeus } = require("../services");
const { EBookedFlightStatus } = require("../constants");
// let htmlPdfNode = require("html-pdf-node");
let puppeteer = require("puppeteer");
let ejs = require("ejs");
let fs = require("fs");
let path = require("path");


// NOTE: Flight tickets
// NOTE: Get flight tickets
module.exports.getFlightTickets = async (req, res) => {
  try {
    const decodedToken = token.decodeToken(req.header("Authorization"));
    // const bookedFlight = await bookedFlightRepository.getBookedFlight(req.params.bookedFlightCode);
    // const { data: user } = await accountManagement.getUserInfo(decodedToken.user);
    // const passengers = bookedFlight.passengers.map(passenger => {
    //   if (!!user.info && !!user.info.document && (user.info.document.code === passenger.documentCode) && (user.info.document.issuedAt === passenger.documentIssuedAt)) {
    //     return {
    //       firstName: user.info.firstName,
    //       middleName: user.info.middleName,
    //       nickName: user.info.nickName,
    //       lastName: user.info.lastName,
    //       birthDate: user.info.birthDate,
    //       gender: user.info.gender,
    //     }
    //   } else {
    //     const userPerson = user.persons.find(person => (person.document.code === passenger.documentCode) && (person.document.issuedAt === passenger.documentIssuedAt));
    //     return {
    //       firstName: userPerson.firstName,
    //       middleName: userPerson.middleName,
    //       nickName: userPerson.nickName,
    //       lastName: userPerson.lastName,
    //       birthDate: userPerson.birthDate,
    //       gender: userPerson.gender,
    //     }
    //   }
    // });

    const filePath = path.join(path.resolve("app/static/tickets"), req.params.bookedFlightCode + ".pdf");

    if (true || !fs.existsSync(filePath)) {
      if (fs.existsSync(filePath)) {
        fs.rmSync(filePath);
      }

      // const templatePath = path.join(process.env.TEMPLATE_TICKET_VERIFICATION_FILE);
      // const template = fs.readFileSync(templatePath, "utf8");

      // const template = await ejs.renderFile(
      //   templatePath,
      //   {
      //     contact: bookedFlight.contact,
      //     passengers,
      //   },
      //   {
      //     beautify: true,
      //     async: true
      //   }
      // );

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

      // let options = { format: 'A4' };
      // let file = { content: template };
      // htmlPdfNode.generatePdf(file, options).then(pdfBuffer => {
      //   console.log("PDF Buffer:-", pdfBuffer);
      //   res.sendFile(pdfBuffer);
      // });

      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      const page = await browser.newPage();
      await page.goto(`${process.env.LOCAL_SERVICE_URL}/flight/ticket/view/${req.header("Authorization")}/${req.params.bookedFlightCode}`, { waitUntil: 'networkidle0' });
      const pdf = await page.pdf({ format: 'A4' });

      const fd = fs.openSync(filePath, "w");
      fs.writeSync(fd, pdf);

      await browser.close();
      // res.sendFile(filePath);

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
      // res.send(template)
    }

    res.sendFile(filePath);
  } catch (e) {
    response.exception(res, e);
  }
};
// NOTE: Get flight tickets
module.exports.getFlightTicketsView = async (req, res) => {
  try {
    const decodedToken = token.decodeToken(req.params.token);
    const bookedFlight = await bookedFlightRepository.getBookedFlight(decodedToken.user, req.params.bookedFlightCode);
    if (bookedFlight.bookedBy !== decodedToken.user) {
      throw "user_invalid";
    }

    const { data: user } = await accountManagement.getUserInfo(bookedFlight.bookedBy);
    const passengers = bookedFlight.passengers.map(passenger => {
      if (!!user.info && !!user.info.document && (user.info.document.code === passenger.documentCode) && (user.info.document.issuedAt === passenger.documentIssuedAt)) {
        return {
          firstName: user.info.firstName,
          middleName: user.info.middleName,
          nickName: user.info.nickName,
          lastName: user.info.lastName,
          birthDate: user.info.birthDate,
          gender: user.info.gender,
        }
      } else {
        const userPerson = user.persons.find(person => (person.document.code === passenger.documentCode) && (person.document.issuedAt === passenger.documentIssuedAt));
        return {
          firstName: userPerson.firstName,
          middleName: userPerson.middleName,
          nickName: userPerson.nickName,
          lastName: userPerson.lastName,
          birthDate: userPerson.birthDate,
          gender: userPerson.gender,
        }
      }
    });

    const templatePath = path.join(process.env.TEMPLATE_TICKET_VERIFICATION_FILE);
    // const template = fs.readFileSync(templatePath, "utf8");

    const template = await ejs.renderFile(
      templatePath,
      {
        contact: bookedFlight.contact,
        passengers,
      },
      {
        beautify: true,
        async: true
      }
    );

    res.send(template)
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
