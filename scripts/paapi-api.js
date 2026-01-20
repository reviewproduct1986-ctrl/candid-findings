#!/usr/bin/env node

// node --env-file=scripts/.env scripts/paapi-api.js 

const fs = require('fs');
const path = require('path');

// Import PA-API SDK
let ProductAdvertisingAPIv1;
try {
  ProductAdvertisingAPIv1 = require('paapi5-nodejs-sdk');
} catch (err) {
  console.error('Error: paapi5-nodejs-sdk not installed');
  console.log('\nPlease run: npm install paapi5-nodejs-sdk\n');
  process.exit(1);
}

// ⚠️ CONFIGURATION - ADD YOUR CREDENTIALS HERE
const CONFIG = {
  accessKey: process.env.PAAPI_ACCESS_KEY,
  secretKey: process.env.PAAPI_SECRET_KEY,
  partnerTag: process.env.AMAZON_PARTNER_TAG,
  region: 'us-east-1', // US marketplace
  productsFile: './public/data/products.json',
  backupFile: './public/data/products.backup.json',
  delayBetweenRequests: 1000, // 1 second (PA-API allows more requests)
};

// Statistics
const stats = {
  total: 0,
  updated: 0,
  unavailable: 0,
  errors: 0,
  skipped: 0
};

/**
 * Initialize PA-API client
 */
function initializeClient() {
  const defaultClient = ProductAdvertisingAPIv1.ApiClient.instance;
  defaultClient.accessKey = CONFIG.accessKey;
  defaultClient.secretKey = CONFIG.secretKey;
  defaultClient.host = 'webservices.amazon.com';
  defaultClient.region = CONFIG.region;
  
  return new ProductAdvertisingAPIv1.DefaultApi();
}

/**
 * Fetch product data from PA-API
 */
async function fetchProductData(api, asin) {
  return new Promise((resolve, reject) => {
    const getItemsRequest = new ProductAdvertisingAPIv1.GetItemsRequest();
    getItemsRequest['PartnerTag'] = CONFIG.partnerTag;
    getItemsRequest['PartnerType'] = 'Associates';
    getItemsRequest['ItemIds'] = [asin];
    getItemsRequest['Resources'] = [
      'ItemInfo.Title',
      'Offers.Listings.Price',
      'Offers.Listings.Availability.Message',
      'CustomerReviews.StarRating',
      'CustomerReviews.Count'
    ];

    api.getItems(getItemsRequest, (error, data, response) => {
      if (error) {
        reject(error);
      } else {
        console.log('data: ', data);
        resolve(data);
      }
    });
  });
}

/**
 * Parse PA-API response
 */
function parseApiResponse(apiData) {
  const data = {
    available: true,
    price: null,
    rating: null,
    reviewCount: null
  };

  if (!apiData || !apiData.ItemsResult || !apiData.ItemsResult.Items || 
      apiData.ItemsResult.Items.length === 0) {
    data.available = false;
    return data;
  }

  const item = apiData.ItemsResult.Items[0];

  // Check availability
  if (item.Offers && item.Offers.Listings && item.Offers.Listings.length > 0) {
    const listing = item.Offers.Listings[0];
    
    // Get price
    if (listing.Price && listing.Price.Amount) {
      data.price = listing.Price.Amount;
    }

    // Check if unavailable
    if (listing.Availability && listing.Availability.Message) {
      const msg = listing.Availability.Message.toLowerCase();
      if (msg.includes('unavailable') || msg.includes('out of stock')) {
        data.available = false;
        return data;
      }
    }
  }

  // Get rating and review count
  if (item.CustomerReviews) {
    if (item.CustomerReviews.StarRating && item.CustomerReviews.StarRating.Value) {
      data.rating = parseFloat(item.CustomerReviews.StarRating.Value);
    }
    
    if (item.CustomerReviews.Count) {
      data.reviewCount = parseInt(item.CustomerReviews.Count);
    }
  }

  return data;
}

/**
 * Update a single product
 */
