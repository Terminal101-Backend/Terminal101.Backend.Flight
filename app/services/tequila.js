const axios = require("axios");
const axiosApiInstance = axios.create();

// Request interceptor for API calls
axiosApiInstance.interceptors.request.use(
    async config => {
        const testMode = config?.testMode ?? false;
        const pathPostfix = testMode ? "_TEST" : "";

        config.baseURL = process.env["TEQUILA_BASE_URL" + pathPostfix];
        config.headers = {
            'Accept': 'application/json',
            'apikey': process.env['TEQUILA_API_KEY' + pathPostfix],
            'Content-Type': 'application/json',
        }

        return config;
    },
    error => {
        Promise.reject(error)
    });


module.exports.search = async (originLocationCode, destinationLocationCode, departureDate, returnDate, segments = [], adults = 1, children = 0, infants = 0, travelClass, includedAirlineCodes, excludedAirlineCodes, nonStop, currencyCode = "USD", testMode = true) => {
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
        data: response
    };

    return result;
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

module.exports.saveBook = async (passengers, bookingToken, sessionId, baggage, testMode = true) => {
    let query = {
        health_declaration_checked: true,
        lang: "en",
        passengers: [
            {
                "birthday": "1990-01-01",
                "cardno": "D25845822",
                "category": "adult",
                "email": "yourdepositemail@test.com",
                "expiration": "2030-12-10",
                "title": "ms",
                "name": "test",
                "surname": "test",
                "nationality": "CZ",
                "phone": "+44857282842"
            },
            {
                "birthday": "2019-05-04",
                "cardno": "D25845222",
                "category": "child",
                "email": "yourdepositemail@test.com",
                "expiration": "2030-12-10",
                "title": "mr",
                "name": "John",
                "surname": "Doe",
                "nationality": "CZ",
                "phone": "+44857282842"
            }
        ],
        locale: "en",
        booking_token: "EAYQ_Iw0T4WcTCX0aCMtNtVd3JAhqynlm0zxrGn7TaSXJvpt-1JxfspLegAsePWx1pfWGoRUXCZs0jaMOxbxCX0uIs8lwnI8wUqw-Chjo2LmyMZv1Ca8F0WNI84VYq2fo9BGxApRAY7KXX7J5Zjeoyl3cRDGREXlrrLBSWVXQkQg-E3240j9GUrMQDvVs0SNxxUwaJnn0Z1NATret45A2BkBh0hn1j0evJXcBuTbpAQV7jkeTfxZJvg_B4PUp-lPRnVb5bHNcqKNCB6_HbrdHMvUP_8HoQCWHsB9laz7qQOQ--5c5kBq2mAI-A6cmg1prkNQcb-pl5cJAQtDcIYhlA6z4ftztd4s1mgPpnStpWp1pUAKlM_89QqE9fKSLQgQT-9TAM7lqIiYHT8llS_vpCGrt0PuzPqIOpyDsm4ByyGEv-oWEV56u85XrdUT5Re7dTn2v4bUQNL7N40D6xIi0mshk3a99DUT40vjGhXrRGQuGScbQzTaL2NKFvqU_IV3InKg6VdCksojpeyJor2xJvuijgLPWAUHKko-dBGoLavY=",
        session_id: "c6f1949d-fcbd-181e-8265-88a206f301ba",
        baggage: [
            {
                combination: {
                    indices: [
                        1
                    ],
                    category: "hold_bag",
                    conditions: {
                        passenger_groups: [
                            "adult",
                            "child"
                        ]
                    },
                    price: {
                        currency: "EUR",
                        amount: 0.0,
                        base: 0.0,
                        service: 0.0,
                        service_flat: 0.0,
                        merchant: 0.0
                    }
                },
                passengers: [
                    0,
                    1
                ]
            },
            {
                combination: {
                    indices: [
                        0,
                        1
                    ],
                    category: "hand_bag",
                    conditions: {
                        passenger_groups: [
                            "adult",
                            "child"
                        ]
                    },
                    price: {
                        currency: "EUR",
                        amount: 0,
                        base: 0,
                        service: 0,
                        service_flat: 0,
                        merchant: 0
                    }
                },
                passengers: [
                    0,
                    1
                ]
            }
        ]
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
        booking_id: "308827948",
        transaction_id: "sandbox_308827948"
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

    const options = {
        headers: {
            "KW-Auth-Token": authToken.authorization_token
        }
    };

    const {
        data: response
    } = await axiosApiInstance.post("/manage/refunds", {
        params: {
            booking_id: "308827948",
            transaction_id: "sandbox_308827948"
        }
    }, options, { testMode });

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