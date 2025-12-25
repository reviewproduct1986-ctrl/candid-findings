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
  partnerTag: process.env.AMAZON_PARTNER_TAG,
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
  
  // For now, using sample data
  // In production, replace with actual API calls
  const products = [
    {
      id: Date.now() + '-1',
      title: 'Premium Wireless Noise Cancelling Headphones',
      category: 'Electronics',
      price: 299.99,
      rating: 4.7,
      reviews: 12453,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
      asin: 'B08EXAMPLE1',
      affiliate: `https://amazon.com/dp/B08EXAMPLE1?tag=${config.partnerTag}`,
      badge: 'Best Seller',
      features: [
        'Active Noise Cancellation',
        '30-hour battery life',
        'Premium sound quality',
        'Comfortable fit'
      ],
      description: 'Experience premium audio with advanced noise cancellation technology.',
      lastUpdated: new Date().toISOString()
    },
    {
      id: Date.now() + '-2',
      title: 'Smart Fitness Watch with Heart Rate Monitor',
      category: 'Health & Fitness',
      price: 249.99,
      rating: 4.5,
      reviews: 8932,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
      asin: 'B08EXAMPLE2',
      affiliate: `https://amazon.com/dp/B08EXAMPLE2?tag=${config.partnerTag}`,
      badge: 'Trending',
      features: [
        'Heart rate monitoring',
        'GPS tracking',
        'Water resistant',
        '7-day battery life'
      ],
      description: 'Track your fitness goals with advanced health monitoring.',
      lastUpdated: new Date().toISOString()
    },
    {
      id: Date.now() + '-3',
      title: 'Ergonomic Office Chair with Lumbar Support',
      category: 'Home & Office',
      price: 399.99,
      rating: 4.8,
      reviews: 15621,
      image: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400&h=400&fit=crop',
      asin: 'B08EXAMPLE3',
      affiliate: `https://amazon.com/dp/B08EXAMPLE3?tag=${config.partnerTag}`,
      badge: 'Top Rated',
      features: [
        'Adjustable lumbar support',
        'Breathable mesh back',
        'Height adjustable',
        'Weight capacity: 300 lbs'
      ],
      description: 'Professional ergonomic chair designed for all-day comfort.',
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
 * Save products to JSON file
 */
function saveProducts(products) {
  const dataDir = path.join(__dirname, '../public/data');
  
  // Create data directory if it doesn't exist
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const filePath = path.join(dataDir, 'products.json');
  
  const data = {
    products,
    metadata: {
      totalProducts: products.length,
      lastUpdated: new Date().toISOString(),
      categories: [...new Set(products.map(p => p.category))]
    }
  };

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`✅ Saved ${products.length} products to ${filePath}`);
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('🚀 Starting product fetch...');
    
    // Validate environment variables
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
