const axios = require("axios");
const axiosApiInstance = axios.create();
const xmljsonParser = require("xml2json");
const { dateTimeHelper, flightHelper, stringHelper } = require("../helpers");

// Request interceptor for API calls
axiosApiInstance.interceptors.request.use(
  async config => {
    const testMode = config?.testMode ?? false;
    const pathPostFix = testMode ? "_TEST" : "";

    config.baseURL = process.env["AVTRA_BASE_URL" + pathPostFix];
    config.headers = {
      'Authorization': `${process.env["AVTRA_ACCESS_TOKEN" + pathPostFix]}`,
      'Accept': 'application/xml',
      // 'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Type': 'application/xml',
    }

    return config;
  },
  error => {
    Promise.reject(error)
  });

// Response interceptor for API calls
// axiosApiInstance.interceptors.response.use((response) => {
//   return response
// }, async function (error) {
//   const originalRequest = error.config;

//   if (!!error.response && [401, 403].includes(error.response.status) && !originalRequest._retry) {
//     originalRequest._retry = true;
//     await getAccessToken();
//     axios.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken;
//     return axiosApiInstance(originalRequest);
//   }
//   return Promise.reject(error);
// });

module.exports.ping = async (message, testMode = false) => {
  const {
    data: response
  } = await axiosApiInstance.post("/services/ping", `
  <OTA_PingRQ xmlns="http://www.opentravel.org/OTA/2003/05" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opentravel.org/OTA/2003/05 
  OTA_AirLowFareSearchRQ.xsd" EchoToken="50987" TimeStamp="2019-08-22T05:44:10+05:30" Target="Test" Version="2.001" SequenceNmbr="1" PrimaryLangID="En-us">
<POS>
<Source AirlineVendorID="IF" ISOCountry="IQ" ISOCurrency="USD">
<RequestorID Type="5" ID="${process.env.AVTRA_OFFICE_ID}"/>
</Source>
</POS>
<EchoData>${message ?? "Echo me back"}</EchoData>
</OTA_PingRQ>
  `, { testMode });

  const option = {
    object: true
  };
  const responseJson = xmljsonParser.toJson(response, option);

  const result = {
    success: !!responseJson?.OTA_PingRS?.Success,
    data: responseJson?.OTA_PingRS?.EchoData
  };

  return result;
};

module.exports.lowFareSearch = async (originLocationCode, destinationLocationCode, departureDate, returnDate, segments = [], adults = 1, children = 0, infants = 0, travelClass, includedAirlineCodes, excludedAirlineCodes, nonStop, currencyCode = "USD", testMode = false) => {
  segments = flightHelper.makeSegmentsArray(segments);
  const originDestinations = [];

  originDestinations.push(`
    <OriginDestinationInformation>
      <DepartureDateTime>${dateTimeHelper.excludeDateFromIsoString(new Date(departureDate).toISOString())}</DepartureDateTime>
      <OriginLocation LocationCode="${originLocationCode}" />
      <DestinationLocation LocationCode="${destinationLocationCode}" />
    </OriginDestinationInformation>
    `);

  for (let index = 0; index < segments?.length ?? 0; index++) {
    originDestinations.push(`
    <OriginDestinationInformation>
      <DepartureDateTime>${segments[index].date}</DepartureDateTime>
      <OriginLocation LocationCode="${segments[index].originCode}" />
      <DestinationLocation LocationCode="${segments[index].destinationCode}" />
    </OriginDestinationInformation>
    `);
  }

  if (!!returnDate) {
    if (!!segments && (segments?.length ?? 0 > 0)) {
      originDestinations.push(`
      <OriginDestinationInformation>
        <DepartureDateTime>${dateTimeHelper.excludeDateFromIsoString(new Date(returnDate).toISOString())}</DepartureDateTime>
        <OriginLocation LocationCode="${segments[segments.length - 1].destinationCode}" />
        <DestinationLocation LocationCode="${originLocationCode}" />
      </OriginDestinationInformation>
      `);
    } else {
      originDestinations.push(`
      <OriginDestinationInformation>
        <DepartureDateTime>${dateTimeHelper.excludeDateFromIsoString(new Date(returnDate).toISOString())}</DepartureDateTime>
        <OriginLocation LocationCode="${destinationLocationCode}" />
        <DestinationLocation LocationCode="${originLocationCode}" />
      </OriginDestinationInformation>
      `);
    }
  }

  const query = `
  <OTA_AirLowFareSearchRQ xmlns="http://www.opentravel.org/OTA/2003/05" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opentravel.org/OTA/2003/05 
  OTA_AirLowFareSearchRQ.xsd" EchoToken="50987" TimeStamp="2019-08-22T05:44:10+05:30" Target="Test" Version="2.001" SequenceNmbr="1" PrimaryLangID="En-us">
  <POS>
    <Source AirlineVendorID="IF" ISOCountry="IQ" ISOCurrency="USD">
      <RequestorID Type="5" ID="${process.env.AVTRA_OFFICE_ID}" />
    </Source>
  </POS>
  ${originDestinations.join("\n")}
  <TravelPreferences>
    <CabinPref Cabin="" />
  </TravelPreferences>
  <TravelerInfoSummary>
    <AirTravelerAvail>
      <PassengerTypeQuantity Code="ADT" Quantity="${adults ?? 1}" />
      <PassengerTypeQuantity Code="CHD" Quantity="${children ?? 0}" />
      <PassengerTypeQuantity Code="INF" Quantity="${infants ?? 0}" />
    </AirTravelerAvail>
  </TravelerInfoSummary>
  <ProcessingInfo SearchType="STANDARD" />
</OTA_AirLowFareSearchRQ>
  `;

  const {
    data: response
  } = await axiosApiInstance.post("/availability/lowfaresearch", query, { testMode });

  const option = {
    object: true
  };
  const responseJson = xmljsonParser.toJson(response, option);

  const result = {
    success: !!responseJson?.OTA_AirLowFareSearchRS?.Success,
    data: responseJson?.OTA_AirLowFareSearchRS?.PricedItineraries?.PricedItinerary
  };

  return result;
};

