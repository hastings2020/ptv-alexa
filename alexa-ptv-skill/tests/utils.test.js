const utils = require('../lambda/utils');

describe('Utils Module', () => {
    describe('formatDepartureTime', () => {
        beforeEach(() => {
            // Mock the current time
            jest.useFakeTimers();
            jest.setSystemTime(new Date('2024-01-15T10:00:00+11:00'));
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('should format immediate departure as "now"', () => {
            const departureTime = new Date('2024-01-15T09:59:30+11:00').toISOString();
            const result = utils.formatDepartureTime(departureTime);
            expect(result).toBe('now');
        });

        it('should format departure in less than 1 minute', () => {
            const departureTime = new Date('2024-01-15T10:00:30+11:00').toISOString();
            const result = utils.formatDepartureTime(departureTime);
            expect(result).toBe('in less than a minute');
        });

        it('should format departure in 1 minute', () => {
            const departureTime = new Date('2024-01-15T10:01:00+11:00').toISOString();
            const result = utils.formatDepartureTime(departureTime);
            expect(result).toBe('in 1 minute');
        });

        it('should format departure in multiple minutes', () => {
            const departureTime = new Date('2024-01-15T10:15:00+11:00').toISOString();
            const result = utils.formatDepartureTime(departureTime);
            expect(result).toBe('in 15 minutes');
        });

        it('should format departure >= 60 minutes as time', () => {
            const departureTime = new Date('2024-01-15T11:30:00+11:00').toISOString();
            const result = utils.formatDepartureTime(departureTime);
            expect(result).toContain('at');
            expect(result).toMatch(/\d{1,2}:\d{2}/); // Should contain time format
        });
    });

    describe('formatDepartureSpeech', () => {
        beforeEach(() => {
            jest.useFakeTimers();
            jest.setSystemTime(new Date('2024-01-15T10:00:00+11:00'));
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('should format departure with platform information', () => {
            const departure = {
                lineName: 'Frankston',
                destination: 'Frankston',
                platform: '9',
                estimatedTime: new Date('2024-01-15T10:05:00+11:00').toISOString()
            };

            const result = utils.formatDepartureSpeech(departure);
            expect(result).toContain('Frankston');
            expect(result).toContain('Platform 9');
            expect(result).toContain('in 5 minutes');
        });

        it('should format departure without platform information', () => {
            const departure = {
                lineName: 'Cranbourne',
                destination: 'Cranbourne',
                platform: null,
                estimatedTime: new Date('2024-01-15T10:03:00+11:00').toISOString()
            };

            const result = utils.formatDepartureSpeech(departure);
            expect(result).toContain('Cranbourne');
            expect(result).not.toContain('Platform');
            expect(result).toContain('in 3 minutes');
        });
    });

    describe('createDeparturesSpeech', () => {
        beforeEach(() => {
            jest.useFakeTimers();
            jest.setSystemTime(new Date('2024-01-15T10:00:00+11:00'));
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('should handle empty departures', () => {
            const result = utils.createDeparturesSpeech('Flinders Street', []);
            expect(result).toContain('couldn\'t find any upcoming train departures');
            expect(result).toContain('Flinders Street');
        });

        it('should format single departure', () => {
            const departures = [{
                lineName: 'Frankston',
                destination: 'Frankston',
                platform: '9',
                estimatedTime: new Date('2024-01-15T10:05:00+11:00').toISOString()
            }];

            const result = utils.createDeparturesSpeech('Flinders Street', departures);
            expect(result).toContain('The next train from Flinders Street is');
            expect(result).toContain('Frankston');
            expect(result).toContain('in 5 minutes');
        });

        it('should format two departures', () => {
            const departures = [
                {
                    lineName: 'Frankston',
                    destination: 'Frankston',
                    platform: '9',
                    estimatedTime: new Date('2024-01-15T10:05:00+11:00').toISOString()
                },
                {
                    lineName: 'Cranbourne',
                    destination: 'Cranbourne',
                    platform: '5',
                    estimatedTime: new Date('2024-01-15T10:08:00+11:00').toISOString()
                }
            ];

            const result = utils.createDeparturesSpeech('Flinders Street', departures);
            expect(result).toContain('The next 2 trains from Flinders Street are');
            expect(result).toContain('Frankston');
            expect(result).toContain('Cranbourne');
            expect(result).toContain('And,');
        });

        it('should format three or more departures', () => {
            const departures = [
                {
                    lineName: 'Frankston',
                    destination: 'Frankston',
                    platform: '9',
                    estimatedTime: new Date('2024-01-15T10:05:00+11:00').toISOString()
                },
                {
                    lineName: 'Cranbourne',
                    destination: 'Cranbourne',
                    platform: '5',
                    estimatedTime: new Date('2024-01-15T10:08:00+11:00').toISOString()
                },
                {
                    lineName: 'Pakenham',
                    destination: 'Pakenham',
                    platform: '6',
                    estimatedTime: new Date('2024-01-15T10:12:00+11:00').toISOString()
                }
            ];

            const result = utils.createDeparturesSpeech('Flinders Street', departures);
            expect(result).toContain('The next 3 trains from Flinders Street are');
            expect(result).toContain('Frankston');
            expect(result).toContain('Cranbourne');
            expect(result).toContain('Pakenham');
        });
    });

    describe('normalizeStationName', () => {
        it('should trim whitespace', () => {
            expect(utils.normalizeStationName('  Richmond  ')).toBe('Richmond');
        });

        it('should normalize multiple spaces', () => {
            expect(utils.normalizeStationName('Southern    Cross')).toBe('Southern Cross');
        });

        it('should handle common station corrections', () => {
            expect(utils.normalizeStationName('flinders')).toBe('Flinders Street');
            expect(utils.normalizeStationName('southern cross')).toBe('Southern Cross');
            expect(utils.normalizeStationName('parliament')).toBe('Parliament');
        });

        it('should capitalize words if all lowercase', () => {
            expect(utils.normalizeStationName('richmond')).toBe('Richmond');
            expect(utils.normalizeStationName('north melbourne')).toBe('North Melbourne');
        });

        it('should preserve existing capitalization', () => {
            expect(utils.normalizeStationName('Richmond')).toBe('Richmond');
            expect(utils.normalizeStationName('North Melbourne')).toBe('North Melbourne');
        });

        it('should handle empty string', () => {
            expect(utils.normalizeStationName('')).toBe('');
            expect(utils.normalizeStationName(null)).toBe('');
        });
    });

    describe('createDeparturesCard', () => {
        beforeEach(() => {
            jest.useFakeTimers();
            jest.setSystemTime(new Date('2024-01-15T10:00:00+11:00'));
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('should create a card with departure information', () => {
            const departures = [{
                lineName: 'Frankston',
                destination: 'Frankston',
                platform: '9',
                estimatedTime: new Date('2024-01-15T10:05:00+11:00').toISOString()
            }];

            const card = utils.createDeparturesCard('Flinders Street', departures);

            expect(card.type).toBe('Simple');
            expect(card.title).toBe('PTV Train Times - Flinders Street');
            expect(card.content).toContain('Frankston');
            expect(card.content).toContain('Platform 9');
            expect(card.content).toContain('in 5 minutes');
        });
    });

    describe('randomElement', () => {
        it('should return an element from the array', () => {
            const arr = ['a', 'b', 'c'];
            const result = utils.randomElement(arr);
            expect(arr).toContain(result);
        });

        it('should return the only element from single-element array', () => {
            const arr = ['only'];
            expect(utils.randomElement(arr)).toBe('only');
        });
    });

    describe('getRandomAcknowledgment', () => {
        it('should return a valid acknowledgment', () => {
            const acknowledgments = ['Got it!', 'Okay!', 'Alright!', 'Sure thing!', 'No problem!'];
            const result = utils.getRandomAcknowledgment();
            expect(acknowledgments).toContain(result);
        });
    });
});
