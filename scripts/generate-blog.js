#!/usr/bin/env node

/**
 * Generate HUMAN-SOUNDING blog posts (not AI-like!)
 * Focus: Natural voice, conversational tone, real opinions
 * Saves each blog as separate file: blog.<slug>.json
 * 
 * IMPROVED: Anti-repetition logic to prevent AI patterns
 */

// node --env-file=./secrets/.script.env scripts/generate-blog.js --asin=<ASIN>
// node scripts/generate-sitemap.js

// node --env-file=./secrets/.script.env scripts/generate-blog.js && node scripts/generate-sitemap.js


const fs = require('fs');
const path = require('path');

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// Parse command line arguments
const args = process.argv.slice(2);
const asinArg = args.find(arg => arg.startsWith('--asin='));
const TARGET_ASIN = asinArg ? asinArg.split('=')[1] : null;

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
  const blogsDirPublic = path.join(__dirname, '../public/data/blogs');
  const blogsDir = path.join(__dirname, '../data/blogs');
  
  // Check both possible blog directories
  let blogsDirectory = blogsDirPublic;
  if (!fs.existsSync(blogsDirPublic) && fs.existsSync(blogsDir)) {
    blogsDirectory = blogsDir;
  }
  
  if (!fs.existsSync(blogsDirectory)) {
    return { posts: [], metadata: {} };
  }

  // Read all blog.*.json files
  const files = fs.readdirSync(blogsDirectory);
  const blogFiles = files.filter(f => f.startsWith('blog.') && f.endsWith('.json'));
  
  const posts = blogFiles.map(filename => {
    const filePath = path.join(blogsDirectory, filename);
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  });

  return { 
    posts, 
    metadata: {
      total: posts.length,
      source: blogsDirectory
    }
  };
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

