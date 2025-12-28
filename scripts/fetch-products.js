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
  
  const products = [
    {
      id: Date.now() + '-1',
      title: 'Apple AirPods Pro 2 Wireless Earbuds',
      category: 'Electronics',
      price: 199,
      listPrice: 249,
      rating: 4.6,
      reviews: 43120,
      image: 'https://m.media-amazon.com/images/I/61SUj2aKoEL._AC_SX679_.jpg',
      asin: 'B0D1XD1ZV3',
      affiliate: `https://amazon.com/dp/B0D1XD1ZV3?tag=${config.partnerTag}`,
      badge: 'Best Seller',
      features: [
        'PIONEERING HEARING',
        'INTELLIGENT NOISE CONTROL',
        'CUSTOMIZABLE FIT',
        'WATER RESISTANT',
        'PERSONALIZED SPATIAL AUDIO'
      ],
      description: '',
      lastUpdated: new Date().toISOString()
    },
    // {
    //   id: Date.now() + '-2',
    //   title: 'Apple 2025 MacBook Air 13-inch Laptop',
    //   category: 'Electronics',
    //   price: 799,
    //   listPrice: 999,
    //   rating: 4.8,
    //   reviews: 4794,
    //   image: 'https://m.media-amazon.com/images/I/71cWZUr9SVL._AC_SX522_.jpg',
    //   asin: 'B0DZD9S5GC',
    //   affiliate: `https://amazon.com/dp/B0DZD9S5GC?tag=${config.partnerTag}`,
    //   badge: 'Best Seller',
    //   features: [
    //     'SPEED OF LIGHTNESS',
    //     'SUPERCHARGED BY M4',
    //     'BUILT FOR APPLE INTELLIGENCE',
    //     'LOOK AND SOUND YOUR BEST',
    //     'A BRILLIANT DISPLAY'
    //   ],
    //   description: '',
    //   lastUpdated: new Date().toISOString()
    // },
    {
      id: Date.now() + '-3',
      title: 'The Housemaid: An absolutely addictive psychological thriller with a jaw-dropping twist ',
      category: 'Books',
      price: 23.5,
      rating: 4.5,
      reviews: 598079,
      image: 'https://m.media-amazon.com/images/I/81G1WltKQGL._SY466_.jpg',
      asin: '0349132852',
      affiliate: `https://amazon.com/dp/0349132852?tag=${config.partnerTag}`,
      badge: 'Best Seller',
      features: [
        '#1 New York Times'
      ],
      description: '',
      lastUpdated: new Date().toISOString()
    },
    {
      id: Date.now() + '-4',
      title: "The Let Them Theory: A Life-Changing Tool That Millions of People Can't Stop Talking About",
      category: 'Books',
      price: 14.99,
      rating: 4.6,
      reviews: 33469,
      image: 'https://m.media-amazon.com/images/I/91ZVf3kNrcL._SY466_.jpg',
      asin: '1401971369',
      affiliate: `https://amazon.com/dp/1401971369?tag=${config.partnerTag}`,
      badge: 'Best Seller',
      features: [
        'Over 7 Million Copies Sold!'
      ],
      description: '',
      lastUpdated: new Date().toISOString()
    },
    {
      id: Date.now() + '-5',
      title: "Owala FreeSip Insulated Stainless Steel Water Bottle with Straw, BPA-Free Sports Water Bottle, Great for Travel, 32 Oz, Black Cherry",
      category: 'Sports',
      price: 34.94,
      rating: 4.7,
      reviews: 101276,
      image: 'https://m.media-amazon.com/images/I/61cXY4wGQSL._AC_SX679_.jpg',
      asin: 'B0FK1LF5PM',
      affiliate: `https://amazon.com/dp/B0FK1LF5PM?tag=${config.partnerTag}`,
      badge: 'Best Seller',
      features: [
        '32-ounce insulated stainless-steel water bottle',
        'Patented FreeSip spout design',
        'Protective push-to-open lid',
        'Double-wall insulation',
        'BPA and phthalate-free'
      ],
      description: '',
      lastUpdated: new Date().toISOString()
    },
    {
      id: Date.now() + '-6',
      title: "Boxbollen® Boxing Reflex Ball - Celebrity-Endorsed Home Workout Game - App-Connected Punch Counter - Hand Eye Coordination Training Ball - Christmas Gift for Boxers, All Ages - Stocking Stuffer",
      category: 'Sports',
      price: 25.4,
      listPrice: 29.99,
      rating: 4.0,
      reviews: 9465,
      image: 'https://m.media-amazon.com/images/I/6168dfLpdnL._AC_SX679_.jpg',
      asin: 'B0BZ8MB4KM',
      affiliate: `https://amazon.com/dp/B0BZ8MB4KM?tag=${config.partnerTag}`,
      badge: 'Best Seller',
      features: [
        'IMPROVE HAND-EYE COORDINATION',
        'INTERACTIVE BOXBALL APP',
        'STOCKING STUFFER',
        'CELEBRITY-USED',
        'QUALITY AND DURABILITY'
      ],
      description: '',
      lastUpdated: new Date().toISOString()
    },
    {
      id: Date.now() + '-7',
      title: "Best Choice Products Heated Shiatsu Foot Massager for Pain Relief, Plantar Fasciitis, Neuropathy, Blood Circulation w/Compact Design - Satin Black",
      category: 'Health & Household',
      price: 89.99,
      listPrice: 129.99,
      rating: 4.3,
      reviews: 7893,
      image: 'https://m.media-amazon.com/images/I/81eUUEK-MQL._AC_SX679_.jpg',
      asin: 'B08M6G51XP',
      affiliate: `https://amazon.com/dp/B08M6G51XP?tag=${config.partnerTag}`,
      features: [
        'TRY ALL FOUR MASSAGES',
        '360-DEGREE HANDLE',
        'BUILT-IN HEAT THERAPY:',
        'SCREEN AND REMOTE FUNCTIONALITY'
      ],
      description: '',
      lastUpdated: new Date().toISOString()
    }
  ];

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