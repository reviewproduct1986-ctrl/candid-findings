#!/bin/bash

# AWS S3 + CloudFront Deployment Script
# This script automates the setup of your static site on AWS

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 AWS Deployment Setup${NC}"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI not found${NC}"
    echo "Please install AWS CLI first:"
    echo "  macOS:   brew install awscli"
    echo "  Windows: https://aws.amazon.com/cli/"
    echo "  Linux:   https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

echo -e "${GREEN}✅ AWS CLI found: $(aws --version)${NC}"
echo ""

# Get bucket name
read -p "Enter your S3 bucket name (e.g., my-affiliate-site): " BUCKET_NAME

# Get region
echo "Choose AWS region:"
echo "  1) us-east-1 (N. Virginia) - Recommended"
echo "  2) us-west-2 (Oregon)"
echo "  3) eu-west-1 (Ireland)"
echo "  4) ap-southeast-1 (Singapore)"
read -p "Enter choice (1-4): " REGION_CHOICE

case $REGION_CHOICE in
  1) REGION="us-east-1" ;;
  2) REGION="us-west-2" ;;
  3) REGION="eu-west-1" ;;
  4) REGION="ap-southeast-1" ;;
  *) REGION="us-east-1" ;;
esac

echo ""
echo -e "${YELLOW}Configuration:${NC}"
echo "  Bucket: $BUCKET_NAME"
echo "  Region: $REGION"
echo ""
read -p "Proceed with setup? (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ]; then
    echo "Setup cancelled."
    exit 0
fi

echo ""
echo -e "${GREEN}📦 Step 1: Creating S3 bucket...${NC}"
if aws s3 mb s3://$BUCKET_NAME --region $REGION 2>/dev/null; then
    echo -e "${GREEN}✅ Bucket created${NC}"
else
    echo -e "${YELLOW}⚠️  Bucket already exists or couldn't be created${NC}"
fi

echo ""
echo -e "${GREEN}🌐 Step 2: Configuring static website hosting...${NC}"
aws s3 website s3://$BUCKET_NAME \
  --index-document index.html \
  --error-document index.html

echo -e "${GREEN}✅ Website hosting enabled${NC}"

echo ""
echo -e "${GREEN}🔓 Step 3: Setting bucket policy for public access...${NC}"

# Create bucket policy
cat > /tmp/bucket-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
    }
  ]
}
EOF

# Disable block public access
aws s3api delete-public-access-block --bucket $BUCKET_NAME 2>/dev/null || true

# Apply bucket policy
aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy file:///tmp/bucket-policy.json

echo -e "${GREEN}✅ Bucket is now publicly accessible${NC}"

echo ""
echo -e "${GREEN}🏗️  Step 4: Building your site...${NC}"
npm run build

echo ""
echo -e "${GREEN}📤 Step 5: Uploading to S3...${NC}"
aws s3 sync dist/ s3://$BUCKET_NAME --delete

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "Your site is live at:"
echo -e "${GREEN}http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com${NC}"
echo ""
echo "Next steps:"
echo "  1. Test your site at the URL above"
echo "  2. Set up CloudFront for HTTPS (see AWS_DEPLOYMENT_GUIDE.md)"
echo "  3. Add custom domain (optional)"
echo ""
echo -e "${YELLOW}💡 To set up automatic deployments:${NC}"
echo "  1. Add AWS credentials to GitHub Secrets:"
echo "     - AWS_ACCESS_KEY_ID"
echo "     - AWS_SECRET_ACCESS_KEY"
echo "  2. Update .github/workflows/deploy-aws.yml with your bucket name"
echo "  3. Push to GitHub - auto-deploys on every commit!"
echo ""
