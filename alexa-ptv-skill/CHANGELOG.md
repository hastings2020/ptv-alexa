# Changelog

All notable changes to the Alexa PTV Train Times skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-11-10

### Added
- Initial release of Alexa PTV Train Times skill
- Real-time train departure information from PTV API
- Support for all Melbourne train stations
- GetTrainTimesIntent - Get departures from any station
- GetMyStationIntent - Get departures from saved home station
- SetHomeStationIntent - Save a home station for quick access
- HMAC-SHA1 signature generation for PTV API authentication
- Persistent storage of user preferences using DynamoDB
- Smart time formatting (minutes for soon, clock time for later)
- Visual cards in Alexa app with departure details
- Comprehensive error handling for API issues and station not found
- Unit tests for API signature generation and utility functions
- Mock data for testing without live API
- Serverless Framework deployment configuration
- Deployment script for easy AWS deployment
- Comprehensive README with setup instructions
- Quick start guide for rapid deployment
- Environment variable configuration

### Features
- Announces next 3-5 train departures
- Shows line name, destination, platform, and departure time
- Filters cancelled services
- Sorts departures by estimated time
- Handles multiple train lines from same station
- Random acknowledgment phrases for variety
- Request/response logging for debugging
- CloudWatch integration for monitoring

### Technical
- Built with Alexa Skills Kit SDK v2
- Node.js 18+ runtime
- AWS Lambda serverless function
- DynamoDB for persistent storage
- Axios for HTTP requests
- Jest for unit testing
- Serverless Framework for deployment
- Melbourne (Australia/Melbourne) timezone support

### Documentation
- Complete README with detailed setup instructions
- Quick start guide for 15-minute deployment
- API documentation and HMAC signature examples
- Troubleshooting guide
- Testing instructions
- Environment variable reference
- Sample interactions and utterances

## [Unreleased]

### Planned Features
- Support for trams (route_type 1)
- Support for buses (route_type 2)
- Service disruption announcements
- Filter departures by specific train line
- Location-based station detection
- Multi-language support (additional locales)
- Scheduled reminders for regular commutes
- Integration with real-time service alerts
- Voice profile recognition for multi-user households
- Integration with calendar for smart commute times

### Under Consideration
- Peak/off-peak pricing information
- myki card balance checking (requires myki API)
- Station facilities information (accessibility, parking)
- Journey planning between stations
- Integration with weather data for commute planning
