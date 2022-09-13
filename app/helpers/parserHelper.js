module.exports.rmAttrTagsSearch = result => {
    if (!Array.isArray(result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary)) {
        result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary["SequenceNumber"] = result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary._attributes.SequenceNumber
        delete result.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary["_attributes"]
        const rmAttrTagsSearch = (result) => {
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

        const rmAttrTagsBook = (result) => {
            try {
                let temp;
                result.OTA_AirBookRS.AirReservation["CreatedDateTme"] = result.OTA_AirBookRS.AirReservation._attributes.CreatedDateTme;
                delete result.OTA_AirBookRS.AirReservation["_attributes"];

                result.OTA_AirBookRS.AirReservation.AirItinerary["DirectionInd"] = result.OTA_AirBookRS.AirReservation.AirItinerary._attributes.DirectionInd
                delete result.OTA_AirBookRS.AirReservation.AirItinerary["_attributes"];

                if (!Array.isArray(result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment)) {
                    result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment["Status"] = result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment._attributes.Status
                    result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment["FlightNumber"] = result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment._attributes.FlightNumber
                    result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment["FareBasisCode"] = result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment._attributes.FareBasisCode
                    result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment["ResBookDesigCode"] = result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment._attributes.ResBookDesigCode
                    result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment["DepartureDateTime"] = result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment._attributes.DepartureDateTime
                    result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment["ArrivalDateTime"] = result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment._attributes.ArrivalDateTime
                    result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment["StopQuantity"] = result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment._attributes.StopQuantity
                    result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment["RPH"] = result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment._attributes.RPH
                    delete result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment["_attributes"]

                    result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.DepartureAirport["LocationCode"] = result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.DepartureAirport._attributes.LocationCode
                    result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.DepartureAirport["LocationName"] = result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.DepartureAirport._attributes.LocationName
                    delete result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.DepartureAirport["_attributes"]

                    result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.ArrivalAirport["LocationCode"] = result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.ArrivalAirport._attributes.LocationCode
                    result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.ArrivalAirport["LocationName"] = result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.ArrivalAirport._attributes.LocationName
                    delete result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.ArrivalAirport["_attributes"]

                    result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.OperatingAirline["Code"] = result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.OperatingAirline._attributes.Code
                    delete result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.OperatingAirline["_attributes"]

                    result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.Equipment["AirEquipType"] = result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.Equipment._attributes.AirEquipType
                    delete result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.Equipment["_attributes"]

                } else {
                    result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.forEach(s => {
                        s["Status"] = s._attributes.Status
                        s["FlightNumber"] = s._attributes.FlightNumber
                        s["FareBasisCode"] = s._attributes.FareBasisCode
                        s["ResBookDesigCode"] = s._attributes.ResBookDesigCode
                        s["DepartureDateTime"] = s._attributes.DepartureDateTime
                        s["ArrivalDateTime"] = s._attributes.ArrivalDateTime
                        s["StopQuantity"] = s._attributes.StopQuantity
                        s["RPH"] = s._attributes.RPH
                        delete s["_attributes"]

                        s.DepartureAirport["LocationCode"] = s.DepartureAirport._attributes.LocationCode
                        s.DepartureAirport["LocationName"] = s.DepartureAirport._attributes.LocationName
                        delete s.DepartureAirport["_attributes"]

                        s.ArrivalAirport["LocationCode"] = s.ArrivalAirport._attributes.LocationCode
                        s.ArrivalAirport["LocationName"] = s.ArrivalAirport._attributes.LocationName
                        delete s.ArrivalAirport["_attributes"]

                        s.OperatingAirline["Code"] = s.OperatingAirline._attributes.Code
                        delete s.OperatingAirline["_attributes"]

                        s.Equipment["AirEquipType"] = s.Equipment._attributes.AirEquipType
                        delete s.Equipment["_attributes"]
                    });
                }

                result.OTA_AirBookRS.AirReservation.ArrangerInfo.CompanyInfo["CompanyShortName"] = result.OTA_AirBookRS.AirReservation.ArrangerInfo.CompanyInfo._attributes.CompanyShortName
                result.OTA_AirBookRS.AirReservation.ArrangerInfo.CompanyInfo["Code"] = result.OTA_AirBookRS.AirReservation.ArrangerInfo.CompanyInfo._attributes.Code
                delete result.OTA_AirBookRS.AirReservation.ArrangerInfo.CompanyInfo["_attributes"]

                result.OTA_AirBookRS.AirReservation.PriceInfo.ItinTotalFare.TotalFare["CurrencyCode"] = result.OTA_AirBookRS.AirReservation.PriceInfo.ItinTotalFare.TotalFare._attributes.CurrencyCode
                result.OTA_AirBookRS.AirReservation.PriceInfo.ItinTotalFare.TotalFare["DecimalPlaces"] = result.OTA_AirBookRS.AirReservation.PriceInfo.ItinTotalFare.TotalFare._attributes.DecimalPlaces
                result.OTA_AirBookRS.AirReservation.PriceInfo.ItinTotalFare.TotalFare["Amount"] = result.OTA_AirBookRS.AirReservation.PriceInfo.ItinTotalFare.TotalFare._attributes.Amount
                delete result.OTA_AirBookRS.AirReservation.PriceInfo.ItinTotalFare.TotalFare["_attributes"]

                if (!Array.isArray(result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown)) {
                    result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerTypeQuantity["Code"] = result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerTypeQuantity._attributes.Code
                    result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerTypeQuantity["Quantity"] = result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerTypeQuantity._attributes.Quantity
                    delete result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerTypeQuantity["_attributes"]

                    temp = result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.FareBasisCodes.FareBasisCode["_text"]
                    delete result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.FareBasisCodes["FareBasisCode"]
                    result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.FareBasisCodes["FareBasisCode"] = temp

                    result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.BaseFare["CurrencyCode"] = result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.BaseFare._attributes.CurrencyCode
                    result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.BaseFare["DecimalPlaces"] = result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.BaseFare._attributes.DecimalPlaces
                    result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.BaseFare["Amount"] = result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.BaseFare._attributes.Amount
                    delete result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.BaseFare["_attributes"]

                    result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.Taxes.Tax.forEach(t => {
                        t["TaxCode"] = t._attributes.TaxCode;
                        t["TaxName"] = t._attributes.TaxName;
                        t["CurrencyCode"] = t._attributes.CurrencyCode;
                        t["DecimalPlaces"] = t._attributes.DecimalPlaces;
                        t["Amount"] = t.Amount;
                        delete t["_attributes"]
                    });

                    result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.TotalFare["CurrencyCode"] = result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.TotalFare._attributes.CurrencyCode
                    result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.TotalFare["DecimalPlaces"] = result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.TotalFare._attributes.DecimalPlaces
                    result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.TotalFare["Amount"] = result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.TotalFare._attributes.Amount
                    delete result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.TotalFare["_attributes"]

                    result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.FareInfo.FareInfo["FareBasisCode"] = result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.FareInfo.FareInfo._attributes.FareBasisCode
                    delete result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.FareInfo.FareInfo["_attributes"]
                    result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.FareInfo.FareInfo.Fare["BaseAmount"] = result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.FareInfo.FareInfo.Fare._attributes.BaseAmount
                    delete result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.FareInfo.FareInfo.Fare["_attributes"]
                } else {
                    result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.forEach(p => {
                        p.PassengerTypeQuantity["Code"] = p.PassengerTypeQuantity._attributes.Code
                        p.PassengerTypeQuantity["Quantity"] = p.PassengerTypeQuantity._attributes.Quantity
                        delete p.PassengerTypeQuantity["_attributes"]

                        temp = p.FareBasisCodes.FareBasisCode["_text"]
                        delete p.FareBasisCodes["FareBasisCode"]
                        p.FareBasisCodes["FareBasisCode"] = temp


                        p.PassengerFare.BaseFare["CurrencyCode"] = p.PassengerFare.BaseFare._attributes.CurrencyCode
                        p.PassengerFare.BaseFare["DecimalPlaces"] = p.PassengerFare.BaseFare._attributes.DecimalPlaces
                        p.PassengerFare.BaseFare["Amount"] = p.PassengerFare.BaseFare._attributes.Amount
                        delete p.PassengerFare.BaseFare["_attributes"]
                        // console.log("******* ==> ", p.PassengerFare.Taxes)
                        p.PassengerFare.Taxes.Tax?.forEach(t => {
                            t["TaxCode"] = t._attributes.TaxCode;
                            t["TaxName"] = t._attributes.TaxName;
                            t["CurrencyCode"] = t._attributes.CurrencyCode;
                            t["DecimalPlaces"] = t._attributes.DecimalPlaces;
                            t["Amount"] = t.Amount;
                            delete t["_attributes"]
                        });

                        p.PassengerFare.TotalFare["CurrencyCode"] = p.PassengerFare.TotalFare._attributes.CurrencyCode
                        p.PassengerFare.TotalFare["DecimalPlaces"] = p.PassengerFare.TotalFare._attributes.DecimalPlaces
                        p.PassengerFare.TotalFare["Amount"] = p.PassengerFare.TotalFare._attributes.Amount
                        delete p.PassengerFare.TotalFare["_attributes"]

                        p.FareInfo.FareInfo["FareBasisCode"] = p.FareInfo.FareInfo._attributes.FareBasisCode
                        delete p.FareInfo.FareInfo["_attributes"]
                        p.FareInfo.FareInfo.Fare["BaseAmount"] = p.FareInfo.FareInfo.Fare._attributes.BaseAmount
                        delete p.FareInfo.FareInfo.Fare["_attributes"]
                    });
                }
                if (!Array.isArray(result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler)) {
                    result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler["BirthDate"] = result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler._attributes.BirthDate
                    result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler["PassengerTypeCode"] = result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler._attributes.PassengerTypeCode
                    result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler["AccompaniedByInfantInd"] = result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler._attributes.AccompaniedByInfantInd
                    result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler["TravelerNationality"] = result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler._attributes.TravelerNationality
                    result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler["Gender"] = result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler._attributes.Gender
                    delete result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler["_attributes"]

                    temp = result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.PersonName.NamePrefix._text
                    delete result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.PersonName["NamePrefix"]
                    result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.PersonName["NamePrefix"] = temp

                    temp = result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.PersonName.GivenName._text
                    delete result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.PersonName["GivenName"]
                    result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.PersonName["GivenName"] = temp

                    temp = result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.PersonName.Surname._text
                    delete result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.PersonName["Surname"]
                    result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.PersonName["Surname"] = temp

                    result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.Document["DocID"] = result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.Document._attributes.DocID
                    result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.Document["DocType"] = result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.Document._attributes.DocType
                    result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.Document["DocIssueCountry"] = result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.Document._attributes.DocIssueCountry
                    result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.Document["DocHolderNationality"] = result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.Document._attributes.DocHolderNationality
                    result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.Document["EffectiveDate"] = result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.Document._attributes.EffectiveDate
                    result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.Document["ExpireDate"] = result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.Document._attributes.ExpireDate
                    delete result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.Document["_attributes"]

                    result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.TravelerRefNumber["RPH"] = result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.TravelerRefNumber._attributes.RPH
                    delete result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.TravelerRefNumber["_attributes"]
                } else {
                    result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.forEach(a => {
                        a["BirthDate"] = a._attributes.BirthDate
                        a["PassengerTypeCode"] = a._attributes.PassengerTypeCode
                        a["AccompaniedByInfantInd"] = a._attributes.AccompaniedByInfantInd
                        a["TravelerNationality"] = a._attributes.TravelerNationality
                        a["Gender"] = a._attributes.Gender
                        delete a["_attributes"]

                        temp = a.PersonName.NamePrefix?._text
                        delete a.PersonName["NamePrefix"]
                        a["NamePrefix"] = temp

                        temp = a.PersonName.GivenName?._text
                        delete a.PersonName["GivenName"]
                        a["GivenName"] = temp

                        temp = a.PersonName.Surname?._text
                        delete a.PersonName["Surname"]
                        a["Surname"] = temp

                        a.Document["DocID"] = a.Document._attributes.DocID
                        a.Document["DocType"] = a.Document._attributes.DocType
                        a.Document["DocIssueCountry"] = a.Document._attributes.DocIssueCountry
                        a.Document["DocHolderNationality"] = a.Document._attributes.DocHolderNationality
                        a.Document["EffectiveDate"] = a.Document._attributes.EffectiveDate
                        a.Document["ExpireDate"] = a.Document._attributes.ExpireDate
                        delete a.Document["_attributes"]

                        a.TravelerRefNumber["RPH"] = a.TravelerRefNumber._attributes.RPH
                        delete a.TravelerRefNumber["_attributes"]
                    });
                }
                temp = result.OTA_AirBookRS.AirReservation.ContactPerson.PersonName.GivenName._text
                delete result.OTA_AirBookRS.AirReservation.ContactPerson.PersonName["GivenName"]
                result.OTA_AirBookRS.AirReservation.ContactPerson.PersonName["GivenName"] = temp
                temp = result.OTA_AirBookRS.AirReservation.ContactPerson.PersonName.Surname._text
                delete result.OTA_AirBookRS.AirReservation.ContactPerson.PersonName["Surname"]
                result.OTA_AirBookRS.AirReservation.ContactPerson.PersonName["Surname"] = temp

                result.OTA_AirBookRS.AirReservation.ContactPerson.Telephone["PhoneNumber"] = result.OTA_AirBookRS.AirReservation.ContactPerson.Telephone._attributes.PhoneNumber
                delete result.OTA_AirBookRS.AirReservation.ContactPerson.Telephone["_attributes"]
                result.OTA_AirBookRS.AirReservation.ContactPerson.HomeTelephone["PhoneNumber"] = result.OTA_AirBookRS.AirReservation.ContactPerson.HomeTelephone._attributes.PhoneNumber
                delete result.OTA_AirBookRS.AirReservation.ContactPerson.HomeTelephone["_attributes"]

                temp = result.OTA_AirBookRS.AirReservation.ContactPerson.Email._text
                delete result.OTA_AirBookRS.AirReservation.ContactPerson["Email"]
                result.OTA_AirBookRS.AirReservation.ContactPerson["Email"] = temp
                if (!!result.OTA_AirBookRS.AirReservation.Fulfillment.PaymentDetails.PaymentDetail) {
                    result.OTA_AirBookRS.AirReservation.Fulfillment.PaymentDetails.PaymentDetail["PaymentType"] = result.OTA_AirBookRS.AirReservation.Fulfillment?.PaymentDetails?.PaymentDetail?._attributes.PaymentType
                    delete result.OTA_AirBookRS.AirReservation.Fulfillment.PaymentDetails?.PaymentDetail["_attributes"]

                    result.OTA_AirBookRS.AirReservation.Fulfillment.PaymentDetails.PaymentDetail.DirectBill["DirectBill_ID"] = result.OTA_AirBookRS.AirReservation.Fulfillment?.PaymentDetails?.PaymentDetail?.DirectBill?._attributes.DirectBill_ID
                    delete result.OTA_AirBookRS.AirReservation.Fulfillment.PaymentDetails.PaymentDetail.DirectBill["_attributes"]

                    result.OTA_AirBookRS.AirReservation.Fulfillment.PaymentDetails.PaymentDetail.DirectBill.CompanyName["CompanyShortName"] = result.OTA_AirBookRS.AirReservation.Fulfillment?.PaymentDetails?.PaymentDetail?.DirectBill.CompanyName._attributes.CompanyShortName
                    result.OTA_AirBookRS.AirReservation.Fulfillment.PaymentDetails.PaymentDetail.DirectBill.CompanyName["Code"] = result.OTA_AirBookRS.AirReservation.Fulfillment?.PaymentDetails?.PaymentDetail?.DirectBill?.CompanyName._attributes.Code
                    result.OTA_AirBookRS.AirReservation.Fulfillment.PaymentDetails.PaymentDetail.DirectBill.CompanyName["AgentType"] = result.OTA_AirBookRS.AirReservation.Fulfillment?.PaymentDetails?.PaymentDetail?.DirectBill?.CompanyName._attributes.AgentType
                    delete result.OTA_AirBookRS.AirReservation.Fulfillment.PaymentDetails?.PaymentDetail.DirectBill.CompanyName["_attributes"]

                    result.OTA_AirBookRS.AirReservation.Fulfillment.PaymentDetails.PaymentDetail.PaymentAmount["CurrencyCode"] = result.OTA_AirBookRS.AirReservation.Fulfillment?.PaymentDetails?.PaymentDetail?.PaymentAmount?._attributes.CurrencyCode
                    result.OTA_AirBookRS.AirReservation.Fulfillment.PaymentDetails.PaymentDetail.PaymentAmount["DecimalPlaces"] = result.OTA_AirBookRS.AirReservation.Fulfillment?.PaymentDetails?.PaymentDetail?.PaymentAmount?._attributes.DecimalPlaces
                    result.OTA_AirBookRS.AirReservation.Fulfillment.PaymentDetails.PaymentDetail.PaymentAmount["Amount"] = result.OTA_AirBookRS.AirReservation.Fulfillment?.PaymentDetails?.PaymentDetail?.PaymentAmount?._attributes.Amount
                    delete result.OTA_AirBookRS.AirReservation.Fulfillment.PaymentDetails.PaymentDetail.PaymentAmount["_attributes"]
                }
                if (!Array.isArray(result.OTA_AirBookRS.AirReservation.Ticketing)) {
                    result.OTA_AirBookRS.AirReservation.Ticketing["TravelerRefNumber"] = result.OTA_AirBookRS.AirReservation.Ticketing._attributes.TravelerRefNumber
                    result.OTA_AirBookRS.AirReservation.Ticketing["TicketDocumentNbr"] = result.OTA_AirBookRS.AirReservation.Ticketing._attributes.TicketDocumentNbr
                    delete result.OTA_AirBookRS.AirReservation.Ticketing["_attributes"]

                } else {
                    result.OTA_AirBookRS.AirReservation.Ticketing.forEach(t => {
                        t["TravelerRefNumber"] = t._attributes.TravelerRefNumber
                        t["TicketDocumentNbr"] = t._attributes.TicketDocumentNbr
                        delete t["_attributes"]
                    })
                }
                result.OTA_AirBookRS.AirReservation.BookingReferenceID["Status"] = result.OTA_AirBookRS.AirReservation.BookingReferenceID._attributes.Status
                result.OTA_AirBookRS.AirReservation.BookingReferenceID["Instance"] = result.OTA_AirBookRS.AirReservation.BookingReferenceID._attributes.Instance
                result.OTA_AirBookRS.AirReservation.BookingReferenceID["ID"] = result.OTA_AirBookRS.AirReservation.BookingReferenceID._attributes.ID
                result.OTA_AirBookRS.AirReservation.BookingReferenceID["ID_Context"] = result.OTA_AirBookRS.AirReservation.BookingReferenceID._attributes.ID_Context
                delete result.OTA_AirBookRS.AirReservation.BookingReferenceID["_attributes"]

                if (!!result.OTA_AirBookRS.AirReservation.Offer.Priced) {
                    result.OTA_AirBookRS.AirReservation.Offer.Priced.forEach(p => {
                        p["FlightSegmentRPH"] = p._attributes.FlightSegmentRPH
                        p["TravelerRPH"] = p._attributes.TravelerRPH
                        p["ID"] = p._attributes.ID
                        p["Name"] = p._attributes.Name
                        delete p["_attributes"]
                        p.Pricing["OfferQty"] = p.Pricing._attributes.OfferQty
                        p.Pricing["PreTaxAmount"] = p.Pricing._attributes.PreTaxAmount
                        p.Pricing["TaxAmount"] = p.Pricing._attributes.TaxAmount
                        p.Pricing["Amount"] = p.Pricing._attributes.Amount
                        p.Pricing["PricingCurrency"] = p.Pricing._attributes.PricingCurrency
                        p.Pricing["DecimalPlaces"] = p.Pricing._attributes.DecimalPlaces
                        delete p.Pricing["_attributes"]
                    })
                }

                return result;
            } catch (e) {
                console.log('EEEEEE ==> ', e)
            }
        }

        const rmAttrTagsGetBook = (result) => {
            try {
                let temp;
                result.OTA_AirBookRS.AirReservation["CreatedDateTme"] = result.OTA_AirBookRS.AirReservation._attributes.CreatedDateTme;
                delete result.OTA_AirBookRS.AirReservation["_attributes"];

                result.OTA_AirBookRS.AirReservation.AirItinerary["DirectionInd"] = result.OTA_AirBookRS.AirReservation.AirItinerary._attributes.DirectionInd
                delete result.OTA_AirBookRS.AirReservation.AirItinerary["_attributes"];

                if (!Array.isArray(result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment)) {
                    result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment["Status"] = result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment._attributes.Status
                    result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment["FlightNumber"] = result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment._attributes.FlightNumber
                    result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment["FareBasisCode"] = result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment._attributes.FareBasisCode
                    result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment["ResBookDesigCode"] = result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment._attributes.ResBookDesigCode
                    result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment["DepartureDateTime"] = result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment._attributes.DepartureDateTime
                    result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment["ArrivalDateTime"] = result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment._attributes.ArrivalDateTime
                    result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment["StopQuantity"] = result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment._attributes.StopQuantity
                    result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment["RPH"] = result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment._attributes.RPH
                    delete result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment["_attributes"]

                    result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.DepartureAirport["LocationCode"] = result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.DepartureAirport._attributes.LocationCode
                    result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.DepartureAirport["LocationName"] = result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.DepartureAirport._attributes.LocationName
                    delete result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.DepartureAirport["_attributes"]

                    result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.ArrivalAirport["LocationCode"] = result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.ArrivalAirport._attributes.LocationCode
                    result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.ArrivalAirport["LocationName"] = result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.ArrivalAirport._attributes.LocationName
                    delete result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.ArrivalAirport["_attributes"]

                    result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.OperatingAirline["Code"] = result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.OperatingAirline._attributes.Code
                    delete result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.OperatingAirline["_attributes"]

                    result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.Equipment["AirEquipType"] = result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.Equipment._attributes.AirEquipType
                    delete result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.Equipment["_attributes"]

                } else {
                    result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.forEach(s => {
                        s["Status"] = s._attributes.Status
                        s["FlightNumber"] = s._attributes.FlightNumber
                        s["FareBasisCode"] = s._attributes.FareBasisCode
                        s["ResBookDesigCode"] = s._attributes.ResBookDesigCode
                        s["DepartureDateTime"] = s._attributes.DepartureDateTime
                        s["ArrivalDateTime"] = s._attributes.ArrivalDateTime
                        s["StopQuantity"] = s._attributes.StopQuantity
                        s["RPH"] = s._attributes.RPH
                        delete s["_attributes"]

                        s.DepartureAirport["LocationCode"] = s.DepartureAirport._attributes.LocationCode
                        s.DepartureAirport["LocationName"] = s.DepartureAirport._attributes.LocationName
                        delete s.DepartureAirport["_attributes"]

                        s.ArrivalAirport["LocationCode"] = s.ArrivalAirport._attributes.LocationCode
                        s.ArrivalAirport["LocationName"] = s.ArrivalAirport._attributes.LocationName
                        delete s.ArrivalAirport["_attributes"]

                        s.OperatingAirline["Code"] = s.OperatingAirline._attributes.Code
                        delete s.OperatingAirline["_attributes"]

                        s.Equipment["AirEquipType"] = s.Equipment._attributes.AirEquipType
                        delete s.Equipment["_attributes"]
                    });
                }

                result.OTA_AirBookRS.AirReservation.ArrangerInfo.CompanyInfo["CompanyShortName"] = result.OTA_AirBookRS.AirReservation.ArrangerInfo.CompanyInfo._attributes.CompanyShortName
                result.OTA_AirBookRS.AirReservation.ArrangerInfo.CompanyInfo["Code"] = result.OTA_AirBookRS.AirReservation.ArrangerInfo.CompanyInfo._attributes.Code
                delete result.OTA_AirBookRS.AirReservation.ArrangerInfo.CompanyInfo["_attributes"]

                result.OTA_AirBookRS.AirReservation.PriceInfo.ItinTotalFare.TotalFare["CurrencyCode"] = result.OTA_AirBookRS.AirReservation.PriceInfo.ItinTotalFare.TotalFare._attributes.CurrencyCode
                result.OTA_AirBookRS.AirReservation.PriceInfo.ItinTotalFare.TotalFare["DecimalPlaces"] = result.OTA_AirBookRS.AirReservation.PriceInfo.ItinTotalFare.TotalFare._attributes.DecimalPlaces
                result.OTA_AirBookRS.AirReservation.PriceInfo.ItinTotalFare.TotalFare["Amount"] = result.OTA_AirBookRS.AirReservation.PriceInfo.ItinTotalFare.TotalFare._attributes.Amount
                delete result.OTA_AirBookRS.AirReservation.PriceInfo.ItinTotalFare.TotalFare["_attributes"]

                if (!Array.isArray(result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown)) {
                    result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerTypeQuantity["Code"] = result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerTypeQuantity._attributes.Code
                    result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerTypeQuantity["Quantity"] = result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerTypeQuantity._attributes.Quantity
                    delete result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerTypeQuantity["_attributes"]

                    temp = result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.FareBasisCodes.FareBasisCode._text
                    delete result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.FareBasisCodes["FareBasisCode"]
                    result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.FareBasisCodes["FareBasisCode"] = temp

                    result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.BaseFare["CurrencyCode"] = result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.BaseFare._attributes.CurrencyCode
                    result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.BaseFare["DecimalPlaces"] = result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.BaseFare._attributes.DecimalPlaces
                    result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.BaseFare["Amount"] = result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.BaseFare._attributes.Amount
                    delete result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.BaseFare["_attributes"]

                    result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.Taxes.Tax.forEach(t => {
                        t["TaxCode"] = t._attributes.TaxCode;
                        t["TaxName"] = t._attributes.TaxName;
                        t["CurrencyCode"] = t._attributes.CurrencyCode;
                        t["DecimalPlaces"] = t._attributes.DecimalPlaces;
                        t["Amount"] = t.Amount;
                        delete t["_attributes"]
                    });

                    result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.TotalFare["CurrencyCode"] = result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.TotalFare._attributes.CurrencyCode
                    result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.TotalFare["DecimalPlaces"] = result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.TotalFare._attributes.DecimalPlaces
                    result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.TotalFare["Amount"] = result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.TotalFare._attributes.Amount
                    delete result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.TotalFare["_attributes"]

                    result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.FareInfo.FareInfo["FareBasisCode"] = result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.FareInfo.FareInfo._attributes.FareBasisCode
                    delete result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.FareInfo.FareInfo["_attributes"]
                    result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.FareInfo.FareInfo.Fare["BaseAmount"] = result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.FareInfo.FareInfo.Fare._attributes.BaseAmount
                    delete result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.FareInfo.FareInfo.Fare["_attributes"]
                } else {
                    result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.forEach(p => {
                        p.PassengerTypeQuantity["Code"] = p.PassengerTypeQuantity._attributes.Code
                        p.PassengerTypeQuantity["Quantity"] = p.PassengerTypeQuantity._attributes.Quantity
                        delete p.PassengerTypeQuantity["_attributes"]

                        temp = p.FareBasisCodes.FareBasisCode["_text"]
                        delete p.FareBasisCodes["FareBasisCode"]
                        p.FareBasisCodes["FareBasisCode"] = temp


                        p.PassengerFare.BaseFare["CurrencyCode"] = p.PassengerFare.BaseFare._attributes.CurrencyCode
                        p.PassengerFare.BaseFare["DecimalPlaces"] = p.PassengerFare.BaseFare._attributes.DecimalPlaces
                        p.PassengerFare.BaseFare["Amount"] = p.PassengerFare.BaseFare._attributes.Amount
                        delete p.PassengerFare.BaseFare["_attributes"]
                        // console.log("******* ==> ", p.PassengerFare.Taxes)
                        p.PassengerFare.Taxes.Tax?.forEach(t => {
                            t["TaxCode"] = t._attributes.TaxCode;
                            t["TaxName"] = t._attributes.TaxName;
                            t["CurrencyCode"] = t._attributes.CurrencyCode;
                            t["DecimalPlaces"] = t._attributes.DecimalPlaces;
                            t["Amount"] = t.Amount;
                            delete t["_attributes"]
                        });

                        p.PassengerFare.TotalFare["CurrencyCode"] = p.PassengerFare.TotalFare._attributes.CurrencyCode
                        p.PassengerFare.TotalFare["DecimalPlaces"] = p.PassengerFare.TotalFare._attributes.DecimalPlaces
                        p.PassengerFare.TotalFare["Amount"] = p.PassengerFare.TotalFare._attributes.Amount
                        delete p.PassengerFare.TotalFare["_attributes"]

                        p.FareInfo.FareInfo["FareBasisCode"] = p.FareInfo.FareInfo._attributes.FareBasisCode
                        delete p.FareInfo.FareInfo["_attributes"]
                        p.FareInfo.FareInfo.Fare["BaseAmount"] = p.FareInfo.FareInfo.Fare._attributes.BaseAmount
                        delete p.FareInfo.FareInfo.Fare["_attributes"]
                    });
                }
                if (!Array.isArray(result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler)) {
                    result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler["BirthDate"] = result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler._attributes.BirthDate
                    result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler["PassengerTypeCode"] = result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler._attributes.PassengerTypeCode
                    result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler["AccompaniedByInfantInd"] = result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler._attributes.AccompaniedByInfantInd
                    result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler["TravelerNationality"] = result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler._attributes.TravelerNationality
                    result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler["Gender"] = result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler._attributes.Gender
                    delete result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler["_attributes"]

                    temp = result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.PersonName.NamePrefix._text
                    delete result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.PersonName["NamePrefix"]
                    result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.PersonName["NamePrefix"] = temp

                    temp = result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.PersonName.GivenName._text
                    delete result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.PersonName["GivenName"]
                    result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.PersonName["GivenName"] = temp

                    temp = result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.PersonName.Surname._text
                    delete result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.PersonName["Surname"]
                    result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.PersonName["Surname"] = temp

                    result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.Document["DocID"] = result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.Document._attributes.DocID
                    result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.Document["DocType"] = result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.Document._attributes.DocType
                    result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.Document["DocIssueCountry"] = result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.Document._attributes.DocIssueCountry
                    result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.Document["DocHolderNationality"] = result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.Document._attributes.DocHolderNationality
                    result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.Document["EffectiveDate"] = result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.Document._attributes.EffectiveDate
                    result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.Document["ExpireDate"] = result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.Document._attributes.ExpireDate
                    delete result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.Document["_attributes"]

                    result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.TravelerRefNumber["RPH"] = result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.TravelerRefNumber._attributes.RPH
                    delete result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.TravelerRefNumber["_attributes"]
                } else {
                    result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.forEach(a => {
                        a["BirthDate"] = a._attributes.BirthDate
                        a["PassengerTypeCode"] = a._attributes.PassengerTypeCode
                        a["AccompaniedByInfantInd"] = a._attributes.AccompaniedByInfantInd
                        a["TravelerNationality"] = a._attributes.TravelerNationality
                        a["Gender"] = a._attributes.Gender
                        delete a["_attributes"]

                        temp = a.PersonName.NamePrefix?._text
                        delete a.PersonName["NamePrefix"]
                        a["NamePrefix"] = temp

                        temp = a.PersonName.GivenName?._text
                        delete a.PersonName["GivenName"]
                        a["GivenName"] = temp

                        temp = a.PersonName.Surname?._text
                        delete a.PersonName["Surname"]
                        a["Surname"] = temp

                        a.Document["DocID"] = a.Document._attributes.DocID
                        a.Document["DocType"] = a.Document._attributes.DocType
                        a.Document["DocIssueCountry"] = a.Document._attributes.DocIssueCountry
                        a.Document["DocHolderNationality"] = a.Document._attributes.DocHolderNationality
                        a.Document["EffectiveDate"] = a.Document._attributes.EffectiveDate
                        a.Document["ExpireDate"] = a.Document._attributes.ExpireDate
                        delete a.Document["_attributes"]

                        a.TravelerRefNumber["RPH"] = a.TravelerRefNumber._attributes.RPH
                        delete a.TravelerRefNumber["_attributes"]
                    });
                }
                temp = result.OTA_AirBookRS.AirReservation.ContactPerson.PersonName.GivenName._text
                delete result.OTA_AirBookRS.AirReservation.ContactPerson.PersonName["GivenName"]
                result.OTA_AirBookRS.AirReservation.ContactPerson.PersonName["GivenName"] = temp
                temp = result.OTA_AirBookRS.AirReservation.ContactPerson.PersonName.Surname._text
                delete result.OTA_AirBookRS.AirReservation.ContactPerson.PersonName["Surname"]
                result.OTA_AirBookRS.AirReservation.ContactPerson.PersonName["Surname"] = temp

                result.OTA_AirBookRS.AirReservation.ContactPerson.Telephone["PhoneNumber"] = result.OTA_AirBookRS.AirReservation.ContactPerson.Telephone._attributes.PhoneNumber
                delete result.OTA_AirBookRS.AirReservation.ContactPerson.Telephone["_attributes"]
                result.OTA_AirBookRS.AirReservation.ContactPerson.HomeTelephone["PhoneNumber"] = result.OTA_AirBookRS.AirReservation.ContactPerson.HomeTelephone._attributes.PhoneNumber
                delete result.OTA_AirBookRS.AirReservation.ContactPerson.HomeTelephone["_attributes"]

                temp = result.OTA_AirBookRS.AirReservation.ContactPerson.Email._text
                delete result.OTA_AirBookRS.AirReservation.ContactPerson["Email"]
                result.OTA_AirBookRS.AirReservation.ContactPerson["Email"] = temp

                if (!!result.OTA_AirBookRS.AirReservation.Fulfillment.PaymentDetails.PaymentDetail) {
                    result.OTA_AirBookRS.AirReservation.Fulfillment.PaymentDetails.PaymentDetail["PaymentType"] = result.OTA_AirBookRS.AirReservation.Fulfillment?.PaymentDetails?.PaymentDetail?._attributes.PaymentType
                    delete result.OTA_AirBookRS.AirReservation.Fulfillment.PaymentDetails?.PaymentDetail["_attributes"]

                    result.OTA_AirBookRS.AirReservation.Fulfillment.PaymentDetails.PaymentDetail.DirectBill["DirectBill_ID"] = result.OTA_AirBookRS.AirReservation.Fulfillment?.PaymentDetails?.PaymentDetail?.DirectBill?._attributes.DirectBill_ID
                    delete result.OTA_AirBookRS.AirReservation.Fulfillment.PaymentDetails.PaymentDetail.DirectBill["_attributes"]

                    result.OTA_AirBookRS.AirReservation.Fulfillment.PaymentDetails.PaymentDetail.DirectBill.CompanyName["CompanyShortName"] = result.OTA_AirBookRS.AirReservation.Fulfillment?.PaymentDetails?.PaymentDetail?.DirectBill.CompanyName._attributes.CompanyShortName
                    result.OTA_AirBookRS.AirReservation.Fulfillment.PaymentDetails.PaymentDetail.DirectBill.CompanyName["Code"] = result.OTA_AirBookRS.AirReservation.Fulfillment?.PaymentDetails?.PaymentDetail?.DirectBill?.CompanyName._attributes.Code
                    result.OTA_AirBookRS.AirReservation.Fulfillment.PaymentDetails.PaymentDetail.DirectBill.CompanyName["AgentType"] = result.OTA_AirBookRS.AirReservation.Fulfillment?.PaymentDetails?.PaymentDetail?.DirectBill?.CompanyName._attributes.AgentType
                    delete result.OTA_AirBookRS.AirReservation.Fulfillment.PaymentDetails?.PaymentDetail.DirectBill.CompanyName["_attributes"]

                    result.OTA_AirBookRS.AirReservation.Fulfillment.PaymentDetails.PaymentDetail.PaymentAmount["CurrencyCode"] = result.OTA_AirBookRS.AirReservation.Fulfillment?.PaymentDetails?.PaymentDetail?.PaymentAmount?._attributes.CurrencyCode
                    result.OTA_AirBookRS.AirReservation.Fulfillment.PaymentDetails.PaymentDetail.PaymentAmount["DecimalPlaces"] = result.OTA_AirBookRS.AirReservation.Fulfillment?.PaymentDetails?.PaymentDetail?.PaymentAmount?._attributes.DecimalPlaces
                    result.OTA_AirBookRS.AirReservation.Fulfillment.PaymentDetails.PaymentDetail.PaymentAmount["Amount"] = result.OTA_AirBookRS.AirReservation.Fulfillment?.PaymentDetails?.PaymentDetail?.PaymentAmount?._attributes.Amount
                    delete result.OTA_AirBookRS.AirReservation.Fulfillment.PaymentDetails.PaymentDetail.PaymentAmount["_attributes"]
                }
                if (!Array.isArray(result.OTA_AirBookRS.AirReservation.Ticketing)) {
                    if (!!result.OTA_AirBookRS.AirReservation.Ticketing._attributes.TicketTimeLimit) {
                        result.OTA_AirBookRS.AirReservation.Ticketing["TicketTimeLimit"] = result.OTA_AirBookRS.AirReservation.Ticketing._attributes.TicketTimeLimit
                        result.OTA_AirBookRS.AirReservation.Ticketing["TicketingStatus"] = result.OTA_AirBookRS.AirReservation.Ticketing._attributes.TicketingStatus
                        delete result.OTA_AirBookRS.AirReservation.Ticketing["_attributes"]
                    } else {
                        result.OTA_AirBookRS.AirReservation.Ticketing["TravelerRefNumber"] = result.OTA_AirBookRS.AirReservation.Ticketing._attributes.TravelerRefNumber
                        result.OTA_AirBookRS.AirReservation.Ticketing["TicketDocumentNbr"] = result.OTA_AirBookRS.AirReservation.Ticketing._attributes.TicketDocumentNbr
                        delete result.OTA_AirBookRS.AirReservation.Ticketing["_attributes"]
                    }

                } else {
                    result.OTA_AirBookRS.AirReservation.Ticketing.forEach(t => {
                        if (!!t._attributes.TicketTimeLimit) {
                            t["TicketTimeLimit"] = t._attributes.TicketTimeLimit
                            t["TicketingStatus"] = t._attributes.TicketingStatus
                            delete t["_attributes"]
                        } else {
                            t["TravelerRefNumber"] = t._attributes.TravelerRefNumber
                            t["TicketDocumentNbr"] = t._attributes.TicketDocumentNbr
                            delete t["_attributes"]
                        }
                    })
                }
                if (!!result.OTA_AirBookRS.AirReservation.BalanceInfo) {
                    result.OTA_AirBookRS.AirReservation.BalanceInfo["CurrencyCode"] = result.OTA_AirBookRS.AirReservation.BalanceInfo._attributes.CurrencyCode
                    result.OTA_AirBookRS.AirReservation.BalanceInfo["DecimalPlaces"] = result.OTA_AirBookRS.AirReservation.BalanceInfo._attributes.DecimalPlaces
                    result.OTA_AirBookRS.AirReservation.BalanceInfo["Amount"] = result.OTA_AirBookRS.AirReservation.BalanceInfo._attributes.Amount
                    delete result.OTA_AirBookRS.AirReservation.BalanceInfo["_attributes"]
                }
                if (!!result.OTA_AirBookRS.AirReservation.BalanceInfoInAgentCurrency) {
                    result.OTA_AirBookRS.AirReservation.BalanceInfoInAgentCurrency["CurrencyCode"] = result.OTA_AirBookRS.AirReservation.BalanceInfoInAgentCurrency._attributes.CurrencyCode
                    result.OTA_AirBookRS.AirReservation.BalanceInfoInAgentCurrency["DecimalPlaces"] = result.OTA_AirBookRS.AirReservation.BalanceInfoInAgentCurrency._attributes.DecimalPlaces
                    result.OTA_AirBookRS.AirReservation.BalanceInfoInAgentCurrency["Amount"] = result.OTA_AirBookRS.AirReservation.BalanceInfoInAgentCurrency._attributes.Amount
                    delete result.OTA_AirBookRS.AirReservation.BalanceInfoInAgentCurrency["_attributes"]
                }
                result.OTA_AirBookRS.AirReservation.BookingReferenceID["Status"] = result.OTA_AirBookRS.AirReservation.BookingReferenceID._attributes.Status
                result.OTA_AirBookRS.AirReservation.BookingReferenceID["Instance"] = result.OTA_AirBookRS.AirReservation.BookingReferenceID._attributes.Instance
                result.OTA_AirBookRS.AirReservation.BookingReferenceID["ID"] = result.OTA_AirBookRS.AirReservation.BookingReferenceID._attributes.ID
                result.OTA_AirBookRS.AirReservation.BookingReferenceID["ID_Context"] = result.OTA_AirBookRS.AirReservation.BookingReferenceID._attributes.ID_Context
                delete result.OTA_AirBookRS.AirReservation.BookingReferenceID["_attributes"]

                if (!!result.OTA_AirBookRS.AirReservation.Offer.Priced) {
                    result.OTA_AirBookRS.AirReservation.Offer.Priced.forEach(p => {
                        p["FlightSegmentRPH"] = p._attributes.FlightSegmentRPH
                        p["TravelerRPH"] = p._attributes.TravelerRPH
                        p["ID"] = p._attributes.ID
                        p["Name"] = p._attributes.Name
                        delete p["_attributes"]
                        p.Pricing["OfferQty"] = p.Pricing._attributes.OfferQty
                        p.Pricing["PreTaxAmount"] = p.Pricing._attributes.PreTaxAmount
                        p.Pricing["TaxAmount"] = p.Pricing._attributes.TaxAmount
                        p.Pricing["Amount"] = p.Pricing._attributes.Amount
                        p.Pricing["PricingCurrency"] = p.Pricing._attributes.PricingCurrency
                        p.Pricing["DecimalPlaces"] = p.Pricing._attributes.DecimalPlaces
                        delete p.Pricing["_attributes"]
                    })
                }

                return result;
            } catch (e) {
                console.log('EEEEEE ==> ', e)
            }
        }
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

module.exports.rmAttrTagsBook = result => {
    try {
        let temp;
        result.OTA_AirBookRS.AirReservation["CreatedDateTme"] = result.OTA_AirBookRS.AirReservation._attributes.CreatedDateTme;
        delete result.OTA_AirBookRS.AirReservation["_attributes"];

        result.OTA_AirBookRS.AirReservation.AirItinerary["DirectionInd"] = result.OTA_AirBookRS.AirReservation.AirItinerary._attributes.DirectionInd
        delete result.OTA_AirBookRS.AirReservation.AirItinerary["_attributes"];

        if (!Array.isArray(result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment)) {
            result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment["Status"] = result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment._attributes.Status
            result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment["FlightNumber"] = result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment._attributes.FlightNumber
            result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment["FareBasisCode"] = result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment._attributes.FareBasisCode
            result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment["ResBookDesigCode"] = result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment._attributes.ResBookDesigCode
            result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment["DepartureDateTime"] = result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment._attributes.DepartureDateTime
            result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment["ArrivalDateTime"] = result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment._attributes.ArrivalDateTime
            result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment["StopQuantity"] = result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment._attributes.StopQuantity
            result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment["RPH"] = result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment._attributes.RPH
            delete result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment["_attributes"]

            result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.DepartureAirport["LocationCode"] = result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.DepartureAirport._attributes.LocationCode
            result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.DepartureAirport["LocationName"] = result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.DepartureAirport._attributes.LocationName
            delete result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.DepartureAirport["_attributes"]

            result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.ArrivalAirport["LocationCode"] = result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.ArrivalAirport._attributes.LocationCode
            result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.ArrivalAirport["LocationName"] = result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.ArrivalAirport._attributes.LocationName
            delete result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.ArrivalAirport["_attributes"]

            result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.OperatingAirline["Code"] = result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.OperatingAirline._attributes.Code
            delete result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.OperatingAirline["_attributes"]

            result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.Equipment["AirEquipType"] = result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.Equipment._attributes.AirEquipType
            delete result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.Equipment["_attributes"]

        } else {
            result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.forEach(s => {
                s["Status"] = s._attributes.Status
                s["FlightNumber"] = s._attributes.FlightNumber
                s["FareBasisCode"] = s._attributes.FareBasisCode
                s["ResBookDesigCode"] = s._attributes.ResBookDesigCode
                s["DepartureDateTime"] = s._attributes.DepartureDateTime
                s["ArrivalDateTime"] = s._attributes.ArrivalDateTime
                s["StopQuantity"] = s._attributes.StopQuantity
                s["RPH"] = s._attributes.RPH
                delete s["_attributes"]

                s.DepartureAirport["LocationCode"] = s.DepartureAirport._attributes.LocationCode
                s.DepartureAirport["LocationName"] = s.DepartureAirport._attributes.LocationName
                delete s.DepartureAirport["_attributes"]

                s.ArrivalAirport["LocationCode"] = s.ArrivalAirport._attributes.LocationCode
                s.ArrivalAirport["LocationName"] = s.ArrivalAirport._attributes.LocationName
                delete s.ArrivalAirport["_attributes"]

                s.OperatingAirline["Code"] = s.OperatingAirline._attributes.Code
                delete s.OperatingAirline["_attributes"]

                s.Equipment["AirEquipType"] = s.Equipment._attributes.AirEquipType
                delete s.Equipment["_attributes"]
            });
        }

        result.OTA_AirBookRS.AirReservation.ArrangerInfo.CompanyInfo["CompanyShortName"] = result.OTA_AirBookRS.AirReservation.ArrangerInfo.CompanyInfo._attributes.CompanyShortName
        result.OTA_AirBookRS.AirReservation.ArrangerInfo.CompanyInfo["Code"] = result.OTA_AirBookRS.AirReservation.ArrangerInfo.CompanyInfo._attributes.Code
        delete result.OTA_AirBookRS.AirReservation.ArrangerInfo.CompanyInfo["_attributes"]

        result.OTA_AirBookRS.AirReservation.PriceInfo.ItinTotalFare.TotalFare["CurrencyCode"] = result.OTA_AirBookRS.AirReservation.PriceInfo.ItinTotalFare.TotalFare._attributes.CurrencyCode
        result.OTA_AirBookRS.AirReservation.PriceInfo.ItinTotalFare.TotalFare["DecimalPlaces"] = result.OTA_AirBookRS.AirReservation.PriceInfo.ItinTotalFare.TotalFare._attributes.DecimalPlaces
        result.OTA_AirBookRS.AirReservation.PriceInfo.ItinTotalFare.TotalFare["Amount"] = result.OTA_AirBookRS.AirReservation.PriceInfo.ItinTotalFare.TotalFare._attributes.Amount
        delete result.OTA_AirBookRS.AirReservation.PriceInfo.ItinTotalFare.TotalFare["_attributes"]

        if (!Array.isArray(result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown)) {
            result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerTypeQuantity["Code"] = result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerTypeQuantity._attributes.Code
            result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerTypeQuantity["Quantity"] = result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerTypeQuantity._attributes.Quantity
            delete result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerTypeQuantity["_attributes"]

            temp = result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.FareBasisCodes.FareBasisCode["_text"]
            delete result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.FareBasisCodes["FareBasisCode"]
            result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.FareBasisCodes["FareBasisCode"] = temp

            result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.BaseFare["CurrencyCode"] = result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.BaseFare._attributes.CurrencyCode
            result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.BaseFare["DecimalPlaces"] = result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.BaseFare._attributes.DecimalPlaces
            result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.BaseFare["Amount"] = result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.BaseFare._attributes.Amount
            delete result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.BaseFare["_attributes"]

            result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.Taxes.Tax.forEach(t => {
                t["TaxCode"] = t._attributes.TaxCode;
                t["TaxName"] = t._attributes.TaxName;
                t["CurrencyCode"] = t._attributes.CurrencyCode;
                t["DecimalPlaces"] = t._attributes.DecimalPlaces;
                t["Amount"] = t.Amount;
                delete t["_attributes"]
            });

            result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.TotalFare["CurrencyCode"] = result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.TotalFare._attributes.CurrencyCode
            result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.TotalFare["DecimalPlaces"] = result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.TotalFare._attributes.DecimalPlaces
            result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.TotalFare["Amount"] = result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.TotalFare._attributes.Amount
            delete result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.TotalFare["_attributes"]

            result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.FareInfo.FareInfo["FareBasisCode"] = result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.FareInfo.FareInfo._attributes.FareBasisCode
            delete result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.FareInfo.FareInfo["_attributes"]
            result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.FareInfo.FareInfo.Fare["BaseAmount"] = result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.FareInfo.FareInfo.Fare._attributes.BaseAmount
            delete result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.FareInfo.FareInfo.Fare["_attributes"]
        } else {
            result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.forEach(p => {
                p.PassengerTypeQuantity["Code"] = p.PassengerTypeQuantity._attributes.Code
                p.PassengerTypeQuantity["Quantity"] = p.PassengerTypeQuantity._attributes.Quantity
                delete p.PassengerTypeQuantity["_attributes"]

                temp = p.FareBasisCodes.FareBasisCode["_text"]
                delete p.FareBasisCodes["FareBasisCode"]
                p.FareBasisCodes["FareBasisCode"] = temp


                p.PassengerFare.BaseFare["CurrencyCode"] = p.PassengerFare.BaseFare._attributes.CurrencyCode
                p.PassengerFare.BaseFare["DecimalPlaces"] = p.PassengerFare.BaseFare._attributes.DecimalPlaces
                p.PassengerFare.BaseFare["Amount"] = p.PassengerFare.BaseFare._attributes.Amount
                delete p.PassengerFare.BaseFare["_attributes"]
                // console.log("******* ==> ", p.PassengerFare.Taxes)
                p.PassengerFare.Taxes.Tax?.forEach(t => {
                    t["TaxCode"] = t._attributes.TaxCode;
                    t["TaxName"] = t._attributes.TaxName;
                    t["CurrencyCode"] = t._attributes.CurrencyCode;
                    t["DecimalPlaces"] = t._attributes.DecimalPlaces;
                    t["Amount"] = t.Amount;
                    delete t["_attributes"]
                });

                p.PassengerFare.TotalFare["CurrencyCode"] = p.PassengerFare.TotalFare._attributes.CurrencyCode
                p.PassengerFare.TotalFare["DecimalPlaces"] = p.PassengerFare.TotalFare._attributes.DecimalPlaces
                p.PassengerFare.TotalFare["Amount"] = p.PassengerFare.TotalFare._attributes.Amount
                delete p.PassengerFare.TotalFare["_attributes"]

                p.FareInfo.FareInfo["FareBasisCode"] = p.FareInfo.FareInfo._attributes.FareBasisCode
                delete p.FareInfo.FareInfo["_attributes"]
                p.FareInfo.FareInfo.Fare["BaseAmount"] = p.FareInfo.FareInfo.Fare._attributes.BaseAmount
                delete p.FareInfo.FareInfo.Fare["_attributes"]
            });
        }
        if (!Array.isArray(result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler)) {
            result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler["BirthDate"] = result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler._attributes.BirthDate
            result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler["PassengerTypeCode"] = result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler._attributes.PassengerTypeCode
            result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler["AccompaniedByInfantInd"] = result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler._attributes.AccompaniedByInfantInd
            result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler["TravelerNationality"] = result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler._attributes.TravelerNationality
            result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler["Gender"] = result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler._attributes.Gender
            delete result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler["_attributes"]

            temp = result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.PersonName.NamePrefix._text
            delete result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.PersonName["NamePrefix"]
            result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.PersonName["NamePrefix"] = temp

            temp = result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.PersonName.GivenName._text
            delete result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.PersonName["GivenName"]
            result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.PersonName["GivenName"] = temp

            temp = result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.PersonName.Surname._text
            delete result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.PersonName["Surname"]
            result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.PersonName["Surname"] = temp

            result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.Document["DocID"] = result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.Document._attributes.DocID
            result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.Document["DocType"] = result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.Document._attributes.DocType
            result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.Document["DocIssueCountry"] = result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.Document._attributes.DocIssueCountry
            result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.Document["DocHolderNationality"] = result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.Document._attributes.DocHolderNationality
            result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.Document["EffectiveDate"] = result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.Document._attributes.EffectiveDate
            result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.Document["ExpireDate"] = result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.Document._attributes.ExpireDate
            delete result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.Document["_attributes"]

            result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.TravelerRefNumber["RPH"] = result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.TravelerRefNumber._attributes.RPH
            delete result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.TravelerRefNumber["_attributes"]
        } else {
            result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.forEach(a => {
                a["BirthDate"] = a._attributes.BirthDate
                a["PassengerTypeCode"] = a._attributes.PassengerTypeCode
                a["AccompaniedByInfantInd"] = a._attributes.AccompaniedByInfantInd
                a["TravelerNationality"] = a._attributes.TravelerNationality
                a["Gender"] = a._attributes.Gender
                delete a["_attributes"]

                temp = a.PersonName.NamePrefix?._text
                delete a.PersonName["NamePrefix"]
                a["NamePrefix"] = temp

                temp = a.PersonName.GivenName?._text
                delete a.PersonName["GivenName"]
                a["GivenName"] = temp

                temp = a.PersonName.Surname?._text
                delete a.PersonName["Surname"]
                a["Surname"] = temp

                a.Document["DocID"] = a.Document._attributes.DocID
                a.Document["DocType"] = a.Document._attributes.DocType
                a.Document["DocIssueCountry"] = a.Document._attributes.DocIssueCountry
                a.Document["DocHolderNationality"] = a.Document._attributes.DocHolderNationality
                a.Document["EffectiveDate"] = a.Document._attributes.EffectiveDate
                a.Document["ExpireDate"] = a.Document._attributes.ExpireDate
                delete a.Document["_attributes"]

                a.TravelerRefNumber["RPH"] = a.TravelerRefNumber._attributes.RPH
                delete a.TravelerRefNumber["_attributes"]
            });
        }
        temp = result.OTA_AirBookRS.AirReservation.ContactPerson.PersonName.GivenName._text
        delete result.OTA_AirBookRS.AirReservation.ContactPerson.PersonName["GivenName"]
        result.OTA_AirBookRS.AirReservation.ContactPerson.PersonName["GivenName"] = temp
        temp = result.OTA_AirBookRS.AirReservation.ContactPerson.PersonName.Surname._text
        delete result.OTA_AirBookRS.AirReservation.ContactPerson.PersonName["Surname"]
        result.OTA_AirBookRS.AirReservation.ContactPerson.PersonName["Surname"] = temp

        result.OTA_AirBookRS.AirReservation.ContactPerson.Telephone["PhoneNumber"] = result.OTA_AirBookRS.AirReservation.ContactPerson.Telephone._attributes.PhoneNumber
        delete result.OTA_AirBookRS.AirReservation.ContactPerson.Telephone["_attributes"]
        result.OTA_AirBookRS.AirReservation.ContactPerson.HomeTelephone["PhoneNumber"] = result.OTA_AirBookRS.AirReservation.ContactPerson.HomeTelephone._attributes.PhoneNumber
        delete result.OTA_AirBookRS.AirReservation.ContactPerson.HomeTelephone["_attributes"]

        temp = result.OTA_AirBookRS.AirReservation.ContactPerson.Email._text
        delete result.OTA_AirBookRS.AirReservation.ContactPerson["Email"]
        result.OTA_AirBookRS.AirReservation.ContactPerson["Email"] = temp
        if (!!result.OTA_AirBookRS.AirReservation.Fulfillment.PaymentDetails.PaymentDetail) {
            result.OTA_AirBookRS.AirReservation.Fulfillment.PaymentDetails.PaymentDetail["PaymentType"] = result.OTA_AirBookRS.AirReservation.Fulfillment?.PaymentDetails?.PaymentDetail?._attributes.PaymentType
            delete result.OTA_AirBookRS.AirReservation.Fulfillment.PaymentDetails?.PaymentDetail["_attributes"]

            result.OTA_AirBookRS.AirReservation.Fulfillment.PaymentDetails.PaymentDetail.DirectBill["DirectBill_ID"] = result.OTA_AirBookRS.AirReservation.Fulfillment?.PaymentDetails?.PaymentDetail?.DirectBill?._attributes.DirectBill_ID
            delete result.OTA_AirBookRS.AirReservation.Fulfillment.PaymentDetails.PaymentDetail.DirectBill["_attributes"]

            result.OTA_AirBookRS.AirReservation.Fulfillment.PaymentDetails.PaymentDetail.DirectBill.CompanyName["CompanyShortName"] = result.OTA_AirBookRS.AirReservation.Fulfillment?.PaymentDetails?.PaymentDetail?.DirectBill.CompanyName._attributes.CompanyShortName
            result.OTA_AirBookRS.AirReservation.Fulfillment.PaymentDetails.PaymentDetail.DirectBill.CompanyName["Code"] = result.OTA_AirBookRS.AirReservation.Fulfillment?.PaymentDetails?.PaymentDetail?.DirectBill?.CompanyName._attributes.Code
            result.OTA_AirBookRS.AirReservation.Fulfillment.PaymentDetails.PaymentDetail.DirectBill.CompanyName["AgentType"] = result.OTA_AirBookRS.AirReservation.Fulfillment?.PaymentDetails?.PaymentDetail?.DirectBill?.CompanyName._attributes.AgentType
            delete result.OTA_AirBookRS.AirReservation.Fulfillment.PaymentDetails?.PaymentDetail.DirectBill.CompanyName["_attributes"]

            result.OTA_AirBookRS.AirReservation.Fulfillment.PaymentDetails.PaymentDetail.PaymentAmount["CurrencyCode"] = result.OTA_AirBookRS.AirReservation.Fulfillment?.PaymentDetails?.PaymentDetail?.PaymentAmount?._attributes.CurrencyCode
            result.OTA_AirBookRS.AirReservation.Fulfillment.PaymentDetails.PaymentDetail.PaymentAmount["DecimalPlaces"] = result.OTA_AirBookRS.AirReservation.Fulfillment?.PaymentDetails?.PaymentDetail?.PaymentAmount?._attributes.DecimalPlaces
            result.OTA_AirBookRS.AirReservation.Fulfillment.PaymentDetails.PaymentDetail.PaymentAmount["Amount"] = result.OTA_AirBookRS.AirReservation.Fulfillment?.PaymentDetails?.PaymentDetail?.PaymentAmount?._attributes.Amount
            delete result.OTA_AirBookRS.AirReservation.Fulfillment.PaymentDetails.PaymentDetail.PaymentAmount["_attributes"]
        }
        if (!Array.isArray(result.OTA_AirBookRS.AirReservation.Ticketing)) {
            result.OTA_AirBookRS.AirReservation.Ticketing["TravelerRefNumber"] = result.OTA_AirBookRS.AirReservation.Ticketing._attributes.TravelerRefNumber
            result.OTA_AirBookRS.AirReservation.Ticketing["TicketDocumentNbr"] = result.OTA_AirBookRS.AirReservation.Ticketing._attributes.TicketDocumentNbr
            delete result.OTA_AirBookRS.AirReservation.Ticketing["_attributes"]

        } else {
            result.OTA_AirBookRS.AirReservation.Ticketing.forEach(t => {
                t["TravelerRefNumber"] = t._attributes.TravelerRefNumber
                t["TicketDocumentNbr"] = t._attributes.TicketDocumentNbr
                delete t["_attributes"]
            })
        }
        result.OTA_AirBookRS.AirReservation.BookingReferenceID["Status"] = result.OTA_AirBookRS.AirReservation.BookingReferenceID._attributes.Status
        result.OTA_AirBookRS.AirReservation.BookingReferenceID["Instance"] = result.OTA_AirBookRS.AirReservation.BookingReferenceID._attributes.Instance
        result.OTA_AirBookRS.AirReservation.BookingReferenceID["ID"] = result.OTA_AirBookRS.AirReservation.BookingReferenceID._attributes.ID
        result.OTA_AirBookRS.AirReservation.BookingReferenceID["ID_Context"] = result.OTA_AirBookRS.AirReservation.BookingReferenceID._attributes.ID_Context
        delete result.OTA_AirBookRS.AirReservation.BookingReferenceID["_attributes"]

        if (!!result.OTA_AirBookRS.AirReservation.Offer.Priced) {
            result.OTA_AirBookRS.AirReservation.Offer.Priced.forEach(p => {
                p["FlightSegmentRPH"] = p._attributes.FlightSegmentRPH
                p["TravelerRPH"] = p._attributes.TravelerRPH
                p["ID"] = p._attributes.ID
                p["Name"] = p._attributes.Name
                delete p["_attributes"]
                p.Pricing["OfferQty"] = p.Pricing._attributes.OfferQty
                p.Pricing["PreTaxAmount"] = p.Pricing._attributes.PreTaxAmount
                p.Pricing["TaxAmount"] = p.Pricing._attributes.TaxAmount
                p.Pricing["Amount"] = p.Pricing._attributes.Amount
                p.Pricing["PricingCurrency"] = p.Pricing._attributes.PricingCurrency
                p.Pricing["DecimalPlaces"] = p.Pricing._attributes.DecimalPlaces
                delete p.Pricing["_attributes"]
            })
        }

        return result;
    } catch (e) {
        console.log('EEEEEE ==> ', e)
    }
}

module.exports.rmAttrTagsGetBook = result => {
    try {
        let temp;
        result.OTA_AirBookRS.AirReservation["CreatedDateTme"] = result.OTA_AirBookRS.AirReservation._attributes.CreatedDateTme;
        delete result.OTA_AirBookRS.AirReservation["_attributes"];

        result.OTA_AirBookRS.AirReservation.AirItinerary["DirectionInd"] = result.OTA_AirBookRS.AirReservation.AirItinerary._attributes.DirectionInd
        delete result.OTA_AirBookRS.AirReservation.AirItinerary["_attributes"];

        if (!Array.isArray(result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment)) {
            result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment["Status"] = result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment._attributes.Status
            result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment["FlightNumber"] = result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment._attributes.FlightNumber
            result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment["FareBasisCode"] = result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment._attributes.FareBasisCode
            result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment["ResBookDesigCode"] = result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment._attributes.ResBookDesigCode
            result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment["DepartureDateTime"] = result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment._attributes.DepartureDateTime
            result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment["ArrivalDateTime"] = result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment._attributes.ArrivalDateTime
            result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment["StopQuantity"] = result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment._attributes.StopQuantity
            result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment["RPH"] = result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment._attributes.RPH
            delete result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment["_attributes"]

            result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.DepartureAirport["LocationCode"] = result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.DepartureAirport._attributes.LocationCode
            result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.DepartureAirport["LocationName"] = result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.DepartureAirport._attributes.LocationName
            delete result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.DepartureAirport["_attributes"]

            result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.ArrivalAirport["LocationCode"] = result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.ArrivalAirport._attributes.LocationCode
            result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.ArrivalAirport["LocationName"] = result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.ArrivalAirport._attributes.LocationName
            delete result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.ArrivalAirport["_attributes"]

            result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.OperatingAirline["Code"] = result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.OperatingAirline._attributes.Code
            delete result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.OperatingAirline["_attributes"]

            result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.Equipment["AirEquipType"] = result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.Equipment._attributes.AirEquipType
            delete result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.Equipment["_attributes"]

        } else {
            result.OTA_AirBookRS.AirReservation.AirItinerary.OriginDestinationOptions.OriginDestinationOption.FlightSegment.forEach(s => {
                s["Status"] = s._attributes.Status
                s["FlightNumber"] = s._attributes.FlightNumber
                s["FareBasisCode"] = s._attributes.FareBasisCode
                s["ResBookDesigCode"] = s._attributes.ResBookDesigCode
                s["DepartureDateTime"] = s._attributes.DepartureDateTime
                s["ArrivalDateTime"] = s._attributes.ArrivalDateTime
                s["StopQuantity"] = s._attributes.StopQuantity
                s["RPH"] = s._attributes.RPH
                delete s["_attributes"]

                s.DepartureAirport["LocationCode"] = s.DepartureAirport._attributes.LocationCode
                s.DepartureAirport["LocationName"] = s.DepartureAirport._attributes.LocationName
                delete s.DepartureAirport["_attributes"]

                s.ArrivalAirport["LocationCode"] = s.ArrivalAirport._attributes.LocationCode
                s.ArrivalAirport["LocationName"] = s.ArrivalAirport._attributes.LocationName
                delete s.ArrivalAirport["_attributes"]

                s.OperatingAirline["Code"] = s.OperatingAirline._attributes.Code
                delete s.OperatingAirline["_attributes"]

                s.Equipment["AirEquipType"] = s.Equipment._attributes.AirEquipType
                delete s.Equipment["_attributes"]
            });
        }

        result.OTA_AirBookRS.AirReservation.ArrangerInfo.CompanyInfo["CompanyShortName"] = result.OTA_AirBookRS.AirReservation.ArrangerInfo.CompanyInfo._attributes.CompanyShortName
        result.OTA_AirBookRS.AirReservation.ArrangerInfo.CompanyInfo["Code"] = result.OTA_AirBookRS.AirReservation.ArrangerInfo.CompanyInfo._attributes.Code
        delete result.OTA_AirBookRS.AirReservation.ArrangerInfo.CompanyInfo["_attributes"]

        result.OTA_AirBookRS.AirReservation.PriceInfo.ItinTotalFare.TotalFare["CurrencyCode"] = result.OTA_AirBookRS.AirReservation.PriceInfo.ItinTotalFare.TotalFare._attributes.CurrencyCode
        result.OTA_AirBookRS.AirReservation.PriceInfo.ItinTotalFare.TotalFare["DecimalPlaces"] = result.OTA_AirBookRS.AirReservation.PriceInfo.ItinTotalFare.TotalFare._attributes.DecimalPlaces
        result.OTA_AirBookRS.AirReservation.PriceInfo.ItinTotalFare.TotalFare["Amount"] = result.OTA_AirBookRS.AirReservation.PriceInfo.ItinTotalFare.TotalFare._attributes.Amount
        delete result.OTA_AirBookRS.AirReservation.PriceInfo.ItinTotalFare.TotalFare["_attributes"]

        if (!Array.isArray(result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown)) {
            result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerTypeQuantity["Code"] = result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerTypeQuantity._attributes.Code
            result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerTypeQuantity["Quantity"] = result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerTypeQuantity._attributes.Quantity
            delete result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerTypeQuantity["_attributes"]

            temp = result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.FareBasisCodes.FareBasisCode._text
            delete result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.FareBasisCodes["FareBasisCode"]
            result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.FareBasisCodes["FareBasisCode"] = temp

            result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.BaseFare["CurrencyCode"] = result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.BaseFare._attributes.CurrencyCode
            result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.BaseFare["DecimalPlaces"] = result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.BaseFare._attributes.DecimalPlaces
            result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.BaseFare["Amount"] = result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.BaseFare._attributes.Amount
            delete result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.BaseFare["_attributes"]

            result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.Taxes.Tax.forEach(t => {
                t["TaxCode"] = t._attributes.TaxCode;
                t["TaxName"] = t._attributes.TaxName;
                t["CurrencyCode"] = t._attributes.CurrencyCode;
                t["DecimalPlaces"] = t._attributes.DecimalPlaces;
                t["Amount"] = t.Amount;
                delete t["_attributes"]
            });

            result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.TotalFare["CurrencyCode"] = result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.TotalFare._attributes.CurrencyCode
            result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.TotalFare["DecimalPlaces"] = result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.TotalFare._attributes.DecimalPlaces
            result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.TotalFare["Amount"] = result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.TotalFare._attributes.Amount
            delete result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.PassengerFare.TotalFare["_attributes"]

            result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.FareInfo.FareInfo["FareBasisCode"] = result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.FareInfo.FareInfo._attributes.FareBasisCode
            delete result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.FareInfo.FareInfo["_attributes"]
            result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.FareInfo.FareInfo.Fare["BaseAmount"] = result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.FareInfo.FareInfo.Fare._attributes.BaseAmount
            delete result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.FareInfo.FareInfo.Fare["_attributes"]
        } else {
            result.OTA_AirBookRS.AirReservation.PriceInfo.PTC_FareBreakdowns.PTC_FareBreakdown.forEach(p => {
                p.PassengerTypeQuantity["Code"] = p.PassengerTypeQuantity._attributes.Code
                p.PassengerTypeQuantity["Quantity"] = p.PassengerTypeQuantity._attributes.Quantity
                delete p.PassengerTypeQuantity["_attributes"]

                temp = p.FareBasisCodes.FareBasisCode["_text"]
                delete p.FareBasisCodes["FareBasisCode"]
                p.FareBasisCodes["FareBasisCode"] = temp


                p.PassengerFare.BaseFare["CurrencyCode"] = p.PassengerFare.BaseFare._attributes.CurrencyCode
                p.PassengerFare.BaseFare["DecimalPlaces"] = p.PassengerFare.BaseFare._attributes.DecimalPlaces
                p.PassengerFare.BaseFare["Amount"] = p.PassengerFare.BaseFare._attributes.Amount
                delete p.PassengerFare.BaseFare["_attributes"]
                // console.log("******* ==> ", p.PassengerFare.Taxes)
                p.PassengerFare.Taxes.Tax?.forEach(t => {
                    t["TaxCode"] = t._attributes.TaxCode;
                    t["TaxName"] = t._attributes.TaxName;
                    t["CurrencyCode"] = t._attributes.CurrencyCode;
                    t["DecimalPlaces"] = t._attributes.DecimalPlaces;
                    t["Amount"] = t.Amount;
                    delete t["_attributes"]
                });

                p.PassengerFare.TotalFare["CurrencyCode"] = p.PassengerFare.TotalFare._attributes.CurrencyCode
                p.PassengerFare.TotalFare["DecimalPlaces"] = p.PassengerFare.TotalFare._attributes.DecimalPlaces
                p.PassengerFare.TotalFare["Amount"] = p.PassengerFare.TotalFare._attributes.Amount
                delete p.PassengerFare.TotalFare["_attributes"]

                p.FareInfo.FareInfo["FareBasisCode"] = p.FareInfo.FareInfo._attributes.FareBasisCode
                delete p.FareInfo.FareInfo["_attributes"]
                p.FareInfo.FareInfo.Fare["BaseAmount"] = p.FareInfo.FareInfo.Fare._attributes.BaseAmount
                delete p.FareInfo.FareInfo.Fare["_attributes"]
            });
        }
        if (!Array.isArray(result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler)) {
            result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler["BirthDate"] = result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler._attributes.BirthDate
            result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler["PassengerTypeCode"] = result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler._attributes.PassengerTypeCode
            result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler["AccompaniedByInfantInd"] = result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler._attributes.AccompaniedByInfantInd
            result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler["TravelerNationality"] = result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler._attributes.TravelerNationality
            result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler["Gender"] = result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler._attributes.Gender
            delete result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler["_attributes"]

            temp = result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.PersonName.NamePrefix._text
            delete result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.PersonName["NamePrefix"]
            result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.PersonName["NamePrefix"] = temp

            temp = result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.PersonName.GivenName._text
            delete result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.PersonName["GivenName"]
            result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.PersonName["GivenName"] = temp

            temp = result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.PersonName.Surname._text
            delete result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.PersonName["Surname"]
            result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.PersonName["Surname"] = temp

            result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.Document["DocID"] = result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.Document._attributes.DocID
            result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.Document["DocType"] = result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.Document._attributes.DocType
            result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.Document["DocIssueCountry"] = result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.Document._attributes.DocIssueCountry
            result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.Document["DocHolderNationality"] = result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.Document._attributes.DocHolderNationality
            result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.Document["EffectiveDate"] = result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.Document._attributes.EffectiveDate
            result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.Document["ExpireDate"] = result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.Document._attributes.ExpireDate
            delete result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.Document["_attributes"]

            result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.TravelerRefNumber["RPH"] = result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.TravelerRefNumber._attributes.RPH
            delete result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.TravelerRefNumber["_attributes"]
        } else {
            result.OTA_AirBookRS.AirReservation.TravelerInfo.AirTraveler.forEach(a => {
                a["BirthDate"] = a._attributes.BirthDate
                a["PassengerTypeCode"] = a._attributes.PassengerTypeCode
                a["AccompaniedByInfantInd"] = a._attributes.AccompaniedByInfantInd
                a["TravelerNationality"] = a._attributes.TravelerNationality
                a["Gender"] = a._attributes.Gender
                delete a["_attributes"]

                temp = a.PersonName.NamePrefix?._text
                delete a.PersonName["NamePrefix"]
                a["NamePrefix"] = temp

                temp = a.PersonName.GivenName?._text
                delete a.PersonName["GivenName"]
                a["GivenName"] = temp

                temp = a.PersonName.Surname?._text
                delete a.PersonName["Surname"]
                a["Surname"] = temp

                a.Document["DocID"] = a.Document._attributes.DocID
                a.Document["DocType"] = a.Document._attributes.DocType
                a.Document["DocIssueCountry"] = a.Document._attributes.DocIssueCountry
                a.Document["DocHolderNationality"] = a.Document._attributes.DocHolderNationality
                a.Document["EffectiveDate"] = a.Document._attributes.EffectiveDate
                a.Document["ExpireDate"] = a.Document._attributes.ExpireDate
                delete a.Document["_attributes"]

                a.TravelerRefNumber["RPH"] = a.TravelerRefNumber._attributes.RPH
                delete a.TravelerRefNumber["_attributes"]
            });
        }
        temp = result.OTA_AirBookRS.AirReservation.ContactPerson.PersonName.GivenName._text
        delete result.OTA_AirBookRS.AirReservation.ContactPerson.PersonName["GivenName"]
        result.OTA_AirBookRS.AirReservation.ContactPerson.PersonName["GivenName"] = temp
        temp = result.OTA_AirBookRS.AirReservation.ContactPerson.PersonName.Surname._text
        delete result.OTA_AirBookRS.AirReservation.ContactPerson.PersonName["Surname"]
        result.OTA_AirBookRS.AirReservation.ContactPerson.PersonName["Surname"] = temp

        result.OTA_AirBookRS.AirReservation.ContactPerson.Telephone["PhoneNumber"] = result.OTA_AirBookRS.AirReservation.ContactPerson.Telephone._attributes.PhoneNumber
        delete result.OTA_AirBookRS.AirReservation.ContactPerson.Telephone["_attributes"]
        result.OTA_AirBookRS.AirReservation.ContactPerson.HomeTelephone["PhoneNumber"] = result.OTA_AirBookRS.AirReservation.ContactPerson.HomeTelephone._attributes.PhoneNumber
        delete result.OTA_AirBookRS.AirReservation.ContactPerson.HomeTelephone["_attributes"]

        temp = result.OTA_AirBookRS.AirReservation.ContactPerson.Email._text
        delete result.OTA_AirBookRS.AirReservation.ContactPerson["Email"]
        result.OTA_AirBookRS.AirReservation.ContactPerson["Email"] = temp

        if (!!result.OTA_AirBookRS.AirReservation.Fulfillment.PaymentDetails.PaymentDetail) {
            result.OTA_AirBookRS.AirReservation.Fulfillment.PaymentDetails.PaymentDetail["PaymentType"] = result.OTA_AirBookRS.AirReservation.Fulfillment?.PaymentDetails?.PaymentDetail?._attributes.PaymentType
            delete result.OTA_AirBookRS.AirReservation.Fulfillment.PaymentDetails?.PaymentDetail["_attributes"]

            result.OTA_AirBookRS.AirReservation.Fulfillment.PaymentDetails.PaymentDetail.DirectBill["DirectBill_ID"] = result.OTA_AirBookRS.AirReservation.Fulfillment?.PaymentDetails?.PaymentDetail?.DirectBill?._attributes.DirectBill_ID
            delete result.OTA_AirBookRS.AirReservation.Fulfillment.PaymentDetails.PaymentDetail.DirectBill["_attributes"]

            result.OTA_AirBookRS.AirReservation.Fulfillment.PaymentDetails.PaymentDetail.DirectBill.CompanyName["CompanyShortName"] = result.OTA_AirBookRS.AirReservation.Fulfillment?.PaymentDetails?.PaymentDetail?.DirectBill.CompanyName._attributes.CompanyShortName
            result.OTA_AirBookRS.AirReservation.Fulfillment.PaymentDetails.PaymentDetail.DirectBill.CompanyName["Code"] = result.OTA_AirBookRS.AirReservation.Fulfillment?.PaymentDetails?.PaymentDetail?.DirectBill?.CompanyName._attributes.Code
            result.OTA_AirBookRS.AirReservation.Fulfillment.PaymentDetails.PaymentDetail.DirectBill.CompanyName["AgentType"] = result.OTA_AirBookRS.AirReservation.Fulfillment?.PaymentDetails?.PaymentDetail?.DirectBill?.CompanyName._attributes.AgentType
            delete result.OTA_AirBookRS.AirReservation.Fulfillment.PaymentDetails?.PaymentDetail.DirectBill.CompanyName["_attributes"]

            result.OTA_AirBookRS.AirReservation.Fulfillment.PaymentDetails.PaymentDetail.PaymentAmount["CurrencyCode"] = result.OTA_AirBookRS.AirReservation.Fulfillment?.PaymentDetails?.PaymentDetail?.PaymentAmount?._attributes.CurrencyCode
            result.OTA_AirBookRS.AirReservation.Fulfillment.PaymentDetails.PaymentDetail.PaymentAmount["DecimalPlaces"] = result.OTA_AirBookRS.AirReservation.Fulfillment?.PaymentDetails?.PaymentDetail?.PaymentAmount?._attributes.DecimalPlaces
            result.OTA_AirBookRS.AirReservation.Fulfillment.PaymentDetails.PaymentDetail.PaymentAmount["Amount"] = result.OTA_AirBookRS.AirReservation.Fulfillment?.PaymentDetails?.PaymentDetail?.PaymentAmount?._attributes.Amount
            delete result.OTA_AirBookRS.AirReservation.Fulfillment.PaymentDetails.PaymentDetail.PaymentAmount["_attributes"]
        }
        if (!Array.isArray(result.OTA_AirBookRS.AirReservation.Ticketing)) {
            if (!!result.OTA_AirBookRS.AirReservation.Ticketing._attributes.TicketTimeLimit) {
                result.OTA_AirBookRS.AirReservation.Ticketing["TicketTimeLimit"] = result.OTA_AirBookRS.AirReservation.Ticketing._attributes.TicketTimeLimit
                result.OTA_AirBookRS.AirReservation.Ticketing["TicketingStatus"] = result.OTA_AirBookRS.AirReservation.Ticketing._attributes.TicketingStatus
                delete result.OTA_AirBookRS.AirReservation.Ticketing["_attributes"]
            } else {
                result.OTA_AirBookRS.AirReservation.Ticketing["TravelerRefNumber"] = result.OTA_AirBookRS.AirReservation.Ticketing._attributes.TravelerRefNumber
                result.OTA_AirBookRS.AirReservation.Ticketing["TicketDocumentNbr"] = result.OTA_AirBookRS.AirReservation.Ticketing._attributes.TicketDocumentNbr
                delete result.OTA_AirBookRS.AirReservation.Ticketing["_attributes"]
            }

        } else {
            result.OTA_AirBookRS.AirReservation.Ticketing.forEach(t => {
                if (!!t._attributes.TicketTimeLimit) {
                    t["TicketTimeLimit"] = t._attributes.TicketTimeLimit
                    t["TicketingStatus"] = t._attributes.TicketingStatus
                    delete t["_attributes"]
                } else {
                    t["TravelerRefNumber"] = t._attributes.TravelerRefNumber
                    t["TicketDocumentNbr"] = t._attributes.TicketDocumentNbr
                    delete t["_attributes"]
                }
            })
        }
        if (!!result.OTA_AirBookRS.AirReservation.BalanceInfo) {
            result.OTA_AirBookRS.AirReservation.BalanceInfo["CurrencyCode"] = result.OTA_AirBookRS.AirReservation.BalanceInfo._attributes.CurrencyCode
            result.OTA_AirBookRS.AirReservation.BalanceInfo["DecimalPlaces"] = result.OTA_AirBookRS.AirReservation.BalanceInfo._attributes.DecimalPlaces
            result.OTA_AirBookRS.AirReservation.BalanceInfo["Amount"] = result.OTA_AirBookRS.AirReservation.BalanceInfo._attributes.Amount
            delete result.OTA_AirBookRS.AirReservation.BalanceInfo["_attributes"]
        }
        if (!!result.OTA_AirBookRS.AirReservation.BalanceInfoInAgentCurrency) {
            result.OTA_AirBookRS.AirReservation.BalanceInfoInAgentCurrency["CurrencyCode"] = result.OTA_AirBookRS.AirReservation.BalanceInfoInAgentCurrency._attributes.CurrencyCode
            result.OTA_AirBookRS.AirReservation.BalanceInfoInAgentCurrency["DecimalPlaces"] = result.OTA_AirBookRS.AirReservation.BalanceInfoInAgentCurrency._attributes.DecimalPlaces
            result.OTA_AirBookRS.AirReservation.BalanceInfoInAgentCurrency["Amount"] = result.OTA_AirBookRS.AirReservation.BalanceInfoInAgentCurrency._attributes.Amount
            delete result.OTA_AirBookRS.AirReservation.BalanceInfoInAgentCurrency["_attributes"]
        }
        result.OTA_AirBookRS.AirReservation.BookingReferenceID["Status"] = result.OTA_AirBookRS.AirReservation.BookingReferenceID._attributes.Status
        result.OTA_AirBookRS.AirReservation.BookingReferenceID["Instance"] = result.OTA_AirBookRS.AirReservation.BookingReferenceID._attributes.Instance
        result.OTA_AirBookRS.AirReservation.BookingReferenceID["ID"] = result.OTA_AirBookRS.AirReservation.BookingReferenceID._attributes.ID
        result.OTA_AirBookRS.AirReservation.BookingReferenceID["ID_Context"] = result.OTA_AirBookRS.AirReservation.BookingReferenceID._attributes.ID_Context
        delete result.OTA_AirBookRS.AirReservation.BookingReferenceID["_attributes"]

        if (!!result.OTA_AirBookRS.AirReservation.Offer.Priced) {
            result.OTA_AirBookRS.AirReservation.Offer.Priced.forEach(p => {
                p["FlightSegmentRPH"] = p._attributes.FlightSegmentRPH
                p["TravelerRPH"] = p._attributes.TravelerRPH
                p["ID"] = p._attributes.ID
                p["Name"] = p._attributes.Name
                delete p["_attributes"]
                p.Pricing["OfferQty"] = p.Pricing._attributes.OfferQty
                p.Pricing["PreTaxAmount"] = p.Pricing._attributes.PreTaxAmount
                p.Pricing["TaxAmount"] = p.Pricing._attributes.TaxAmount
                p.Pricing["Amount"] = p.Pricing._attributes.Amount
                p.Pricing["PricingCurrency"] = p.Pricing._attributes.PricingCurrency
                p.Pricing["DecimalPlaces"] = p.Pricing._attributes.DecimalPlaces
                delete p.Pricing["_attributes"]
            })
        }

        return result;
    } catch (e) {
        console.log('EEEEEE ==> ', e)
    }
}