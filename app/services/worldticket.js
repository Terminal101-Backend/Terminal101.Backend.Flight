const xmljsonParser = require("fast-xml-parser");
const qs = require('qs');
const axios = require("axios");
const axiosApiInstance = axios.create();
let accessToken = "";
let modeText = "_TEST";

const reformatToArray = path => {
    const root = path.split(".")[0];

    const lowFareSearchArrays = [
        "OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary",
        "OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption",
        "OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.BookingClassAvails.BookingClassAvail",
        "OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown",
        "OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.FareBasisCodes.FareBasisCode",
        "OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.Taxes.Tax",
        "OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.AirItineraryPricingInfo.FareInfos.FareInfo",
    ];
    const airAvailArrays = [
        "OTA_AirAvailRS.OriginDestinationInformation.OriginDestinationOptions.OriginDestinationOption"
    ];
    const airPriceArrays = [

    ];
    const bookArrays = [

    ];
    const ticketDemandArrays = [
        "OTA_AirDemandTicketRS.TicketItemInfo"
    ];
    const airReadArrays = [

    ];

    switch (root) {
        case "OTA_AirLowFareSearchRS":
            if (lowFareSearchArrays.indexOf(path) !== -1) return true;
            break;
        case "OTA_AirAvailRS":
            if (airAvailArrays.indexOf(path) !== -1) return true;
            break;
        case "OTA_AirPriceRS":
            if (airPriceArrays.indexOf(path) !== -1) return true;
            break;
        case "OTA_AirBookRS":
            if (bookArrays.indexOf(path) !== -1) return true;
            break;
        case "OTA_AirDemandTicketRS":
            if (ticketDemandArrays.indexOf(path) !== -1) return true;
            break;
        case "OTA_ReadRS":
            if (airReadArrays.indexOf(path) !== -1) return true;
            break;
        case "":
            break;

        default:
    }
};

const option = {
    ignoreDeclaration: true,
    ignoreAttributes: false,
    attributeNamePrefix: "",
    allowBooleanAttributes: true,
    parseAttributeValue: true,
    alwaysCreateTextNode: true,
    removeNSPrefix: true,
    textNodeName: "$t",
    numberParseOptions: {
        leadingZeros: true,
        hex: true,
        skipLike: /\+[0-9]{10}/
    },
    isArray: (name, jpath, isLeafNode, isAttribute) => reformatToArray(jpath)
};

const xmlParser = new xmljsonParser.XMLParser(option);

