#!/usr/bin/env node

/**
 * Split best-of-blogs.json into separate blog.<slug>.json files
 * Also updates products.json with slug field
 */

const fs = require('fs');
const path = require('path');

function findBestOfBlogsFile() {
  const possiblePaths = [
    path.join(__dirname, '../public/data/best-of-blogs.json'),
    path.join(__dirname, '../data/best-of-blogs.json'),
    path.join(__dirname, 'best-of-blogs.json'),
    path.join(process.cwd(), 'public/data/best-of-blogs.json'),
    path.join(process.cwd(), 'data/best-of-blogs.json'),
    path.join(process.cwd(), 'best-of-blogs.json')
  ];

  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }

  return null;
}

function loadBestOfBlogsJson(filePath) {
  console.log(`📖 Reading: ${filePath}`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  
  // Handle different structures
  if (data.posts) {
    return data.posts;
  } else if (data.blogs) {
    return data.blogs;
  } else if (Array.isArray(data)) {
    return data;
  } else {
    throw new Error('Unrecognized best-of-blogs.json structure');
  }
}

function createBackup(originalPath) {
  const backupPath = originalPath.replace('.json', '.backup.json');
  fs.copyFileSync(originalPath, backupPath);
  console.log(`✅ Backup created: ${backupPath}`);
  return backupPath;
}

function saveBlogFiles(blogs, baseDir) {
  const blogsDirPublic = path.join(baseDir, '../public/data/blogs');
  const blogsDir = path.join(baseDir, '../data/blogs');
  
  // Create blogs directories
  const dirs = [blogsDirPublic, blogsDir];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created: ${dir}`);
    }
  });

  console.log('');
  console.log('💾 Saving individual blog files...');
  
  let savedCount = 0;
  let skippedCount = 0;
  const skipped = [];

  // Save each blog as separate file
  blogs.forEach((blog, index) => {
    if (!blog.slug) {
      console.log(`   ⚠️  Skipped blog ${index + 1}: No slug found`);
      skippedCount++;
      skipped.push({ index: index + 1, title: blog.title || 'Untitled' });
      return;
    }

    const filename = `blog.${blog.slug}.json`;
    const filePathPublic = path.join(blogsDirPublic, filename);
    const filePath = path.join(blogsDir, filename);
    
    try {
      fs.writeFileSync(filePathPublic, JSON.stringify(blog));
      fs.writeFileSync(filePath, JSON.stringify(blog));
      console.log(`   ✓ ${index + 1}/${blogs.length} ${filename}`);
      savedCount++;
    } catch (error) {
      console.log(`   ✗ ${index + 1}/${blogs.length} ${filename} - Error: ${error.message}`);
      skippedCount++;
      skipped.push({ index: index + 1, title: blog.title || 'Untitled', error: error.message });
    }
  });

  console.log('');
  console.log(`✅ Saved ${savedCount} individual blog files`);
  
  if (skippedCount > 0) {
    console.log(`⚠️  Skipped ${skippedCount} blogs:`);
    skipped.forEach(item => {
      console.log(`   - Blog ${item.index}: ${item.title}${item.error ? ` (${item.error})` : ''}`);
    });
  }

  return { savedCount, skippedCount };
}

function updateProductsWithSlugs(blogs, baseDir) {
  // List of possible product file locations
  const possibleProductPaths = [
    path.join(baseDir, '../public/data/products.json'),
    path.join(baseDir, '../data/products.json'),
    path.join(baseDir, '../public/data/initial-products.json'),
    path.join(baseDir, '../data/initial-products.json'),
    path.join(baseDir, 'products.json'),
    path.join(baseDir, 'initial-products.json')
  ];

  // Find at least one products file
  let foundProductsPath = null;
  for (const p of possibleProductPaths) {
    if (fs.existsSync(p)) {
      foundProductsPath = p;
      break;
    }
  }

  if (!foundProductsPath) {
    console.log('⚠️  No product files found - skipping product update');
    return;
  }

  console.log(`📖 Reading products from: ${foundProductsPath}`);
  const productsData = JSON.parse(fs.readFileSync(foundProductsPath, 'utf-8'));
  const products = productsData.products || productsData;

  // Create a map of productId to slug
  const productSlugMap = {};
  blogs.filter(b => b.slug).forEach(blog => {
    productSlugMap[blog.productId] = blog.slug;
  });

  // Update products with blog slugs
  const updatedProducts = products.map(product => {
    if (productSlugMap[product.id]) {
      return {
        ...product,
        slug: productSlugMap[product.id]
      };
    }
    return product;
  });

  // Save updated products
  const updatedData = {
    products: updatedProducts,
    metadata: {
      total: updatedProducts.length,
      updated: new Date().toISOString()
    }
  };

  // Update ALL existing product files
  const filesToUpdate = [
    path.join(baseDir, '../public/data/products.json'),
    path.join(baseDir, '../data/products.json'),
    path.join(baseDir, '../public/data/initial-products.json'),
    path.join(baseDir, '../data/initial-products.json')
  ];

  let updatedCount = 0;
  filesToUpdate.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(updatedData));
      console.log(`✅ Updated ${filePath} with blog slugs`);
      updatedCount++;
    }
  });

  if (updatedCount === 0) {
    console.log('⚠️  No product files were updated');
  } else {
    console.log(`✅ Updated ${updatedCount} product file(s) total`);
  }
}

function main() {
  console.log('╔═══════════════════════════════════════════╗');
  console.log('║  Split best-of-blogs.json into files     ║');
  console.log('╚═══════════════════════════════════════════╝');
  console.log('');

  // Find best-of-blogs.json
  const blogsPath = findBestOfBlogsFile();
  
  if (!blogsPath) {
    console.error('❌ best-of-blogs.json not found!');
    console.error('');
    console.error('Searched in:');
    console.error('  - ./best-of-blogs.json');
    console.error('  - ./data/best-of-blogs.json');
    console.error('  - ./public/data/best-of-blogs.json');
    console.error('  - ../data/best-of-blogs.json');
    console.error('  - ../public/data/best-of-blogs.json');
    console.error('');
    process.exit(1);
  }

  try {
    // Load blogs
    const blogs = loadBestOfBlogsJson(blogsPath);
    console.log(`📦 Found ${blogs.length} blog posts`);
    console.log('');

    // Create backup
    createBackup(blogsPath);
    console.log('');

    // Get base directory
    const baseDir = path.dirname(blogsPath);

    // Save individual files
    const { savedCount, skippedCount } = saveBlogFiles(blogs, baseDir);
    
    // Update products.json with blog slugs
    updateProductsWithSlugs(blogs, baseDir);
    console.log('');

    // Summary
    console.log('╔═══════════════════════════════════════════╗');
    console.log('║              Summary                      ║');
    console.log('╚═══════════════════════════════════════════╝');
    console.log(`Total blogs:     ${blogs.length}`);
    console.log(`Saved:           ${savedCount}`);
    console.log(`Skipped:         ${skippedCount}`);
    console.log('');
    console.log('📁 Created structure:');
    console.log('   /data/blogs/');
    console.log('     ├── blog.slug-1.json');
    console.log('     ├── blog.slug-2.json');
    console.log('     └── ...');
    console.log('   /data/products.json (updated with slug)');
    console.log('   /data/initial-products.json (updated with slug)');
    console.log('   /public/data/blogs/');
    console.log('     └── (same structure)');
    console.log('');
    console.log('✅ Migration complete!');
    console.log('');
    console.log('💡 You can now delete best-of-blogs.json if everything looks good.');
    console.log('   (A backup was created: best-of-blogs.backup.json)');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ Error:', error.message);
    console.error('');
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { loadBestOfBlogsJson, saveBlogFiles, updateProductsWithSlugs };