const { EProvider } = require("../constants");
const { providerRepository, flightConditionRepository } = require("../repositories");
const { flightHelper, socketHelper, amadeusHelper, partoHelper } = require("../helpers");
const { flightController } = require("../controllers");

module.exports = (io, socket) => {
  socket.on("searchFlight", async req => {
    if (!req.headers) {
      req.headers = {};
    }
    if (!req.body) {
      req.body = {};
    }
    req.header = name => {
      const result = Object.entries(req?.headers ?? {}).find(([hname, hvalue]) => hname.toLowerCase() === name.toLowerCase());

      return result ? result[1] : undefined;
    };
    const language = req.header("Language") ?? "EN";

    console.log(req);

    try {
      const activeProviders = await providerRepository.getActiveProviders();

      // const flightConditionsForProviders = await flightConditionRepository.findFlightCondition(req.body.origin, req.body.destination);
      // const notRestrictedProviders = flightController.checkIfProviderNotRestrictedForThisRoute(flightConditionsForProviders, activeProviders);
      const notRestrictedProviders = activeProviders;

      const activeProviderCount = notRestrictedProviders.length;
      const lastSearch = [];
      let providerNumber = 0;
      let searchCode;
      const departureDate = new Date(req.body?.departureDate);

      await (async () => {
        const { origin, destination } = await flightHelper.getOriginDestinationCity(req.body.origin, req.body.destination);
        result = await flightController.appendProviderResult(origin, destination, departureDate.toISOString(), lastSearch, searchCode, req.header("Page"), req.header("PageSize"));
        searchCode = result.code;

        const response = {
          headers: {
            language,
            providerNumber,
            activeProviderCount,
          },
          body: result,
        };
        console.log(response.headers);

        socket.emit("searchFlightResult", await socketHelper.success(response, language, "START"));
      })();

      const flightConditions = await flightConditionRepository.findFlightCondition(req.body.origin, req.body.destination);

      notRestrictedProviders.forEach(provider => {
        providerHelper = eval(EProvider.find(provider.name).toLowerCase() + "Helper");

        providerHelper.searchFlights(req.body).then(async flight => {
          const flightDetails = flightController.filterFlightDetailsByFlightConditions(flightConditions, EProvider.find(provider.name), flight.flightDetails);

          lastSearch.push(...flightDetails);
          const result = await flightController.appendProviderResult(flight.origin, flight.destination, departureDate.toISOString(), lastSearch, searchCode, req.header("Page"), req.header("PageSize"));
          searchCode = result.code;

          const response = {
            headers: {
              language,
              providerNumber: ++providerNumber,
              activeProviderCount,
              completed: providerNumber === activeProviderCount,
            },
            body: result,
          };
          console.log(provider.title, response.headers, "count: " + flightDetails.length);

          socket.emit("searchFlightResult", await socketHelper.success(response, language));
        }).catch(async e => {
          socket.emit("searchFlightResult", await socketHelper.exception(e, language, {
            headers: {
              language,
              providerNumber: ++providerNumber,
              activeProviderCount,
              completed: providerNumber === activeProviderCount,
            }
          }));
          console.log(provider.title, {
            headers: {
              language,
              providerNumber: providerNumber,
              activeProviderCount,
            }
          }, e.message ?? e);
        });
      });
    } catch (e) {
      socket.emit("searchFlightResult", await socketHelper.exception(e, language));
    }
  });
};
