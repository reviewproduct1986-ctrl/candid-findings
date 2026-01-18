/**
 * Generate HUMAN-SOUNDING content for Best-Of blog posts
 * Focus: Natural recommendations, conversational tone, real opinions
 */

// node --env-file=secrets/.script.env scripts/generate-best-of-content.js

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

function loadBestOfBlogs() {
  const publicPath = path.join(__dirname, '../public/data/best-of-blogs.json');
  const dataPath = path.join(__dirname, '../data/best-of-blogs.json');
  
  let filePath = publicPath;
  if (!fs.existsSync(publicPath) && fs.existsSync(dataPath)) {
    filePath = dataPath;
  }
  
  if (!fs.existsSync(filePath)) {
    console.error('❌ best-of-blogs.json not found!');
    console.log('');
    console.log('Create it with this structure:');
    console.log(JSON.stringify({
      posts: [
        {
          title: "Your Blog Title",
          slug: "your-slug",
          metaDescription: "Description",
          keywords: ["keyword1", "keyword2"],
          category: "Technology",
          products: [
            { asin: "ASIN123", content: "" }
          ],
          publishedDate: new Date().toISOString()
        }
      ]
    }, null, 2));
    process.exit(1);
  }

  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
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

function validateNoDynamicData(content) {
  const errors = [];
  const allText = content.toLowerCase();
  
  // Check for prices
  if (/\$\d+/.test(allText)) {
    errors.push('❌ Contains price mentions');
  }
  
  // Check for review counts
  const reviewPatterns = [
    /\d+,\d+\s*(reviews?|ratings?)/i,
    /\d{4,}\s*(reviews?|ratings?)/i,
    /thousands?\s+of\s+(reviews?|ratings?)/i,
    /millions?\s+of\s+(reviews?|ratings?)/i,
    /\d+k\+?\s*(reviews?|ratings?)/i
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
    .replace(/```markdown\s*/g, '')
    .replace(/```\s*/g, '')
    .trim();
  
  // The response should be pure markdown, not JSON
  console.log('   ✅ Got markdown content');
  return cleanText;
}

async function generateProductContent(product, postContext, position, totalProducts, attempt = 1) {
  const positionText = position === 1 ? 'first' : position === 2 ? 'second' : position === 3 ? 'third' : `${position}th`;
  
  console.log(`   Generating content for ${product.title} (#${position})...`);
  
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
        max_tokens: 2500,
        system: `You are a real person writing honest product recommendations for a best-of list.

CRITICAL STYLE RULES:
- Write like a REAL person, not an AI
- Use conversational, natural language
- Include personal observations and opinions
- Vary your sentence structure (some short, some long)
- Use contractions (it's, don't, can't, you'll)
- Add occasional first-person perspective (I found, In my experience, We love)
- Be relatable and enthusiastic
- Skip overly formal language
- Natural transitions, not robotic ones

ABSOLUTELY AVOID:
- Formulaic AI phrases like "standout feature" or "One of the most appealing aspects"
- Generic intros like "In today's market" or "When it comes to"
- Overly structured, listy writing
- Corporate/marketing speak
- Perfect grammar at expense of naturalness
- Saying "quotation marks" around words - just use the words directly

CRITICAL FOR OUTPUT:
- Return ONLY markdown content
- NO JSON wrapping
- NO markdown code fences
- Start directly with ## heading
- Use apostrophes freely (it's, don't, they're)`,
        messages: [
          {
            role: "user",
            content: `Write enthusiastic, natural recommendation content for this product.

CONTEXT:
- Blog Post: "${postContext.title}"
- Category: ${postContext.category}
- This is product #${position} of ${totalProducts}
- Position: ${positionText} recommendation

PRODUCT:
- Name: ${safeTitle}
- Category: ${product.category}
- Features: ${product.features?.join(', ') || 'N/A'}

WRITING STYLE (CRITICAL):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write like you're excitedly telling a friend why they should get this!

✅ GOOD EXAMPLES (Natural, Human):
"Okay, hear me out on this one - it's actually worth it."
"This thing has saved me so much hassle. Like, seriously."
"If you're looking for something that just works without any drama, this is it."
"The quality? Way better than I expected for the price."
"I was skeptical at first, but this really delivers."

❌ BAD EXAMPLES (AI-like, Avoid):
"The standout feature of this product is its innovative design."
"One of the most compelling aspects is the comprehensive feature set."
"This represents exceptional value in its category."
"When it comes to performance, this excels on multiple fronts."

STRUCTURE RULES:
- Start with ## Why We Love It (or similar natural header)
- Lead with enthusiasm or surprising fact
- Mix features with real-world benefits
- Include specific use cases
- Use natural section headers (### Key Features, ### What Makes It Different, ### Perfect For)
- End with honest recommendation

TONE RULES:
- Enthusiastic but genuine
- Conversational, not sales-y
- Specific, not vague
- Personal touches welcome
- Natural flow

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CONTENT PROHIBITIONS (Will Be Validated):
❌ NO prices or dollar amounts
❌ NO review counts or numbers of reviews  
❌ NO star ratings or numerical ratings
❌ NO specific years or dates
❌ NO "as of", "currently", "right now"
❌ NO quotation marks in text (just say the words directly)

Instead write about:
✅ Features and what they enable
✅ Real-world use cases and benefits
✅ Build quality and design
✅ What makes it different or better
✅ Who will love it most
✅ Specific scenarios where it shines

CONTENT LENGTH: 500-700 words

OUTPUT FORMAT:
Return ONLY markdown content. Start directly with:

## Why We Love It

[Natural, enthusiastic opening paragraph about why this product made the list]

### Key Features

- **Feature 1**: What it does and why it matters
- **Feature 2**: Real benefit explained
- **Feature 3**: How it helps in practice
[etc]

### What Makes It Stand Out

[Paragraph about what differentiates this from alternatives]

### Real-World Performance

[How it actually performs in daily use, specific examples]

### Perfect For

- People who need/want X
- Anyone dealing with Y  
- Users looking for Z
[etc]

### Our Take

[Final honest recommendation paragraph - why we included it, who should get it]

REMEMBER:
- Write like a human recommending to a friend
- Be enthusiastic but honest
- No prices, ratings, reviews, dates
- Specific details over vague claims
- NO quotation marks in the text
- Return ONLY markdown, no wrapping`
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
    
    const content = parseAIResponse(textContent);
    const cleanedContent = cleanMarkdown(content);

    const validationErrors = validateNoDynamicData(cleanedContent);
    
    if (validationErrors.length > 0) {
      console.log('   ⚠️  VALIDATION FAILED:');
      validationErrors.forEach(err => console.log(`      ${err}`));
      
      if (attempt < 3) {
        console.log(`   🔄 Retrying (attempt ${attempt + 1}/3)...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return await generateProductContent(product, postContext, position, totalProducts, attempt + 1);
      } else {
        console.log('   ❌ Max retries reached. Using placeholder.');
        return '';
      }
    }

    console.log('   ✅ Validation passed!');
    console.log(`   ✅ Generated ${cleanedContent.length} characters`);

    return cleanedContent;

  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return '';
  }
}

async function generateMissingContent(posts, products) {
  console.log('');
  console.log('🔍 Checking for missing content...');
  console.log('');
  
  let totalProducts = 0;
  let missingCount = 0;
  let generatedCount = 0;
  
  // First pass: count what needs generation
  for (const post of posts) {
    for (const productRef of post.products) {
      totalProducts++;
      if (!productRef.content || productRef.content.trim() === '' || productRef.content === 'Markdown content 1') {
        missingCount++;
      }
    }
  }
  
  if (missingCount === 0) {
    console.log('✅ All products already have content!');
    return posts;
  }

  console.log(`📊 Found ${missingCount} products needing content out of ${totalProducts} total`);
  console.log('');
  console.log(`🤖 Generating HUMAN-LIKE content for Best-Of posts...`);
  console.log('');
  
  // Second pass: generate content
  for (let postIdx = 0; postIdx < posts.length; postIdx++) {
    const post = posts[postIdx];
    
    console.log(`\n📄 Post: "${post.title}"`);
    console.log(`   Category: ${post.category}`);
    console.log(`   Products: ${post.products.length}`);
    
    for (let prodIdx = 0; prodIdx < post.products.length; prodIdx++) {
      const productRef = post.products[prodIdx];
      
      // Skip if content already exists
      if (productRef.content && 
          productRef.content.trim() !== '' && 
          !productRef.content.includes('Markdown content')) {
        console.log(`   ⏭️  Skipping ${productRef.asin} (has content)`);
        continue;
      }
      
      // Find product details
      const product = products.find(p => p.asin === productRef.asin);
      if (!product) {
        console.log(`   ⚠️  Product not found: ${productRef.asin}`);
        continue;
      }
      
      const content = await generateProductContent(
        product,
        post,
        prodIdx + 1,
        post.products.length
      );
      
      // Update the content
      productRef.content = content;
      generatedCount++;
      
      // Rate limiting
      if (generatedCount < missingCount) {
        const delay = 3000;
        console.log(`   ⏳ Waiting ${delay/1000}s...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  console.log('');
  console.log('═══════════════════════════════════════');
  console.log('📊 GENERATION SUMMARY');
  console.log('═══════════════════════════════════════');
  console.log(`✅ Generated: ${generatedCount}`);
  console.log(`📝 Total products: ${totalProducts}`);
  console.log(`✓ Coverage: ${((totalProducts - missingCount + generatedCount) / totalProducts * 100).toFixed(1)}%`);
  console.log('═══════════════════════════════════════');
  console.log('');

  return posts;
}

function saveBestOfBlogs(posts) {
  const dataDirPublic = path.join(__dirname, '../public/data');
  const dataDir = path.join(__dirname, '../data');
  
  if (!fs.existsSync(dataDirPublic)) {
    fs.mkdirSync(dataDirPublic, { recursive: true });
  }
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const blogsData = {
    posts: posts
  };
  
  const jsonPathPublic = path.join(dataDirPublic, 'best-of-blogs.json');
  const jsonPath = path.join(dataDir, 'best-of-blogs.json');
  
  // Backup existing file
  if (fs.existsSync(jsonPathPublic)) {
    const backupPath = path.join(dataDirPublic, `best-of-blogs.backup.${Date.now()}.json`);
    fs.copyFileSync(jsonPathPublic, backupPath);
    console.log(`💾 Backup saved: ${path.basename(backupPath)}`);
  }
  
  fs.writeFileSync(jsonPathPublic, JSON.stringify(blogsData, null, 2));
  fs.writeFileSync(jsonPath, JSON.stringify(blogsData, null, 2));
  
  console.log(`✅ Saved ${posts.length} best-of posts`);
  
  // Count total products with content
  let productsWithContent = 0;
  for (const post of posts) {
    for (const product of post.products) {
      if (product.content && product.content.trim() !== '') {
        productsWithContent++;
      }
    }
  }
  console.log(`✅ ${productsWithContent} products have content`);
}

async function main() {
  try {
    console.log('╔═══════════════════════════════════════════╗');
    console.log('║  Best-Of Content Generator                ║');
    console.log('╚═══════════════════════════════════════════╝');
    console.log('');
    console.log('🎯 Features:');
    console.log('   - Natural, enthusiastic recommendations');
    console.log('   - Personal voice and opinions');
    console.log('   - NO AI-sounding phrases');
    console.log('   - Validation for dynamic data');
    console.log('   - Generates only missing content');
    console.log('');
    
    if (!ANTHROPIC_API_KEY || ANTHROPIC_API_KEY === 'YOUR_KEY_HERE') {
      console.error('❌ Please set ANTHROPIC_API_KEY!');
      console.log('');
      console.log('Set it with:');
      console.log('  export ANTHROPIC_API_KEY=your_key_here');
      console.log('');
      process.exit(1);
    }

    const products = loadProducts();
    console.log(`📦 Loaded ${products.length} products`);

    const bestOfBlogs = loadBestOfBlogs();
    console.log(`📄 Found ${bestOfBlogs.posts.length} best-of posts`);

    const updatedPosts = await generateMissingContent(bestOfBlogs.posts, products);
    
    saveBestOfBlogs(updatedPosts);
    
    console.log('');
    console.log('🎉 Generation complete!');
    console.log('');
    console.log('✅ Content sounds human, not AI!');
    console.log('   - Natural, enthusiastic tone');
    console.log('   - Personal recommendations');
    console.log('   - No corporate speak');
    console.log('');
    console.log('📂 Updated files:');
    console.log('   - public/data/best-of-blogs.json');
    console.log('   - data/best-of-blogs.json');
    console.log('');
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();