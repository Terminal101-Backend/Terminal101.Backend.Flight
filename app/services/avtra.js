const axios = require("axios");
const axiosApiInstance = axios.create();
const xmljsonParser = require("xml-js");
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
const reformatSearchResponse = searchResponse => {
  if (!Array.isArray(searchResponse)) {
    searchResponse = [searchResponse];
  }

  searchResponse.forEach(itinerary => {
    if (!Array.isArray(itinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption)) {
      itinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption = !!itinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption ? [itinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption] : [];
    }

    itinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption.forEach(od => {
      if (!Array.isArray(od.FlightSegment.BookingClassAvails.BookingClassAvail)) {
        od.FlightSegment.BookingClassAvails.BookingClassAvail = !!od.FlightSegment.BookingClassAvails.BookingClassAvail ? [od.FlightSegment.BookingClassAvails.BookingClassAvail] : [];
      }
    });

    if (!Array.isArray(itinerary.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown)) {
      itinerary.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown = !!itinerary.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown ? [itinerary.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown] : [];
    }

    itinerary.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.forEach(fareBreakdown => {
      if (!Array.isArray(fareBreakdown.FareBasisCodes.FareBasisCode)) {
        fareBreakdown.FareBasisCodes.FareBasisCode = !!fareBreakdown.FareBasisCodes.FareBasisCode ? [fareBreakdown.FareBasisCodes.FareBasisCode] : [];
      }

      if (!Array.isArray(fareBreakdown.PassengerFare.Taxes.Tax)) {
        fareBreakdown.PassengerFare.Taxes.Tax = !!fareBreakdown.PassengerFare.Taxes.Tax ? [fareBreakdown.PassengerFare.Taxes.Tax] : [];
      }
    });

    if (!Array.isArray(itinerary.AirItineraryPricingInfo.FareInfos.FareInfo)) {
      itinerary.AirItineraryPricingInfo.FareInfos.FareInfo = !!itinerary.AirItineraryPricingInfo.FareInfos.FareInfo ? [itinerary.AirItineraryPricingInfo.FareInfos.FareInfo] : [];
    }
  });

  return searchResponse;
};

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
      <DepartureDateTime>${new Date(segments[index].date).toISOString()}</DepartureDateTime>
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
    // object: true
    compact: true, 
    spaces: 4 
  };
  // const responseJson = xmljsonParser.toJson(response, option);
  const responseJson = rmAttrTags(xmljsonParser.xml2js(response, option));

  const result = {
    success: !!responseJson?.OTA_AirLowFareSearchRS?.Success,
    data: reformatSearchResponse(responseJson?.OTA_AirLowFareSearchRS?.PricedItineraries?.PricedItinerary),
  };

  return result;
};

