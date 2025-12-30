#!/usr/bin/env node

/**
 * Fetch products from Amazon Product Advertising API
 * and save them to data/products.json
 */

const fs = require('fs');
const path = require('path');

// Amazon Product Advertising API configuration
const config = {
  accessKey: process.env.AMAZON_ACCESS_KEY,
  secretKey: process.env.AMAZON_SECRET_KEY,
  partnerTag: 'candidfinding-20',
  region: 'us-east-1',
  host: 'webservices.amazon.com'
};

// Categories and search terms to fetch
const SEARCH_QUERIES = [
  { category: 'Electronics', keywords: 'wireless headphones', maxResults: 5 },
  { category: 'Health & Fitness', keywords: 'fitness tracker', maxResults: 5 },
  { category: 'Home & Office', keywords: 'ergonomic chair', maxResults: 5 },
  { category: 'Kitchen', keywords: 'coffee maker', maxResults: 5 },
  { category: 'Electronics', keywords: 'action camera', maxResults: 5 },
  { category: 'Home & Office', keywords: 'laptop stand', maxResults: 5 }
];

/**
 * Mock function - Replace with actual Amazon Product Advertising API
 * Install: npm install amazon-paapi
 */
async function fetchAmazonProducts() {
  console.log('🔍 Fetching products from Amazon...');

  const dataDir = path.join(__dirname, '../public/data');
  
  // Create data directory if it doesn't exist
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const filePath = path.join(dataDir, 'initial-products.json');
  
  // Load existing products
  const products = [];
  if (fs.existsSync(filePath)) {
    try {
      const productsJSON = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const initialProducts = productsJSON?.products || [];
      products.push(...initialProducts);
    }
    catch(e) {
      console.warn(`${filePath} does not exist`);      
    }
  }

  /*
  // Example with actual Amazon PAAPI (uncomment when ready)
  const amazonPaapi = require('amazon-paapi');
  
  const commonParameters = {
    AccessKey: config.accessKey,
    SecretKey: config.secretKey,
    PartnerTag: config.partnerTag,
    PartnerType: 'Associates',
    Marketplace: 'www.amazon.com'
  };

  const allProducts = [];

  for (const query of SEARCH_QUERIES) {
    const requestParameters = {
      Keywords: query.keywords,
      SearchIndex: 'All',
      ItemCount: query.maxResults,
      Resources: [
        'Images.Primary.Large',
        'ItemInfo.Title',
        'ItemInfo.Features',
        'Offers.Listings.Price',
        'CustomerReviews.StarRating',
        'CustomerReviews.Count'
      ]
    };

    try {
      const data = await amazonPaapi.SearchItems(commonParameters, requestParameters);
      
      if (data.SearchResult && data.SearchResult.Items) {
        const items = data.SearchResult.Items.map(item => ({
          id: item.ASIN,
          title: item.ItemInfo.Title.DisplayValue,
          category: query.category,
          price: item.Offers?.Listings?.[0]?.Price?.Amount || 0,
          rating: item.CustomerReviews?.StarRating?.Value || 0,
          reviews: item.CustomerReviews?.Count || 0,
          image: item.Images?.Primary?.Large?.URL || '',
          asin: item.ASIN,
          affiliate: item.DetailPageURL,
          features: item.ItemInfo?.Features?.DisplayValues || [],
          description: item.ItemInfo?.Features?.DisplayValues?.[0] || '',
          lastUpdated: new Date().toISOString()
        }));
        
        allProducts.push(...items);
      }
    } catch (error) {
      console.error(`Error fetching ${query.keywords}:`, error.message);
    }
  }

  return allProducts;
  */

  return products;
}

/**
 * Save products to JSON file - MERGES with existing products
 */
function saveProducts(newProducts) {
  const dataDir = path.join(__dirname, '../public/data');
  
  // Create data directory if it doesn't exist
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const filePath = path.join(dataDir, 'products.json');
  
  // Load existing products
  let existingProducts = [];
  if (fs.existsSync(filePath)) {
    try {
      const existingData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      existingProducts = existingData.products || [];
      console.log(`📦 Found ${existingProducts.length} existing products`);
    } catch (error) {
      console.warn('⚠️  Could not read existing products.json, will create new file');
    }
  }

  // Create a map of existing products by ID or ASIN
  const existingMap = new Map();
  existingProducts.forEach(product => {
    const key = product.asin || product.id;
    existingMap.set(key, product);
  });

  // Merge new products with existing ones
  let addedCount = 0;
  let updatedCount = 0;

  newProducts.forEach(newProduct => {
    const key = newProduct.asin || newProduct.id;
    
    if (existingMap.has(key)) {
      // Update existing product
      existingMap.set(key, {
        ...existingMap.get(key),
        ...newProduct,
        // Keep original ID if exists
        id: existingMap.get(key).id,
        // Update timestamp
        lastUpdated: new Date().toISOString()
      });
      updatedCount++;
    } else {
      // Add new product
      existingMap.set(key, newProduct);
      addedCount++;
    }
  });

  // Convert map back to array
  const allProducts = Array.from(existingMap.values());

  const data = {
    products: allProducts,
    metadata: {
      total: allProducts.length,
      updated: new Date().toISOString()
    }
  };

  // Save minified JSON (no spaces) for production
  fs.writeFileSync(filePath, JSON.stringify(data));
  
  console.log(`✅ Saved products to ${filePath}`);
  console.log(`   - Added: ${addedCount} new products`);
  console.log(`   - Updated: ${updatedCount} existing products`);
  console.log(`   - Total: ${allProducts.length} products`);
  
  // Calculate file size
  const stats = fs.statSync(filePath);
  const fileSizeKB = (stats.size / 1024).toFixed(2);
  console.log(`   - File size: ${fileSizeKB} KB (minified)`);
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('🚀 Starting product fetch...');
    
    // Validate environment variables
    console.log('config.partnerTag: ', config.partnerTag);
    if (!config.partnerTag) {
      console.warn('⚠️  AMAZON_PARTNER_TAG not set. Using placeholder.');
    }

    const products = await fetchAmazonProducts();
    
    if (products.length === 0) {
      console.warn('⚠️  No products fetched!');
      return;
    }

    saveProducts(products);
    
    console.log('🎉 Product fetch completed successfully!');
    console.log(`   - Total products: ${products.length}`);
    console.log(`   - Categories: ${[...new Set(products.map(p => p.category))].join(', ')}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
main();