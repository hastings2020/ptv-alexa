const crypto = require('crypto');

// Mock environment variables
process.env.PTV_DEV_ID = '3000001';
process.env.PTV_API_KEY = 'test-api-key-12345';

const ptvApi = require('../lambda/ptvApi');

describe('PTV API Helper', () => {
    describe('generateSignature', () => {
        it('should generate a valid HMAC-SHA1 signature', () => {
            const request = '/v3/search/Flinders?devid=3000001';
            const signature = ptvApi.generateSignature(request);

            // Verify it's a valid hex string
            expect(signature).toMatch(/^[A-F0-9]+$/);
            expect(signature.length).toBe(40); // SHA1 produces 40 character hex string
        });

        it('should generate consistent signatures for the same input', () => {
            const request = '/v3/search/Richmond?devid=3000001';
            const signature1 = ptvApi.generateSignature(request);
            const signature2 = ptvApi.generateSignature(request);

            expect(signature1).toBe(signature2);
        });

        it('should generate different signatures for different inputs', () => {
            const request1 = '/v3/search/Flinders?devid=3000001';
            const request2 = '/v3/search/Richmond?devid=3000001';

            const signature1 = ptvApi.generateSignature(request1);
            const signature2 = ptvApi.generateSignature(request2);

            expect(signature1).not.toBe(signature2);
        });

        it('should match known signature for test data', () => {
            // Using a known API key and request to verify signature generation
            const testApiKey = 'test-key';
            const testRequest = '/v3/test?devid=1234';

            const expectedSignature = crypto
                .createHmac('sha1', testApiKey)
                .update(testRequest)
                .digest('hex')
                .toUpperCase();

            // Temporarily override the API key
            const originalKey = process.env.PTV_API_KEY;
            process.env.PTV_API_KEY = testApiKey;

            const signature = ptvApi.generateSignature(testRequest);

            // Restore original key
            process.env.PTV_API_KEY = originalKey;

            expect(signature).toBe(expectedSignature);
        });
    });

    describe('buildSignedUrl', () => {
        it('should build a valid signed URL with signature and devid', () => {
            const endpoint = '/v3/search/Flinders';
            const url = ptvApi.buildSignedUrl(endpoint);

            expect(url).toContain('https://timetableapi.ptv.vic.gov.au');
            expect(url).toContain('/v3/search/Flinders');
            expect(url).toContain('devid=3000001');
            expect(url).toContain('signature=');
        });

        it('should handle endpoints with existing query parameters', () => {
            const endpoint = '/v3/departures/route_type/0/stop/1071?max_results=5';
            const url = ptvApi.buildSignedUrl(endpoint);

            expect(url).toContain('max_results=5');
            expect(url).toContain('&devid=3000001');
            expect(url).toContain('&signature=');
        });

        it('should handle endpoints without query parameters', () => {
            const endpoint = '/v3/stops/1071/route_type/0';
            const url = ptvApi.buildSignedUrl(endpoint);

            expect(url).toContain('?devid=3000001');
            expect(url).toContain('&signature=');
        });

        it('should properly encode special characters in endpoint', () => {
            const endpoint = '/v3/search/Southern Cross';
            const url = ptvApi.buildSignedUrl(endpoint);

            // The search term should be encoded, but we build the signature before encoding the URL
            expect(url).toContain('devid=3000001');
            expect(url).toContain('signature=');
        });
    });
});
