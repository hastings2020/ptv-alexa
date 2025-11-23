const crypto = require('crypto');
const axios = require('axios');

const PTV_BASE_URL = 'https://timetableapi.ptv.vic.gov.au';

// Cached credentials (loaded from Parameter Store on first use)
let cachedCredentials = null;

/**
 * Fetch PTV credentials from AWS Systems Manager Parameter Store
 * Credentials are cached after first retrieval for performance
 * @returns {Promise<{devId: string, apiKey: string}>}
 */
async function getCredentials() {
    if (cachedCredentials) {
        return cachedCredentials;
    }

    // Check if parameters are stored as direct env vars (for local testing)
    if (process.env.PTV_DEV_ID && process.env.PTV_API_KEY) {
        cachedCredentials = {
            devId: process.env.PTV_DEV_ID,
            apiKey: process.env.PTV_API_KEY
        };
        return cachedCredentials;
    }

    // Fetch from Parameter Store
    const AWS = require('aws-sdk');
    const ssm = new AWS.SSM({ region: process.env.AWS_REGION || 'ap-southeast-2' });

    const devIdParam = process.env.PTV_DEV_ID_PARAMETER;
    const apiKeyParam = process.env.PTV_API_KEY_PARAMETER;

    if (!devIdParam || !apiKeyParam) {
        throw new Error('PTV parameter names not configured in environment');
    }

    try {
        const params = await ssm.getParameters({
            Names: [devIdParam, apiKeyParam],
            WithDecryption: true
        }).promise();

        const devId = params.Parameters.find(p => p.Name === devIdParam)?.Value;
        const apiKey = params.Parameters.find(p => p.Name === apiKeyParam)?.Value;

        if (!devId || !apiKey) {
            throw new Error('Failed to retrieve PTV credentials from Parameter Store');
        }

        cachedCredentials = { devId, apiKey };
        return cachedCredentials;
    } catch (error) {
        console.error('Error fetching credentials from Parameter Store:', error);
        throw error;
    }
}

/**
 * Generate HMAC-SHA1 signature for PTV API authentication
 * @param {string} request - The API request path (e.g., "/v3/search/Flinders")
 * @param {string} apiKey - The PTV API key
 * @returns {string} The signature for the request
 */
function generateSignature(request, apiKey) {
    const signature = crypto
        .createHmac('sha1', apiKey)
        .update(request)
        .digest('hex')
        .toUpperCase();
    return signature;
}

/**
 * Build a signed PTV API URL
 * @param {string} endpoint - The API endpoint (e.g., "/v3/search/Flinders")
 * @param {string} devId - The PTV developer ID
 * @param {string} apiKey - The PTV API key
 * @returns {string} The complete signed URL
 */
function buildSignedUrl(endpoint, devId, apiKey) {
    // Add devid parameter
    const separator = endpoint.includes('?') ? '&' : '?';
    const request = `${endpoint}${separator}devid=${devId}`;

    // Generate signature
    const signature = generateSignature(request, apiKey);

    // Build complete URL
    const url = `${PTV_BASE_URL}${request}&signature=${signature}`;

    return url;
}

/**
 * Search for a station by name
 * @param {string} searchTerm - The station name to search for
 * @returns {Promise<Object|null>} The station object or null if not found
 */
async function searchStation(searchTerm) {
    try {
        const { devId, apiKey } = await getCredentials();
        const endpoint = `/v3/search/${encodeURIComponent(searchTerm)}`;
        const url = buildSignedUrl(endpoint, devId, apiKey);

        console.log(`Searching for station: ${searchTerm}`);
        const response = await axios.get(url);

        if (response.data && response.data.stops && response.data.stops.length > 0) {
            // Filter for train stops (route_type 0)
            const trainStops = response.data.stops.filter(stop => stop.route_type === 0);

            if (trainStops.length > 0) {
                // Return the first matching train station
                return trainStops[0];
            }
        }

        return null;
    } catch (error) {
        console.error('Error searching for station:', error.message);
        if (error.response) {
            console.error('API Response:', error.response.data);
        }
        throw new Error('Failed to search for station');
    }
}

/**
 * Get train departures from a station
 * @param {number} stopId - The PTV stop ID
 * @param {number} maxResults - Maximum number of results to return (default: 5)
 * @returns {Promise<Array>} Array of departure objects
 */
async function getDepartures(stopId, maxResults = 5) {
    try {
        const { devId, apiKey } = await getCredentials();
        const endpoint = `/v3/departures/route_type/0/stop/${stopId}?max_results=${maxResults}&include_cancelled=false&expand=route&expand=direction`;
        const url = buildSignedUrl(endpoint, devId, apiKey);

        console.log(`Getting departures for stop ID: ${stopId}`);
        const response = await axios.get(url);

        if (response.data && response.data.departures) {
            const departures = response.data.departures;
            const routes = response.data.routes || {};
            const directions = response.data.directions || {};

            // Enrich departure data with route and direction information
            const enrichedDepartures = departures.map(dep => {
                const route = routes[dep.route_id] || {};
                const direction = directions[dep.direction_id] || {};

                return {
                    scheduledTime: dep.scheduled_departure_utc,
                    estimatedTime: dep.estimated_departure_utc || dep.scheduled_departure_utc,
                    platform: dep.platform_number,
                    lineName: route.route_name || 'Unknown Line',
                    destination: direction.direction_name || 'Unknown Destination',
                    routeNumber: route.route_number,
                    atPlatform: dep.at_platform
                };
            });

            // Sort by estimated departure time
            enrichedDepartures.sort((a, b) =>
                new Date(a.estimatedTime) - new Date(b.estimatedTime)
            );

            return enrichedDepartures;
        }

        return [];
    } catch (error) {
        console.error('Error getting departures:', error.message);
        if (error.response) {
            console.error('API Response:', error.response.data);
        }
        throw new Error('Failed to get departure information');
    }
}

/**
 * Get stop details by stop ID
 * @param {number} stopId - The PTV stop ID
 * @returns {Promise<Object|null>} The stop details or null if not found
 */
async function getStopDetails(stopId) {
    try {
        const { devId, apiKey } = await getCredentials();
        const endpoint = `/v3/stops/${stopId}/route_type/0`;
        const url = buildSignedUrl(endpoint, devId, apiKey);

        console.log(`Getting stop details for ID: ${stopId}`);
        const response = await axios.get(url);

        if (response.data && response.data.stop) {
            return response.data.stop;
        }

        return null;
    } catch (error) {
        console.error('Error getting stop details:', error.message);
        if (error.response) {
            console.error('API Response:', error.response.data);
        }
        throw new Error('Failed to get stop details');
    }
}

module.exports = {
    generateSignature,
    buildSignedUrl,
    searchStation,
    getDepartures,
    getStopDetails
};
