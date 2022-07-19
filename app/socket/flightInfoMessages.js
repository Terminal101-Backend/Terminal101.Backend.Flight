const { EProvider } = require("../constants");
const { providerRepository, flightConditionRepository } = require("../repositories");
const { socketHelper, amadeusHelper, partoHelper } = require("../helpers");
const { flightController } = require("../controllers");

module.exports = (io, socket) => {
  socket.on("searchFlight", async req => {
    try {
      console.log(req);
      const activeProviders = await providerRepository.getActiveProviders();

      // const flightConditionsForProviders = await flightConditionRepository.findFlightCondition(req.body.origin, req.body.destination);
      // const notRestrictedProviders = flightController.checkIfProviderNotRestrictedForThisRoute(flightConditionsForProviders, activeProviders);
      const notRestrictedProviders = activeProviders;

      const activeProviderCount = notRestrictedProviders.length;
      const lastSearch = [];
      let providerNumber = 0;
      let searchCode;
      if (!req.headers) {
        req.headers = {};
      }
      if (!req.body) {
        req.body = {};
      }
      req.header = name => {
        const result = Object.entries(req.headers).find(([hname, hvalue]) => hname.toLowerCase() === name.toLowerCase());

        return result ? result[1] : undefined;
      };

      const language = req.header.language ?? "EN";

      await (async () => {
        const response = {
          headers: {
            language,
            providerNumber,
            activeProviderCount,
          },
          body: {},
        };
        console.log(response.headers);

        socket.emit("searchFlightResult", await socketHelper.success(response, language));
      })();

      const flightConditions = await flightConditionRepository.findFlightCondition(req.body.origin, req.body.destination);

      notRestrictedProviders.forEach(provider => {
        providerHelper = eval(EProvider.find(provider.name).toLowerCase() + "Helper");

        providerHelper.searchFlights(req.body).then(async flight => {
          const flightDetails = flightController.filterFlightDetailsByFlightConditions(flightConditions, EProvider.find(provider.name), flight.flightDetails);

          lastSearch.push(...flightDetails);
          const result = await flightController.appendProviderResult(flight.origin, flight.destination, req.body.departureDate.toISOString(), lastSearch, searchCode, req.header("Page"), req.header("PageSize"));
          searchCode = result.code;

          const response = {
            headers: {
              language,
              providerNumber: ++providerNumber,
              activeProviderCount,
            },
            body: result,
          };
          console.log(provider.title, response.headers);

          socket.emit("searchFlightResult", await socketHelper.success(response, language));
        }).catch(async e => {
          socket.emit("searchFlightResult", await socketHelper.exception(e, language, {
            headers: {
              language,
              providerNumber: ++providerNumber,
              activeProviderCount,
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
