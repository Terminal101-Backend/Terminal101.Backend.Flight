const dateTimeHelper = require("./dateTimeHelper");
const flightHelper = require("./flightHelper");
const tequila = require("../services/tequila");
const { flightInfoRepository, countryRepository, airlineRepository } = require("../repositories");
const { accountManagement } = require("../services");
const { EProvider } = require("../constants");
const segment = require("../models/subdocuments/segment");
const fs = require('fs')

const makeSegmentsArray = segments => {
    segments = segments ?? [];
    if (!Array.isArray(segments)) {
        try {
            segments = segments.split(",");
        } catch (e) {
            segments = [segments];
        }
    }

    segments = segments.map(segment => {
        const segment_date = segment.trim().split(":");
        return {
            originCode: segment_date[0],
            destinationCode: segment_date[1],
            date: segment_date[2],
        };
    });

    return segments;
};

const makeFlightSegmentsArray = (aircrafts, airlines, airports) => segment => ({
    duration: Math.floor((new Date(segment.local_arrival) - new Date(segment.local_departure)) / 60 / 1000),
    flightNumber: segment.flight_no,
    aircraft: aircrafts[segment.vehicle_type],
    airline: airlines[segment.airline],
    stops: [],
    departure: {
        airport: !!airports[segment.flyFrom] ? airports[segment.flyFrom].airport : {
            code: segment.flyFrom,
            name: "UNKNOWN"
        },
        city: !!airports[segment.cityCodeFrom] ? airports[segment.cityCodeFrom].city : {
            code: "UNKNOWN",
            name: "UNKNOWN"
        },
        country: !!airports[segment.cityCodeFrom] ? airports[segment.cityCodeFrom].country : {
            code: "UNKNOWN",
            name: "UNKNOWN"
        },
        at: segment.local_departure,
    },
    arrival: {
        airport: !!airports[segment.flyTo] ? airports[segment.flyTo].airport : {
            code: segment.flyTo,
            name: "UNKNOWN"
        },
        city: !!airports[segment.cityCodeTo] ? airports[segment.cityCodeTo].city : {
            code: "UNKNOWN",
            name: "UNKNOWN"
        },
        country: !!airports[segment.cityCodeTo] ? airports[segment.cityCodeTo].country : {
            code: "UNKNOWN",
            name: "UNKNOWN"
        },
        at: segment.local_arrival,
    },
});

const makeTravelerPricings = (flight, adults, children, infants) => {
    let travelerPricings = [];
    if (flight.adults_price !== 0) {
        travelerPricings.push({
            total: parseFloat(flight.conversion.adults_price),
            base: parseFloat(flight.conversion.adults_price),
            count: adults,
            travelerType: 'ADULT',
            fees: [],
            taxes: [{ amount: 0, code: 'Tax' }]
        })
    }
    if (flight.children_price !== 0) {
        travelerPricings.push({
            total: parseFloat(flight.conversion.children_price),
            base: parseFloat(flight.conversion.children_price),
            count: children,
            travelerType: 'CHILD',
            fees: [],
            taxes: [{ amount: 0, code: 'Tax' }]
        })
    }
    if (flight.infants_price !== 0) {
        travelerPricings.push({
            total: parseFloat(flight.conversion.infants_price),
            base: parseFloat(flight.conversion.infants_price),
            count: infants,
            travelerType: 'INFANT',
            fees: [],
            taxes: [{ amount: 0, code: 'Tax' }]
        })
    }
    return travelerPricings;
}

const makePriceObject = (flight, adults, children, infants, rate) => ({
    total: parseFloat(flight.conversion.amount),
    grandTotal: parseFloat(flight.conversion.amount),
    base: parseFloat(flight.flights_price * rate),
    commissions: [],
    fees: [{ amount: parseFloat((flight.sp_fee + flight.book_fee + flight.extra_fee + flight.fee_airline) * rate), type: "SUPPLIER" }],
    taxes: [{ amount: 0, code: 'Tax' }],
    travelerPrices: makeTravelerPricings(flight, adults, children, infants),
});

