const response = require("../helpers/responseHelper");
const request = require("../helpers/requestHelper");
const token = require("../helpers/tokenHelper");
const {flightInfoRepository, bookedFlightRepository} = require("../repositories");
const {wallet, accountManagement, amadeus, common} = require("../services");
const {EBookedFlightStatus} = require("../constants");
// let htmlPdfNode = require("html-pdf-node");
let puppeteer = require("puppeteer");
let ejs = require("ejs");
let fs = require("fs");
let path = require("path");


// NOTE: Flight tickets
module.exports.generatePdfTicket = async (userToken, bookedFlightCode) => {
  const filePath = path.join(path.resolve(`app/static/tickets`), bookedFlightCode + ".pdf");

  const decodedToken = token.decodeToken(userToken);
  const bookedFlight = await bookedFlightRepository.getBookedFlight(decodedToken.user, bookedFlightCode);
  if (!bookedFlight) {
    throw "flight_not_found";
  } else if (bookedFlight.bookedBy !== decodedToken.user) {
    throw "user_invalid";
  } else if (EBookedFlightStatus.check(["ERROR", "PAYING", "REMOVE", "REJECTED",], bookedFlight.status)) {
    throw "You can't download this ticket";
  }
  if (fs.existsSync(filePath)) {
    return filePath;
  }

  if (true || !fs.existsSync(filePath)) {
    if (fs.existsSync(filePath)) {
      fs.rmSync(filePath);
    }


    const browser = await puppeteer.launch({
      // browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.BROWSERLESS_TOKEN}`,
    });
    const page = await browser.newPage();
    await page.goto(`${process.env.LOCAL_SERVICE_URL}/flight/ticket/view/${userToken}/${bookedFlightCode}`, {waitUntil: 'networkidle0'});
    const pdf = await page.pdf({
      format: 'A4', margin: {
        top: "3px",
        right: "8px",
        bottom: "3px"
      }
    });

    const fd = fs.openSync(filePath, "w");
    fs.writeSync(fd, pdf);

    await browser.close();
  }

  return filePath;
};

// NOTE: Get flight tickets
module.exports.getFlightTickets = async (req, res) => {
  try {
    console.log(req.header("Authorization"))
    const filePath = await this.generatePdfTicket(req.header("Authorization"), req.params.bookedFlightCode);
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
    if (!bookedFlight) {
      throw "flight_not_found";
    }
    if (bookedFlight.bookedBy !== decodedToken.user) {
      throw "user_invalid";
    }

    const {data: user} = await accountManagement.getUserInfo(bookedFlight.bookedBy);
    const passengers = bookedFlight.passengers.map(passenger => {
      if (!!user.info && !!user.info.document && (user.info.document.code === passenger.documentCode) && (user.info.document.issuedAt === passenger.documentIssuedAt)) {
        return {
          firstName: user.info.firstName,
          middleName: user.info.middleName,
          nickName: user.info.nickName,
          lastName: user.info.lastName,
          birthDate: user.info.birthDate,
          gender: user.info.gender,
          type: user.info.type,
          documentCode: user.info.document.code,
        }
      } else {
        const userPerson = user.persons.find(person => (person.document.code === passenger.documentCode) && (person.document.issuedAt === passenger.documentIssuedAt));
        if (!userPerson) {
          throw "passenger_not_found";
        }
        return {
          firstName: userPerson.firstName,
          middleName: userPerson.middleName,
          nickName: userPerson.nickName,
          lastName: userPerson.lastName,
          birthDate: userPerson.birthDate,
          gender: userPerson.gender,
          type: userPerson.type,
          documentCode: userPerson.document.code,
        }
      }
    });
    const {value: agencyPhoneNumber} = await common.getSetting('AGENCY_PHONE_NUMBER');

    const templatePath = path.join(process.env.TEMPLATE_TICKET_VERIFICATION_FILE);
    // const template = fs.readFileSync(templatePath, "utf8");

    const template = await ejs.renderFile(
      templatePath,
      {
        time: bookedFlight.time,
        itineraries: bookedFlight.flightInfo.flights.itineraries,
        status: bookedFlight.status,
        classOfService: bookedFlight.travelClass,
        reservationCode: "TODO",
        pnr: bookedFlight.providerPnr ?? "-----",
        agencyPhoneNumber: agencyPhoneNumber,
        cloudineryStaticFileUrl: process.env.CLOUDINERY_STATIC_FILE_TICKET_URL,
        airlineLogoBaseUrl: process.env.AIRLINE_LOGO_BASE_URL,
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
    const userToken = token.newToken({user: req.params.userCode});
    const filePath = await this.generatePdfTicket(userToken, req.params.bookedFlightCode);
    res.sendFile(filePath);
  } catch (e) {
    response.exception(res, e);
  }
};
