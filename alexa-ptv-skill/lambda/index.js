const Alexa = require('ask-sdk-core');
const { DynamoDbPersistenceAdapter } = require('ask-sdk-dynamodb-persistence-adapter');
const ptvApi = require('./ptvApi');
const utils = require('./utils');

// ============================================================================
// Launch Request Handler
// ============================================================================
const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Welcome to PTV Train Times! You can ask me for train departures from any Melbourne station, or set your home station for quick access. What would you like to know?';
        const repromptText = 'You can say things like, when is the next train from Flinders Street, or, set my home station to Richmond.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(repromptText)
            .getResponse();
    }
};

// ============================================================================
// Get Train Times Intent Handler
// ============================================================================
const GetTrainTimesIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetTrainTimesIntent';
    },
    async handle(handlerInput) {
        const { requestEnvelope, attributesManager, responseBuilder } = handlerInput;
        const stationNameSlot = Alexa.getSlotValue(requestEnvelope, 'StationName');

        if (!stationNameSlot) {
            const speakOutput = 'I didn\'t catch the station name. Please try again and say something like, when is the next train from Flinders Street.';
            return responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse();
        }

        const stationName = utils.normalizeStationName(stationNameSlot);

        try {
            // Search for the station
            console.log(`Searching for station: ${stationName}`);
            const station = await ptvApi.searchStation(stationName);

            if (!station) {
                const speakOutput = `I couldn't find a train station called ${stationName}. Please check the name and try again.`;
                return responseBuilder
                    .speak(speakOutput)
                    .reprompt('What station would you like train times for?')
                    .getResponse();
            }

            console.log(`Found station: ${station.stop_name} (ID: ${station.stop_id})`);

            // Get departures
            const departures = await ptvApi.getDepartures(station.stop_id, 5);

            if (departures.length === 0) {
                const speakOutput = `There are no upcoming train departures from ${station.stop_name} at this time.`;
                return responseBuilder
                    .speak(speakOutput)
                    .withSimpleCard('PTV Train Times', speakOutput)
                    .getResponse();
            }

            // Limit to 3 departures for speech (5 in the card)
            const speechDepartures = departures.slice(0, 3);
            const speakOutput = utils.createDeparturesSpeech(station.stop_name, speechDepartures);
            const card = utils.createDeparturesCard(station.stop_name, departures);

            return responseBuilder
                .speak(speakOutput)
                .withSimpleCard(card.title, card.content)
                .getResponse();

        } catch (error) {
            console.error('Error in GetTrainTimesIntent:', error);
            const speakOutput = 'Sorry, I had trouble getting the train times. Please try again later.';
            return responseBuilder
                .speak(speakOutput)
                .getResponse();
        }
    }
};

// ============================================================================
// Get My Station Intent Handler
// ============================================================================
const GetMyStationIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetMyStationIntent';
    },
    async handle(handlerInput) {
        const { attributesManager, responseBuilder } = handlerInput;

        // Get persistent attributes (saved home station)
        const attributes = await attributesManager.getPersistentAttributes() || {};
        const homeStation = attributes.homeStation;

        if (!homeStation) {
            const speakOutput = 'You haven\'t set a home station yet. You can say, set my home station to Flinders Street.';
            return responseBuilder
                .speak(speakOutput)
                .reprompt('What station would you like to set as your home station?')
                .getResponse();
        }

        try {
            console.log(`Getting departures for home station: ${homeStation.stopName} (ID: ${homeStation.stopId})`);

            // Get departures
            const departures = await ptvApi.getDepartures(homeStation.stopId, 5);

            if (departures.length === 0) {
                const speakOutput = `There are no upcoming train departures from ${homeStation.stopName} at this time.`;
                return responseBuilder
                    .speak(speakOutput)
                    .withSimpleCard('PTV Train Times', speakOutput)
                    .getResponse();
            }

            // Limit to 3 departures for speech (5 in the card)
            const speechDepartures = departures.slice(0, 3);
            const speakOutput = utils.createDeparturesSpeech(homeStation.stopName, speechDepartures);
            const card = utils.createDeparturesCard(homeStation.stopName, departures);

            return responseBuilder
                .speak(speakOutput)
                .withSimpleCard(card.title, card.content)
                .getResponse();

        } catch (error) {
            console.error('Error in GetMyStationIntent:', error);
            const speakOutput = 'Sorry, I had trouble getting the train times for your home station. Please try again later.';
            return responseBuilder
                .speak(speakOutput)
                .getResponse();
        }
    }
};

