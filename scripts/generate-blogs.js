#!/usr/bin/env node

/**
 * Generate HUMAN-SOUNDING blog posts (not AI-like!)
 * Focus: Natural voice, conversational tone, real opinions
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
  if (product.price < 50) return 2000;
  if (product.price < 100) return 2500;
  if (product.price < 300) return 3000;
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

function validateNoDynamicData(blogData) {
  const errors = [];
  const allText = [
    blogData.title,
    blogData.metaDescription,
    blogData.content,
    blogData.verdict,
    blogData.targetAudience,
    ...(blogData.pros || []),
    ...(blogData.cons || [])
  ].join(' ').toLowerCase();
  
  // Check for prices
  if (/\$\d+/.test(allText)) {
    errors.push('❌ Contains price mentions');
  }
  
  // Check for ACTUAL review counts (more specific patterns to avoid false positives)
  const reviewPatterns = [
    /\d+,\d+\s*(reviews?|ratings?)/i,      // "10,000 reviews" or "1,234 ratings"
    /\d{4,}\s*(reviews?|ratings?)/i,       // "5000 reviews" (4+ digits only)
    /thousands?\s+of\s+(reviews?|ratings?)/i, // "thousands of reviews"
    /millions?\s+of\s+(reviews?|ratings?)/i,  // "millions of reviews"
    /\d+k\+?\s*(reviews?|ratings?)/i       // "10k+ reviews" or "5k ratings"
  ];
  
  for (const pattern of reviewPatterns) {
    if (pattern.test(allText)) {
      errors.push('❌ Contains review count mentions');
      break;
    }
  }
  
  // Check for star ratings
  const ratingPatterns = [
    /\d\.?\d?\s*stars?/i,
    /\d\.?\d?\s*star rating/i,
    /\d\.?\d?\/5/i,
    /rated \d/i,
    /rating of \d/i
  ];
  
  for (const pattern of ratingPatterns) {
    if (pattern.test(allText)) {
      errors.push('❌ Contains rating mentions');
      break;
    }
  }
  
  // Check for years
  if (/\b20\d{2}\b/.test(allText)) {
    errors.push('❌ Contains year references');
  }
  
  // Check for temporal phrases
  if (/as of/i.test(allText)) {
    errors.push('❌ Contains "as of" phrases');
  }
  
  if (/\b(currently|right now|at present)\b/i.test(allText)) {
    errors.push('❌ Contains temporal words');
  }
  
  return errors;
}

function parseAIResponse(textContent) {
  console.log('   📝 Parsing response...');
  
  let cleanText = textContent
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    .trim();
  
  // Strategy 1: Direct parse (Claude followed instructions perfectly)
  try {
    const result = JSON.parse(cleanText);
    console.log('   ✅ Parsed successfully (direct)');
    return result;
  } catch (e) {
    console.log('   ⚠️  Direct parse failed:', e.message);
  }
  
  // Strategy 2: Fix unescaped quotes using targeted regex
  try {
    console.log('   🔧 Fixing unescaped quotes in content...');
    
    let fixed = cleanText;
    
    // Match pattern: ": "content with "quotes" in it"
    // We need to escape quotes that appear between the opening and closing quotes of a value
    
    // This regex finds: "field": "value..."
    // Then we escape any unescaped quotes in the value part
    fixed = fixed.replace(/"([^"\\]*(?:\\.[^"\\]*)*)"/g, (match) => {
      // This is a complete string - check if it contains unescaped quotes
      // by looking for patterns that would break JSON
      return match;
    });
    
    // Simpler approach: Replace specific problematic patterns
    // Pattern 1: word "word" word (quotes used for emphasis)
    fixed = fixed.replace(/(\w+)\s+"([^"]+)"\s+(\w+)/g, '$1 $2 $3');
    
    // Pattern 2: "text "quoted" text" -> "text \\"quoted\\" text"
    // Find content fields and fix quotes within them
    fixed = fixed.replace(/"content":\s*"([^"]*)"/g, (match, content) => {
      // This won't work for multi-line content
      // Skip this approach
      return match;
    });
    
    const result = JSON.parse(fixed);
    console.log('   ✅ Parsed successfully (fixed quotes)');
    return result;
  } catch (e) {
    console.log('   ⚠️  Quote fixing failed:', e.message);
  }
  
  // Strategy 3: Remove quotes entirely from content (aggressive but effective)
  try {
    console.log('   🔧 Removing all quotes from string values...');
    
    // This is aggressive: find all string values and remove internal quotes
    let fixed = cleanText.replace(/"(content|title|metaDescription|verdict|targetAudience)":\s*"([^]*?)"/g, (match, field, value) => {
      // Remove all quotes from the value
      const cleaned = value.replace(/"/g, '');
      return `"${field}": "${cleaned}"`;
    });
    
    const result = JSON.parse(fixed);
    console.log('   ✅ Parsed successfully (removed quotes)');
    return result;
  } catch (e) {
    console.log('   ⚠️  Quote removal failed:', e.message);
  }
  
  // Strategy 4: Fix trailing commas
  try {
    let fixed = cleanText.replace(/,(\s*[}\]])/g, '$1');
    const result = JSON.parse(fixed);
    console.log('   ✅ Parsed successfully (fixed commas)');
    return result;
  } catch (e) {
    console.log('   ⚠️  Comma fix failed:', e.message);
  }
  
  // Strategy 5: Add missing closing braces
  try {
    const start = cleanText.indexOf('{');
    let end = cleanText.lastIndexOf('}');
    
    if (start !== -1) {
      let jsonStr;
      
      if (end === -1 || end < start) {
        console.log('   🔧 Adding missing closing brace...');
        jsonStr = cleanText.substring(start) + '\n}';
      } else {
        jsonStr = cleanText.substring(start, end + 1);
      }
      
      jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');
      const result = JSON.parse(jsonStr);
      console.log('   ✅ Parsed successfully (added brace)');
      return result;
    }
  } catch (e) {
    console.log('   ⚠️  Brace fix failed:', e.message);
  }
  
  // All failed - save debug file
  const debugPath = path.join(__dirname, `debug-response-${Date.now()}.txt`);
  fs.writeFileSync(debugPath, textContent);
  
  console.error('');
  console.error(`   ❌ Could not parse JSON!`);
  console.error(`   💾 Saved to: ${debugPath}`);
  console.error('   🔄 Will retry with different prompt...');
  console.error('');
  
  throw new Error(`JSON parsing failed - see ${debugPath}`);
}

async function generateBlogPost(product, attempt = 1) {
  console.log(`Generating blog: ${product.title} (attempt ${attempt})`);
  
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
        system: `You are a real person writing honest product reviews on your blog.

CRITICAL STYLE RULES:
- Write like a REAL person, not an AI
- Use conversational, natural language
- Include personal observations and opinions
- Vary your sentence structure (some short, some long)
- Use contractions (it's, don't, can't, you'll)
- Add occasional first-person perspective (I found, In my experience)
- Be relatable and friendly
- Skip overly formal language
- Natural transitions, not robotic ones

ABSOLUTELY AVOID:
- Formulaic AI phrases like "standout feature" or "One of the most appealing aspects"
- Generic intros like "In today's market" or "When it comes to"
- Predictable headers like "Introduction" and "Conclusion"
- Overly structured, listy writing
- Corporate/marketing speak
- Perfect grammar at expense of naturalness

CRITICAL FOR JSON OUTPUT:
- NEVER use quotation marks (") in your content
- Use apostrophes freely (it's, don't, they're)
- Instead of "quoted text" write: quoted text or so-called text
- Example: Instead of He said "hello" write: He said hello
- This prevents JSON parsing errors`,
        messages: [
          {
            role: "user",
            content: `Write an honest, natural product review like a real person would write.

Product: ${safeTitle}
Category: ${product.category}
Features: ${product.features?.join(', ') || 'N/A'}

WRITING STYLE (CRITICAL):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write like you're telling a friend about this product!

✅ GOOD EXAMPLES (Natural, Human):
"Look, I'm just going to say it upfront - this thing actually works."
"Here's what surprised me most about this..."
"If you're like me and hate dealing with complicated setups, you'll appreciate this."
"The build quality? Solid. Not amazing, but definitely good enough."
"Is it perfect? Nope. But here's why I still recommend it."

❌ BAD EXAMPLES (AI-like, Avoid):
"The standout feature of this product is its innovative design."
"In today's competitive market, this offers exceptional value."
"One of the most appealing aspects is the comprehensive feature set."
"When it comes to performance, this delivers on multiple fronts."
"This represents a significant advancement in the category."

STRUCTURE RULES:
- Skip generic "Introduction" headers
- Start with something interesting or an opinion
- Use natural section headers ("What I Liked", "The Not-So-Great Parts", "Who Should Get This")
- Mix up sentence lengths
- Include some personal perspective (I noticed, In my testing, From what I can tell)
- End with honest recommendation, not a sales pitch

TONE RULES:
- Conversational, not corporate
- Honest, even about flaws
- Relatable language
- Some personality
- Natural flow

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CONTENT PROHIBITIONS (Will Be Validated):
❌ NO prices or dollar amounts
❌ NO review counts or numbers of reviews
❌ NO star ratings or numerical ratings
❌ NO specific years or dates
❌ NO "as of", "currently", "right now"

Instead write about:
✅ Features and how they work
✅ Real-world use cases
✅ Build quality and materials
✅ What works well and what doesn't
✅ Who this is actually good for

Requirements:
1. Natural, engaging title (sound like a real review, not SEO spam)
2. Meta description (150-160 chars, conversational)
3. Review content (700-900 words) in MARKDOWN
   - Use ## for sections (but make them natural, not generic)
   - Start strong, no boring intro
   - Mix opinion with facts
   - Real-world usage examples
   - Honest pros and cons
4. 7 specific pros (be specific, not generic)
5. 3-4 specific cons (real issues, not fake balance)
6. Honest verdict (2-3 sentences, your real opinion)
7. Target audience (who will actually benefit)
8. 8-10 SEO keywords
9. URL slug (lowercase-with-hyphens)

CRITICAL OUTPUT FORMAT:
- Return ONLY valid JSON
- NO markdown code fences  
- NO text before or after JSON
- AVOID using quotation marks in your content (use single quotes or rephrase)
- If you must use quotes, they will be automatically escaped
- Use apostrophes freely (they're, don't, can't)
- NO trailing comma after targetAudience

Example of what to AVOID in content:
❌ He said "this is great" → Use: He said this is great
❌ The "best" option → Use: The best option or The so-called best option
✅ It's amazing → OK!
✅ Don't miss it → OK!

OUTPUT FORMAT:
{
  "title": "Natural review title here",
  "slug": "product-slug",
  "metaDescription": "Conversational description",
  "content": "Natural markdown content",
  "keywords": ["keyword1", "keyword2"],
  "pros": ["Specific pro 1", "Specific pro 2"],
  "cons": ["Real con 1", "Real con 2"],
  "verdict": "Honest 2-3 sentence opinion",
  "targetAudience": "Who actually needs this"
}

CRITICAL JSON RULES:
✓ Must end with closing brace }
✓ NO comma after targetAudience (last field)
✓ Ensure JSON is COMPLETE
✓ All strings properly closed
✓ All braces matched

REMEMBER: 
- Write like a human, not an AI
- No prices, ratings, reviews, dates
- Be honest and natural
- Skip the corporate speak
- COMPLETE the JSON with closing brace!`
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
    
    const blogData = parseAIResponse(textContent);

    if (blogData.content) {
      blogData.content = cleanMarkdown(blogData.content);
    }

    const validationErrors = validateNoDynamicData(blogData);
    
    if (validationErrors.length > 0) {
      console.log('   ⚠️  VALIDATION FAILED:');
      validationErrors.forEach(err => console.log(`      ${err}`));
      
      if (attempt < 3) {
        console.log(`   🔄 Retrying (attempt ${attempt + 1}/3)...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return await generateBlogPost(product, attempt + 1);
      } else {
        console.log('   ❌ Max retries reached. Skipping.');
        return null;
      }
    }

    console.log('   ✅ Validation passed!');
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
  console.log(`🤖 Generating HUMAN-LIKE blogs for ${productsNeedingBlogs.length} products...`);
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
    } else {
      failCount++;
      failedProducts.push(product.title);
    }
    
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
  
  fs.writeFileSync(jsonPathPublic, JSON.stringify(blogsData));
  fs.writeFileSync(jsonPath, JSON.stringify(blogsData));
  
  console.log(`✅ Saved ${blogPosts.length} blog posts`);
}

async function main() {
  try {
    console.log('╔═══════════════════════════════════════════╗');
    console.log('║  Human-Like Blog Generator                ║');
    console.log('╚═══════════════════════════════════════════╝');
    console.log('');
    console.log('🎯 Features:');
    console.log('   - Natural, conversational writing');
    console.log('   - Personal voice and opinions');
    console.log('   - NO AI-sounding phrases');
    console.log('   - Validation for dynamic data');
    console.log('');
    
    if (!ANTHROPIC_API_KEY || ANTHROPIC_API_KEY === 'YOUR_KEY_HERE') {
      console.error('❌ Please set ANTHROPIC_API_KEY!');
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
    console.log('✅ Blogs sound human, not AI!');
    console.log('   - Natural, conversational tone');
    console.log('   - Personal observations');
    console.log('   - No corporate speak');
    console.log('');
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

main();