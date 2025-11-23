#!/bin/bash

# Setup script for storing PTV API credentials in AWS Systems Manager Parameter Store
# Usage: ./setup-secrets.sh [stage] [region] [aws-profile]
# Example: ./setup-secrets.sh dev ap-southeast-2 myprofile

set -e

STAGE=${1:-dev}
REGION=${2:-ap-southeast-2}
AWS_PROFILE=${3:-}

echo "🔐 Setting up PTV API Secrets in AWS Parameter Store"
echo "===================================================="
echo "Stage: $STAGE"
echo "Region: $REGION"
if [ -n "$AWS_PROFILE" ]; then
    echo "AWS Profile: $AWS_PROFILE"
    AWS_PROFILE_FLAG="--profile $AWS_PROFILE"
else
    AWS_PROFILE_FLAG=""
fi
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ Error: AWS CLI is not installed"
    echo "Please install it from: https://aws.amazon.com/cli/"
    exit 1
fi

# Check AWS credentials are configured
echo "🔍 Checking AWS credentials..."
if ! aws sts get-caller-identity $AWS_PROFILE_FLAG --region $REGION &> /dev/null; then
    echo "❌ Error: AWS credentials not configured or invalid"
    echo "Please run: aws configure"
    if [ -n "$AWS_PROFILE" ]; then
        echo "Or: aws configure --profile $AWS_PROFILE"
    fi
    exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity $AWS_PROFILE_FLAG --region $REGION --query Account --output text)
echo "✅ AWS credentials valid (Account: $ACCOUNT_ID)"
echo ""

# Prompt for PTV API credentials
echo "📝 Enter your PTV API credentials"
echo "Get them from: https://www.ptv.vic.gov.au/footer/data-and-reporting/datasets/ptv-timetable-api/"
echo ""

# Check if credentials are in environment variables
if [ -n "$PTV_DEV_ID" ] && [ -n "$PTV_API_KEY" ]; then
    echo "Found credentials in environment variables"
    read -p "Use PTV_DEV_ID=$PTV_DEV_ID? (y/n): " use_env
    if [ "$use_env" != "y" ]; then
        read -p "Enter PTV Developer ID: " DEV_ID
        read -sp "Enter PTV API Key: " API_KEY
        echo ""
    else
        DEV_ID=$PTV_DEV_ID
        API_KEY=$PTV_API_KEY
    fi
else
    read -p "Enter PTV Developer ID: " DEV_ID
    read -sp "Enter PTV API Key: " API_KEY
    echo ""
fi

# Validate inputs
if [ -z "$DEV_ID" ] || [ -z "$API_KEY" ]; then
    echo "❌ Error: Both Developer ID and API Key are required"
    exit 1
fi

# Parameter names
DEV_ID_PARAM="/alexa-ptv-skill/$STAGE/ptv-dev-id"
API_KEY_PARAM="/alexa-ptv-skill/$STAGE/ptv-api-key"

echo ""
echo "📤 Storing credentials in Parameter Store..."
echo "Parameter names:"
echo "  - $DEV_ID_PARAM"
echo "  - $API_KEY_PARAM"
echo ""

# Store PTV Developer ID
echo "Storing Developer ID..."
aws ssm put-parameter \
    --name "$DEV_ID_PARAM" \
    --value "$DEV_ID" \
    --type SecureString \
    --overwrite \
    --region $REGION \
    $AWS_PROFILE_FLAG \
    --description "PTV API Developer ID for Alexa skill ($STAGE)" \
    > /dev/null

echo "✅ Developer ID stored successfully"

# Store PTV API Key
echo "Storing API Key..."
aws ssm put-parameter \
    --name "$API_KEY_PARAM" \
    --value "$API_KEY" \
    --type SecureString \
    --overwrite \
    --region $REGION \
    $AWS_PROFILE_FLAG \
    --description "PTV API Key for Alexa skill ($STAGE)" \
    > /dev/null

echo "✅ API Key stored successfully"

# Verify parameters were created
echo ""
echo "🔍 Verifying parameters..."
DEV_ID_CHECK=$(aws ssm get-parameter --name "$DEV_ID_PARAM" --region $REGION $AWS_PROFILE_FLAG --query Parameter.Name --output text 2>/dev/null || echo "")
API_KEY_CHECK=$(aws ssm get-parameter --name "$API_KEY_PARAM" --region $REGION $AWS_PROFILE_FLAG --query Parameter.Name --output text 2>/dev/null || echo "")

if [ -n "$DEV_ID_CHECK" ] && [ -n "$API_KEY_CHECK" ]; then
    echo "✅ All parameters verified"
else
    echo "❌ Warning: Some parameters could not be verified"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Deploy your skill: ./deploy.sh $STAGE"
echo "   2. The Lambda function will automatically read these encrypted parameters"
echo ""
echo "🔒 Security features:"
echo "   ✅ Credentials encrypted at rest with AWS KMS"
echo "   ✅ Credentials encrypted in transit"
echo "   ✅ Access controlled via IAM policies"
echo "   ✅ Audit trail in CloudTrail"
echo "   ✅ Not visible in Lambda console environment variables"
echo ""
echo "💡 To view parameters (decrypted):"
echo "   aws ssm get-parameter --name $DEV_ID_PARAM --with-decryption --region $REGION $AWS_PROFILE_FLAG"
echo ""
echo "💡 To delete parameters:"
echo "   aws ssm delete-parameter --name $DEV_ID_PARAM --region $REGION $AWS_PROFILE_FLAG"
echo "   aws ssm delete-parameter --name $API_KEY_PARAM --region $REGION $AWS_PROFILE_FLAG"
echo ""