// ============================================================================
// Set Home Station Intent Handler
// ============================================================================
const SetHomeStationIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'SetHomeStationIntent';
    },
    async handle(handlerInput) {
        const { requestEnvelope, attributesManager, responseBuilder } = handlerInput;
        const stationNameSlot = Alexa.getSlotValue(requestEnvelope, 'StationName');

        if (!stationNameSlot) {
            const speakOutput = 'I didn\'t catch the station name. Please try again and say something like, set my home station to Richmond.';
            return responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse();
        }

        const stationName = utils.normalizeStationName(stationNameSlot);

        try {
            // Search for the station
            console.log(`Setting home station: ${stationName}`);
            const station = await ptvApi.searchStation(stationName);

            if (!station) {
                const speakOutput = `I couldn't find a train station called ${stationName}. Please check the name and try again.`;
                return responseBuilder
                    .speak(speakOutput)
                    .reprompt('What station would you like to set as your home station?')
                    .getResponse();
            }

            // Save to persistent attributes
            const attributes = await attributesManager.getPersistentAttributes() || {};
            attributes.homeStation = {
                stopId: station.stop_id,
                stopName: station.stop_name
            };
            attributesManager.setPersistentAttributes(attributes);
            await attributesManager.savePersistentAttributes();

            const acknowledgment = utils.getRandomAcknowledgment();
            const speakOutput = `${acknowledgment} I've saved ${station.stop_name} as your home station. You can now ask for your next train to get departures from ${station.stop_name}.`;

            return responseBuilder
                .speak(speakOutput)
                .withSimpleCard('Home Station Saved', `Your home station is now set to ${station.stop_name}.`)
                .getResponse();

        } catch (error) {
            console.error('Error in SetHomeStationIntent:', error);
            const speakOutput = 'Sorry, I had trouble saving your home station. Please try again later.';
            return responseBuilder
                .speak(speakOutput)
                .getResponse();
        }
    }
};

// ============================================================================
// Help Intent Handler
// ============================================================================
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'I can help you get real-time train departure times for Melbourne PTV stations. '
            + 'You can ask me, when is the next train from Flinders Street, '
            + 'or set your home station by saying, set my home station to Richmond. '
            + 'Once you\'ve set a home station, you can simply ask, when is my next train. '
            + 'What would you like to do?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

// ============================================================================
// Cancel and Stop Intent Handler
// ============================================================================
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

// ============================================================================
// Fallback Intent Handler
// ============================================================================
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Sorry, I don\'t know about that. You can ask me for train times from any Melbourne station, or set your home station. What would you like to do?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

// ============================================================================
// Session Ended Request Handler
// ============================================================================
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        return handlerInput.responseBuilder.getResponse();
    }
};

// ============================================================================
// Error Handler
// ============================================================================
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.error(`Error handled: ${error.stack || error.message}`);
        const speakOutput = 'Sorry, I had trouble doing what you asked. Please try again.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

// ============================================================================
// Request and Response Interceptors (for logging)
// ============================================================================
const RequestInterceptor = {
    process(handlerInput) {
        console.log(`REQUEST: ${JSON.stringify(handlerInput.requestEnvelope)}`);
    }
};

const ResponseInterceptor = {
    process(handlerInput, response) {
        console.log(`RESPONSE: ${JSON.stringify(response)}`);
    }
};

// ============================================================================
// Lambda Handler
// ============================================================================
const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
    .addRequestHandlers(
        LaunchRequestHandler,
        GetTrainTimesIntentHandler,
        GetMyStationIntentHandler,
        SetHomeStationIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler
    )
    .addErrorHandlers(ErrorHandler)
    .addRequestInterceptors(RequestInterceptor)
    .addResponseInterceptors(ResponseInterceptor)
    .withPersistenceAdapter(
        new DynamoDbPersistenceAdapter({
            tableName: process.env.DYNAMODB_PERSISTENCE_TABLE_NAME || 'AlexaPtvSkill',
            createTable: false  // Table already created by Serverless Framework
        })
    )
    .lambda();