module.exports.book = async (segments, price, contact, travelers, testMode = false) => {
  const originDestinations = [];
  segments.forEach(segment => {
    originDestinations.push(`
      <OriginDestinationOption>
        <FlightSegment FlightNumber="${segment.flightNumber}" DepartureDateTime="${new Date(segment.date).toISOString().replace(/(\.\d{3})?Z$/, "+00:00")}">
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
    const infant = 2 * 365 * 24 * 3600 * 1000;
    const child = 12 * 365 * 24 * 3600 * 1000
    const age = new Date() - new Date(traveler.birthDate);
    if ((traveler.gender === "MALE") || (traveler.gender === "TRANS") || (traveler.gender === "OTHER")) {
      traveler.gender = "M";
    } else {
      traveler.gender = "F";
    }

    const type = (age < infant) ? "INF" : (age < child) ? "CHD" : "ADT";
    switch (traveler.gender) {
      case "M":
        namePrefix = "Mr";
        break;

      case "F":
        namePrefix = "Mrs";
        break;
    }

    travelersInfo.push(`
      <AirTraveler BirthDate="${new Date(traveler.birthDate).toISOString().replace(/(\.\d{3})Z.*$/, "")}" PassengerTypeCode="${type}" AccompaniedByInfantInd="false" Gender="${traveler.gender}" TravelerNationality="${traveler.document.issuedAt}">
        <PersonName>
          <NamePrefix>${namePrefix}</NamePrefix>
          <GivenName>${traveler.firstName}</GivenName>
          <Surname>${traveler.lastName}</Surname>
        </PersonName>
        <TravelerRefNumber RPH="1"/>
        <Document DocID="${traveler.document.code}" DocType="2" ExpireDate="${new Date(traveler.document.expirationDate).toISOString().replace(/(\.\d{3})?Z.*$/, "")}" DocIssueCountry="${traveler.document.issuedAt}" DocHolderNationality="${traveler.document.issuedAt}"/>
      </AirTraveler>
    `);
  });

  const query = `
  <OTA_AirBookRQ xmlns="http://www.opentravel.org/OTA/2003/05" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opentravel.org/OTA/2003/05 
  OTA_AirBookRQ.xsd" EchoToken="50987" TimeStamp="2019-08-22T05:44:10+05:30" Target="Test" Version="2.001" SequenceNmbr="1" PrimaryLangID="En-us">
  <POS>
    <Source AirlineVendorID="IF" ISOCountry="IQ" ISOCurrency="${price.currency}">
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
					<BaseFare CurrencyCode="${price.currency}" DecimalPlaces="2" Amount="${stringHelper.padNumbers(price.base)}"/>
					<TotalFare CurrencyCode="${price.currency}" DecimalPlaces="2" Amount="${stringHelper.padNumbers(price.total)}"/>
				</ItinTotalFare>
			</PriceInfo>
			<TravelerInfo>
        ${travelersInfo.join("\n")}
			</TravelerInfo>
			<ContactPerson>
				<PersonName>
					<GivenName>${travelers[0].firstName}</GivenName>
					<Surname>${travelers[0].lastName}</Surname>
				</PersonName>
			  <Telephone PhoneNumber="${contact.mobileNumber}"/>
			  <HomeTelephone PhoneNumber="${contact.mobileNumber}"/>
			  <Email>${contact.email}</Email>
	    </ContactPerson>
  	  <Fulfillment>
        <PaymentDetails>
            <PaymentDetail PaymentType="2">
                <DirectBill DirectBill_ID="${process.env.AVTRA_OFFICE_ID}">
                    <CompanyName CompanyShortName="${process.env.AVTRA_OFFICE_ID}" Code="${process.env.AVTRA_OFFICE_ID}"/>
                </DirectBill>
                <PaymentAmount CurrencyCode="${price.currency}" DecimalPlaces="2" Amount="${stringHelper.padNumbers(price.total)}"/>
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

module.exports.getBooked = async (id, testMode = false) => {
  const query = `
    <OTA_ReadRQ xmlns="http://www.opentravel.org/OTA/2003/05" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opentravel.org/OTA/2003/05 
    OTA_ReadRQ.xsd" EchoToken="50987" TimeStamp="2019-08-22T05:44:10+05:30" Target="Test" Version="2.001" SequenceNmbr="1" PrimaryLangID="En-us">
      <POS>
        <Source AirlineVendorID="IF" ISOCountry="IQ" ISOCurrency="USD">
          <RequestorID Type="5" ID="${process.env.AVTRA_OFFICE_ID}" />
        </Source>
      </POS>
      <UniqueID ID="${id}"/>
    </OTA_ReadRQ>
  `;

  const {
    data: response
  } = await axiosApiInstance.post("/booking/read", query, { testMode });

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

const rmAttrTags = (result) => {
  if (!Array.isArray(result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary)) {
    result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary["SequenceNumber"] = result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary._attributes.SequenceNumber
    delete result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary["_attributes"]

    result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment["FlightNumber"] = result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment._attributes.FlightNumber;
    result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment["ResBookDesigCode"] = result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment._attributes.ResBookDesigCode;
    result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment["DepartureDateTime"] = result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment._attributes.DepartureDateTime;
    result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment["ArrivalDateTime"] = result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment._attributes.ArrivalDateTime;
    result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment["Duration"] = result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment._attributes.Duration;
    result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment["StopQuantity"] = result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment._attributes.StopQuantity;
    result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment["RPH"] = result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment._attributes.RPH;
    delete result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment["_attributes"];

    result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.DepartureAirport["LocationCode"] = result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.DepartureAirport._attributes.LocationCode;
    delete result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.DepartureAirport["_attributes"];

    result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.ArrivalAirport["LocationCode"] = result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.ArrivalAirport._attributes.LocationCode;
    delete result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.ArrivalAirport["_attributes"];

    result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.OperatingAirline["Code"] = result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.OperatingAirline._attributes.Code;
    delete result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.OperatingAirline["_attributes"]

    result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.Equipment["AirEquipType"] = result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.Equipment._attributes.AirEquipType;
    delete result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.Equipment["_attributes"]

    result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.BookingClassAvails.BookingClassAvail["ResBookDesigCode"] = result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.BookingClassAvails.BookingClassAvail._attributes.ResBookDesigCode
    result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.BookingClassAvails.BookingClassAvail["ResBookDesigQuantity"] = result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.BookingClassAvails.BookingClassAvail._attributes.ResBookDesigQuantity
    delete result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.BookingClassAvails.BookingClassAvail["_attributes"]

    result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.ItinTotalFare.BaseFare["CurrencyCode"] = result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.ItinTotalFare.BaseFare._attributes.CurrencyCode;
    result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.ItinTotalFare.BaseFare["DecimalPlaces"] = result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.ItinTotalFare.BaseFare._attributes.DecimalPlaces;
    result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.ItinTotalFare.BaseFare["Amount"] = result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.ItinTotalFare.BaseFare._attributes.Amount;
    delete result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.ItinTotalFare.BaseFare["_attributes"]

    result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.ItinTotalFare.TotalFare["CurrencyCode"] = result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.ItinTotalFare.TotalFare._attributes.CurrencyCode;
    result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.ItinTotalFare.TotalFare["DecimalPlaces"] = result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.ItinTotalFare.TotalFare._attributes.DecimalPlaces;
    result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.ItinTotalFare.TotalFare["Amount"] = result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.ItinTotalFare.TotalFare._attributes.Amount;
    delete result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.ItinTotalFare.TotalFare["_attributes"]

    result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerTypeQuantity["Code"] = result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerTypeQuantity._attributes.Code;
    result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerTypeQuantity["Quantity"] = result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerTypeQuantity._attributes.Quantity;
    delete result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerTypeQuantity["_attributes"]

    result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.FareBasisCodes.FareBasisCode["FlightSegmentRPH"] = result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.FareBasisCodes.FareBasisCode._attributes.FlightSegmentRPH;
    result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.FareBasisCodes.FareBasisCode["fareRPH"] = result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.FareBasisCodes.FareBasisCode._attributes.fareRPH;
    delete result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.FareBasisCodes.FareBasisCode["_attributes"]
    result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.FareBasisCodes.FareBasisCode["$t"] = result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.FareBasisCodes.FareBasisCode._text
    delete result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.FareBasisCodes.FareBasisCode["_text"]

    result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.BaseFare["CurrencyCode"] = result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.BaseFare._attributes.CurrencyCode;
    result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.BaseFare["DecimalPlaces"] = result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.BaseFare._attributes.DecimalPlaces;
    result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.BaseFare["Amount"] = result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.BaseFare._attributes.Amount;
    delete result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.BaseFare["_attributes"]

    result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.Taxes.Tax.forEach(t => {
      t["TaxCode"] = t._attributes.TaxCode;
      t["TaxName"] = t._attributes.TaxName;
      t["CurrencyCode"] = t._attributes.CurrencyCode;
      t["DecimalPlaces"] = t._attributes.DecimalPlaces;
      t["$t"] = t._text;
      delete t["_attributes"]
      delete t["_text"]
    });

    result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.TotalFare["CurrencyCode"] = result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.TotalFare._attributes.CurrencyCode;
    result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.TotalFare["DecimalPlaces"] = result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.TotalFare._attributes.DecimalPlaces;
    result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.TotalFare["Amount"] = result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.TotalFare._attributes.Amount;
    delete result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.TotalFare["_attributes"]

    if (!Array.isArray(result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.FareBaggageAllowance)) {
      result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.FareBaggageAllowance["FlightSegmentRPH"] = result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.FareBaggageAllowance._attributes.FlightSegmentRPH;
      result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.FareBaggageAllowance["UnitOfMeasureQuantity"] = result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.FareBaggageAllowance._attributes.UnitOfMeasureQuantity;
      result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.FareBaggageAllowance["UnitOfMeasure"] = result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.FareBaggageAllowance._attributes.UnitOfMeasure;
      result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.FareBaggageAllowance["UnitOfMeasureCode"] = result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.FareBaggageAllowance._attributes.UnitOfMeasureCode;
      delete result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.FareBaggageAllowance["_attributes"]
    } else {
      result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.FareBaggageAllowance.forEach(q => {
        q["FlightSegmentRPH"] = q._attributes.FlightSegmentRPH;
        q["UnitOfMeasureQuantity"] = q._attributes.UnitOfMeasureQuantity;
        q["UnitOfMeasure"] = q._attributes.UnitOfMeasure;
        q["UnitOfMeasureCode"] = q._attributes.UnitOfMeasureCode;
        delete q["_attributes"]
      })
    }
    result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.FareInfos.FareInfo.RuleInfo.ChargesRules.VoluntaryChanges["VolChangeInd"] = result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.FareInfos.FareInfo.RuleInfo.ChargesRules.VoluntaryChanges._attributes.VolChangeInd;
    delete result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.FareInfos.FareInfo.RuleInfo.ChargesRules.VoluntaryChanges["_attributes"]
    result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.FareInfos.FareInfo.RuleInfo.ChargesRules.VoluntaryChanges.Penalty["PenaltyType"] = result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.FareInfos.FareInfo.RuleInfo.ChargesRules.VoluntaryChanges.Penalty._attributes.PenaltyType;
    result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.FareInfos.FareInfo.RuleInfo.ChargesRules.VoluntaryChanges.Penalty["DepartureStatus"] = result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.FareInfos.FareInfo.RuleInfo.ChargesRules.VoluntaryChanges.Penalty._attributes.DepartureStatus;
    result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.FareInfos.FareInfo.RuleInfo.ChargesRules.VoluntaryChanges.Penalty["CurrencyCode"] = result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.FareInfos.FareInfo.RuleInfo.ChargesRules.VoluntaryChanges.Penalty._attributes.CurrencyCode;
    result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.FareInfos.FareInfo.RuleInfo.ChargesRules.VoluntaryChanges.Penalty["Amount"] = result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.FareInfos.FareInfo.RuleInfo.ChargesRules.VoluntaryChanges.Penalty._attributes.Amount;
    delete result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.FareInfos.FareInfo.RuleInfo.ChargesRules.VoluntaryChanges.Penalty["_attributes"]

    result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.FareInfos.FareInfo.RuleInfo.ChargesRules.VoluntaryRefunds["VolChangeInd"] = result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.FareInfos.FareInfo.RuleInfo.ChargesRules.VoluntaryRefunds._attributes.VolChangeInd;
    delete result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.FareInfos.FareInfo.RuleInfo.ChargesRules.VoluntaryRefunds["_attributes"]
    result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.FareInfos.FareInfo.RuleInfo.ChargesRules.VoluntaryRefunds.Penalty["PenaltyType"] = result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.FareInfos.FareInfo.RuleInfo.ChargesRules.VoluntaryRefunds.Penalty._attributes.PenaltyType;
    result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.FareInfos.FareInfo.RuleInfo.ChargesRules.VoluntaryRefunds.Penalty["DepartureStatus"] = result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.FareInfos.FareInfo.RuleInfo.ChargesRules.VoluntaryRefunds.Penalty._attributes.DepartureStatus;
    result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.FareInfos.FareInfo.RuleInfo.ChargesRules.VoluntaryRefunds.Penalty["CurrencyCode"] = result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.FareInfos.FareInfo.RuleInfo.ChargesRules.VoluntaryRefunds.Penalty._attributes.CurrencyCode;
    result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.FareInfos.FareInfo.RuleInfo.ChargesRules.VoluntaryRefunds.Penalty["Amount"] = result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.FareInfos.FareInfo.RuleInfo.ChargesRules.VoluntaryRefunds.Penalty._attributes.Amount;
    delete result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.FareInfos.FareInfo.RuleInfo.ChargesRules.VoluntaryRefunds.Penalty["_attributes"]

    result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.FareInfos.FareInfo.DepartureAirport["LocationCode"] = result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.FareInfos.FareInfo.DepartureAirport._attributes.LocationCode;
    delete result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.FareInfos.FareInfo.DepartureAirport["_attributes"]

    result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.FareInfos.FareInfo.ArrivalAirport["LocationCode"] = result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.FareInfos.FareInfo.ArrivalAirport._attributes.LocationCode;
    delete result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.FareInfos.FareInfo.ArrivalAirport["_attributes"]


  } else {
    result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.forEach(p => {
      p["SequenceNumber"] = p._attributes.SequenceNumber
      delete p["_attributes"]

      p.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment["FlightNumber"] = p.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment._attributes.FlightNumber;
      p.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment["ResBookDesigCode"] = p.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment._attributes.ResBookDesigCode;
      p.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment["DepartureDateTime"] = p.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment._attributes.DepartureDateTime;
      p.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment["ArrivalDateTime"] = p.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment._attributes.ArrivalDateTime;
      p.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment["Duration"] = p.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment._attributes.Duration;
      p.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment["StopQuantity"] = p.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment._attributes.StopQuantity;
      p.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment["RPH"] = p.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment._attributes.RPH;
      delete p.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment["_attributes"];

      p.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.DepartureAirport["LocationCode"] = p.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.DepartureAirport._attributes.LocationCode;
      delete p.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.DepartureAirport["_attributes"];

      p.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.ArrivalAirport["LocationCode"] = p.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.ArrivalAirport._attributes.LocationCode;
      delete p.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.ArrivalAirport["_attributes"];

      p.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.OperatingAirline["Code"] = p.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.OperatingAirline._attributes.Code;
      delete p.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.OperatingAirline["_attributes"]

      p.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.Equipment["AirEquipType"] = p.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.Equipment._attributes.AirEquipType;
      delete p.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.Equipment["_attributes"]

      p.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.BookingClassAvails.BookingClassAvail["ResBookDesigCode"] = p.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.BookingClassAvails.BookingClassAvail._attributes.ResBookDesigCode
      p.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.BookingClassAvails.BookingClassAvail["ResBookDesigQuantity"] = p.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.BookingClassAvails.BookingClassAvail._attributes.ResBookDesigQuantity
      delete p.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.BookingClassAvails.BookingClassAvail["_attributes"]

      p.AirItineraryPricingInfo.ItinTotalFare.BaseFare["CurrencyCode"] = p.AirItineraryPricingInfo.ItinTotalFare.BaseFare._attributes.CurrencyCode;
      p.AirItineraryPricingInfo.ItinTotalFare.BaseFare["DecimalPlaces"] = p.AirItineraryPricingInfo.ItinTotalFare.BaseFare._attributes.DecimalPlaces;
      p.AirItineraryPricingInfo.ItinTotalFare.BaseFare["Amount"] = p.AirItineraryPricingInfo.ItinTotalFare.BaseFare._attributes.Amount;
      delete p.AirItineraryPricingInfo.ItinTotalFare.BaseFare["_attributes"]

      p.AirItineraryPricingInfo.ItinTotalFare.TotalFare["CurrencyCode"] = p.AirItineraryPricingInfo.ItinTotalFare.TotalFare._attributes.CurrencyCode;
      p.AirItineraryPricingInfo.ItinTotalFare.TotalFare["DecimalPlaces"] = p.AirItineraryPricingInfo.ItinTotalFare.TotalFare._attributes.DecimalPlaces;
      p.AirItineraryPricingInfo.ItinTotalFare.TotalFare["Amount"] = p.AirItineraryPricingInfo.ItinTotalFare.TotalFare._attributes.Amount;
      delete p.AirItineraryPricingInfo.ItinTotalFare.TotalFare["_attributes"]

      p.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerTypeQuantity["Code"] = p.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerTypeQuantity._attributes.Code;
      p.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerTypeQuantity["Quantity"] = p.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerTypeQuantity._attributes.Quantity;
      delete p.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerTypeQuantity["_attributes"]

      p.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.FareBasisCodes.FareBasisCode["FlightSegmentRPH"] = p.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.FareBasisCodes.FareBasisCode._attributes.FlightSegmentRPH;
      p.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.FareBasisCodes.FareBasisCode["fareRPH"] = p.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.FareBasisCodes.FareBasisCode._attributes.fareRPH;
      delete p.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.FareBasisCodes.FareBasisCode["_attributes"]
      p.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.FareBasisCodes.FareBasisCode["$t"] = p.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.FareBasisCodes.FareBasisCode._text
      delete p.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.FareBasisCodes.FareBasisCode["_text"]

      p.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.BaseFare["CurrencyCode"] = p.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.BaseFare._attributes.CurrencyCode;
      p.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.BaseFare["DecimalPlaces"] = p.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.BaseFare._attributes.DecimalPlaces;
      p.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.BaseFare["Amount"] = p.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.BaseFare._attributes.Amount;
      delete p.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.BaseFare["_attributes"]

      p.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.Taxes.Tax.forEach(t => {
        t["TaxCode"] = t._attributes.TaxCode;
        t["TaxName"] = t._attributes.TaxName;
        t["CurrencyCode"] = t._attributes.CurrencyCode;
        t["DecimalPlaces"] = t._attributes.DecimalPlaces;
        t["$t"] = t._text;
        delete t["_attributes"]
        delete t["_text"]
      });

      p.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.TotalFare["CurrencyCode"] = p.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.TotalFare._attributes.CurrencyCode;
      p.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.TotalFare["DecimalPlaces"] = p.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.TotalFare._attributes.DecimalPlaces;
      p.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.TotalFare["Amount"] = p.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.TotalFare._attributes.Amount;
      delete p.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.TotalFare["_attributes"]

      if (!Array.isArray(p.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.FareBaggageAllowance)) {
        p.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.FareBaggageAllowance["FlightSegmentRPH"] = p.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.FareBaggageAllowance._attributes.FlightSegmentRPH;
        p.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.FareBaggageAllowance["UnitOfMeasureQuantity"] = p.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.FareBaggageAllowance._attributes.UnitOfMeasureQuantity;
        p.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.FareBaggageAllowance["UnitOfMeasure"] = p.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.FareBaggageAllowance._attributes.UnitOfMeasure;
        p.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.FareBaggageAllowance["UnitOfMeasureCode"] = p.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.FareBaggageAllowance._attributes.UnitOfMeasureCode;
        delete p.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.FareBaggageAllowance["_attributes"]
      } else {
        p.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.FareBaggageAllowance.forEach(q => {
          q["FlightSegmentRPH"] = q._attributes.FlightSegmentRPH;
          q["UnitOfMeasureQuantity"] = q._attributes.UnitOfMeasureQuantity;
          q["UnitOfMeasure"] = q._attributes.UnitOfMeasure;
          q["UnitOfMeasureCode"] = q._attributes.UnitOfMeasureCode;
          delete q["_attributes"]
        })
      }
      p.AirItineraryPricingInfo.FareInfos.FareInfo.RuleInfo.ChargesRules.VoluntaryChanges["VolChangeInd"] = p.AirItineraryPricingInfo.FareInfos.FareInfo.RuleInfo.ChargesRules.VoluntaryChanges._attributes.VolChangeInd;
      delete p.AirItineraryPricingInfo.FareInfos.FareInfo.RuleInfo.ChargesRules.VoluntaryChanges["_attributes"]
      p.AirItineraryPricingInfo.FareInfos.FareInfo.RuleInfo.ChargesRules.VoluntaryChanges.Penalty["PenaltyType"] = p.AirItineraryPricingInfo.FareInfos.FareInfo.RuleInfo.ChargesRules.VoluntaryChanges.Penalty._attributes.PenaltyType;
      p.AirItineraryPricingInfo.FareInfos.FareInfo.RuleInfo.ChargesRules.VoluntaryChanges.Penalty["DepartureStatus"] = p.AirItineraryPricingInfo.FareInfos.FareInfo.RuleInfo.ChargesRules.VoluntaryChanges.Penalty._attributes.DepartureStatus;
      p.AirItineraryPricingInfo.FareInfos.FareInfo.RuleInfo.ChargesRules.VoluntaryChanges.Penalty["CurrencyCode"] = p.AirItineraryPricingInfo.FareInfos.FareInfo.RuleInfo.ChargesRules.VoluntaryChanges.Penalty._attributes.CurrencyCode;
      p.AirItineraryPricingInfo.FareInfos.FareInfo.RuleInfo.ChargesRules.VoluntaryChanges.Penalty["Amount"] = p.AirItineraryPricingInfo.FareInfos.FareInfo.RuleInfo.ChargesRules.VoluntaryChanges.Penalty._attributes.Amount;
      delete p.AirItineraryPricingInfo.FareInfos.FareInfo.RuleInfo.ChargesRules.VoluntaryChanges.Penalty["_attributes"]

      p.AirItineraryPricingInfo.FareInfos.FareInfo.RuleInfo.ChargesRules.VoluntaryRefunds["VolChangeInd"] = p.AirItineraryPricingInfo.FareInfos.FareInfo.RuleInfo.ChargesRules.VoluntaryRefunds._attributes.VolChangeInd;
      delete p.AirItineraryPricingInfo.FareInfos.FareInfo.RuleInfo.ChargesRules.VoluntaryRefunds["_attributes"]
      p.AirItineraryPricingInfo.FareInfos.FareInfo.RuleInfo.ChargesRules.VoluntaryRefunds.Penalty["PenaltyType"] = p.AirItineraryPricingInfo.FareInfos.FareInfo.RuleInfo.ChargesRules.VoluntaryRefunds.Penalty._attributes.PenaltyType;
      p.AirItineraryPricingInfo.FareInfos.FareInfo.RuleInfo.ChargesRules.VoluntaryRefunds.Penalty["DepartureStatus"] = p.AirItineraryPricingInfo.FareInfos.FareInfo.RuleInfo.ChargesRules.VoluntaryRefunds.Penalty._attributes.DepartureStatus;
      p.AirItineraryPricingInfo.FareInfos.FareInfo.RuleInfo.ChargesRules.VoluntaryRefunds.Penalty["CurrencyCode"] = p.AirItineraryPricingInfo.FareInfos.FareInfo.RuleInfo.ChargesRules.VoluntaryRefunds.Penalty._attributes.CurrencyCode;
      p.AirItineraryPricingInfo.FareInfos.FareInfo.RuleInfo.ChargesRules.VoluntaryRefunds.Penalty["Amount"] = p.AirItineraryPricingInfo.FareInfos.FareInfo.RuleInfo.ChargesRules.VoluntaryRefunds.Penalty._attributes.Amount;
      delete p.AirItineraryPricingInfo.FareInfos.FareInfo.RuleInfo.ChargesRules.VoluntaryRefunds.Penalty["_attributes"]

      p.AirItineraryPricingInfo.FareInfos.FareInfo.DepartureAirport["LocationCode"] = p.AirItineraryPricingInfo.FareInfos.FareInfo.DepartureAirport._attributes.LocationCode;
      delete p.AirItineraryPricingInfo.FareInfos.FareInfo.DepartureAirport["_attributes"]

      p.AirItineraryPricingInfo.FareInfos.FareInfo.ArrivalAirport["LocationCode"] = p.AirItineraryPricingInfo.FareInfos.FareInfo.ArrivalAirport._attributes.LocationCode;
      delete p.AirItineraryPricingInfo.FareInfos.FareInfo.ArrivalAirport["_attributes"]

    })
  }
  return result;
}