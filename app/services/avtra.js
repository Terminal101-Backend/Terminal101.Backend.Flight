const axios = require("axios");
const axiosApiInstance = axios.create();

// Request interceptor for API calls
axiosApiInstance.interceptors.request.use(
  async config => {
    config.baseURL = process.env.AVTRA_BASE_URL;
    config.headers = {
      'Authorization': `${process.env.AVTRA_ACCESS_TOKEN}`,
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

module.exports.ping = async message => {
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
  `);

  return response;
};

module.exports.lowFareSearch = async (originLocationCode, destinationLocationCode, departureDate, returnDate, segments = [], adults = 1, children = 0, infants = 0, travelClass, includedAirlineCodes, excludedAirlineCodes, nonStop, currencyCode = "USD") => {
  const originDestinations = [];
  originDestinations.push(`
  <DepartureDateTime>${departureDate}</DepartureDateTime>
  <OriginLocation LocationCode="${originLocationCode}" />
  <DestinationLocation LocationCode="${destinationLocationCode}" />
  `);

  for (let index = 0; index < segments?.length ?? 0; index++) {
    originDestinations.push(`
    <DepartureDateTime>${segments[index].date}</DepartureDateTime>
    <OriginLocation LocationCode="${segments[index].originCode}" />
    <DestinationLocation LocationCode="${segments[index].destinationCode}" />
    `);
  }

  if (!!returnDate) {
    if (!!segments && (segments?.length ?? 0 > 0)) {
      originDestinations.push(`
      <DepartureDateTime>${returnDate}</DepartureDateTime>
      <OriginLocation LocationCode="${segments[segments.length - 1].destinationCode}" />
      <DestinationLocation LocationCode="${originLocationCode}" />
      `);
    } else {
      originDestinations.push(`
      <DepartureDateTime>${returnDate}</DepartureDateTime>
      <OriginLocation LocationCode="${destinationLocationCode}" />
      <DestinationLocation LocationCode="${originLocationCode}" />
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
  <OriginDestinationInformation>
  ${originDestinations.join("\n")}
  </OriginDestinationInformation>
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

  console.log(query);

  const {
    data: response
  } = await axiosApiInstance.post("/availability/lowfaresearch", query);

  return response;
};
