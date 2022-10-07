const {EProvider} = require("../constants");
const {providerRepository, flightConditionRepository} = require("../repositories");
const {flightHelper, socketHelper, arrayHelper, amadeusHelper, partoHelper} = require("../helpers");
const {flightController} = require("../controllers");

module.exports = (io, socket) => {
  const canceledSearchFlightCodes = [];
  const searchedList = {};
  let providerResultCompleted = {};

  const cancelSearch = async searchCode => {
    canceledSearchFlightCodes.push(searchCode);

    setTimeout(() => {
        canceledSearchFlightCodes.splice(0, 1);
      },
      10 * 60 * 1000
    );
    socket.emit("searchFlightCanceled", await socketHelper.success({searchFlightCode: searchCode}));
  };

  const header = (req, name) => {
    const result = Object.entries(req?.headers ?? {}).find(([hname, hvalue]) => hname.toLowerCase() === name.toLowerCase());

    return result ? result[1] : undefined;
  };

  socket.on("disconnect", (reason) => {
    delete searchedList[socket.id];
  });

  socket.on("cancelSearchFlight", async req => {
    req.header = name => header(req, name);
    const language = req.header("Language") ?? "EN";

    try {
      if (!req?.body?.searchCode) {
        throw "searchCode_required";
      }
      await cancelSearch(req.body.searchCode);
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
      providerResultCompleted = activeProviders.reduce((res, cur) => ({...res, [cur.title]: false}), {});

      // const flightConditionsForProviders = await flightConditionRepository.findFlightCondition(req.body.origin, req.body.destination);
      // const notRestrictedProviders = flightController.checkIfProviderNotRestrictedForThisRoute(flightConditionsForProviders, activeProviders);
      const notRestrictedProviders = activeProviders;

      const activeProviderCount = notRestrictedProviders.length;
      const lastSearch = [];
      const departureDate = new Date(req.body?.departureDate);

      await (async () => {
        const {
          origin,
          destination
        } = await flightHelper.getOriginDestinationCity(req.body.origin, req.body.destination);
        result = await flightController.appendProviderResult(origin, destination, departureDate.toISOString(), lastSearch, searchCode, req.header("Page"), req.header("PageSize"));
        searchCode = result.code;

        if (!!searchedList[socket.id]) {
          await cancelSearch(searchedList[socket.id]);
        }
        searchedList[socket.id] = searchCode;

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

            const timerId = setInterval(async () => {
              if (canceledSearchFlightCodes.includes(searchCode)) {
                clearInterval(timerId);
                return;
              }

              providerNumber = Object.keys(providerResultCompleted).findIndex(p => p === provider.title) + 1;
              providerResultCompleted[provider.title] = pageIndex >= pageCount - 1;

              const response = {
                headers: {
                  language,
                  providerNumber,
                  activeProviderCount,
                  completed: Object.values(providerResultCompleted).every(pc => !!pc),
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

              if (!!providerResultCompleted[provider.title]) {
                clearInterval(timerId);
              }
              console.log(provider.title, response.headers, "count: " + flightDetails.length);

              socket.emit("searchFlightResult", await socketHelper.success(response, language));
            }, 50);
          } else {
            providerNumber = Object.keys(providerResultCompleted).findIndex(p => p === provider.title) + 1;
            providerResultCompleted[provider.title] = true;

            const response = {
              headers: {
                language,
                providerNumber,
                activeProviderCount,
                completed: Object.values(providerResultCompleted).every(pc => !!pc),
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

          providerNumber = Object.keys(providerResultCompleted).findIndex(p => p === provider.title) + 1;
          providerResultCompleted[provider.title] = true;
          socket.emit("searchFlightResult", await socketHelper.exception(e, language, {
            headers: {
              language,
              providerNumber,
              activeProviderCount,
              completed: Object.values(providerResultCompleted).every(pc => !!pc),
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
