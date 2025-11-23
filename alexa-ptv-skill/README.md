# Alexa PTV Train Times Skill

An Alexa skill that provides real-time train departure information for Melbourne's Public Transport Victoria (PTV) network.

## Features

- 🚆 Real-time train departure times from any Melbourne station
- 🏠 Save your home station for quick access
- ⏱️ Next 3-5 departures with platform information
- 🕒 Smart time formatting (minutes for soon, clock time for later)
- 📱 Visual cards in the Alexa app with full departure details
- 🔒 Secure credential storage using AWS Parameter Store (encrypted with KMS)

## Sample Interactions

**Get train times from a specific station:**
- "Alexa, ask train times when is the next train from Flinders Street"
- "Alexa, ask train times for departures from Richmond"

**Set your home station:**
- "Alexa, ask train times to set my home station to Southern Cross"
- "Alexa, ask train times to remember Melbourne Central"

**Get times from your home station:**
- "Alexa, ask train times when is my next train"
- "Alexa, ask train times for my departures"

## Project Structure

```
alexa-ptv-skill/
├── lambda/
│   ├── index.js              # Main Lambda handler with Alexa intents
│   ├── ptvApi.js             # PTV API integration with HMAC-SHA1 auth
│   ├── utils.js              # Utility functions (time formatting, etc.)
│   └── package.json          # Node.js dependencies
├── skill-package/
│   ├── interactionModels/
│   │   └── custom/
│   │       └── en-AU.json    # Alexa interaction model (intents, utterances)
│   └── skill.json            # Skill metadata and configuration
├── tests/
│   ├── ptvApi.test.js        # Tests for PTV API functions
│   └── utils.test.js         # Tests for utility functions
├── serverless.yml            # Serverless Framework deployment config
├── .env.example              # Example environment variables
└── README.md                 # This file
```

## Prerequisites

1. **AWS Account** - For Lambda function hosting
2. **Amazon Developer Account** - For Alexa Skill configuration
3. **PTV API Credentials** - Developer ID and API Key from PTV

## Getting PTV API Credentials