// Request interceptor for API calls
axiosApiInstance.interceptors.request.use(
    async config => {
        config.baseURL = process.env["FLYERBIL_BASE_URL" + modeText];
        config.headers = {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': '*/*',
            'Content-Type': 'application/xml',
        }
        return config;
    },
    error => {
        Promise.reject(error)
    });

// Response interceptor for API calls
axiosApiInstance.interceptors.response.use((response) => {
    return response
}, async function (error) {
    const originalRequest = error.config;
    if (!!error.response && [401, 403, 406, 500].includes(error.response.status) && !originalRequest._retry) {
        originalRequest._retry = true;
        await getAccessToken();
        axios.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken;
        return axiosApiInstance(originalRequest);
    }
    return Promise.reject(error);
});

const getAccessToken = async () => {
    var data = {
        "grant_type": process.env["FLYERBIL_GRANT_TYPE" + modeText],
        "client_id": process.env["FLYERBIL_CLIENT_ID" + modeText],
        "client_secret": process.env["FLYERBIL_CLIENT_SECRET" + modeText],
        "username": process.env["FLYERBIL_USERNAME" + modeText],
        "password": process.env["FLYERBIL_PASSWORD" + modeText]
    }

    delete axios.defaults.headers.common['Authorization'];

    const {
        data: response
    } = await axios.post(process.env["FLYERBIL_BASE_AUTH_URL" + modeText] + `/auth/realms/${process.env["FLYERBIL_TENANT" + modeText]}/protocol/openid-connect/token`, qs.stringify(data), {
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
        },
    });

    accessToken = response.access_token;

    return response;
};

const airLowFareSearch = async (originLocationCode, destinationLocationCode, departureDate, returnDate,
    segments = [], adults = 1, children = 0, infants = 0, travelClass, includedAirlineCodes,
    excludedAirlineCodes, nonStop, currencyCode = "USD", testMode = false) => {
    // modeText = !!testMode ? "" : "_TEST";
    let travelClassCode;
    switch (travelClass) {
        case "FIRST":
            travelClassCode = "F";
            break;

        case "BUSINESS":
            travelClassCode = "C";
            break;

        case "ECONOMY":
            travelClassCode = "Y";
            break;

        case "PREMIUM_ECONOMY":
            travelClassCode = "W";
            break;

        default:
            throw "travel_class_invalid";
    }
    //segments = flightHelper.makeSegmentsArray(segments);
    segments = segments ?? [];
    if (!Array.isArray(segments)) {
        try {
            segments = segments.split(",");
        } catch (e) {
            segments = [segments];
        }
    };
    segments = segments.map(segment => {
        const segment_date = segment.trim().split(":");
        return {
            originCode: segment_date[0],
            destinationCode: segment_date[1],
            date: segment_date[2],
        };
    });
    const originDestinations = [];
    originDestinations.push(`<OriginDestinationInformation>
    <DepartureDateTime WindowAfter="P0D" WindowBefore="P0D">${new Date(departureDate).toISOString().split('T')[0]}</DepartureDateTime>
  <OriginLocation LocationCode="${originLocationCode}" />
  <DestinationLocation LocationCode="${destinationLocationCode}" />
  </OriginDestinationInformation>`);

    for (let index = 0; index < segments?.length ?? 0; index++) {
        originDestinations.push(`<OriginDestinationInformation>
        <DepartureDateTime WindowAfter="P0D" WindowBefore="P0D">"${new Date(segments[index].date).toISOString().split('T')[0]}"</DepartureDateTime>
    <OriginLocation LocationCode="${segments[index].originCode}" />
    <DestinationLocation LocationCode="${segments[index].destinationCode}" />
    </OriginDestinationInformation>`);
    }

    if (!!returnDate) {
        if (!!segments && (segments?.length ?? 0 > 0)) {
            originDestinations.push(`<OriginDestinationInformation>
            <DepartureDateTime WindowAfter="P0D" WindowBefore="P0D">${new Date(returnDate).toISOString().split('T')[0]}</DepartureDateTime>
      <OriginLocation LocationCode="${segments[segments.length - 1].destinationCode}" />
      <DestinationLocation LocationCode="${originLocationCode}" />
      </OriginDestinationInformation>`);
        } else {
            originDestinations.push(`<OriginDestinationInformation>
            <DepartureDateTime WindowAfter="P0D" WindowBefore="P0D">${new Date(returnDate).toISOString().split('T')[0]}</DepartureDateTime>
      <OriginLocation LocationCode="${destinationLocationCode}" />
      <DestinationLocation LocationCode="${originLocationCode}" />
      </OriginDestinationInformation>`);
        }
    }

    const query = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <OTA_AirLowFareSearchRQ
     xmlns="http://www.opentravel.org/OTA/2003/05"
     xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
     xsi:schemaLocation="http://www.opentravel.org/OTA/2003/05
    OTA_AirLowFareSearchRQ.xsd"
     TimeStamp="${new Date().toISOString().split('Z')[0]}"
     Version="2.001"
     PrimaryLangID="en"
     MaxResponses="1"
     DirectFlightsOnly="false"
     AvailableFlightsOnly="true">
        <POS>
            <Source ISOCurrency="EUR">
                <RequestorID Type="5" ID="08336230"/>
            </Source>
        </POS>
        <ProcessingInfo DisplayOrder="ByPriceLowToHigh"
    AvailabilityIndicator="true"/>
        ${originDestinations.join("\n")}
        <SpecificFlightInfo>
            <BookingClassPref ResBookDesigCode="${travelClassCode}"/>
        </SpecificFlightInfo>
        <TravelerInfoSummary>
            <AirTravelerAvail>
            <PassengerTypeQuantity Code="ADT" Quantity="${adults ?? 1}" />
            </AirTravelerAvail>
            <AirTravelerAvail>
            <PassengerTypeQuantity Code="CHD" Quantity="${children ?? 0}" />
            </AirTravelerAvail>
            <AirTravelerAvail>
            <PassengerTypeQuantity Code="INF" Quantity="${infants ?? 0}" />
            </AirTravelerAvail>
        </TravelerInfoSummary>
    </OTA_AirLowFareSearchRQ>`;

    const { data: response_ } = await axiosApiInstance.post(`${process.env["FLYERBIL_BASE_URL" + modeText]}/${process.env["FLYERBIL_TENANT" + modeText]}/ota-ecom-saml`, query);

    let response = response_.replaceAll('ota:', '');

    const responseJson = xmlParser.parse(response);
    if (!!responseJson?.OTA_AirLowFareSearchRS?.Success) {
        return {
            success: !!responseJson?.OTA_AirLowFareSearchRS?.Success,
            data: responseJson?.OTA_AirLowFareSearchRS?.PricedItineraries?.PricedItinerary,
        };
    }
    else {
        return {
            success: !responseJson?.OTA_AirLowFareSearchRS?.Success,
            data: { error: responseJson?.OTA_AirLowFareSearchRS?.Errors?.Error.$t },
        }
    }
};

const availableRoutes = async (testMode = false) => {
    // modeText = !!testMode ? "" : "_TEST";
    const {
        data: response
    } = await axios.get(`${process.env["FLYERBIL_BASE_URL" + modeText]}/${process.env["FLYERBIL_TENANT" + modeText]}/rest/route`);

    return response;
};

const calendarAvailability = async (departure, arrival, start_date, end_date, testMode = false) => {
    // modeText = !!testMode ? "" : "_TEST";
    const data = {
        departure,
        arrival,
        start_date,
        end_date
    }
    const {
        data: response
    } = await axiosApiInstance.get(`${process.env["FLYERBIL_BASE_URL" + modeText]}/${process.env["FLYERBIL_TENANT" + modeText]}/rest/calendar/availability`, { params: data });

    return response;
};

const airAvailable = async (originLocationCode, destinationLocationCode, departureDate, travelClass, testMode = false) => {
    // modeText = !!testMode ? "" : "_TEST";
    let tClass = travelClass.toLowerCase().charAt(0).toUpperCase() + travelClass.toLowerCase().slice(1);
    const query = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
  <OTA_AirAvailRQ xmlns="http://www.opentravel.org/OTA/2003/05" 
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
   SequenceNmbr="1" 
   TimeStamp="${new Date().toISOString()}" 
   Version="2.001" PrimaryLangID="en" 
   DirectFlightsOnly="false" 
   xsi:schemaLocation="http://www.opentravel.org/OTA/2003/05 OTA_AirAvailRQ.xsd">
      <POS>
          <Source ISOCurrency="EUR">
              <RequestorID Type="5" ID="35896241"/>
          </Source>
      </POS>
      <OriginDestinationInformation>
      <DepartureDateTime WindowAfter="P0D">${departureDate}</DepartureDateTime>
          <OriginLocation LocationCode="${originLocationCode}"></OriginLocation>
          <DestinationLocation LocationCode="${destinationLocationCode}"></DestinationLocation>
      </OriginDestinationInformation>
      <TravelPreferences MaxStopsQuantity="1">
      <CabinPref Cabin="${tClass}"/>
      </TravelPreferences>
      <TravelerInfoSummary>
          <AirTravelerAvail>
              <PassengerTypeQuantity Code="ADT" Quantity="1"/>
          </AirTravelerAvail>
      </TravelerInfoSummary>
  </OTA_AirAvailRQ>`;

    const {
        data: response_
    } = await axiosApiInstance.post(`${process.env["FLYERBIL_BASE_URL" + modeText]}/${process.env["FLYERBIL_TENANT" + modeText]}/ota-ecom-saml`, query);

    let response = response_.replaceAll('ota:', '');
    const responseJson = xmlParser.parse(response);

    if (!!responseJson?.OTA_AirAvailRS?.Success) {
        return {
            success: !!responseJson?.OTA_AirAvailRS?.Success,
            data: responseJson?.OTA_AirAvailRS?.OriginDestinationInformation,
        }
    } else {
        return {
            success: !responseJson?.OTA_AirAvailRS?.Success,
            data: { error: responseJson?.OTA_AirAvailRS?.Errors?.Error.$t },
        }
    }
};

const airPrice = async (flight, adults = 1, children = 0, infants = 0, testMode = false) => {
    // modeText = !!testMode ? "" : "_TEST";
    const segments = flight.itineraries[0].segments;
    const flightSegments = [];
    for (let index = 0; index < segments?.length ?? 0; index++) {
        flightSegments.push(`<FlightSegment DepartureDateTime="${new Date(segments[index].departure.at).toISOString().split('Z')[0]}" ArrivalDateTime="${new Date(segments[index].arrival.at).toISOString().split('Z')[0]}" FlightNumber="${segments[index].flightNumber}" RPH="${index + 1}" ResBookDesigCode="${flight.providerData.resBookCode}" Status="${flight.providerData.Status}">
        <DepartureAirport LocationCode="${segments[index].departure.airport.code}" />
        <ArrivalAirport LocationCode="${segments[index].arrival.airport.code}" />
        <MarketingAirline Code="${flight.providerData.codeAirline}"/>
        <TPA_Extensions>
            <FareBasis Code="${flight.providerData.FareBasis}"/>
        </TPA_Extensions>
    </FlightSegment>`);
    }
    let traveler = `<AirTravelerAvail>
    <PassengerTypeQuantity Code="ADT" Quantity="${adults ?? 1}"/>
    <AirTraveler PassengerTypeCode="ADT">
        <PersonName>
            <GivenName> </GivenName>
            <Surname> </Surname>
        </PersonName>
        <TravelerRefNumber RPH="1"/>
    </AirTraveler>
    </AirTravelerAvail>`;

    traveler += children ? `
    <AirTravelerAvail>
    <PassengerTypeQuantity Code="CHD" Quantity="${children ?? 0}"/>
    <AirTraveler PassengerTypeCode="CHD">
        <PersonName>
            <GivenName> </GivenName>
            <Surname> </Surname>
        </PersonName>
        <TravelerRefNumber RPH="2"/>
    </AirTraveler>
    </AirTravelerAvail>`: ``;

    traveler += infants ? `<AirTravelerAvail>
    <PassengerTypeQuantity Code="INF" Quantity="${infants ?? 0}"/>
    <AirTraveler PassengerTypeCode="INF">
        <PersonName>
            <GivenName> </GivenName>
            <Surname> </Surname>
        </PersonName>
        <TravelerRefNumber RPH="3"/>
    </AirTraveler>
    </AirTravelerAvail>`: ``;

    const query = `<?xml version="1.0"?>
    <OTA_AirPriceRQ xmlns="http://www.opentravel.org/OTA/2003/05" 
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.opentravel.org/OTA/2003/05 
    OTA_AirPriceRQ.xsd" TimeStamp="${new Date().toISOString().split('Z')[0]}" 
    Version="2.001" PrimaryLangID="en" Type="PerSegment">
        <POS>
            <Source ISOCurrency="EUR">
                <RequestorID Type="5" ID="35896241"/>
            </Source>
        </POS>
        <AirItinerary>
            <OriginDestinationOptions>
                <OriginDestinationOption>
                ${flightSegments.join("\n")}
                </OriginDestinationOption>
            </OriginDestinationOptions>
        </AirItinerary>
        <TravelerInfoSummary>
        ${traveler}
        </TravelerInfoSummary>
    </OTA_AirPriceRQ>`;

    const {
        data: response_
    } = await axiosApiInstance.post(`${process.env["FLYERBIL_BASE_URL" + modeText]}/${process.env["FLYERBIL_TENANT" + modeText]}/ota-ecom-saml`, query);

    let response = response_.replaceAll('ota:', '');

    const responseJson = xmlParser.parse(response);
    if (!!responseJson?.OTA_AirPriceRS?.Success) {
        return {
            success: !!responseJson?.OTA_AirPriceRS?.Success,
            data: responseJson?.OTA_AirPriceRS?.PricedItineraries?.PricedItinerary,
        }
    } else {
        return {
            success: !responseJson?.OTA_AirPriceRS?.Success,
            data: { error: responseJson?.OTA_AirPriceRS?.Errors?.Error.$t },
        }
    }
};

const book = async (segments, price, contact, passengers, testMode = false) => {
    // modeText = !!testMode ? "" : "_TEST";
    const originDestinations = [];
    for (let index = 0; index < segments?.length ?? 0; index++) {
        originDestinations.push(`<OriginDestinationOption>
        <FlightSegment DepartureDateTime="${new Date(segments[index].date).toISOString().replace(/(\.\d{3})Z.*$/, "")}"
        FlightNumber="${segments[index].flightNumber}" 
        RPH="${index + 1}" ResBookDesigCode="${segments[index].travelClass}" Status="${segments[index].status}">
        <DepartureAirport LocationCode="${segments[index].originCode}" />
        <ArrivalAirport LocationCode="${segments[index].destinationCode}" />
        <MarketingAirline Code="${segments[index].airlineCode}"/>
        <TPA_Extensions>
        </TPA_Extensions>
        </FlightSegment>
        </OriginDestinationOption>`);
    };
    const travelersInfo = [];
    for (let index = 0; index < passengers?.length ?? 0; index++) {
        let namePrefix;
        const infant = 2 * 365 * 24 * 3600 * 1000;
        const child = 12 * 365 * 24 * 3600 * 1000
        const age = new Date() - new Date(passengers[index].birthDate);

        const type = (age < infant) ? "INF" : (age < child) ? "CHD" : "ADT";
        let gender;
        switch (passengers[index].gender) {
            case "MALE":
                namePrefix = (type === "ADT") ? "Mr" : "Master";
                gender = "Male";
                break;

            case "FEMALE":
                namePrefix = (type === "ADT") ? "Mrs" : "Miss";
                gender = "Female";
                break;
        }
        travelersInfo.push(`<AirTraveler Gender="${gender}" PassengerTypeCode="${type}">
            <PersonName>
            <NamePrefix>${namePrefix}</NamePrefix>
                <GivenName>${passengers[index].firstName}</GivenName>
                <Surname>${passengers[index].lastName}</Surname>
            </PersonName>
            <Telephone CountryAccessCode="66" PhoneNumber="${contact.mobileNumber}" PhoneTechType="5"/>
            <Email EmailType="1">${contact.email}</Email>
            <TravelerRefNumber RPH="${index + 1}"/>
        </AirTraveler>`);
    }

    const query = `<?xml version="1.0"?>
    <OTA_AirBookRQ xmlns="http://www.opentravel.org/OTA/2003/05" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.opentravel.org/OTA/2003/05 OTA_AirBookRQ.xsd"
     TimeStamp="${new Date().toISOString().replace(/(\.\d{3})Z.*$/, "")}" 
     Target="Production" Version="2.001" PrimaryLangID="en">
        <POS>
            <Source ISOCurrency="${price.currency}">
                <RequestorID Type="5" ID="35896241"/>
            </Source>
        </POS>
        <AirItinerary>
            <OriginDestinationOptions>
                ${originDestinations.join("\n")}
            </OriginDestinationOptions>
        </AirItinerary>
        <TravelerInfo>
        ${travelersInfo.join("\n")}
        </TravelerInfo>
    </OTA_AirBookRQ>`;

    const {
        data: response_
    } = await axiosApiInstance.post(`${process.env["FLYERBIL_BASE_URL" + modeText]}/${process.env["FLYERBIL_TENANT" + modeText]}/ota-ecom-saml`, query);

    let response = response_.replaceAll('ota:', '');

    const responseJson = xmlParser.parse(response);
    if (!!responseJson?.OTA_AirBookRS?.Success) {
        return {
            success: !!responseJson?.OTA_AirBookRS?.Success,
            data: responseJson?.OTA_AirBookRS?.AirReservation,
        };
    }
    else {
        return {
            success: !responseJson?.OTA_AirBookRS?.Success,
            data: { error: responseJson?.OTA_AirBookRS?.Errors?.Error.$t },
        }
    }
};

const ticketDemand = async (providerPnr, testMode = false) => {
    // modeText = !!testMode ? "" : "_TEST";
    const query = `<OTA_AirDemandTicketRQ xmlns="http://www.opentravel.org/OTA/2003/05"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.opentravel.org/OTA/2003/05 OTA_AirDemandTicketRQ.xsd"
    TimeStamp="${new Date().toISOString()}" Version="1.000" >
    <DemandTicketDetail>
        <BookingReferenceID Type="14" ID="${providerPnr}">
        </BookingReferenceID>
    </DemandTicketDetail>
</OTA_AirDemandTicketRQ>`;

    const {
        data: response_
    } = await axiosApiInstance.post(`${process.env["FLYERBIL_BASE_URL" + modeText]}/${process.env["FLYERBIL_TENANT" + modeText]}/ota-ecom-saml`, query);

    let response = response_.replaceAll('ota:', '');
    const responseJson = xmlParser.parse(response);
    if (!!responseJson?.OTA_AirDemandTicketRS?.Success) {
        return {
            success: !!responseJson?.OTA_AirDemandTicketRS?.Success,
            data: responseJson?.OTA_AirDemandTicketRS,
        }
    } else {
        return {
            success: !responseJson?.OTA_AirDemandTicketRS?.Success,
            data: { error: responseJson?.OTA_AirDemandTicketRS?.Errors?.Error.$t },
        }
    }
};

const airRead = async (bookedFlight, passengers) => {
    const travelers = [];
    for (let index = 0; index < passengers?.length ?? 0; index++) {
        travelers.push(`
        <PersonName>
        <Surname>${passengers[index].lastName}</Surname>
        </PersonName>
    `);
    }

    const query = `<OTA_ReadRQ
    xmlns="http://www.opentravel.org/OTA/2003/05"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.opentravel.org/OTA/2003/05 OTA_ReadRQ.xsd"
    TimeStamp="${new Date().toISOString()}"
    Version="2.001"
    PrimaryLangID="en">
    <POS>
        <Source ISOCurrency="EUR" >
        </Source>
    </POS>
    <ReadRequests>
        <ReadRequest>
            <UniqueID ID=${bookedFlight.providerPnr} Type="14"/>
            <Verification>
               ${travelers.join("\n")}
            </Verification>
        </ReadRequest>
    </ReadRequests>
</OTA_ReadRQ>`;

    const {
        data: response_
    } = await axiosApiInstance.post(`${process.env["FLYERBIL_BASE_URL" + modeText]}/${process.env["FLYERBIL_TENANT" + modeText]}/ota-ecom-saml`, query);

    let response = response_.replaceAll('ota:', '');
    const responseJson = xmlParser.parse(response);
    if (!!responseJson?.OTA_AirBookRS?.Success) {
        return {
            success: !!responseJson?.OTA_AirBookRS?.Success,
            data: responseJson?.OTA_AirBookRS?.AirReservation,
        }
    } else {
        return {
            success: !responseJson?.OTA_AirBookRS?.Success,
            data: { error: responseJson?.OTA_AirBookRS?.Errors?.Error.$t },
        }
    }
};

module.exports = {
    airLowFareSearch,
    availableRoutes,
    calendarAvailability,
    airAvailable,
    airPrice,
    book,
    ticketDemand,
    airRead,
};