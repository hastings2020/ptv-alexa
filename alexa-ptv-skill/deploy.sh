#!/bin/bash

# Deployment script for Alexa PTV Train Times skill
# Usage: ./deploy.sh [stage]
# Example: ./deploy.sh dev

set -e

STAGE=${1:-dev}

echo "🚆 Deploying Alexa PTV Train Times Skill (Stage: $STAGE)"
echo "=================================================="

# Check if required environment variables are set
if [ -z "$PTV_DEV_ID" ] || [ -z "$PTV_API_KEY" ]; then
    echo "❌ Error: PTV_DEV_ID and PTV_API_KEY environment variables must be set"
    echo ""
    echo "Please set them in your environment:"
    echo "  export PTV_DEV_ID=your_dev_id"
    echo "  export PTV_API_KEY=your_api_key"
    echo ""
    echo "Or create a .env file in the lambda directory"
    exit 1
fi

echo "✅ Environment variables configured"

# Check if in correct directory
if [ ! -f "serverless.yml" ]; then
    echo "❌ Error: serverless.yml not found. Please run this script from the alexa-ptv-skill directory"
    exit 1
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
cd lambda
npm install --production
cd ..

echo "✅ Dependencies installed"

# Run tests
echo ""
echo "🧪 Running tests..."
cd lambda
npm test
TEST_EXIT_CODE=$?
cd ..

if [ $TEST_EXIT_CODE -ne 0 ]; then
    echo "❌ Tests failed. Please fix the issues before deploying."
    exit 1
fi

echo "✅ Tests passed"

# Check if serverless is installed
if ! command -v serverless &> /dev/null; then
    echo ""
    echo "⚠️  Serverless Framework not found. Installing..."
    npm install -g serverless
    echo "✅ Serverless Framework installed"
fi

# Deploy
echo ""
echo "🚀 Deploying to AWS (Stage: $STAGE)..."
serverless deploy --stage $STAGE

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Copy the Lambda ARN from the output above"
echo "   2. Configure it in your Alexa Skill endpoint settings"
echo "   3. Test your skill in the Alexa Developer Console"
echo ""
echo "🎉 Happy testing!"
