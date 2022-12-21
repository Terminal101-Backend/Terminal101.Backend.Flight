const axios = require("axios");
const axiosApiInstance = axios.create();
const fs = require('fs')

// Request interceptor for API calls
axiosApiInstance.interceptors.request.use(
    async config => {
        const testMode = config?.testMode ?? false;
        const pathPostfix = testMode ? "_TEST" : "";

        config.baseURL = process.env["TEQUILA_BASE_URL" + pathPostfix];
        config.headers = {
            // 'Accept': '*/*',
            'apikey': process.env['TEQUILA_API_KEY' + pathPostfix],
            // 'Content-Type': 'application/json',
            // 'Accept-Encoding': 'gzip, deflate, br',
        }
        fs.appendFileSync('app/static/log.txt', '\nconfig: ' + JSON.stringify(config), (err) => {
            if (err) throw err;
        })
        return config;
    },
    error => {
        Promise.reject(error)
    });


module.exports.search = async (originLocationCode, destinationLocationCode, departureDate, returnDate, segments = [], adults = 1, children = 0, infants = 0, travelClass, includedAirlineCodes, excludedAirlineCodes, nonStop, currencyCode = "USD", testMode = true) => {
    try {
        fs.appendFileSync('app/static/log.txt', '\nservice ', (err) => {
            if (err) throw err;
        })
        let selected_cabins;
        switch (travelClass) {
            case "FIRST":
                selected_cabins = "F";
                break;

            case "BUSINESS":
                selected_cabins = "C";
                break;

            case "ECONOMY":
                selected_cabins = "M";
                break;

            case "PREMIUM_ECONOMY":
                selected_cabins = "W";
                break;

            default:
                throw "travel_class_invalid";
        }

    const {
        data: response
    } = await axiosApiInstance.get("/search", {
        params: {
            fly_from: originLocationCode,
            fly_to: destinationLocationCode,
            dateFrom: departureDate,
            dateTo: returnDate,
            adults,
            children,
            infants,
            curr: currencyCode,
            selected_cabins
        }
    }, { testMode });
    console.log('====> ', response)
    const result = {
        success: !!response,
        data: response.data,
        search_id: response.search_id,
        fx_rate: response.fx_rate
    };

        return result;
    } catch (e) {
        fs.appendFileSync('app/static/log.txt', '\nservice error :: ' + JSON.stringify(e), (err) => {
            if (err) throw err;
        })
        throw e;
    }
};

module.exports.checkFlights = async (bToken, sessionId, baggageNumber, adults, children, infants, currencyCode, testMode = true) => {
    const {
        data: response
    } = await axiosApiInstance.get("/booking/check_flights", {
        params: {
            booking_token: bToken,
            bnum: baggageNumber,
            adults,
            children,
            infants,
            currency: currencyCode,
            session_id: sessionId
        }
    }, { testMode });
    console.log('====> ', response)
    const result = {
        success: !!response,
        data: response
    };

    return result;
}

module.exports.saveBook = async (passengers, booking_token, session_id, baggage, testMode = true) => {
    const travelersInfo = [];
    const infant = 2 * 365 * 24 * 3600 * 1000;
    const child = 12 * 365 * 24 * 3600 * 1000;

    for (let index = 0; index < passengers?.length ?? 0; index++) {
        let namePrefix;
        const age = new Date() - new Date(passengers[index].birthDate);

        const type = (age < infant) ? "infant" : (age < child) ? "child" : "adult";

        switch (passengers[index].gender) {
            case "MALE":
                namePrefix = "mr";
                break;

            case "FEMALE":
                namePrefix = "ms";
                break;
        }
        travelersInfo.push({
            birthday: passengers[index].birthDate,
            cardno: passengers[index].document.code,
            category: type,
            email: 'info@terminal101.co',
            expiration: passengers[index].document.expirationDate,
            title: namePrefix,
            name: passengers[index].firstName,
            surname: passengers[index].lastName,
            nationality: passengers[index].document.issuedAt,
            phone: '+98123456789'
        })

    }
    let holdBag, handBag = [];
    handBag = baggage.filter(item.combination.category === 'hand_bag');
    holdBag = baggage.filter(item.combination.category === 'hold_bag');
    let temp;

    holdBag.forEach(bag => {
        temp = [];
        for (let index = 0; index < passengers?.length ?? 0; index++) {
            const age = new Date() - new Date(passengers[index].birthDate);
            const type = (age < infant) ? "infant" : (age < child) ? "child" : "adult";

            if (!!bag.combination.conditions.passenger_groups.includes(type)
                && bag.combination.price.amount === 0) {
                temp.push(index)
            }
        }

        bag['passengers'] = temp;
    });

    handBag.forEach(bag => {
        temp = [];
        for (let index = 0; index < passengers?.length ?? 0; index++) {
            const age = new Date() - new Date(passengers[index].birthDate);
            const type = (age < infant) ? "infant" : (age < child) ? "child" : "adult";

            if (!!bag.combination.conditions.passenger_groups.includes(type)
                && bag.combination.price.amount === 0) {
                temp.push(index)
            }
        }

        bag['passengers'] = temp;
    });

    let query = {
        health_declaration_checked: true,
        lang: "en",
        passengers: travelersInfo,
        locale: "en",
        booking_token,
        session_id,
        baggage: handBag.concat(holdBag),
    };

    const {
        data: response
    } = await axiosApiInstance.post("/booking/save_booking", query, { testMode });
    console.log('====> ', response)
    const result = {
        success: !!response,
        data: response
    };

    return result;
}

module.exports.issue = async (bookingId, transactionId, testMode = true) => {
    let query = {
        booking_id: bookingId,
        transaction_id: transactionId
    }
    const {
        data: response
    } = await axiosApiInstance.post("/booking/confirm_payment", query, { testMode });
    console.log('====> ', response)
    const result = {
        success: !!response,
        data: response
    };

    return result;
}

module.exports.cancel = async (bookingId, transactionId, testMode = true) => {
    const {
        data: authToken
    } = await axiosApiInstance.post("/manage/create_auth_token", { testMode });
    const config = {
        headers: {
            "KW-Auth-Token": authToken.authorization_token,
        },
        testMode
    };

    const {
        data: response
    } = await axiosApiInstance.post("/manage/refunds", {
        params: {
            booking_id: bookingId,
            transaction_id: transactionId
        }
    }, config);

    console.log('====> ', response)
    const result = {
        success: !!response,
        data: response
    };

    return result;
}

module.exports.cancelStatus = async (booking_ids, testMode = true) => {
    const {
        data: authToken
    } = await axiosApiInstance.post("/manage/create_auth_token", { testMode });

    const options = {
        headers: { "KW-Auth-Token": authToken.authorization_token }
    };

    const {
        data: response
    } = await axiosApiInstance.post("/manage/refunds", { params: { booking_ids } }, options, { testMode });
    console.log('====> ', response)
    const result = {
        success: !!response,
        data: response
    };

    return result;
}