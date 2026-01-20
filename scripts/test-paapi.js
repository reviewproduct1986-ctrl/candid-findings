#!/usr/bin/env node

/**
 * PA-API Credentials Test
 * 
 * Quick test to verify your PA-API credentials work
 * 
 * Usage:
 * 1. Set environment variables:
 *    export PAAPI_ACCESS_KEY="your_key"
 *    export PAAPI_SECRET_KEY="your_secret"  
 *    export AMAZON_PARTNER_TAG="yoursite-20"
 * 
 * 2. Run: node test-paapi-credentials.js
 */

// node --env-file=secrets/.script.env scripts/test-paapi.js 

const ProductAdvertisingAPIv1 = require('paapi5-nodejs-sdk');

// Get credentials
const CONFIG = {
    accessKey: process.env.PAAPI_ACCESS_KEY,
    secretKey: process.env.PAAPI_SECRET_KEY,
    partnerTag: process.env.AMAZON_PARTNER_TAG,
    region: 'us-east-1'
};

console.log(`
╔═══════════════════════════════════════╗
║   PA-API Credentials Test             ║
╚═══════════════════════════════════════╝
`);

// Validate credentials present
console.log('Checking credentials...\n');

if (!CONFIG.accessKey) {
  console.error('❌ PAAPI_ACCESS_KEY not set');
  console.log('\nSet it with:');
  console.log('export PAAPI_ACCESS_KEY="your_access_key"\n');
  process.exit(1);
}

if (!CONFIG.secretKey) {
  console.error('❌ PAAPI_SECRET_KEY not set');
  console.log('\nSet it with:');
  console.log('export PAAPI_SECRET_KEY="your_secret_key"\n');
  process.exit(1);
}

if (!CONFIG.partnerTag) {
  console.error('❌ AMAZON_PARTNER_TAG not set');
  console.log('\nSet it with:');
  console.log('export AMAZON_PARTNER_TAG="yoursite-20"\n');
  process.exit(1);
}

// Show what we're using (masked)
console.log('✓ Access Key:', CONFIG.accessKey.slice(0, 10) + '...' + CONFIG.accessKey.slice(-4));
console.log('✓ Secret Key: SET (hidden for security)');
console.log('✓ Partner Tag:', CONFIG.partnerTag);
console.log('✓ Region:', CONFIG.region);
console.log();

// Check if using AWS credentials by mistake
if (CONFIG.accessKey.includes('AWS') || CONFIG.secretKey.includes('AWS')) {
  console.warn('⚠️  WARNING: Your credentials contain "AWS" - these might be AWS IAM credentials!');
  console.warn('   PA-API requires different credentials from the PA-API Scratchpad.');
  console.warn('   Get them from: https://webservices.amazon.com/paapi5/scratchpad/\n');
}

// Initialize client
console.log('Initializing PA-API client...\n');

const defaultClient = ProductAdvertisingAPIv1.ApiClient.instance;
defaultClient.accessKey = CONFIG.accessKey;
defaultClient.secretKey = CONFIG.secretKey;
defaultClient.host = 'webservices.amazon.com';
defaultClient.region = CONFIG.region;

const api = new ProductAdvertisingAPIv1.DefaultApi();

// Test with a known ASIN (Apple AirPods Pro)
const testAsin = 'B0BSHF7WHW';

console.log(`Testing with ASIN: ${testAsin}`);
console.log('Sending request to PA-API...\n');

const getItemsRequest = new ProductAdvertisingAPIv1.GetItemsRequest();
getItemsRequest['PartnerTag'] = CONFIG.partnerTag;
getItemsRequest['PartnerType'] = 'Associates';
getItemsRequest['ItemIds'] = [testAsin];
getItemsRequest['Resources'] = [
  'ItemInfo.Title',
  'Offers.Listings.Price'
];

api.getItems(getItemsRequest, (error, data, response) => {
  if (error) {
    console.error('❌ ERROR:\n');
    
    // Parse error details
    if (error.status === 403) {
      console.error('Status: 403 Forbidden\n');
      console.error('This usually means:');
      console.error('1. ❌ You\'re using AWS credentials instead of PA-API credentials');
      console.error('2. ❌ Your PA-API access is not approved yet');
      console.error('3. ❌ Your Associates account has no sales (and grace period expired)');
      console.error('4. ❌ Your Associate Tag doesn\'t match the PA-API account\n');
      console.error('FIX:');
      console.error('→ Get PA-API credentials from: https://webservices.amazon.com/paapi5/scratchpad/');
      console.error('→ Make sure your Associates account has sales (or is in 30-day grace period)');
      console.error('→ Verify your Associate Tag is correct\n');
    } else if (error.status === 401) {
      console.error('Status: 401 Unauthorized\n');
      console.error('Your credentials are incorrect.');
      console.error('→ Double-check your Access Key and Secret Key');
      console.error('→ Make sure there are no extra spaces or line breaks\n');
    } else {
      console.error('Status:', error.status || 'Unknown');
      console.error('Message:', error.message || error);
      console.error();
    }
    
    // Show response details
    if (response && response.text) {
      console.error('Response details:');
      try {
        const responseBody = JSON.parse(response.text);
        console.error(JSON.stringify(responseBody, null, 2));
      } catch {
        console.error(response.text);
      }
    }
    
    console.log('\n❌ Credentials test FAILED\n');
    process.exit(1);
  } else {
    console.log('✅ SUCCESS!\n');
    console.log('Your credentials are working correctly!\n');
    
    if (data && data.ItemsResult && data.ItemsResult.Items) {
      const item = data.ItemsResult.Items[0];
      if (item.ItemInfo && item.ItemInfo.Title) {
        console.log('Product found:', item.ItemInfo.Title.DisplayValue);
      }
      if (item.Offers && item.Offers.Listings && item.Offers.Listings[0]) {
        const price = item.Offers.Listings[0].Price;
        if (price) {
          console.log('Price:', price.DisplayAmount);
        }
      }
    }
    
    console.log('\n✅ You can now run the product updater script!\n');
    console.log('Run: node update-products-paapi.js\n');
  }
});