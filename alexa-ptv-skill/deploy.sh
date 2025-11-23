#!/bin/bash

# Deployment script for Alexa PTV Train Times skill
# Usage: ./deploy.sh [stage] [region] [aws-profile]
# Example: ./deploy.sh dev ap-southeast-2 myprofile

set -e

STAGE=${1:-dev}
REGION=${2:-ap-southeast-2}
AWS_PROFILE=${3:-}

echo "🚆 Deploying Alexa PTV Train Times Skill (Stage: $STAGE)"
echo "=================================================="

if [ -n "$AWS_PROFILE" ]; then
    echo "AWS Profile: $AWS_PROFILE"
    AWS_PROFILE_FLAG="--profile $AWS_PROFILE"
    SERVERLESS_PROFILE_FLAG="--aws-profile $AWS_PROFILE"
else
    AWS_PROFILE_FLAG=""
    SERVERLESS_PROFILE_FLAG=""
fi

echo "Region: $REGION"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "⚠️  Warning: AWS CLI not installed. Skipping parameter verification."
else
    # Check if parameters exist in Parameter Store
    echo "🔍 Checking for PTV API credentials in Parameter Store..."

    DEV_ID_PARAM="/alexa-ptv-skill/$STAGE/ptv-dev-id"
    API_KEY_PARAM="/alexa-ptv-skill/$STAGE/ptv-api-key"

    DEV_ID_EXISTS=$(aws ssm get-parameter --name "$DEV_ID_PARAM" --region $REGION $AWS_PROFILE_FLAG --query Parameter.Name --output text 2>/dev/null || echo "")
    API_KEY_EXISTS=$(aws ssm get-parameter --name "$API_KEY_PARAM" --region $REGION $AWS_PROFILE_FLAG --query Parameter.Name --output text 2>/dev/null || echo "")

    if [ -z "$DEV_ID_EXISTS" ] || [ -z "$API_KEY_EXISTS" ]; then
        echo "❌ Error: PTV API credentials not found in Parameter Store"
        echo ""
        echo "Missing parameters:"
        [ -z "$DEV_ID_EXISTS" ] && echo "  ❌ $DEV_ID_PARAM"
        [ -n "$DEV_ID_EXISTS" ] && echo "  ✅ $DEV_ID_PARAM"
        [ -z "$API_KEY_EXISTS" ] && echo "  ❌ $API_KEY_PARAM"
        [ -n "$API_KEY_EXISTS" ] && echo "  ✅ $API_KEY_PARAM"
        echo ""
        echo "Please run the setup script first:"
        echo "  ./setup-secrets.sh $STAGE $REGION"
        [ -n "$AWS_PROFILE" ] && echo "  Or: ./setup-secrets.sh $STAGE $REGION $AWS_PROFILE"
        exit 1
    fi

    echo "✅ PTV API credentials found in Parameter Store"
fi

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
serverless deploy --stage $STAGE --region $REGION $SERVERLESS_PROFILE_FLAG

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Copy the Lambda ARN from the output above"
echo "   2. Configure it in your Alexa Skill endpoint settings"
echo "   3. Test your skill in the Alexa Developer Console"
echo ""
echo "🔒 Security:"
echo "   ✅ PTV credentials stored encrypted in Parameter Store"
echo "   ✅ Not visible in Lambda console environment variables"
echo ""
echo "🎉 Happy testing!"
