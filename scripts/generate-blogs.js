#!/usr/bin/env node

/**
 * Generate SEO-optimized blog posts for products using Claude AI
 * FIXED: Better JSON parsing and quote handling
 */

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
 * Parse JSON with better error handling
 * FIX: Handles unescaped quotes and malformed JSON
 */
function parseAIResponse(textContent) {
  // Remove markdown code fences
  let cleanJson = textContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  
  try {
    // Try normal parsing first
    return JSON.parse(cleanJson);
  } catch (error) {
    console.log('   ⚠️  JSON parsing failed, attempting to fix...');
    
    // Try to extract JSON from the response
    const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanJson = jsonMatch[0];
      
      try {
        return JSON.parse(cleanJson);
      } catch (error2) {
        console.error('   ❌ Could not parse JSON even after extraction');
        console.error('   Error:', error2.message);
        
        // Save the problematic response for debugging
        const debugPath = path.join(__dirname, 'debug-response.txt');
        fs.writeFileSync(debugPath, textContent);
        console.error(`   💾 Saved problematic response to: ${debugPath}`);
        
        throw new Error('JSON parsing failed - see debug-response.txt');
      }
    }
    
    throw error;
  }
}

/**
 * Generate blog post with improved error handling
 */
async function generateBlogPost(product) {
  console.log('Generating blog for:', product.title);
  console.log('   Tokens:', getOptimalTokens(product));
  
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
            content: `Write a comprehensive, SEO-optimized blog post review about this product:

Product: ${product.title}
Category: ${product.category}
Price: $${product.price}
Rating: ${product.rating}/5 (${product.reviews.toLocaleString()} reviews)
Features: ${product.features?.join(', ') || 'N/A'}
Description: ${product.description || ''}
ASIN: ${product.asin || 'N/A'}

Requirements:
1. Engaging, SEO-friendly headline (60-70 characters)
2. Meta description (150-160 characters)
3. Comprehensive review in MARKDOWN format with:
   - Introduction highlighting key benefits
   - Multiple h2 sections (##) for detailed features
   - Real-world use cases
   - Detailed analysis of performance
4. 7 specific pros (not generic)
5. 3-4 specific cons
6. Final verdict paragraph (3-4 sentences)
7. Target audience paragraph (who should buy this)
8. 8-10 SEO keywords
9. URL slug (lowercase, hyphens, include product name and "review")

CRITICAL FORMATTING RULES:
- Use ONLY single ## for h2 headings (NOT ## ##)
- Do NOT use quotes in text unless absolutely necessary
- If you must use quotes, use single quotes (') not double quotes (")
- Avoid apostrophes in contractions - write "do not" instead of "don't"
- Write 600-800 words of actual review content
- Be specific about features, not generic
- Include numbers and specific details

Format ONLY as valid JSON with NO special characters in strings:
{
  "title": "Product Name Review...",
  "slug": "product-name-review",
  "metaDescription": "Brief description without quotes",
  "content": "Full markdown content...",
  "keywords": ["keyword1", "keyword2"],
  "pros": ["First pro", "Second pro"],
  "cons": ["First con", "Second con"],
  "verdict": "Final verdict text",
  "targetAudience": "Who should buy this"
}

IMPORTANT: Ensure all text fields avoid special characters that would break JSON parsing.`
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
    
    // Parse with better error handling
    const blogData = parseAIResponse(textContent);

    // Clean the markdown content
    if (blogData.content) {
      blogData.content = cleanMarkdown(blogData.content);
      console.log(`   🧹 Cleaned markdown content`);
    }

    return {
      id: `blog-${product.id}`,
      productId: product.id,
      asin: product.asin,
      ...blogData,
      publishedDate: new Date().toISOString(),
      updatedDate: new Date().toISOString()
    };

  } catch (error) {
    console.error(`❌ Error generating blog for ${product.title}:`);
    console.error(`   ${error.message}`);
    
    if (error.message.includes('JSON')) {
      console.error('');
      console.error('💡 TIP: The AI generated invalid JSON, likely due to unescaped quotes.');
      console.error('   Retrying might work, or check debug-response.txt for details.');
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
  console.log(`🤖 Generating blog posts for ${productsNeedingBlogs.length} products...`);
  console.log('');
  
  const newBlogPosts = [];
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < productsNeedingBlogs.length; i++) {
    const product = productsNeedingBlogs[i];
    console.log(`[${i + 1}/${productsNeedingBlogs.length}] ${product.title}`);
    
    const blog = await generateBlogPost(product);
    if (blog) {
      newBlogPosts.push(blog);
      successCount++;
      console.log(`   ✅ Success! (${blog.content.length} characters)`);
    } else {
      failCount++;
      console.log(`   ❌ Failed - skipping`);
    }
    
    if (i < productsNeedingBlogs.length - 1) {
      console.log('   ⏳ Waiting 2s...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('');
  console.log('📊 SUMMARY:');
  console.log(`   Success: ${successCount}`);
  console.log(`   Failed: ${failCount}`);
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
  
  console.log(`✅ Saved ${blogPosts.length} blog posts`);
}

async function main() {
  try {
    console.log('🚀 Blog Generation (Fixed JSON Parsing)');
    console.log('');
    
    if (!ANTHROPIC_API_KEY) {
      console.error('❌ API key not set!');
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
    
    console.log('🎉 Complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();