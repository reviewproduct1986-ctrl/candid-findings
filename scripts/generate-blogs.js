#!/usr/bin/env node

/**
 * Generate SEO-optimized blog posts for products using Claude AI
 * IMPROVED: Better JSON parsing with actual error recovery
 */

// node --env-file=scripts/.env scripts/generate-blogs.js

const fs = require('fs');
const path = require('path');

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

function loadProducts() {
  const publicPath = path.join(__dirname, '../public/data/products.json');
  const dataPath = path.join(__dirname, '../data/products.json');
  
  let filePath = publicPath;
  if (!fs.existsSync(publicPath) && fs.existsSync(dataPath)) {
    filePath = dataPath;
  }
  
  if (!fs.existsSync(filePath)) {
    console.error('❌ products.json not found!');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  return data.products || data;
}

function loadExistingBlogs() {
  const publicPath = path.join(__dirname, '../public/data/blogs.json');
  const dataPath = path.join(__dirname, '../data/blogs.json');
  
  let filePath = publicPath;
  if (!fs.existsSync(publicPath) && fs.existsSync(dataPath)) {
    filePath = dataPath;
  }
  
  if (!fs.existsSync(filePath)) {
    return { posts: [], metadata: {} };
  }

  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function getOptimalTokens(product) {
  if (product.price < 50) return 1500;
  if (product.price < 100) return 2000;
  if (product.price < 300) return 2500;
  if (product.price < 500) return 3000;
  return 3500;
}

function cleanMarkdown(content) {
  if (!content) return '';
  
  return content
    .replace(/## ##/g, '##')
    .replace(/### ###/g, '###')
    .replace(/#### ####/g, '####')
    .replace(/# #/g, '#')
    .replace(/\\#/g, '#')
    .replace(/\n\n\n+/g, '\n\n')
    .trim();
}

/**
 * IMPROVED: Parse JSON with multiple strategies and better error reporting
 */
function parseAIResponse(textContent) {
  console.log('   📝 Parsing AI response...');
  
  // Remove markdown code fences first
  let cleanText = textContent
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    .trim();
  
  // Strategy 1: Direct parse (cleanest response)
  try {
    const result = JSON.parse(cleanText);
    console.log('   ✅ Parsed successfully (direct)');
    return result;
  } catch (e) {
    console.log('   ⚠️  Direct parse failed');
  }
  
  // Strategy 2: Extract JSON block
  try {
    const start = cleanText.indexOf('{');
    const end = cleanText.lastIndexOf('}');
    
    if (start !== -1 && end !== -1 && end > start) {
      const jsonStr = cleanText.substring(start, end + 1);
      const result = JSON.parse(jsonStr);
      console.log('   ✅ Parsed successfully (extracted)');
      return result;
    }
  } catch (e) {
    console.log('   ⚠️  Extraction failed');
  }
  
  // Strategy 3: Find error and try to fix
  try {
    let jsonStr = cleanText;
    const start = jsonStr.indexOf('{');
    const end = jsonStr.lastIndexOf('}');
    
    if (start !== -1 && end !== -1) {
      jsonStr = jsonStr.substring(start, end + 1);
    }
    
    // Attempt parse to get error position
    try {
      return JSON.parse(jsonStr);
    } catch (parseError) {
      // Extract error position
      const posMatch = parseError.message.match(/position (\d+)/);
      if (posMatch) {
        const errorPos = parseInt(posMatch[1]);
        
        // Show error context
        const contextStart = Math.max(0, errorPos - 80);
        const contextEnd = Math.min(jsonStr.length, errorPos + 80);
        const context = jsonStr.substring(contextStart, contextEnd);
        
        console.log('   ⚠️  JSON error at position', errorPos);
        console.log('   📍 Context:', context);
      }
      
      throw parseError;
    }
  } catch (e) {
    console.log('   ⚠️  Fix attempt failed');
  }
  
  // All strategies failed - save for debugging
  console.error('   ❌ All parsing strategies failed!');
  
  const debugPath = path.join(__dirname, `debug-response-${Date.now()}.txt`);
  fs.writeFileSync(debugPath, textContent);
  console.error(`   💾 Saved response to: ${debugPath}`);
  console.error('');
  console.error('   🔍 Check the debug file to see what Claude returned');
  console.error('');
  
  throw new Error(`JSON parsing failed. Check ${debugPath}`);
}

/**
 * IMPROVED: Generate blog with better prompt to avoid JSON issues
 */
async function generateBlogPost(product) {
  console.log('Generating blog for:', product.title);
  console.log('   Tokens:', getOptimalTokens(product));
  const currentYear = new Date().getFullYear();

  // Clean product title for prompt (escape special chars)
  const safeTitle = product.title.replace(/'/g, '').replace(/"/g, '');

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: getOptimalTokens(product),
        messages: [
          {
            role: "user",
            content: `Write a comprehensive, SEO-optimized blog post review.

Product: ${safeTitle}
Category: ${product.category}
Price: $${product.price}
Rating: ${product.rating}/5 (${product.reviews.toLocaleString()} reviews)
Features: ${product.features?.join(', ') || 'N/A'}
ASIN: ${product.asin || 'N/A'}
Year: ${currentYear}

Requirements:
1. Engaging headline (60-70 chars)
2. Meta description (150-160 chars)
3. Review content in MARKDOWN with:
   - Introduction with key benefits
   - Multiple h2 sections (use ##)
   - Real-world use cases
   - Performance analysis
4. 7 specific pros
5. 3-4 specific cons
6. Final verdict (3-4 sentences)
7. Target audience paragraph
8. 8-10 SEO keywords
9. URL slug (lowercase-with-hyphens)

CRITICAL - OUTPUT FORMAT:
- Return ONLY valid JSON
- NO text before or after JSON
- NO markdown code fences
- Use ONLY single ## for headings
- Avoid apostrophes - use "do not" not "dont"
- Avoid quotes in content where possible
- If quotes needed, escape them properly

JSON structure:
{
  "title": "Product Review Title Here",
  "slug": "product-review-slug",
  "metaDescription": "Description here",
  "content": "Markdown content here",
  "keywords": ["keyword1", "keyword2"],
  "pros": ["First pro", "Second pro"],
  "cons": ["First con", "Second con"],
  "verdict": "Final verdict text",
  "targetAudience": "Who should buy"
}

Write 600-800 words. Be specific with numbers and details.`
          }
        ],
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const textContent = data.content.find(c => c.type === "text")?.text || "";
    
    // Parse with improved error handling
    const blogData = parseAIResponse(textContent);

    // Clean the markdown content
    if (blogData.content) {
      blogData.content = cleanMarkdown(blogData.content);
      console.log(`   🧹 Cleaned markdown`);
    }

    console.log(`   ✅ Generated ${blogData.content?.length || 0} characters`);

    return {
      id: `blog-${product.id}`,
      productId: product.id,
      asin: product.asin,
      ...blogData,
      publishedDate: new Date().toISOString(),
      updatedDate: new Date().toISOString()
    };

  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    
    if (error.message.includes('JSON')) {
      console.error('');
      console.error('   💡 TIP: Claude returned invalid JSON.');
      console.error('      Check the debug-response-*.txt file.');
      console.error('      You can retry this product.');
      console.error('');
    }
    
    return null;
  }
}

async function generateMissingBlogs(products, existingBlogs) {
  const existingProductIds = new Set(existingBlogs.posts.map(b => b.productId));
  const productsNeedingBlogs = products.filter(p => !existingProductIds.has(p.id));
  
  if (productsNeedingBlogs.length === 0) {
    console.log('✅ All products already have blog posts!');
    return existingBlogs.posts;
  }

  console.log('');
  console.log(`🤖 Generating blogs for ${productsNeedingBlogs.length} products...`);
  console.log('');
  
  const newBlogPosts = [];
  let successCount = 0;
  let failCount = 0;
  const failedProducts = [];
  
  for (let i = 0; i < productsNeedingBlogs.length; i++) {
    const product = productsNeedingBlogs[i];
    console.log(`\n[${i + 1}/${productsNeedingBlogs.length}] ${product.title}`);
    
    const blog = await generateBlogPost(product);
    if (blog) {
      newBlogPosts.push(blog);
      successCount++;
      console.log(`   ✅ Success!`);
    } else {
      failCount++;
      failedProducts.push(product.title);
      console.log(`   ❌ Failed - will skip`);
    }
    
    // Delay between requests
    if (i < productsNeedingBlogs.length - 1) {
      const delay = 3000;
      console.log(`   ⏳ Waiting ${delay/1000}s...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  console.log('');
  console.log('═══════════════════════════════════════');
  console.log('📊 GENERATION SUMMARY');
  console.log('═══════════════════════════════════════');
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed:  ${failCount}`);
  
  if (failedProducts.length > 0) {
    console.log('');
    console.log('Failed products:');
    failedProducts.forEach((title, i) => {
      console.log(`  ${i + 1}. ${title}`);
    });
    console.log('');
    console.log('💡 You can run this script again to retry failed products');
  }
  
  console.log('═══════════════════════════════════════');
  console.log('');

  return [...existingBlogs.posts, ...newBlogPosts];
}

function saveBlogPosts(blogPosts) {
  const dataDirPublic = path.join(__dirname, '../public/data');
  const dataDir = path.join(__dirname, '../data');
  
  if (!fs.existsSync(dataDirPublic)) {
    fs.mkdirSync(dataDirPublic, { recursive: true });
  }
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const blogsData = {
    posts: blogPosts,
    metadata: {
      total: blogPosts.length,
      updated: new Date().toISOString()
    }
  };
  
  const jsonPathPublic = path.join(dataDirPublic, 'blogs.json');
  const jsonPath = path.join(dataDir, 'blogs.json');
  
  fs.writeFileSync(jsonPathPublic, JSON.stringify(blogsData, null, 2));
  fs.writeFileSync(jsonPath, JSON.stringify(blogsData, null, 2));
  
  console.log(`✅ Saved ${blogPosts.length} blog posts to blogs.json`);
}

async function main() {
  try {
    console.log('╔════════════════════════════════════════╗');
    console.log('║   Blog Generator (Improved Parsing)   ║');
    console.log('╚════════════════════════════════════════╝');
    console.log('');
    
    if (!ANTHROPIC_API_KEY || ANTHROPIC_API_KEY === 'YOUR_KEY_HERE') {
      console.error('❌ Please add your Anthropic API key to this script!');
      process.exit(1);
    }

    const products = loadProducts();
    console.log(`📦 Loaded ${products.length} products`);

    const existingBlogs = loadExistingBlogs();
    console.log(`📄 Found ${existingBlogs.posts.length} existing blogs`);

    const allBlogs = await generateMissingBlogs(products, existingBlogs);
    
    if (allBlogs.length === 0) {
      console.warn('⚠️  No blog posts to save!');
      return;
    }

    saveBlogPosts(allBlogs);
    
    console.log('🎉 Generation complete!');
    console.log('');
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

main();