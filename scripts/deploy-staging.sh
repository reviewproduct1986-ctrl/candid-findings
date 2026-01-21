#!/bin/bash
# 
# deploy-staging.sh
# Deploy React/Next.js app to S3 + CloudFront staging environment
#
# Usage: ./deploy-staging.sh
#

set -e

# ============================================
# CONFIGURATION - UPDATE THESE VALUES
# ============================================
ENVIRONMENT="staging"
S3_BUCKET="staging-candid-findings"                 # Your staging S3 bucket name
CLOUDFRONT_ID="E1N4RAHBASTG4R"                      # Your staging CloudFront distribution ID
BUILD_DIR="./dist"                                  # Build output directory
AWS_REGION="us-east-1"                              # AWS region
STAGING_URL="https://staging.candidfindings.com"    # Your staging URL

# Build command (customize if needed)
BUILD_COMMAND="npm run build"

# ============================================
# COLORS FOR OUTPUT
# ============================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================
# FUNCTIONS
# ============================================

log_info() {
  echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
  echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
  echo -e "${RED}✗${NC} $1"
}

# ============================================
# PRE-DEPLOYMENT CHECKS
# ============================================

echo ""
echo "=========================================="
echo "  Deploying to $ENVIRONMENT"
echo "=========================================="
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
  log_error "AWS CLI not found. Please install it first."
  exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
  log_error "AWS credentials not configured. Run 'aws configure' first."
  exit 1
fi

log_success "AWS CLI configured"

# Check if S3 bucket exists
if ! aws s3 ls "s3://$S3_BUCKET" &> /dev/null; then
  log_error "S3 bucket $S3_BUCKET not found!"
  exit 1
fi

log_success "S3 bucket found: $S3_BUCKET"

# ============================================
# BUILD
# ============================================

log_info "Building application..."
echo ""

# Clean previous build
if [ -d "$BUILD_DIR" ]; then
  rm -rf $BUILD_DIR
  log_info "Cleaned previous build"
fi

# Run build
if ! $BUILD_COMMAND; then
  log_error "Build failed!"
  exit 1
fi

log_success "Build completed"
echo ""

# ============================================
# DEPLOY TO S3
# ============================================

log_info "Uploading to S3..."
echo ""

# Upload static assets with cache (1 year)
log_info "Uploading static assets (with cache)..."
aws s3 sync $BUILD_DIR s3://$S3_BUCKET \
  --region $AWS_REGION \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "index.html" \
  --exclude "service-worker.js" \
  --exclude "asset-manifest.json" \
  --exclude "*.map" \
  --exclude ".DS_Store"

# Upload index.html without cache
log_info "Uploading index.html (no cache)..."
aws s3 cp $BUILD_DIR/index.html s3://$S3_BUCKET/index.html \
  --region $AWS_REGION \
  --cache-control "no-cache, no-store, must-revalidate" \
  --metadata-directive REPLACE \
  --content-type "text/html"

# Upload service worker with short cache (if exists)
if [ -f "$BUILD_DIR/service-worker.js" ]; then
  log_info "Uploading service-worker.js (short cache)..."
  aws s3 cp $BUILD_DIR/service-worker.js s3://$S3_BUCKET/service-worker.js \
    --region $AWS_REGION \
    --cache-control "max-age=0, must-revalidate" \
    --content-type "application/javascript"
fi

# Upload asset-manifest.json without cache (if exists)
if [ -f "$BUILD_DIR/asset-manifest.json" ]; then
  log_info "Uploading asset-manifest.json (no cache)..."
  aws s3 cp $BUILD_DIR/asset-manifest.json s3://$S3_BUCKET/asset-manifest.json \
    --region $AWS_REGION \
    --cache-control "no-cache, no-store, must-revalidate" \
    --content-type "application/json"
fi

log_success "Upload to S3 completed"
echo ""

# ============================================
# INVALIDATE CLOUDFRONT CACHE
# ============================================

log_info "Invalidating CloudFront cache..."
echo ""

INVALIDATION_OUTPUT=$(aws cloudfront create-invalidation \
  --distribution-id $CLOUDFRONT_ID \
  --paths "/*" \
  --output json)

INVALIDATION_ID=$(echo $INVALIDATION_OUTPUT | grep -o '"Id": "[^"]*' | cut -d'"' -f4)

log_success "Invalidation created: $INVALIDATION_ID"

# Wait for invalidation to complete (optional - comment out if you don't want to wait)
log_info "Waiting for invalidation to complete..."
aws cloudfront wait invalidation-completed \
  --distribution-id $CLOUDFRONT_ID \
  --id $INVALIDATION_ID

log_success "CloudFront cache invalidated"
echo ""

# ============================================
# DEPLOYMENT SUMMARY
# ============================================

echo ""
echo "=========================================="
echo "  Deployment Summary"
echo "=========================================="
echo ""
echo "Environment:     $ENVIRONMENT"
echo "S3 Bucket:       $S3_BUCKET"
echo "CloudFront ID:   $CLOUDFRONT_ID"
echo "Invalidation:    $INVALIDATION_ID"
echo ""
echo "🌐 Staging URL:  $STAGING_URL"
echo ""
log_success "Deployment completed successfully! 🎉"
echo ""

# ============================================
# POST-DEPLOYMENT CHECKS (Optional)
# ============================================

log_info "Running post-deployment checks..."
echo ""

# Check if site is accessible
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $STAGING_URL)

if [ "$HTTP_STATUS" = "200" ]; then
  log_success "Site is accessible (HTTP $HTTP_STATUS)"
else
  log_warning "Site returned HTTP $HTTP_STATUS"
fi

echo ""
log_info "Deployment complete! Visit: $STAGING_URL"
echo ""