const makeFlightDetailsArray = (aircrafts, airlines, airports, travelClass = "ECONOMY", searchId, currencyRate) => {
    return (flight, index) => {

        let code = flight.route[0].operating_carrier;
        result = {
            code: `TQL-${index}`,
            owner: airlines[code],
            availableSeats: flight.availability.seats,
            currencyCode: 'USD', //TODO: get from data
            travelClass,
            provider: EProvider.get("TEQUILA"),
            providerData: {
                bookingToken: flight.booking_token,
                searchId,
                currencyRate,
            },
            itineraries: [
                {
                    duration: flight.duration.total / 60,
                    segments: flight.route.map(makeFlightSegmentsArray(aircrafts, airlines, airports)),
                }
            ],
        };

        return result;
    };
};

const createBaggage = (flight, info, rate) => {
    let combinations = [];
    info.baggage.combinations.hold_bag.forEach(holdBag => {
        holdBag.price.currency = 'USD';
        holdBag.price.amount = holdBag.price.amount * rate;
        holdBag.price.base = holdBag.price.base * rate;
        holdBag.price.service = holdBag.price.service * rate;
        holdBag.price.service_flat = holdBag.price.service_flat * rate;
        holdBag.price.merchant = holdBag.price.merchant * rate;
        combinations.push({ combination: holdBag });
    });
    info.baggage.combinations.hand_bag.forEach(handBag => {
        handBag.price.currency = 'USD';
        handBag.price.amount = handBag.price.amount * rate;
        handBag.price.base = handBag.price.base * rate;
        handBag.price.service = handBag.price.service * rate;
        handBag.price.service_flat = handBag.price.service_flat * rate;
        handBag.price.merchant = handBag.price.merchant * rate;
        combinations.push({ combination: handBag });
    });

    flight.providerData['combinations'] = combinations;
}

const fareRule = () => {
    return `Baggage rules:
    Up to 1 personal item maximum.
    Up to 1 cabin bag maximum.
    Up to 2 hold bags maximum. Both bags must have the same dimensions and weight.`
}

const makeTicketInfo = (bookedFlight) => {
    let segments = bookedFlight.passengers;
    return {
        tickets: segments.map(s => ({
            ticketNumber: bookedFlight.providerPnr
        }))
    }
}

module.exports.searchFlights = async (params, testMode) => {
    fs.appendFileSync('app/static/log.txt', '\nhelper ', (err) => {
        if (err) throw err;
    })
    let segments = makeSegmentsArray(params.segments);

    params.departureDate = new Date(params.departureDate);
    params.returnDate = params.returnDate ? new Date(params.returnDate) : "";

    const departureDate = dateTimeHelper.excludeDateFromIsoString(params.departureDate.toISOString());
    const returnDate = dateTimeHelper.excludeDateFromIsoString(params.returnDate ? params.returnDate.toISOString() : "");

    let {
        data: tequilaSearchResult,
        search_id: searchId,
        fx_rate: rate
    } = await tequila.search(params.origin, params.destination, departureDate, returnDate, segments, params.adults, params.children, params.infants, params.travelClass, undefined, undefined, undefined, undefined, testMode);
    fs.appendFileSync('app/static/log.txt', '\nhelper tequila search :: ' + JSON.stringify(tequilaSearchResult), (err) => {

        // In case of a error throw err.
        if (err) throw err;
    })
    if (!tequilaSearchResult) {
        return {
            flightDetails: []
        };
    }
    if (!!tequilaSearchResult.error || !Array.isArray(tequilaSearchResult)) {
        throw tequilaSearchResult;
    }

    const stops = Object.keys(
        tequilaSearchResult
            .reduce((res, cur) => [...res, ...cur.route], [])
            .reduce((res, cur) => ({
                ...res,
                [cur.flyFrom]: 1,
                [cur.flyTo]: 1,
            }), {})
    );

    const carriers = Object.keys(tequilaSearchResult
        .reduce((res, cur) => [...res, ...cur.route], [])
        .reduce((res, cur) => ({
            ...res,
            [cur.operating_carrier]: 1,
        }), {})
    );

    const aircrafts = tequilaSearchResult.reduce((res, cur) => [...res, ...cur.route], []).reduce((res, cur) => ({
        ...res,
        [cur.vehicle_type]: cur.vehicle_type,
    }), {});

    const airports = await countryRepository.getAirportsByCode([params.origin, params.destination, ...stops]);
    const airlines = await airlineRepository.getAirlinesByCode(carriers);
    const flightDetails = tequilaSearchResult.map(makeFlightDetailsArray(aircrafts, airlines, airports, params.travelClass, searchId, rate));

    const { origin, destination } = await flightHelper.getOriginDestinationCity(params.origin, params.destination, airports);

    for (flight of flightDetails) {
        let { data: info } = await tequila.checkFlights(flight.providerData.bookingToken, flight.providerData.searchId, params.adults + params.children + params.infants, params.adults, params.children, params.infants, 'USD', testMode);

        flight.providerData['baggageNumber'] = params.adults + params.children + params.infants;
        flight.providerData['passengerNumber'] = { adults: params.adults, children: params.children, infants: params.infants };

        flight['price'] = makePriceObject(info, params.adults, params.children, params.infants, rate);
        createBaggage(flight, info, rate);
        flight.providerData['FareRule'] = fareRule();
    }
    fs.appendFileSync('app/static/log.txt', '\nhelper tequila search1 :: ' + JSON.stringify(flightDetails), (err) => {

        // In case of a error throw err.
        if (err) throw err;
    })
    return {
        origin,
        destination,
        flightDetails,
    };
};

