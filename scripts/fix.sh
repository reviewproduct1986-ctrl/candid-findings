#!/bin/bash
#
# Complete AWS Staging Diagnostic
# Checks: S3, CloudFront, OAC, DNS, Permissions
#

set -e

BUCKET="staging-candid-findings"
DOMAIN="staging.candidfindings.com"
DIST_ID="E1N4RAHBASTG4R"
OAC_ID="E3I2UF2TXWMP3M"
ACCOUNT_ID="107153400993"

echo "=========================================="
echo "🔍 Complete AWS Staging Diagnostic"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

pass() {
  echo -e "${GREEN}✅ $1${NC}"
}

fail() {
  echo -e "${RED}❌ $1${NC}"
}

warn() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

# ====================
# 1. S3 CHECKS
# ====================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  S3 Bucket Checks"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check bucket exists
if aws s3 ls s3://$BUCKET >/dev/null 2>&1; then
  pass "Bucket exists: $BUCKET"
else
  fail "Cannot access bucket: $BUCKET"
  exit 1
fi

# Check files exist
FILE_COUNT=$(aws s3 ls s3://$BUCKET --recursive | wc -l | tr -d ' ')
echo "   Files in bucket: $FILE_COUNT"

# Check index.html exists
if aws s3 ls s3://$BUCKET/index.html >/dev/null 2>&1; then
  pass "index.html exists"
  INDEX_SIZE=$(aws s3 ls s3://$BUCKET/index.html | awk '{print $3}')
  echo "   Size: $INDEX_SIZE bytes"
else
  fail "index.html NOT FOUND in bucket!"
fi

# Check bucket policy
echo ""
echo "Checking bucket policy..."
if aws s3api get-bucket-policy --bucket $BUCKET >/dev/null 2>&1; then
  pass "Bucket policy exists"
  
  POLICY=$(aws s3api get-bucket-policy --bucket $BUCKET --query Policy --output text)
  
  if echo "$POLICY" | grep -q "cloudfront.amazonaws.com"; then
    pass "Policy allows CloudFront service principal"
  else
    fail "Policy does NOT allow cloudfront.amazonaws.com"
  fi
  
  if echo "$POLICY" | grep -q "$DIST_ID"; then
    pass "Policy references correct distribution: $DIST_ID"
  else
    fail "Policy does NOT reference distribution $DIST_ID"
  fi
else
  fail "No bucket policy found!"
fi

# Check bucket public access
echo ""
echo "Checking public access block..."
PUBLIC_BLOCK=$(aws s3api get-public-access-block --bucket $BUCKET --query PublicAccessBlockConfiguration 2>/dev/null || echo "null")
if [ "$PUBLIC_BLOCK" != "null" ]; then
  pass "Public access is blocked (good for security)"
else
  warn "Public access block not configured"
fi

echo ""

# ====================
# 2. CLOUDFRONT CHECKS
# ====================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  CloudFront Distribution Checks"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Get distribution details
DIST_CONFIG=$(aws cloudfront get-distribution --id $DIST_ID --query 'Distribution.DistributionConfig' 2>/dev/null)

if [ -z "$DIST_CONFIG" ]; then
  fail "Cannot get CloudFront distribution: $DIST_ID"
  exit 1
fi

pass "CloudFront distribution found: $DIST_ID"

# Check distribution status
DIST_STATUS=$(aws cloudfront get-distribution --id $DIST_ID --query 'Distribution.Status' --output text)
echo "   Status: $DIST_STATUS"

if [ "$DIST_STATUS" = "Deployed" ]; then
  pass "Distribution is deployed"
else
  warn "Distribution status: $DIST_STATUS (might still be deploying)"
fi

# Check enabled
ENABLED=$(echo "$DIST_CONFIG" | jq -r '.Enabled')
if [ "$ENABLED" = "true" ]; then
  pass "Distribution is enabled"
else
  fail "Distribution is DISABLED!"
fi

# Check default root object
echo ""
echo "Checking default root object..."
DEFAULT_ROOT=$(echo "$DIST_CONFIG" | jq -r '.DefaultRootObject')
if [ "$DEFAULT_ROOT" = "index.html" ]; then
  pass "Default root object: index.html"
else
  warn "Default root object: '$DEFAULT_ROOT' (should be 'index.html')"
fi

# Check origin
echo ""
echo "Checking origin configuration..."
ORIGIN_DOMAIN=$(echo "$DIST_CONFIG" | jq -r '.Origins.Items[0].DomainName')
ORIGIN_OAC=$(echo "$DIST_CONFIG" | jq -r '.Origins.Items[0].OriginAccessControlId')

echo "   Origin domain: $ORIGIN_DOMAIN"

if [[ "$ORIGIN_DOMAIN" == *"$BUCKET"* ]]; then
  pass "Origin points to correct bucket"
else
  fail "Origin domain doesn't match bucket!"
fi

if [ "$ORIGIN_OAC" = "$OAC_ID" ]; then
  pass "OAC is attached to origin"
else
  fail "OAC mismatch! Expected: $OAC_ID, Got: $ORIGIN_OAC"
fi

# Check CNAMEs
echo ""
echo "Checking CNAMEs (alternate domains)..."
CNAMES=$(echo "$DIST_CONFIG" | jq -r '.Aliases.Items[]' 2>/dev/null)
if echo "$CNAMES" | grep -q "$DOMAIN"; then
  pass "CNAME configured: $DOMAIN"
else
  warn "CNAME not found: $DOMAIN"
  echo "   Found CNAMEs: $CNAMES"
fi

# Check error pages (CRITICAL for SPAs!)
echo ""
echo "Checking custom error responses..."
ERROR_RESPONSES=$(echo "$DIST_CONFIG" | jq -r '.CustomErrorResponses.Items[]' 2>/dev/null)

if [ -z "$ERROR_RESPONSES" ]; then
  fail "NO custom error responses configured!"
  echo ""
  echo "   ⚠️  THIS IS LIKELY YOUR PROBLEM!"
  echo "   For React/SPA apps, you MUST configure error pages:"
  echo "   - 403 → /index.html (200)"
  echo "   - 404 → /index.html (200)"
  echo ""
else
  pass "Custom error responses configured"
  echo "$DIST_CONFIG" | jq '.CustomErrorResponses.Items[]' 2>/dev/null
fi

echo ""

# ====================
# 3. OAC CHECKS
# ====================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  Origin Access Control Checks"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

OAC_CONFIG=$(aws cloudfront get-origin-access-control --id $OAC_ID 2>/dev/null)

if [ -z "$OAC_CONFIG" ]; then
  fail "Cannot get OAC: $OAC_ID"
else
  pass "OAC exists: $OAC_ID"
  
  OAC_SIGNING=$(echo "$OAC_CONFIG" | jq -r '.OriginAccessControl.OriginAccessControlConfig.SigningBehavior')
  OAC_PROTOCOL=$(echo "$OAC_CONFIG" | jq -r '.OriginAccessControl.OriginAccessControlConfig.SigningProtocol')
  
  echo "   Signing behavior: $OAC_SIGNING"
  echo "   Signing protocol: $OAC_PROTOCOL"
  
  if [ "$OAC_SIGNING" = "always" ]; then
    pass "Signing behavior is correct"
  else
    fail "Signing behavior should be 'always', got: $OAC_SIGNING"
  fi
fi

echo ""

# ====================
# 4. LIVE TESTS
# ====================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣  Live Access Tests"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test S3 direct access (should fail)
echo "Testing direct S3 access (should be blocked)..."
S3_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://$BUCKET.s3.amazonaws.com/index.html)
if [ "$S3_STATUS" = "403" ]; then
  pass "S3 direct access blocked (correct)"
else
  warn "S3 returned: $S3_STATUS (expected 403)"
fi

# Test CloudFront access
echo ""
echo "Testing CloudFront access..."
CF_RESPONSE=$(curl -s -I https://$DOMAIN)
CF_STATUS=$(echo "$CF_RESPONSE" | grep -i "HTTP" | awk '{print $2}')
CF_CACHE=$(echo "$CF_RESPONSE" | grep -i "x-cache" | awk '{print $2}')
CF_SERVER=$(echo "$CF_RESPONSE" | grep -i "server:" | awk '{print $2}')

echo "   HTTP Status: $CF_STATUS"
echo "   X-Cache: $CF_CACHE"
echo "   Server: $CF_SERVER"

if [ "$CF_STATUS" = "200" ]; then
  pass "CloudFront returns 200 OK!"
  echo ""
  echo "🎉 YOUR SITE IS WORKING!"
elif [ "$CF_STATUS" = "403" ]; then
  fail "CloudFront returns 403 Access Denied"
  
  if [[ "$CF_SERVER" == *"AmazonS3"* ]]; then
    echo ""
    echo "   🔍 Server header shows 'AmazonS3'"
    echo "   This means CloudFront is passing through S3's error"
    echo ""
    echo "   Most likely causes:"
    echo "   1. Custom Error Pages not configured in CloudFront"
    echo "   2. CloudFront trying to access non-existent path"
    echo "   3. OAC permissions not fully propagated yet"
  fi
else
  warn "CloudFront returned: $CF_STATUS"
fi

echo ""

# ====================
# 5. DNS CHECKS
# ====================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5️⃣  DNS Checks"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

DNS_RESULT=$(dig +short $DOMAIN 2>/dev/null | head -1)
CF_DOMAIN=$(aws cloudfront get-distribution --id $DIST_ID --query 'Distribution.DomainName' --output text)

echo "   DNS resolves to: $DNS_RESULT"
echo "   CloudFront domain: $CF_DOMAIN"

if [ -n "$DNS_RESULT" ]; then
  pass "DNS resolves"
else
  fail "DNS does not resolve!"
fi

echo ""

# ====================
# SUMMARY & RECOMMENDATIONS
# ====================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Summary & Recommendations"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$CF_STATUS" = "200" ]; then
  echo "🎉 Everything looks good! Your site should be working."
  echo ""
  echo "If you're still seeing errors in your browser:"
  echo "  - Clear browser cache (Cmd+Shift+R or Ctrl+Shift+F5)"
  echo "  - Try incognito/private mode"
  echo "  - Wait a few more minutes for CloudFront cache to clear"
else
  echo "🔧 Issues found. Here's what to fix:"
  echo ""
  
  # Check if error pages are missing
  if [ -z "$ERROR_RESPONSES" ]; then
    echo "⚠️  CRITICAL: Custom Error Pages not configured!"
    echo ""
    echo "For React/SPA apps, you MUST add these in CloudFront:"
    echo "  1. Go to CloudFront Console"
    echo "  2. Select distribution: $DIST_ID"
    echo "  3. Go to 'Error pages' tab"
    echo "  4. Add custom error response:"
    echo "     - HTTP error code: 403"
    echo "     - Response page path: /index.html"
    echo "     - HTTP response code: 200"
    echo "  5. Add another for 404 error code"
    echo "  6. Save changes and wait 5-10 minutes"
    echo ""
  fi
  
  if [ "$CF_STATUS" = "403" ]; then
    echo "Current issue: 403 Access Denied"
    echo ""
    echo "Next steps:"
    echo "  1. Add custom error pages (see above)"
    echo "  2. Wait 5 minutes for CloudFront to deploy changes"
    echo "  3. Invalidate cache:"
    echo "     aws cloudfront create-invalidation --distribution-id $DIST_ID --paths '/*'"
    echo "  4. Test again"
    echo ""
  fi
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"