const { EProvider } = require("../constants");
const { providerRepository, flightConditionRepository } = require("../repositories");
const { flightHelper, socketHelper, arrayHelper, amadeusHelper, partoHelper } = require("../helpers");
const { flightController } = require("../controllers");

module.exports = (io, socket) => {
  let canceledSearchFlightCodes = [];
  const header = (req, name) => {
    const result = Object.entries(req?.headers ?? {}).find(([hname, hvalue]) => hname.toLowerCase() === name.toLowerCase());

    return result ? result[1] : undefined;
  };

  socket.on("cancelSearchFlight", async req => {
    req.header = name => header(req, name);
    const language = req.header("Language") ?? "EN";

    try {
      if (!req?.body?.searchCode) {
        throw "searchCode_required";
      }
      canceledSearchFlightCodes.push(req.body.searchCode);

      setTimeout(() => {
        canceledSearchFlightCodes.splice(0, 1);
      },
        10 * 60 * 1000
      )
      socket.emit("searchFlightCanceled", await socketHelper.success({ searchFlightCode: req.body.searchCode }));
    } catch (e) {
      socket.emit("searchFlightCanceled", await socketHelper.exception(e, language));
    }
  });

  socket.on("searchFlight", async req => {
    let providerNumber = 0;
    let searchCode;
    if (!req.headers) {
      req.headers = {};
    }
    if (!req.body) {
      req.body = {};
    }
    req.header = name => header(req, name);
    const language = req.header("Language") ?? "EN";

    console.log(req);

    try {
      const activeProviders = await providerRepository.getActiveProviders();

      // const flightConditionsForProviders = await flightConditionRepository.findFlightCondition(req.body.origin, req.body.destination);
      // const notRestrictedProviders = flightController.checkIfProviderNotRestrictedForThisRoute(flightConditionsForProviders, activeProviders);
      const notRestrictedProviders = activeProviders;

      const activeProviderCount = notRestrictedProviders.length;
      const lastSearch = [];
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

        socket.emit("searchFlightResult", await socketHelper.success(response, language, "START"));
      })();

      const flightConditions = await flightConditionRepository.findFlightCondition(req.body.origin, req.body.destination);

      notRestrictedProviders.forEach(provider => {
        providerHelper = eval(EProvider.find(provider.name).toLowerCase() + "Helper");

        providerHelper.searchFlights(req.body).then(async flight => {
          if (canceledSearchFlightCodes.includes(searchCode)) {
            return;
          }

          const flightDetails = flightController.filterFlightDetailsByFlightConditions(flightConditions, EProvider.find(provider.name), flight.flightDetails);

          lastSearch.push(...flightDetails);
          const result = await flightController.appendProviderResult(flight.origin, flight.destination, departureDate.toISOString(), lastSearch, searchCode, req.header("Page"), req.header("PageSize"));
          searchCode = result.code;

          if (req.header("Page") === -1) {
            let pageIndex = 0;
            const pageSize = !!req.header("PageSize") ? parseInt(req.header("PageSize")) : config.application.pagination.pageSize;
            const pageCount = Math.ceil(flightDetails.length / pageSize);
            ++providerNumber;

            const timerId = setInterval(async () => {
              const response = {
                headers: {
                  language,
                  providerNumber,
                  activeProviderCount,
                  completed: (providerNumber === activeProviderCount) && (pageIndex === pageCount - 1),
                },
                body: {
                  code: searchCode,
                  origin: {
                    code: result.origin.code,
                    name: result.origin.name,
                    description: result.origin.description,
                  },
                  destination: {
                    code: result.destination.code,
                    name: result.destination.name,
                    description: result.destination.description,
                  },
                  time: result.time,
                  flights: arrayHelper.pagination(flightDetails.sort((flight1, flight2) => flight1.price.total - flight2.price.total), pageIndex++, pageSize),
                },
              };

              if (pageIndex === pageCount) {
                clearInterval(timerId);
              }
              console.log(provider.title, response.headers, "count: " + flightDetails.length);

              socket.emit("searchFlightResult", await socketHelper.success(response, language));
            }, 50);
          } else {
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
          }
        }).catch(async e => {
          if (canceledSearchFlightCodes.includes(searchCode)) {
            return;
          }

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
