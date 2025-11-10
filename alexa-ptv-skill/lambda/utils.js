/**
 * Format a departure time for speech
 * @param {string} departureTimeUTC - ISO 8601 datetime string in UTC
 * @returns {string} Formatted time string for Alexa speech
 */
function formatDepartureTime(departureTimeUTC) {
    const now = new Date();
    const departureTime = new Date(departureTimeUTC);
    const diffMs = departureTime - now;
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes < 0) {
        return 'now';
    } else if (diffMinutes === 0) {
        return 'in less than a minute';
    } else if (diffMinutes === 1) {
        return 'in 1 minute';
    } else if (diffMinutes < 60) {
        return `in ${diffMinutes} minutes`;
    } else {
        // For times >= 60 minutes, show the actual time in Melbourne timezone
        const options = {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZone: 'Australia/Melbourne'
        };
        const timeString = departureTime.toLocaleString('en-AU', options);
        return `at ${timeString}`;
    }
}

/**
 * Format departure information for speech output
 * @param {Object} departure - Departure object with lineName, destination, platform, estimatedTime
 * @returns {string} Formatted departure announcement
 */
function formatDepartureSpeech(departure) {
    const timeString = formatDepartureTime(departure.estimatedTime);
    const platformInfo = departure.platform ? `, Platform ${departure.platform}` : '';

    return `${departure.lineName} to ${departure.destination}${platformInfo}, departing ${timeString}`;
}

/**
 * Create speech output for multiple departures
 * @param {string} stationName - Name of the station
 * @param {Array} departures - Array of departure objects
 * @returns {string} Complete speech output
 */
function createDeparturesSpeech(stationName, departures) {
    if (!departures || departures.length === 0) {
        return `I couldn't find any upcoming train departures from ${stationName}. The service may not be running at this time.`;
    }

    const count = departures.length;
    const trainWord = count === 1 ? 'train' : 'trains';

    let speech = `The next ${count} ${trainWord} from ${stationName} are: `;

    const departureDescriptions = departures.map(formatDepartureSpeech);

    // Join with proper punctuation
    if (count === 1) {
        speech = `The next train from ${stationName} is: ${departureDescriptions[0]}.`;
    } else if (count === 2) {
        speech += `${departureDescriptions[0]}. And, ${departureDescriptions[1]}.`;
    } else {
        const lastDeparture = departureDescriptions.pop();
        speech += departureDescriptions.join('. ') + `. And, ${lastDeparture}.`;
    }

    return speech;
}

/**
 * Normalize station name for search (handles common variations)
 * @param {string} stationName - Raw station name from user
 * @returns {string} Normalized station name
 */
function normalizeStationName(stationName) {
    if (!stationName) {
        return '';
    }

    // Trim and normalize whitespace
    let normalized = stationName.trim().replace(/\s+/g, ' ');

    // Common station name corrections for Alexa speech recognition
    const corrections = {
        'flinders': 'Flinders Street',
        'southern cross': 'Southern Cross',
        'parliament': 'Parliament',
        'melbourne central': 'Melbourne Central',
        'flagstaff': 'Flagstaff'
    };

    const lowerName = normalized.toLowerCase();
    if (corrections[lowerName]) {
        normalized = corrections[lowerName];
    }

    // Capitalize first letter of each word if not already capitalized
    if (normalized === normalized.toLowerCase()) {
        normalized = normalized
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    return normalized;
}

/**
 * Create a card for the Alexa app
 * @param {string} stationName - Name of the station
 * @param {Array} departures - Array of departure objects
 * @returns {Object} Card content object
 */
function createDeparturesCard(stationName, departures) {
    let text = `Departures from ${stationName}:\n\n`;

    departures.forEach(dep => {
        const timeString = formatDepartureTime(dep.estimatedTime);
        const platformInfo = dep.platform ? ` (Platform ${dep.platform})` : '';
        text += `${dep.lineName} to ${dep.destination}${platformInfo}\n`;
        text += `Departing ${timeString}\n\n`;
    });

    return {
        type: 'Simple',
        title: `PTV Train Times - ${stationName}`,
        content: text
    };
}

/**
 * Get a random element from an array
 * @param {Array} arr - The array
 * @returns {*} Random element from the array
 */
function randomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Get a random acknowledgment phrase
 * @returns {string} Random acknowledgment
 */
function getRandomAcknowledgment() {
    const acknowledgments = [
        'Got it!',
        'Okay!',
        'Alright!',
        'Sure thing!',
        'No problem!'
    ];
    return randomElement(acknowledgments);
}

module.exports = {
    formatDepartureTime,
    formatDepartureSpeech,
    createDeparturesSpeech,
    normalizeStationName,
    createDeparturesCard,
    randomElement,
    getRandomAcknowledgment
};
