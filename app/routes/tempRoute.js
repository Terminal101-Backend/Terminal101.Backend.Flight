const express = require("express");
const router = express.Router();

router.post("/parto/session", async (req, res) => {
  const { parto } = require("../services");

  const session = await parto.createSession();

  console.log(session);
});

router.get("/parto/search", async (req, res) => {
  const { parto } = require("../services");

  const { data: result } = await parto.airLowFareSearch("IKA", "IST", "2022-05-20T00:00:00");

  console.log(result.PricedItineraries);
  res.status(200).send({ result: true });
});

router.get("/socket", (req, res) => {
  res.send(`
  <html>
  <head>
  <script src="/public/scripts/socket.io/socket.io.js"></script>
  <script>
    var socket;
    window.onload = () => {
      socket = io("https://test-terminal101-flight.herokuapp.com/", {cors: {withCredentials: true}});
      // socket = io();
  
      socket.on("searchFlightResult", result => {
        if (result.data.headers.providerNumber < result.data.headers.activeProviderCount) {
          document.getElementById("result").innerHTML = "Message Receiving ...";
        } else {
          document.getElementById("result").innerHTML = "Message Received";
        }
        console.log(result);
      });
    };

    window.beforeUnload = () => {
      socket.close();
    };

    function sendMessage() {
      var date = new Date();
      date.setDate(date.getDate() + 5);
      socket.emit("searchFlight", {
        headers: {
          page: 1,
        },
        body: {
          origin: "IKA",
          destination: "TBS",
          departureDate: date,
          travelClass: "ECONOMY",
        }
      });
      document.getElementById("result").innerHTML = "Message Sent ...";
    }
  </script>
  </head>
  <body>
  <input type="button" onclick="sendMessage()" value="Search" />
  <h1 id="result">Press "Search" button to send request</h1>
  </body>
  </html>
  `);
});

router.get("/test-rollbackAmadeusData", async (req, res) => {
  const repository = require("../repositories/flightInfoRepository");
  res.send(await repository.regenerateAmadeusFlightOfferObject("JiazIVN1RmxSW5u4OLGb", 0));
});

router.get("/test-soap", async (req, res) => {
  const { v4: uuidv4 } = require("uuid");
  const soap = require("soap");
  const sha1 = require("sha1");
  const { generateRandomString } = require("../helpers/stringHelper");
  const fs = require("fs");

  // const wsdlUrl = "/home/node/app/services/amadeus-soap-wsdl-pack/Terminal101Test_TST_1.0_Functional.wsdl";
  const wsdlUrl = "/home/node/app/services/amadeus-soap-wsdl-pack/Terminal101Test_TST_1.0_Technical.wsdl";

  soap.createClient(wsdlUrl, (err, client) => {
    if (!!err) {
      throw err;
    }

    // const methods = client.describe();
    // console.log(methods.Terminal101Test_PDT_1_0_Services.AmadeusWebServicesPort.Fare_MasterPricerTravelBoardSearch);

    const wslOperations = client.wsdl.xmlToObject(fs.readFileSync(wsdlUrl)).definitions.binding.operation;
    const Fare_MasterPricerTravelBoardSearch = wslOperations.find(op => op.attributes.name === "Fare_MasterPricerTravelBoardSearch");

    const time = new Date();
    time.setHours(time.getMinutes() + 10);

    const nonce = generateRandomString(22, 22, true, true, true);

    client.addSoapHeader({
      "add:MessageId": uuidv4(),
    });

    client.addSoapHeader({
      "add:Action": Fare_MasterPricerTravelBoardSearch.operation.attributes.soapAction,
    });

    client.addSoapHeader({
      "add:To": "https://nodeD2.test.webservices.amadeus.com/1ASIWYIAFDF",
    });

    client.addSoapHeader({
      Security: {
        UsernameToken: {
          Nonce: nonce,
          Created: time.toISOString(),
          Username: "WSFDFYIA",
          Password: {
            attributes: {
              Type: "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordDigest"
            },
            $value: Buffer.from(sha1(nonce + time.toISOString() + "FaRD=T3st")).toString("base64")
          },
        }
      }
    });

    const args = {
      numberOfUnit: {
        unitNumberDetail: {
          numberOfUnits: "1",
          typeOfUnit: "PX",
        },
        unitNumberDetail: {
          numberOfUnits: "200",
          typeOfUnit: "RC",
        },
      },
      paxReference: {
        ptc: "ADT",
        traveller: {
          ref: "1",
        },
      },
      fareOptions: {
        pricingTickInfo: {
          pricingTicketing: {
            priceType: "RP",
            priceType: "RU",
            priceType: "TAC",
          },
        },
      },
      itinerary: {
        requestedSegmentRef: {
          segRef: "1",
        },
        departureLocalization: {
          departurePoint: {
            locationId: "CDG",
          },
        },
        arrivalLocalization: {
          arrivalPointDetails: {
            locationId: "LHR",
          },
        },
        timeDetails: {
          firstDateTimeDetail: {
            timeQualifier: "TA",
            date: "231113",
            time: "2200",
            timeWindow: "4",
          },
          rangeOfDate: {
            rangeQualifier: "M",
            dayInterval: "1",
          },
        },
      },
    };

    client.Terminal101Test_PDT_1_0_Services.AmadeusWebServicesPort.Fare_MasterPricerTravelBoardSearch(args, (err, result, rawResponse, soapHeader, rawRequest) => {
      // console.log(rawRequest);
      console.log(client.wsdl.xmlToObject(rawRequest));
      // console.log(client.wsdl.xmlToObject(rawRequest).Header.Security.UsernameToken);
      console.log(client.wsdl.xmlToObject(rawResponse));
      // console.log();
    });

    res.send(true);
    // client.addHttpHeader("Content-Type", "text/xml;charset=UTF-8");
    // client.addHttpHeader("SOAPAction", "https://graphical.weather.gov/xml/DWMLgen/wsdl/ndfdXML.wsdl#LatLonListZipCode");
    // const args = {
    //   zipCodeList:
    //   {
    //     attributes: {
    //       "xsi:type": "dwml:zipCodeListType",
    //       "xmlns:dwml": "https://graphical.weather.gov/xml/DWMLgen/schema/DWML.xsd",
    //     },
    //     $value: [75001],
    //   },
    // };

    //   client.ndfdXML.ndfdXMLPort.LatLonListZipCode(args, (err, result, rawResponse, soapHeader, rawRequest) => {
    //     if (!!err) {
    //       throw err;
    //     }

    //     const { dwml: res } = client.wsdl.xmlToObject(result.listLatLonOut.$value);
    //     const [lat, lon] = res.latLonList.split(",");
    //     console.dir({ lat, lon });
    //   });
  });
});

module.exports = router;
