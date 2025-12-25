#!/bin/bash

# CloudFront Setup Script - Simplified Version
# This script automates CloudFront distribution creation

set -e

echo "☁️  CloudFront Setup for S3 Static Site"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Get configuration
read -p "Enter your S3 bucket name: " BUCKET_NAME
REGION="us-east-1"

echo ""
echo "This will:"
echo "  1. Create Origin Access Control (OAC)"
echo "  2. Create CloudFront distribution"
echo "  3. Update S3 bucket policy"
echo "  4. Give you HTTPS URL"
echo ""
read -p "Proceed? (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ]; then
    echo "Cancelled."
    exit 0
fi

# Create temporary directory for files
mkdir -p /tmp/cloudfront-setup

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 1/3: Creating Origin Access Control"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Create OAC config file
cat > /tmp/cloudfront-setup/oac-config.json <<EOF
{
  "Name": "${BUCKET_NAME}-OAC",
  "Description": "Origin Access Control for ${BUCKET_NAME}",
  "SigningProtocol": "sigv4",
  "SigningBehavior": "always",
  "OriginAccessControlOriginType": "s3"
}
EOF

# Create OAC
aws cloudfront create-origin-access-control \
  --origin-access-control-config file:///tmp/cloudfront-setup/oac-config.json \
  --output json > /tmp/cloudfront-setup/oac-output.json

OAC_ID=$(jq -r '.OriginAccessControl.Id' /tmp/cloudfront-setup/oac-output.json)

echo "✅ Origin Access Control created"
echo "   OAC ID: $OAC_ID"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 2/3: Creating CloudFront Distribution"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⏱️  This takes 5-10 minutes..."

# Create distribution config
cat > /tmp/cloudfront-setup/distribution-config.json <<EOF
{
  "CallerReference": "$(date +%s)",
  "Comment": "${BUCKET_NAME} - Affiliate Site CDN",
  "Enabled": true,
  "DefaultRootObject": "index.html",
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-${BUCKET_NAME}",
        "DomainName": "${BUCKET_NAME}.s3.${REGION}.amazonaws.com",
        "OriginAccessControlId": "${OAC_ID}",
        "S3OriginConfig": {
          "OriginAccessIdentity": ""
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-${BUCKET_NAME}",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {
      "Quantity": 2,
      "Items": ["GET", "HEAD"],
      "CachedMethods": {
        "Quantity": 2,
        "Items": ["GET", "HEAD"]
      }
    },
    "Compress": true,
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {
        "Forward": "none"
      }
    },
    "MinTTL": 0,
    "DefaultTTL": 86400,
    "MaxTTL": 31536000,
    "TrustedSigners": {
      "Enabled": false,
      "Quantity": 0
    }
  },
  "CustomErrorResponses": {
    "Quantity": 1,
    "Items": [
      {
        "ErrorCode": 404,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 300
      }
    ]
  },
  "PriceClass": "PriceClass_All",
  "HttpVersion": "http2and3"
}
EOF

# Create distribution
aws cloudfront create-distribution \
  --distribution-config file:///tmp/cloudfront-setup/distribution-config.json \
  --output json > /tmp/cloudfront-setup/distribution-output.json

DISTRIBUTION_ID=$(jq -r '.Distribution.Id' /tmp/cloudfront-setup/distribution-output.json)
DOMAIN_NAME=$(jq -r '.Distribution.DomainName' /tmp/cloudfront-setup/distribution-output.json)

echo "✅ CloudFront distribution created!"
echo "   Distribution ID: $DISTRIBUTION_ID"
echo "   Domain: $DOMAIN_NAME"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 3/3: Updating S3 Bucket Policy"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Get AWS account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Create bucket policy for CloudFront
cat > /tmp/cloudfront-setup/bucket-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::${BUCKET_NAME}/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::${ACCOUNT_ID}:distribution/${DISTRIBUTION_ID}"
        }
      }
    }
  ]
}
EOF

# Apply bucket policy
aws s3api put-bucket-policy \
  --bucket $BUCKET_NAME \
  --policy file:///tmp/cloudfront-setup/bucket-policy.json

echo "✅ S3 bucket policy updated"

# Save configuration for future use
cat > cloudfront-config.txt <<EOF
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CLOUDFRONT CONFIGURATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

S3 Bucket: ${BUCKET_NAME}
Distribution ID: ${DISTRIBUTION_ID}
CloudFront URL: https://${DOMAIN_NAME}

Created: $(date)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DEPLOYMENT COMMANDS:

# Upload new version
npm run build
aws s3 sync dist/ s3://${BUCKET_NAME} --delete

# Clear CloudFront cache
aws cloudfront create-invalidation \\
  --distribution-id ${DISTRIBUTION_ID} \\
  --paths "/*"

# Check deployment status
aws cloudfront get-distribution \\
  --id ${DISTRIBUTION_ID} \\
  --query 'Distribution.Status'

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EOF

echo ""
echo "🎉 SETUP COMPLETE!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Your site will be available at:"
echo "https://${DOMAIN_NAME}"
echo ""
echo "Distribution ID: ${DISTRIBUTION_ID}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⏱️  IMPORTANT: Wait 5-10 minutes for deployment"
echo ""
echo "Check status with:"
echo "  aws cloudfront get-distribution --id ${DISTRIBUTION_ID} --query 'Distribution.Status'"
echo ""
echo "When status shows 'Deployed', test your site:"
echo "  https://${DOMAIN_NAME}"
echo ""
echo "Configuration saved to: cloudfront-config.txt"
echo ""
echo "Next steps:"
echo "  1. Wait for deployment to complete"
echo "  2. Test your HTTPS site"
echo "  3. Add custom domain (optional)"
echo "  4. Update GitHub Actions with Distribution ID"
echo ""
