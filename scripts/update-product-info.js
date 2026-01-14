#!/usr/bin/env node

/**
 * Simple Product Editor - Manual input with dot notation
 */

const fs = require('fs');
const readline = require('readline');
const { exec } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function openBrowser(url) {
  if (!url) return;
  const platform = process.platform;
  let command;
  if (platform === 'darwin') command = `open "${url}"`;
  else if (platform === 'win32') command = `start "" "${url}"`;
  else command = `xdg-open "${url}"`;
  exec(command);
}

async function main() {
  console.log(`${colors.bright}${colors.cyan}Simple Product Editor${colors.reset}\n`);
  
  // Load files
  const productsPath = './public/data/products.json';
  const initialProductsPath = './public/data/initial-products.json';
  
  if (!fs.existsSync(productsPath)) {
    console.log(`${colors.red}Error: products.json not found!${colors.reset}`);
    rl.close();
    return;
  }
  
  const data = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
  const products = data.products || [];
  
  let initialData = null;
  const hasInitial = fs.existsSync(initialProductsPath);
  if (hasInitial) {
    initialData = JSON.parse(fs.readFileSync(initialProductsPath, 'utf8'));
    console.log(`${colors.green}✓ Will update both files${colors.reset}\n`);
  }
  
  console.log(`Loaded ${products.length} products\n`);
  
  let modified = 0;
  const failed = [];
  
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    
    console.log('═'.repeat(70));
    console.log(`${colors.bright}${i + 1}/${products.length}: ${product.title}${colors.reset}`);
    console.log('═'.repeat(70));
    
    // Show current info
    console.log(`${colors.cyan}Current:${colors.reset}`);
    console.log(`  Price:   $${product.price?.toFixed(2) || 'N/A'}`);
    console.log(`  Rating:  ${product.rating?.toFixed(1) || 'N/A'} ⭐`);
    console.log(`  Reviews: ${product.reviews?.toLocaleString() || 'N/A'}`);
    
    // Open browser automatically
    console.log(`\n${colors.green}Opening in browser...${colors.reset}`);
    openBrowser(product.affiliate);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Ask for input
    console.log(`\n${colors.yellow}Enter [price rating reviews] or . to skip${colors.reset}`);
    console.log(`${colors.yellow}Use . as placeholder to keep existing value${colors.reset}`);
    console.log(`${colors.cyan}Examples:${colors.reset}`);
    console.log(`  ${colors.green}.${colors.reset}           = Skip (no changes)`);
    console.log(`  ${colors.green}69.99 4.6 1500${colors.reset} = Update all three`);
    console.log(`  ${colors.green}69.99 . .${colors.reset}      = Update price only`);
    console.log(`  ${colors.green}. 4.6 .${colors.reset}        = Update rating only`);
    console.log(`  ${colors.green}. . 1500${colors.reset}       = Update reviews only`);
    
    const input = await question(`\n${colors.cyan}> ${colors.reset}`);
    const trimmed = input.trim();
    
    // Check if skip (single dot or empty)
    if (trimmed === '.' || trimmed === '') {
      console.log(`${colors.yellow}Skipped${colors.reset}\n`);
      continue;
    }
    
    // Parse input
    const parts = trimmed.split(/\s+/);
    let updated = false;
    
    // Update price
    if (parts.length >= 1 && parts[0] !== '.') {
      const price = parseFloat(parts[0]);
      if (!isNaN(price) && price > 0) {
        product.price = price;
        console.log(`${colors.green}✓ Price: $${price.toFixed(2)}${colors.reset}`);
        updated = true;
      }
    }
    
    // Update rating
    if (parts.length >= 2 && parts[1] !== '.') {
      const rating = parseFloat(parts[1]);
      if (!isNaN(rating) && rating >= 0 && rating <= 5) {
        product.rating = rating;
        console.log(`${colors.green}✓ Rating: ${rating}${colors.reset}`);
        updated = true;
      }
    }
    
    // Update reviews
    if (parts.length >= 3 && parts[2] !== '.') {
      const reviews = parseInt(parts[2]);
      if (!isNaN(reviews) && reviews >= 0) {
        product.reviews = reviews;
        console.log(`${colors.green}✓ Reviews: ${reviews.toLocaleString()}${colors.reset}`);
        updated = true;
      }
    }
    
    if (updated) {
      product.lastUpdated = new Date().toISOString();
      product.priceUpdated = new Date().toISOString();
      modified++;
      console.log(`${colors.green}✓ Updated (timestamp added)${colors.reset}`);
    }
    
    // Check for issues
    if (!product.affiliate || !product.affiliate.includes('amazon.com')) {
      failed.push(product.affiliate);
    }
    
    console.log('');
  }
  
  // Save both files
  console.log(`\n${colors.green}Saving...${colors.reset}`);
  fs.writeFileSync(productsPath, JSON.stringify(data, null, 2));
  console.log(`${colors.green}✓ Saved products.json${colors.reset}`);
  
  if (hasInitial && initialData) {
    initialData.products = products;
    fs.writeFileSync(initialProductsPath, JSON.stringify(initialData, null, 2));
    console.log(`${colors.green}✓ Saved initial-products.json${colors.reset}`);
  }
  
  // Summary
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`${colors.bright}SUMMARY${colors.reset}`);
  console.log(`${'═'.repeat(70)}`);
  console.log(`Total:    ${products.length}`);
  console.log(`Modified: ${modified}`);
  console.log(`Skipped:  ${products.length - modified}`);
  
  if (failed.length > 0) {
    console.log(`\n${colors.red}Failed URLs:${colors.reset} ${failed.length}`);
    fs.writeFileSync('failed-products.txt', failed.join('\n'));
    console.log(`${colors.yellow}Saved to: failed-products.txt${colors.reset}`);
  }
  
  console.log('');
  rl.close();
}

main().catch(error => {
  console.error(`${colors.red}Error:${colors.reset}`, error);
  rl.close();
  process.exit(1);
});