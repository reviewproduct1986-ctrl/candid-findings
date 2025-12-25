#!/bin/bash

set -e

echo "🚀 AWS S3 Deployment - FIXED VERSION"
echo ""

# Configuration
read -p "Enter your S3 bucket name: " BUCKET_NAME
REGION="us-east-1"

echo ""
echo "Configuration:"
echo "  Bucket: $BUCKET_NAME"
echo "  Region: $REGION"
echo ""
read -p "Proceed? (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "📦 Step 1: Creating bucket..."
if aws s3 mb s3://$BUCKET_NAME --region $REGION 2>/dev/null; then
    echo "✅ Bucket created"
else
    echo "⚠️  Bucket already exists (that's okay)"
fi

echo ""
echo "🔓 Step 2: Disabling Block Public Access..."
aws s3api delete-public-access-block --bucket $BUCKET_NAME 2>/dev/null || echo "✅ Already disabled"

echo ""
echo "🌐 Step 3: Enabling static website hosting..."

# FIXED: Use put-bucket-website instead of s3 website
aws s3api put-bucket-website --bucket $BUCKET_NAME --website-configuration '{
  "IndexDocument": {
    "Suffix": "index.html"
  },
  "ErrorDocument": {
    "Key": "index.html"
  }
}'

echo "✅ Website hosting enabled"

echo ""
echo "📝 Step 4: Setting bucket policy..."

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

aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy file:///tmp/bucket-policy.json

echo "✅ Bucket policy applied"

echo ""
echo "🏗️  Step 5: Building site..."
npm run build

echo ""
echo "📤 Step 6: Uploading files..."
aws s3 sync dist/ s3://$BUCKET_NAME --delete

echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Your site is now live at:"
echo "http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next steps:"
echo "  1. Test your site in a browser"
echo "  2. Set up CloudFront for HTTPS (optional)"
echo "  3. Add custom domain (optional)"
echo ""