module.exports.book = async (segments, price, travelers, testMode = false) => {
  const originDestinations = [];
  segments.forEach(segment => {
    originDestinations.push(`
      <OriginDestinationOption>
        <FlightSegment FlightNumber="${segment.flightNumber}" DepartureDateTime="${segment.date.toISOString().replace(/Z$/, "+00:00")}">
          <DepartureAirport LocationCode="${segment.originCode}" />
          <ArrivalAirport LocationCode="${segment.destinationCode}" />
          <OperatingAirline Code="${segment.airlineCode}"/>
        </FlightSegment>
      </OriginDestinationOption>
      `);
  });

  const travelersInfo = [];
  travelers.forEach(traveler => {
    let namePrefix;
    switch (traveler.genderCode) {
      case "M":
        namePrefix = "Mr";
        break;

      case "F":
        namePrefix = "Mrs";
        break;

      default:
        namePrefix = "Mx";
    }
    travelersInfo.push(`
      <AirTraveler BirthDate="${dateTimeHelper.excludeDateFromIsoString(traveler.birthDate.toISOString())}" PassengerTypeCode="${traveler.type}" AccompaniedByInfantInd="false" Gender="${traveler.genderCode}" TravelerNationality="${traveler.nationality}">
        <PersonName>
          <NamePrefix>${namePrefix}</NamePrefix>
          <GivenName>${traveler.firstName}</GivenName>
          <Surname>${traveler.lastName}</Surname>
        </PersonName>
        <TravelerRefNumber RPH="1"/>
        <Document DocID="${traveler.document.code}" DocType="2" ExpireDate="${dateTimeHelper.excludeDateFromIsoString(traveler.document.expireDate.toISOString())}" DocIssueCountry="${traveler.document.issuedAt}" DocHolderNationality="${traveler.nationality}"/>
      </AirTraveler>
    `);
  });

  const query = `
    <OTA_AirBookRQ xmlns="http://www.opentravel.org/OTA/2003/05" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opentravel.org/OTA/2003/05 
    OTA_AirBookRQ.xsd" EchoToken="50987" TimeStamp="2019-08-22T05:44:10+05:30" Target="Test" Version="2.001" SequenceNmbr="1" PrimaryLangID="En-us">
      <POS>
        <Source AirlineVendorID="IF" ISOCountry="IQ" ISOCurrency="USD">
          <RequestorID Type="5" ID="${process.env.AVTRA_OFFICE_ID}" />
        </Source>
      </POS>
      <AirItinerary>
        <OriginDestinationOptions>
          ${originDestinations.join("\n")}
        </OriginDestinationOptions>
      </AirItinerary>
      <PriceInfo>
        <ItinTotalFare>
          <BaseFare CurrencyCode="${price.currencyCode}" DecimalPlaces="2" Amount="${stringHelper.padNumbers(price.base)}"/>
          <TotalFare CurrencyCode="${price.currencyCode}" DecimalPlaces="2" Amount="${stringHelper.padNumbers(price.total)}"/>
        </ItinTotalFare>
      </PriceInfo>
      <TravelerInfo>
        ${travelersInfo.join("\n")}
      </TravelerInfo>
      <ContactPerson>
        <PersonName>
          <GivenName>AHMED</GivenName>
          <Surname>MOHAMMED</Surname>
        </PersonName>
        <Telephone PhoneNumber="(44)1233222344"/>
        <HomeTelephone PhoneNumber="(44)1233225744"/>
        <Email>tba@tba.com</Email>
      </ContactPerson>
      <Fulfillment>
        <PaymentDetails>
          <PaymentDetail PaymentType="2">
            <DirectBill DirectBill_ID="${process.env.AVTRA_OFFICE_ID}">
              <CompanyName CompanyShortName="Avtra OTA" Code="${process.env.AVTRA_OFFICE_ID}"/>
            </DirectBill>
            <PaymentAmount CurrencyCode="USD" DecimalPlaces="2" Amount="${stringHelper.padNumbers(price.total)}"/>
          </PaymentDetail>
        </PaymentDetails>
      </Fulfillment>
    </OTA_AirBookRQ>
  `;

  const {
    data: response
  } = await axiosApiInstance.post("/booking/create", query, { testMode });

  const option = {
    object: true
  };
  const responseJson = xmljsonParser.toJson(response, option);

  const result = {
    success: !!responseJson?.OTA_AirBookRS?.Success,
    data: responseJson?.OTA_AirBookRS?.AirReservation,
    error: {
      code: responseJson?.OTA_AirBookRS?.Errors?.Error?.Code,
      message: responseJson?.OTA_AirBookRS?.Errors?.Error?.ShortText,
    }
  };

  return result;
};