1. Visit the [PTV Timetable API](https://www.ptv.vic.gov.au/footer/data-and-reporting/datasets/ptv-timetable-api/) page
2. Click "Register for API access"
3. Fill out the registration form
4. You'll receive:
   - **devid** (Developer ID) - A numeric ID
   - **API Key** - Your private key for signing requests

Keep these credentials secure and never commit them to version control!

## Setup Instructions

### 1. Install Dependencies

```bash
cd alexa-ptv-skill/lambda
npm install
```

### 2. Store PTV Credentials in AWS Parameter Store

**IMPORTANT**: This skill uses AWS Systems Manager Parameter Store to securely store your PTV API credentials. This provides:
- ✅ Encryption at rest with AWS KMS
- ✅ Encryption in transit
- ✅ IAM access control
- ✅ Audit trail via CloudTrail
- ✅ Credentials not visible in Lambda console

Run the setup script to store your credentials:

```bash
cd alexa-ptv-skill
./setup-secrets.sh dev ap-southeast-2

# For different stages or regions:
# ./setup-secrets.sh prod us-east-1
# ./setup-secrets.sh staging ap-southeast-2 myprofile
```

The script will prompt you for your PTV Developer ID and API Key, then securely store them as encrypted parameters.

**Optional**: For local testing only, you can create a `.env` file:
```bash
cp .env.example lambda/.env
# Edit lambda/.env and add your credentials for local testing
```

### 3. Run Tests

```bash
cd lambda
npm test

# For coverage report
npm run test:coverage
```

### 4. Deploy to AWS Lambda

#### Option A: Using Deployment Script (Recommended)

1. Install Serverless Framework:
```bash
npm install -g serverless
```

2. Configure AWS credentials:
```bash
serverless config credentials --provider aws --key YOUR_ACCESS_KEY --secret YOUR_SECRET_KEY
# Or use: aws configure
```

3. Store your PTV credentials (if not already done):
```bash
cd alexa-ptv-skill
./setup-secrets.sh dev ap-southeast-2
```

4. Deploy:
```bash
./deploy.sh dev ap-southeast-2

# For production with a specific profile:
# ./deploy.sh prod ap-southeast-2 myprofile
```

5. Note the Lambda ARN from the output - you'll need this for the Alexa Skill configuration.

#### Option B: Using Serverless Framework Directly

```bash
cd alexa-ptv-skill
serverless deploy --stage dev --region ap-southeast-2

# For production:
# serverless deploy --stage prod --region ap-southeast-2
```

#### Option C: Manual Deployment (Not Recommended)

1. **Create Lambda Function:**
   - Go to AWS Lambda Console
   - Click "Create function"
   - Choose "Author from scratch"
   - Function name: `alexa-ptv-skill`
   - Runtime: Node.js 18.x or later
   - Click "Create function"

2. **Upload Code:**
   - In the `lambda` directory, create a zip file:
     ```bash
     cd lambda
     npm install --production
     zip -r ../lambda-deployment.zip .
     ```
   - Upload the zip file to Lambda

3. **Store PTV Credentials in Parameter Store:**
   - Run the setup script to store credentials securely:
     ```bash
     ./setup-secrets.sh dev ap-southeast-2
     ```
   - Or manually create parameters in AWS Systems Manager:
     - Parameter: `/alexa-ptv-skill/dev/ptv-dev-id` (Type: SecureString)
     - Parameter: `/alexa-ptv-skill/dev/ptv-api-key` (Type: SecureString)

4. **Set up DynamoDB:**
   - Go to DynamoDB console
   - Create table named `AlexaPtvSkill`
   - Primary key: `id` (String)
   - Use default settings

5. **Configure IAM Permissions:**
   - Attach the following policies to Lambda execution role:
     - `AmazonDynamoDBFullAccess` (or custom DynamoDB policy)
     - `AmazonSSMReadOnlyAccess` (for reading Parameter Store)
     - Policy allowing `kms:Decrypt` for SecureString parameters

6. **Configure Alexa Skills Kit Trigger:**
   - In Lambda console, click "Add trigger"
   - Select "Alexa Skills Kit"
   - Leave "Skill ID verification" disabled for testing (enable in production)
   - Click "Add"

7. **Copy Lambda ARN:**
   - Copy the ARN from the top right of the Lambda console
   - Format: `arn:aws:lambda:ap-southeast-2:ACCOUNT_ID:function:alexa-ptv-skill`

### 5. Configure Alexa Skill

1. **Create Skill:**
   - Go to [Alexa Developer Console](https://developer.amazon.com/alexa/console/ask)
   - Click "Create Skill"
   - Skill name: "PTV Train Times"
   - Default language: English (AU)
   - Choose "Custom" model
   - Choose "Alexa-Hosted (Node.js)" or "Provision your own"
   - Click "Create skill"

2. **Configure Interaction Model:**
   - Go to "Build" tab → "Interaction Model" → "JSON Editor"
   - Copy the contents of `skill-package/interactionModels/custom/en-AU.json`
   - Paste into the JSON Editor
   - Click "Save Model"
   - Click "Build Model"

3. **Configure Endpoint:**
   - Go to "Build" tab → "Endpoint"
   - Select "AWS Lambda ARN"
   - Paste your Lambda ARN in the "Default Region" field
   - Click "Save Endpoints"

4. **Enable Permissions:**
   - Go to "Build" tab → "Permissions"
   - Enable "Device Address" if you want geolocation features (optional)

5. **Configure Account Linking (Optional):**
   - Not required for this skill

### 6. Test the Skill

1. **In Alexa Developer Console:**
   - Go to "Test" tab
   - Enable testing for "Development"
   - Type or speak: "ask train times when is the next train from Flinders Street"

2. **On Your Alexa Device:**
   - Say "Alexa, ask train times when is my next train"
   - The skill should now be available on all devices registered to your account

## Configuration

### Credentials (Parameter Store)

This skill uses AWS Systems Manager Parameter Store to securely store credentials:

| Parameter Name | Type | Description |
|----------------|------|-------------|
| `/alexa-ptv-skill/{stage}/ptv-dev-id` | SecureString | Your PTV developer ID (encrypted) |
| `/alexa-ptv-skill/{stage}/ptv-api-key` | SecureString | Your PTV API key (encrypted) |

**Security Benefits:**
- 🔒 Encrypted at rest using AWS KMS
- 🔒 Encrypted in transit
- 🔒 IAM-based access control
- 🔒 Audit trail via CloudTrail
- 🔒 Not visible in Lambda console
- 🔒 Rotation capability

**Setup:** Use `./setup-secrets.sh [stage] [region]` to store credentials securely.

### Lambda Function Settings

- **Memory**: 256 MB (recommended)
- **Timeout**: 10 seconds
- **Runtime**: Node.js 18.x or later
- **Environment Variables**:
  - `PTV_DEV_ID` - Automatically populated from Parameter Store
  - `PTV_API_KEY` - Automatically populated from Parameter Store
  - `DYNAMODB_PERSISTENCE_TABLE_NAME` - Set to table name

## Supported Intents

| Intent | Description | Example Utterance |
|--------|-------------|-------------------|
| `GetTrainTimesIntent` | Get departures from a specific station | "when is the next train from Richmond" |
| `GetMyStationIntent` | Get departures from saved home station | "when is my next train" |
| `SetHomeStationIntent` | Save a home station for quick access | "set my home station to Flinders Street" |
| `AMAZON.HelpIntent` | Get help using the skill | "help" |
| `AMAZON.CancelIntent` | Cancel the current action | "cancel" |
| `AMAZON.StopIntent` | Stop the skill | "stop" |

## Development

### Running Tests Locally

```bash
cd lambda
npm test
```

### Testing with Mock Data

The tests use mock data and don't require actual PTV API credentials. To test with real API calls:

1. Set up your `.env` file with real credentials
2. Create integration tests in `tests/integration/`
3. Run integration tests separately:
   ```bash
   npm run test:integration
   ```

### Debugging

Enable CloudWatch logs in Lambda for debugging:

1. Go to Lambda console → Monitor → View logs in CloudWatch
2. Check for errors and API responses
3. All requests and responses are logged by the interceptors

## API Documentation

### PTV Timetable API v3

This skill uses the following PTV API endpoints:

- **Search**: `/v3/search/{search_term}` - Find stations by name
- **Departures**: `/v3/departures/route_type/0/stop/{stop_id}` - Get train departures
- **Stop Details**: `/v3/stops/{stop_id}/route_type/0` - Get station information

Route type `0` = Trains

For full API documentation, visit: [PTV Timetable API Docs](https://www.ptv.vic.gov.au/footer/data-and-reporting/datasets/ptv-timetable-api/)

### HMAC-SHA1 Signature Generation

All PTV API requests must be signed using HMAC-SHA1:

```javascript
const crypto = require('crypto');
const signature = crypto
    .createHmac('sha1', API_KEY)
    .update(request)
    .digest('hex')
    .toUpperCase();
```

The signature is generated for the full request path including the `devid` parameter.

## Troubleshooting

### "I couldn't find a train station called..."

- **Cause**: Station name not recognized or doesn't exist
- **Solution**: Try using the full station name (e.g., "Flinders Street" instead of "Flinders")

### "Sorry, I had trouble getting the train times"

- **Cause**: API error or network issue
- **Solution**:
  - Check CloudWatch logs for specific error
  - Verify PTV API credentials are correct
  - Check if PTV API is operational

### "You haven't set a home station yet"

- **Cause**: Trying to use "my next train" without setting a home station
- **Solution**: Say "set my home station to [station name]" first

### Lambda timeout errors

- **Cause**: API calls taking too long
- **Solution**:
  - Increase Lambda timeout to 10 seconds
  - Check network connectivity
  - Consider implementing caching

## Future Enhancements

- [ ] Support for trams and buses (route_type 1 and 2)
- [ ] Filter departures by specific train line
- [ ] Service disruption announcements
- [ ] Location-based station detection
- [ ] Multi-language support
- [ ] Scheduled reminders for regular commutes
- [ ] Integration with real-time service alerts

## License

MIT License - see LICENSE file for details

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## Support

For issues and questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review [PTV API Documentation](https://www.ptv.vic.gov.au/footer/data-and-reporting/datasets/ptv-timetable-api/)
3. Check [Alexa Skills Kit Documentation](https://developer.amazon.com/en-US/docs/alexa/ask-overviews/what-is-the-alexa-skills-kit.html)
4. Open an issue on GitHub

## Credits

- Built with [Alexa Skills Kit SDK for Node.js](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs)
- Uses [PTV Timetable API](https://www.ptv.vic.gov.au/footer/data-and-reporting/datasets/ptv-timetable-api/)
- Axios for HTTP requests

## Acknowledgments

- Public Transport Victoria for providing the Timetable API
- Amazon for the Alexa Skills Kit
- The open-source community
