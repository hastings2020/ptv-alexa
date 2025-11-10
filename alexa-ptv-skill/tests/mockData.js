/**
 * Mock data for testing without hitting the live PTV API
 */

const mockSearchResponse = {
    stops: [
        {
            stop_id: 1071,
            stop_name: 'Flinders Street Railway Station',
            route_type: 0,
            stop_latitude: -37.8183,
            stop_longitude: 144.9671
        }
    ],
    routes: [],
    outlets: []
};

const mockDeparturesResponse = {
    departures: [
        {
            stop_id: 1071,
            route_id: 1,
            direction_id: 1,
            scheduled_departure_utc: new Date(Date.now() + 5 * 60000).toISOString(),
            estimated_departure_utc: new Date(Date.now() + 5 * 60000).toISOString(),
            platform_number: '9',
            at_platform: true
        },
        {
            stop_id: 1071,
            route_id: 2,
            direction_id: 2,
            scheduled_departure_utc: new Date(Date.now() + 8 * 60000).toISOString(),
            estimated_departure_utc: new Date(Date.now() + 8 * 60000).toISOString(),
            platform_number: '5',
            at_platform: false
        },
        {
            stop_id: 1071,
            route_id: 3,
            direction_id: 3,
            scheduled_departure_utc: new Date(Date.now() + 12 * 60000).toISOString(),
            estimated_departure_utc: new Date(Date.now() + 12 * 60000).toISOString(),
            platform_number: '6',
            at_platform: false
        }
    ],
    routes: {
        1: {
            route_id: 1,
            route_name: 'Frankston',
            route_number: '1',
            route_type: 0
        },
        2: {
            route_id: 2,
            route_name: 'Cranbourne',
            route_number: '2',
            route_type: 0
        },
        3: {
            route_id: 3,
            route_name: 'Pakenham',
            route_number: '3',
            route_type: 0
        }
    },
    directions: {
        1: {
            direction_id: 1,
            direction_name: 'Frankston',
            route_id: 1
        },
        2: {
            direction_id: 2,
            direction_name: 'Cranbourne',
            route_id: 2
        },
        3: {
            direction_id: 3,
            direction_name: 'Pakenham',
            route_id: 3
        }
    }
};

const mockStopDetailsResponse = {
    stop: {
        stop_id: 1071,
        stop_name: 'Flinders Street Railway Station',
        route_type: 0,
        stop_latitude: -37.8183,
        stop_longitude: 144.9671,
        stop_suburb: 'Melbourne City'
    }
};

// Popular Melbourne stations for testing
const popularStations = {
    'Flinders Street': { stop_id: 1071, stop_name: 'Flinders Street Railway Station' },
    'Southern Cross': { stop_id: 1181, stop_name: 'Southern Cross Railway Station' },
    'Richmond': { stop_id: 1104, stop_name: 'Richmond Railway Station' },
    'Melbourne Central': { stop_id: 1120, stop_name: 'Melbourne Central Railway Station' },
    'Flagstaff': { stop_id: 1155, stop_name: 'Flagstaff Railway Station' },
    'Parliament': { stop_id: 1068, stop_name: 'Parliament Railway Station' }
};

module.exports = {
    mockSearchResponse,
    mockDeparturesResponse,
    mockStopDetailsResponse,
    popularStations
};
