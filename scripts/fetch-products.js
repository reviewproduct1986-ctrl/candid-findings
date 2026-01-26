#!/usr/bin/env node

/**
 * Fetch products from Amazon Product Advertising API
 * and save them to data/products.json
 */

const fs = require('fs');
const path = require('path');

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
    if (!process.env.AMAZON_TAG) {
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