function validateUniqueness(blogData) {
  const errors = [];
  const allText = [blogData.title, blogData.content].join(' ').toLowerCase();
  
  // Get first 200 characters to check opening patterns more carefully
  const opening = blogData.content.substring(0, 200).toLowerCase();
  
  // Check for overused AI patterns that reveal AI authorship
  const aiPatterns = [
    { pattern: /promising to (do everything|deliver|revolutionize)/i, msg: 'overused skeptical opening about promises' },
    { pattern: /yeah,? i rolled my eyes( too)?/i, msg: 'overused cynical eye-rolling opener' },
    { pattern: /let's talk about/i, msg: 'overused conversational opener' },
    { pattern: /i'll be honest/i, msg: 'overused honesty signal' },
    { pattern: /to be honest/i, msg: 'overused honesty signal variant' },
    { pattern: /look,? i'm (just )?going to say/i, msg: 'overused direct address pattern' },
    { pattern: /in today's (market|world|landscape)/i, msg: 'generic market reference' },
    { pattern: /when it comes to/i, msg: 'generic transition phrase' },
    { pattern: /the standout feature/i, msg: 'generic feature highlight' },
    { pattern: /one of the most (appealing|impressive|notable)/i, msg: 'generic superlative pattern' },
    { pattern: /is it perfect\? (no|nope)/i, msg: 'overused rhetorical question pattern' },
    { pattern: /here's the (deal|thing|kicker)/i, msg: 'overused casual transition' },
    { pattern: /bottom line:/i, msg: 'overused conclusion marker' },
    { pattern: /(pretty|fairly|quite) skeptical/i, msg: 'overused skepticism pattern' },
    { pattern: /i was skeptical/i, msg: 'classic AI skeptical opening' },
    { pattern: /after (dealing with|struggling with|years of)/i, msg: 'AI backstory pattern' },
    { pattern: /everyone (kept|was) (recommending|raving about|talking about)/i, msg: 'AI social proof pattern' },
    { pattern: /game[- ]changer/i, msg: 'overused marketing term' },
    { pattern: /total game[- ]changer/i, msg: 'overused marketing superlative' },
    { pattern: /worth (every penny|the hype|mentioning)/i, msg: 'overused value phrase' },
  ];
  
  for (const { pattern, msg } of aiPatterns) {
    if (pattern.test(allText)) {
      const match = allText.match(pattern);
      errors.push(`❌ AI pattern detected: ${msg} (matched: "${match[0]}")`);
    }
  }
  
  // CRITICAL: Check for the "skeptical but then..." pattern in opening
  const skepticalPatterns = [
    // Catch the EXACT pattern user keeps seeing
    /^.{0,50}after.{0,50}(dealing with|struggling with|years).{0,100}(skeptical|doubtful)/i,
    /^.{0,100}(skeptical|doubtful|unsure).{0,20}when everyone/i,
    /everyone.{0,20}(kept|was|started).{0,20}(recommending|suggesting|raving)/i,
    // Original patterns
    /^.{0,100}(skeptical|doubtful|unsure).{0,100}(but|however|yet|though)/i,
    /^.{0,100}(wasn't sure|had doubts|questioned).{0,100}(but|however|turned out)/i,
    /didn't (think|believe|expect).{0,100}(but|however|actually)/i,
  ];
  
  for (const pattern of skepticalPatterns) {
    if (pattern.test(opening)) {
      const match = opening.match(pattern);
      errors.push(`❌ CRITICAL: Skeptical-but-convinced opening pattern (matched: "${match[0].substring(0, 60)}...")`);
      break;
    }
  }
  
  // Check for repetitive structure words in opening
  const firstParagraph = blogData.content.split('\n\n')[0].toLowerCase();
  const repetitiveOpeners = [
    /^(so|well|now|okay),/i,
    /^let me (tell you|start by)/i,
    /^i (want to|need to|have to) (talk about|discuss|share)/i,
  ];
  
  for (const pattern of repetitiveOpeners) {
    if (pattern.test(firstParagraph)) {
      errors.push(`❌ Repetitive opening pattern detected`);
    }
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

  // Randomize opening style for variety
  const openingStyles = [
    "Start with a concrete physical detail (weight, size, material, color)",
    "Begin with a specific performance metric from testing (battery life, speed, capacity)",
    "Open with the primary use case or who it's designed for",
    "Start with a direct comparison to a similar product",
    "Begin with the most practical benefit or feature",
    "Open with setup or first-use experience (time taken, difficulty)",
    "Start with what it replaces or improves upon",
    "Begin with a specific testing scenario and result",
    "Open with build quality observation (materials, construction)",
    "Start with price-to-features assessment (no dollar amounts)",
    "Begin with the main problem it solves",
    "Open with capacity, size, or dimensional details",
    "Start with a specific feature that works well",
    "Begin with what surprised you during testing (no skepticism)",
    "Open with durability or longevity observation"
  ];
  
  const randomOpening = openingStyles[Math.floor(Math.random() * openingStyles.length)];
  
  // Randomize tone variation
  const toneVariations = [
    "Be direct and factual - no fluff or setup",
    "Focus on measurable details and specifications",
    "Keep it practical with real-world use cases",
    "Emphasize hands-on testing observations",
    "Mix technical specs with everyday language",
    "Prioritize what users actually care about",
    "Be straightforward - skip the windup"
  ];
  
  const randomTone = toneVariations[Math.floor(Math.random() * toneVariations.length)];

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

🚨 CRITICAL CONSTRAINT - YOU ARE FORBIDDEN FROM USING THESE PATTERNS 🚨
The following opening patterns will cause your output to be AUTOMATICALLY REJECTED:
1. "After dealing with [problem]..."
2. "I was skeptical..." or "pretty skeptical..."
3. "Everyone kept recommending..."
4. Any combination of backstory + skepticism + praise
5. "For years I struggled..."
6. "I wasn't sure this would work..."

If you use ANY of the above patterns, your response will be discarded and you will need to regenerate it.
Start your review with a FACTUAL, SPECIFIC observation about the product itself.

CRITICAL STYLE RULES:
- Write like a REAL person, not an AI
- VARY YOUR OPENING - never use the same style twice
- Each review should feel completely unique and fresh
- NO BACKSTORY SETUPS - jump right into the product
- NO "I was skeptical but..." patterns (biggest AI tell)
- Use conversational, natural language
- Include personal observations and opinions
- Vary your sentence structure (some short, some long)
- Use contractions (it's, don't, can't, you'll)
- Add occasional first-person perspective (I found, In my experience)
- Be relatable and friendly
- Skip overly formal language
- Natural transitions, not robotic ones

OPENING STYLE VARIETY - Must feel different each time:
✓ Direct feature: "The motor runs quieter than I expected."
✓ Usage context: "After two weeks of testing, here's what stands out."
✓ Simple assessment: "This works well for small spaces."
✓ Specific detail: "The stainless steel build feels premium."
✓ Practical angle: "If you need something reliable for daily use..."
✓ Comparison: "Compared to my previous model, the setup is simpler."
✓ Problem focus: "For anyone dealing with limited counter space..."
✓ Surprise element: "The battery life exceeded expectations."
✓ Direct fact: "Battery lasts about six hours with normal use."
✓ Build observation: "Solid construction, heavier than expected."

ABSOLUTELY FORBIDDEN - These patterns SCREAM AI:
❌ NEVER: "I was skeptical" or "pretty skeptical" (BIGGEST AI TELL)
❌ NEVER: "After dealing with [problem] for years..." (AI backstory)
❌ NEVER: "everyone kept recommending" (fake social proof)
❌ NEVER: "[skepticism]... but [positive outcome]" (AI formula)
❌ NEVER: "promising to do everything" or "promising to deliver/revolutionize"
❌ NEVER: "Yeah, I rolled my eyes too"
❌ NEVER: "Let's talk about"
❌ NEVER: "I'll be honest" or "To be honest"
❌ NEVER: "Look, I'm just going to say it upfront"
❌ NEVER: "In today's market/world/landscape"
❌ NEVER: "When it comes to"
❌ NEVER: "The standout feature"
❌ NEVER: "One of the most appealing/impressive/notable"
❌ NEVER: "Is it perfect? No/Nope" (rhetorical question pattern)
❌ NEVER: "Here's the deal/thing/kicker"
❌ NEVER: "Bottom line:"
❌ NEVER: "game-changer" or "total game-changer"
❌ NEVER: "worth every penny" or "worth the hype"
❌ NEVER: Starting with skepticism then praise (AI cliche)
❌ NEVER: Any pattern that could appear in multiple reviews
❌ NEVER: Personal backstory before discussing product

INSTEAD, START WITH:
✓ Specific product observation
✓ Direct feature mention  
✓ Simple statement about use case
✓ Build quality or physical trait
✓ Comparison to alternatives
✓ Practical testing result
✓ Who it's designed for
✓ What problem it solves (without backstory)

ALSO AVOID:
- Formulaic transitions
- Predictable headers like "Introduction" and "Conclusion"
- Overly structured, listy writing
- Corporate/marketing speak
- Perfect grammar at expense of naturalness
- REPETITIVE PHRASES ACROSS POSTS

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

🎯 YOUR UNIQUE OPENING APPROACH FOR THIS REVIEW:
${randomOpening}

🎨 TONE GUIDANCE FOR THIS REVIEW:
${randomTone}

⚠️⚠️⚠️ CRITICAL - YOUR FIRST SENTENCE MUST BE LIKE THESE EXAMPLES ⚠️⚠️⚠️

ACCEPTABLE Opening Sentences (Model your opening after these):
• "The 12-ounce capacity works well for single servings."
• "Setup takes about 10-15 minutes from start to finish."
• "This runs noticeably quieter than my previous model."
• "Battery life averaged 6 hours during my testing period."
• "The stainless steel body feels more durable than plastic alternatives."
• "Designed for compact spaces, this measures 8 by 6 inches."
• "Temperature range goes from 150 to 400 degrees Fahrenheit."
• "I've used this daily for the past three weeks."
• "The motor operates at a relatively low noise level."
• "Build quality seems solid after a month of regular use."

REJECTED Opening Sentences (If you use ANY of these patterns, your output WILL BE DISCARDED):
❌ "After dealing with dry skin for years, I was skeptical when everyone kept recommending..."
❌ "I've struggled with finding good products, but everyone raved about this..."
❌ "For years I dealt with this problem, so I was doubtful when I heard..."
❌ "Everyone kept telling me to try this, and I was pretty skeptical..."
❌ "I wasn't sure this would work after years of disappointing products..."
❌ "Promising to solve all my problems, I rolled my eyes at first..."

DO NOT START WITH: skepticism, backstory, "everyone recommending", doubt-then-praise pattern

YOUR FIRST SENTENCE MUST BE FACTUAL AND DIRECT LIKE THE ACCEPTABLE EXAMPLES.

WRITING STYLE (CRITICAL):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write like you're telling a friend about this product!

✅ GOOD EXAMPLES (Natural, Human, VARIED):
"After three weeks of daily use, the motor still runs quietly."
"Setup took me about ten minutes with no issues."
"This replaces my old model that died after two years."
"The weight is the first thing you feel when you pick it up."
"For the price point, the features are solid."
"I tested this in my kitchen for a month."
"The build quality feels durable - metal housing, not plastic."
"Battery lasts longer than advertised, which is rare."
"Holds about twelve ounces, perfect for morning coffee."
"Temperature control is more precise than my last one."

❌ BAD EXAMPLES (AI-like, NEVER USE THESE):
"After dealing with dry skin for years, I was skeptical..." ← FORBIDDEN (backstory + skepticism)
"Everyone kept recommending this, so I was doubtful..." ← FORBIDDEN (social proof + doubt)
"I wasn't sure this would work, but I was wrong..." ← FORBIDDEN (doubt then reversal)
"Promising to deliver on every front..." ← FORBIDDEN
"Yeah, I rolled my eyes too when I saw..." ← FORBIDDEN
"Let's talk about what makes this special..." ← FORBIDDEN
"I'll be honest with you..." ← FORBIDDEN
"The standout feature of this product..." ← FORBIDDEN
"In today's competitive market..." ← FORBIDDEN
"When it comes to performance..." ← FORBIDDEN
"Is it perfect? Nope. But here's why..." ← FORBIDDEN
"This is a total game-changer..." ← FORBIDDEN

STRUCTURE RULES:
- NO generic "Introduction" headers
- Start with something specific, not a windup
- Use natural section headers based on actual aspects
- Mix up sentence lengths naturally
- Include specific observations from use
- End with honest take, not a sales pitch
- Make each section transition feel organic

TONE RULES:
- Sound like one person, not a template
- Be honest about both strengths and flaws
- Use relatable, everyday language
- Add specific details from actual use
- Natural conversational flow

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CONTENT PROHIBITIONS (Will Be Validated):
❌ NO prices or dollar amounts
❌ NO review counts or numbers of reviews
❌ NO star ratings or numerical ratings
❌ NO specific years or dates
❌ NO "as of", "currently", "right now"
❌ NO overused AI phrases from forbidden list

Instead write about:
✅ Features and how they actually work
✅ Real-world use cases and testing
✅ Build quality and materials
✅ What works well and what doesn't
✅ Who this is actually good for
✅ Specific observations from use

Requirements:
1. Natural, engaging title (sound like a real review, not SEO spam)
2. Meta description (150-160 chars, conversational)
3. Review content (700-900 words) in MARKDOWN
   - Use ## for sections (make them unique and specific)
   - Start strong with your unique opening
   - Mix specific observations with practical info
   - Real-world usage examples
   - Honest pros and cons woven in naturally
4. 7 specific pros (detailed, not generic)
5. 3-4 specific cons (real issues, not manufactured)
6. Honest verdict (2-3 sentences, your actual take)
7. Target audience (specific groups who'd benefit)
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

FINAL REMINDERS: 
- Make THIS review sound completely different from others
- Avoid ALL forbidden AI patterns
- No prices, ratings, reviews, dates
- Be honest and specific
- Skip the corporate speak
- COMPLETE the JSON with closing brace!
- NEVER repeat openings or patterns across reviews!`
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
    const uniquenessErrors = validateUniqueness(blogData);
    
    const allErrors = [...validationErrors, ...uniquenessErrors];
    
    if (allErrors.length > 0) {
      console.log('   ⚠️  VALIDATION FAILED:');
      allErrors.forEach(err => console.log(`      ${err}`));
      
      if (attempt < 5) {
        console.log(`   🔄 Retrying (attempt ${attempt + 1}/5)...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return await generateBlogPost(product, attempt + 1);
      } else {
        console.log('   ❌ Max retries reached (5 attempts). Skipping.');
        return null;
      }
    }

    console.log('   ✅ Validation passed!');
    console.log('   ✅ Uniqueness check passed!');
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

async function generateMissingBlogs(products, existingBlogs, targetAsin = null) {
  // If targeting specific ASIN, find that product
  if (targetAsin) {
    const targetProduct = products.find(p => p.asin === targetAsin);
    
    if (!targetProduct) {
      console.error(`❌ Product with ASIN ${targetAsin} not found!`);
      return existingBlogs.posts;
    }
    
    console.log('');
    console.log(`🎯 Generating blog for specific product: ${targetProduct.title}`);
    console.log(`   ASIN: ${targetAsin}`);
    console.log('');
    
    const blog = await generateBlogPost(targetProduct);
    
    if (blog) {
      // Replace existing blog if it exists, otherwise add new
      const existingIndex = existingBlogs.posts.findIndex(b => b.productId === targetProduct.id);
      if (existingIndex >= 0) {
        console.log('   ℹ️  Replacing existing blog');
        existingBlogs.posts[existingIndex] = blog;
      } else {
        existingBlogs.posts.push(blog);
      }
      
      console.log('');
      console.log('═══════════════════════════════════════');
      console.log('✅ Blog generation successful!');
      console.log('═══════════════════════════════════════');
      console.log('');
      
      return existingBlogs.posts;
    } else {
      console.log('');
      console.log('═══════════════════════════════════════');
      console.log('❌ Blog generation failed!');
      console.log('═══════════════════════════════════════');
      console.log('');
      
      return existingBlogs.posts;
    }
  }
  
  // Original behavior: generate for all missing blogs
  const existingProductIds = new Set(existingBlogs.posts.map(b => b.productId));
  
  // Filter products that need blogs:
  // 1. No existing blog file (productId not in existingProductIds)
  // 2. OR product doesn't have a slug field
  const productsNeedingBlogs = products.filter(p => 
    !existingProductIds.has(p.id) || !p.slug
  );
  
  if (productsNeedingBlogs.length === 0) {
    console.log('✅ All products already have blog posts!');
    console.log(`   📊 Total products: ${products.length}`);
    console.log(`   📝 Total blogs: ${existingBlogs.posts.length}`);
    return existingBlogs.posts;
  }

  console.log('');
  console.log(`🤖 Generating HUMAN-LIKE blogs for ${productsNeedingBlogs.length} products...`);
  console.log(`   📊 Total products: ${products.length}`);
  console.log(`   📝 Existing blogs: ${existingBlogs.posts.length}`);
  console.log(`   🆕 Need blogs: ${productsNeedingBlogs.length}`);
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

function saveBlogPosts(blogPosts, products) {
  const blogsDirPublic = path.join(__dirname, '../public/data/blogs');
  const blogsDir = path.join(__dirname, '../data/blogs');
  
  // Create blogs directories
  if (!fs.existsSync(blogsDirPublic)) {
    fs.mkdirSync(blogsDirPublic, { recursive: true });
  }
  if (!fs.existsSync(blogsDir)) {
    fs.mkdirSync(blogsDir, { recursive: true });
  }

  console.log('');
  console.log('💾 Saving individual blog files...');
  
  // Create a map of productId to slug
  const productSlugMap = {};
  
  // Save each blog as separate file
  blogPosts.forEach((blog, index) => {
    const filename = `blog.${blog.slug}.json`;
    const filePathPublic = path.join(blogsDirPublic, filename);
    const filePath = path.join(blogsDir, filename);
    
    fs.writeFileSync(filePathPublic, JSON.stringify(blog));
    fs.writeFileSync(filePath, JSON.stringify(blog));
    
    // Track slug for this product
    productSlugMap[blog.productId] = blog.slug;
    
    console.log(`   ✓ ${index + 1}/${blogPosts.length} ${filename}`);
  });

  console.log('');
  console.log('📝 Updating products with blog slugs...');
  console.log(`   Found ${Object.keys(productSlugMap).length} new/updated product-to-slug mappings`);
  
  // Update products with blog slugs
  let updatedCount = 0;
  let preservedCount = 0;
  
  const updatedProducts = products.map(product => {
    // If this product got a new blog in this run, update its slug
    if (productSlugMap[product.id]) {
      updatedCount++;
      return {
        ...product,
        slug: productSlugMap[product.id]
      };
    }
    // Otherwise, keep existing slug if it has one
    if (product.slug) {
      preservedCount++;
    }
    return product;
  });
  
  console.log(`   Updated ${updatedCount} product(s) with new slugs`);
  console.log(`   Preserved ${preservedCount} existing slug(s)`);
  
  // Save updated products to all relevant files
  const productsData = {
    products: updatedProducts,
    metadata: {
      total: updatedProducts.length,
      updated: new Date().toISOString(),
      withSlugs: updatedCount + preservedCount
    }
  };
  
  console.log('');
  console.log('💾 Writing to product files...');
  
  // List of possible product files to update
  const productFiles = [
    { path: path.join(__dirname, '../public/data/products.json'), name: 'public/data/products.json' },
    { path: path.join(__dirname, '../data/products.json'), name: 'data/products.json' },
    { path: path.join(__dirname, '../public/data/initial-products.json'), name: 'public/data/initial-products.json' },
    { path: path.join(__dirname, '../data/initial-products.json'), name: 'data/initial-products.json' }
  ];
  
  // Update all existing product files
  let filesUpdated = 0;
  let filesNotFound = 0;
  
  productFiles.forEach(({ path: filePath, name }) => {
    try {
      if (fs.existsSync(filePath)) {
        // Read existing file to preserve structure
        let existing = {};
        try {
          existing = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        } catch (parseError) {
          console.log(`   ⚠️  Could not parse ${name}, will overwrite`);
        }
        
        // Merge: keep existing structure but update products array
        const merged = {
          ...existing,
          products: updatedProducts,
          metadata: {
            ...(existing.metadata || {}),
            total: updatedProducts.length,
            updated: new Date().toISOString(),
            withSlugs: updatedCount + preservedCount
          }
        };
        
        fs.writeFileSync(filePath, JSON.stringify(merged));
        console.log(`   ✓ Updated ${name}`);
        filesUpdated++;
      } else {
        console.log(`   ⚠️  Not found: ${name}`);
        filesNotFound++;
      }
    } catch (error) {
      console.log(`   ❌ Failed to update ${name}: ${error.message}`);
    }
  });
  
  console.log('');
  console.log(`✅ Saved ${blogPosts.length} individual blog files`);
  console.log(`✅ Updated ${filesUpdated} product file(s)`);
  
  if (filesNotFound > 0) {
    console.log(`⚠️  ${filesNotFound} product file(s) not found (this may be normal)`);
  }
  
  console.log('');
  console.log('📋 Summary:');
  console.log(`   • Blog files created: ${blogPosts.length}`);
  console.log(`   • Products updated with new slugs: ${updatedCount}`);
  console.log(`   • Products with preserved slugs: ${preservedCount}`);
  console.log(`   • Total products with slugs: ${updatedCount + preservedCount}`);
  console.log(`   • Product files updated: ${filesUpdated}`);
}

async function main() {
  try {
    console.log('╔═══════════════════════════════════════════╗');
    console.log('║  Human-Like Blog Generator v2.0           ║');
    console.log('║  (Anti-Repetition Edition)                ║');
    console.log('╚═══════════════════════════════════════════╝');
    console.log('');
    
    if (TARGET_ASIN) {
      console.log('🎯 Mode: Generate blog for specific ASIN');
      console.log(`   ASIN: ${TARGET_ASIN}`);
      console.log('');
    } else {
      console.log('🤖 Mode: Generate blogs for all products without blogs');
      console.log('');
      console.log('💡 Tip: Generate for specific product:');
      console.log('   node generate-blogs.js --asin=B0D1XD1ZV3');
      console.log('');
    }
    
    console.log('🎯 Features:');
    console.log('   - Natural, conversational writing');
    console.log('   - Personal voice and opinions');
    console.log('   - NO AI-sounding phrases');
    console.log('   - Anti-repetition validation');
    console.log('   - Randomized opening styles');
    console.log('   - Validation for dynamic data');
    console.log('   - Each blog saved as blog.<slug>.json');
    console.log('   - Updates products.json & initial-products.json');
    console.log('');
    
    if (!ANTHROPIC_API_KEY || ANTHROPIC_API_KEY === 'YOUR_KEY_HERE') {
      console.error('❌ Please set ANTHROPIC_API_KEY!');
      process.exit(1);
    }

    const products = loadProducts();
    console.log(`📦 Loaded ${products.length} products`);

    const existingBlogs = loadExistingBlogs();
    console.log(`📄 Found ${existingBlogs.posts.length} existing blogs`);

    const allBlogs = await generateMissingBlogs(products, existingBlogs, TARGET_ASIN);
    
    if (allBlogs.length === 0) {
      console.warn('⚠️  No blog posts to save!');
      return;
    }

    saveBlogPosts(allBlogs, products);
    
    console.log('🎉 Generation complete!');
    console.log('');
    console.log('✅ Blogs sound human, not AI!');
    console.log('   - Natural, conversational tone');
    console.log('   - Personal observations');
    console.log('   - No corporate speak');
    console.log('   - No repetitive patterns');
    console.log('   - Each saved as separate file');
    console.log('   - Product files updated with slugs');
    console.log('');
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

main();