async function updateProduct(api, product, index, total) {
  console.log(`\n[${index + 1}/${total}] ${product.title}`);
  
  const asin = product.asin;
  
  if (!asin) {
    console.log(`  ⚠ Skipped: No ASIN found`);
    stats.skipped++;
    return product;
  }

  console.log(`  ASIN: ${asin}`);

  try {
    console.log(`  Fetching from PA-API...`);
    const apiData = await fetchProductData(api, asin);
    
    const newData = parseApiResponse(apiData);

    if (!newData.available) {
      console.log(`  ✗ Product unavailable`);
      stats.unavailable++;
      return {
        ...product,
        available: false,
        lastChecked: new Date().toISOString()
      };
    }

    const updated = { ...product };
    let hasChanges = false;

    if (newData.price !== null && newData.price !== product.price) {
      console.log(`  Price: $${product.price} → $${newData.price}`);
      updated.price = newData.price;
      hasChanges = true;
    }

    if (newData.rating !== null && newData.rating !== product.rating) {
      console.log(`  Rating: ${product.rating} → ${newData.rating}`);
      updated.rating = newData.rating;
      hasChanges = true;
    }

    if (newData.reviewCount !== null && newData.reviewCount !== product.reviews) {
      console.log(`  Reviews: ${product.reviews} → ${newData.reviewCount}`);
      updated.reviews = newData.reviewCount;
      hasChanges = true;
    }

    if (hasChanges) {
      updated.lastUpdated = new Date().toISOString();
      console.log(`  ✓ Updated`);
      stats.updated++;
    } else {
      console.log(`  ✓ No changes`);
    }

    updated.lastChecked = new Date().toISOString();
    updated.available = true;
    return updated;

  } catch (error) {
    console.log(`  ✗ Error: ${error.message}`);
    stats.errors++;
    return {
      ...product,
      lastChecked: new Date().toISOString(),
      lastError: error.message
    };
  }
}

/**
 * Sleep function
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main function
 */
async function main() {
  const currentTime = new Date();
  console.log(currentTime.toLocaleString());
  console.log(`
╔═══════════════════════════════════════╗
║   Amazon Product Updater (PA-API)     ║
╚═══════════════════════════════════════╝
`);

  // Check credentials
  if (CONFIG.accessKey === 'YOUR_ACCESS_KEY_HERE' ||
      CONFIG.secretKey === 'YOUR_SECRET_KEY_HERE' ||
      CONFIG.partnerTag === 'YOUR_ASSOCIATE_TAG_HERE') {
    console.error(`Error: Please add your PA-API credentials\n`);
    console.log('1. Sign up: https://affiliate-program.amazon.com/');
    console.log('2. Apply for PA-API: https://webservices.amazon.com/paapi5/documentation/');
    console.log('3. Add your credentials to CONFIG in this script\n');
    process.exit(1);
  }

  const productsPath = path.resolve(CONFIG.productsFile);
  const backupPath = path.resolve(CONFIG.backupFile);

  if (!fs.existsSync(productsPath)) {
    console.error(`Error: products.json not found`);
    process.exit(1);
  }

  // Initialize API client
  console.log('Initializing PA-API client...\n');
  const api = initializeClient();

  console.log(`Reading: ${productsPath}\n`);
  const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
  const products = productsData.products;

  stats.total = products.length;
  console.log(`Found ${stats.total} products\n`);

  // Create backup
  try {
    fs.copyFileSync(productsPath, backupPath);
    console.log(`✓ Backup created\n`);
  } catch (error) {
    console.log(`⚠ Could not create backup\n`);
  }

  // Update each product
  const updatedProducts = [];
  for (let i = 0; i < products.length; i++) {
    const updated = await updateProduct(api, products[i], i, products.length);
    updatedProducts.push(updated);
    
    if (i < products.length - 1) {
      await sleep(CONFIG.delayBetweenRequests);
    }
  }

  // Save
  const outputData = {
    products: updatedProducts,
    metadata: {
      total: updatedProducts.length,
      updated: new Date().toISOString()
    }
  };

  fs.writeFileSync(productsPath, JSON.stringify(outputData), 'utf8');

  // Summary
  console.log(`\n
╔═══════════════════════════════════════╗
║            Summary                    ║
╚═══════════════════════════════════════╝
`);
  console.log(`Total products:    ${stats.total}`);
  console.log(`Updated:           ${stats.updated}`);
  console.log(`Unavailable:       ${stats.unavailable}`);
  console.log(`Errors:            ${stats.errors}`);
  console.log(`Skipped:           ${stats.skipped}`);
  console.log(`\n✓ Done!\n`);
}

main().catch(error => {
  console.error(`$\nFatal error: ${error.message}$`);
  process.exit(1);
});