module.exports.bookFlight = async (params, testMode) => {
    const { data: user } = await accountManagement.getUserInfo(params.userCode);

    const travelers = params.passengers.map(passenger => {
        if (!!user.info && !!user.info.document && (user.info.document.code === passenger.documentCode) && (user.info.document.issuedAt === passenger.documentIssuedAt)) {
            if (!user?.info?.birthDate) {
                throw "birthDate_required";
            }

            return {
                birthDate: new Date(user.info.birthDate).toISOString().replace(/Z.*$/, ""),
                gender: user.info.gender,
                firstName: user.info.firstName,
                middleName: user.info.middleName,
                lastName: user.info.lastName,
                document: {
                    issuedAt: user.info.document.issuedAt,
                    expirationDate: user.info.document.expirationDate,
                    code: user.info.document.code,
                },
            };
        } else {
            const person = user.persons.find(p => (p.document.code === passenger.documentCode) && (p.document.issuedAt === passenger.documentIssuedAt));

            if (!person) {
                throw "passenger_not_found";
            }

            return {
                birthDate: new Date(person.birthDate).toISOString().replace(/Z.*$/, ""),
                gender: person.gender,
                firstName: person.firstName,
                middleName: person.middleName,
                lastName: person.lastName,
                document: {
                    issuedAt: person.document.issuedAt,
                    expirationDate: person.document.expirationDate,
                    code: person.document.code,
                },
            };
        }
    });

    const flightInfo = await flightInfoRepository.findOne({ code: params.flightDetails.code });
    const flightIndex = flightInfo.flights.findIndex(flight => flight.code === params.flightDetails.flights.code);

    const { data: bookedFlight } = await tequila.saveBook(travelers, params.flightDetails.providerData.bookingToken, params.flightDetails.providerData.searchId, params.flightDetails.flights.providerData.combinations, testMode);
    flightInfo.flights[flightIndex].providerData.bookedId = bookedFlight.booking_id;
    await flightInfo.save();
    let extraData = {
        transactionId: bookedFlight.transaction_id
    };
    return { ...bookedFlight, extraData, bookedId: bookedFlight.booking_id, timeout: new Date().getTime() + parseInt(process.env.PAYMENT_TIMEOUT) };
};

module.exports.airRevalidate = async (flightInfo, testMode) => {
    let info = await tequila.checkFlights(flightInfo.providerData.bookingToken, flightInfo.providerData.searchId, flightInfo.providerData.baggageNumber, flightInfo.providerData.passengerNumber.adults, flightInfo.providerData.passengerNumber.children, flightInfo.providerData.passengerNumber.infants, 'USD', testMode);
    let newPrice = makePriceObject(info, flightInfo.providerData.passengerNumber.adults, flightInfo.providerData.passengerNumber.children, flightInfo.providerData.passengerNumber.infants, flightInfo.providerData.currencyRate);
    return newPrice;
};

module.exports.issueBookedFlight = async (bookedFlight, testMode) => {
    let { data: response } = await tequila.issue(bookedFlight.providerPnr, bookedFlight.extraData.transactionId, testMode);
    let ticketInfo;
    if (response.status === 0) {
        ticketInfo = makeTicketInfo(bookedFlight);
    }
    return ticketInfo;
}

module.exports.cancelBookFlight = async (bookedFlight, testMode) => {
    return await tequila.cancel(bookedFlight.providerPnr, bookedFlight.extraData.transactionId, testMode);
}