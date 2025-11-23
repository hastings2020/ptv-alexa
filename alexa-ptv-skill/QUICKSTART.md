# Quick Start Guide

Get your Alexa PTV Train Times skill running in 15 minutes!

## Prerequisites

- [ ] AWS Account
- [ ] Amazon Developer Account
- [ ] Node.js 18+ installed
- [ ] PTV API credentials (or use test mode)

## Step 1: Get PTV API Credentials (5 minutes)

1. Visit https://www.ptv.vic.gov.au/footer/data-and-reporting/datasets/ptv-timetable-api/
2. Register for API access
3. Save your `devid` and `API Key`

## Step 2: Deploy to AWS (5 minutes)

### Using Automated Deployment (Recommended)

```bash
# Install dependencies
cd alexa-ptv-skill/lambda
npm install

# Install Serverless globally
npm install -g serverless

# Configure AWS credentials
serverless config credentials \
  --provider aws \
  --key YOUR_ACCESS_KEY \
  --secret YOUR_SECRET_KEY

# OR use AWS CLI
aws configure

# Go back to skill directory
cd ..

# Store PTV credentials securely in Parameter Store
./setup-secrets.sh dev ap-southeast-2
# This will prompt you for your PTV_DEV_ID and PTV_API_KEY
# Credentials are encrypted and stored in AWS Parameter Store

# Deploy!
./deploy.sh dev ap-southeast-2

# Copy the Lambda ARN from the output
```

**Security Note:** Your PTV credentials are now encrypted with AWS KMS and stored in Parameter Store, not visible in the Lambda console!

## Step 3: Configure Alexa Skill (5 minutes)

1. Go to https://developer.amazon.com/alexa/console/ask
2. Click "Create Skill"
   - Name: "PTV Train Times"
   - Language: English (AU)
   - Model: Custom
   - Backend: Provision your own
3. In "Build" tab → "JSON Editor":
   - Copy contents from `skill-package/interactionModels/custom/en-AU.json`
   - Paste and click "Save Model" → "Build Model"
4. In "Build" tab → "Endpoint":
   - Select "AWS Lambda ARN"
   - Paste your Lambda ARN
   - Click "Save Endpoints"
5. In "Test" tab:
   - Enable testing for "Development"

## Step 4: Test It!

In the Alexa Developer Console test panel, type:

```
ask train times when is the next train from flinders street
```

Or on your Alexa device:

```
"Alexa, ask train times when is my next train"
```

## Common Test Phrases

- "Alexa, ask train times when is the next train from Richmond"
- "Alexa, ask train times for departures from Southern Cross"
- "Alexa, ask train times to set my home station to Melbourne Central"
- "Alexa, ask train times when is my next train"

## Troubleshooting

### "Sorry, I had trouble..."

Check CloudWatch logs in AWS Lambda console:
- Monitor → View logs in CloudWatch

### Invalid API credentials

Verify Parameter Store parameters exist:
```bash
aws ssm get-parameter --name /alexa-ptv-skill/dev/ptv-dev-id --region ap-southeast-2
aws ssm get-parameter --name /alexa-ptv-skill/dev/ptv-api-key --region ap-southeast-2
```

If missing, run:
```bash
./setup-secrets.sh dev ap-southeast-2
```

### Station not found

Try full station names:
- ✅ "Flinders Street"
- ❌ "Flinders"

## Next Steps

- Set your home station for quick access
- Check out the full [README.md](README.md) for advanced features
- Run tests: `cd lambda && npm test`
- Monitor usage in CloudWatch

## Need Help?

- Check the [README.md](README.md) for detailed documentation
- Review the [PTV API docs](https://www.ptv.vic.gov.au/footer/data-and-reporting/datasets/ptv-timetable-api/)
- Check [Alexa Skills Kit docs](https://developer.amazon.com/en-US/docs/alexa/ask-overviews/what-is-the-alexa-skills-kit.html)

Happy building! 🚆
