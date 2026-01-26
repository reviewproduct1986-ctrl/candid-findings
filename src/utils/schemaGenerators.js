// Schema generators for SEO

import { affiliateLink, categoryToSlug } from '../utils/urlHelper';

function CleanAndShort(title) {
  const newTitle = title.replace(/®/g, '')
    .replace(/™/g, '')
    .replace(/©/g, '');
  return newTitle.length > 150 ? newTitle.substring(0, 147) + '...' : newTitle;
}

/**
 * Generate FAQ schema for review pages
 */
export function generateFAQSchema(blog) {
  if (!blog?.faqs || blog.faqs.length === 0) return null;
  
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": blog.faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

/**
 * Generate Review schema for review pages
 */
export function generateReviewSchema(product, blog) {
  if (!product || !blog) return null;

  return {
    "@context": "https://schema.org",
    "@type": "Review",
    "reviewBody": blog.excerpt || blog.metaDescription,
    "itemReviewed": {
      "@type": "Product",
      "name": CleanAndShort(product.title),
      "description": product.description || blog.metaDescription,
      "image": product.image,
      "sku": product.id,
      "brand": {
        "@type": "Brand",
        "name": product.brand || product.title.split(' ')[0] || "Various"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": product.rating.toString(),
        "reviewCount": (product.reviews || 1).toString(),
        "bestRating": "5",
        "worstRating": "1"
      },
      "offers": {
        "@type": "Offer",
        "price": product.price.toFixed(2),
        "priceCurrency": "USD",
        "priceValidUntil": new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0],
        "availability": "https://schema.org/InStock",
        "url": affiliateLink(product),
        "itemCondition": "https://schema.org/NewCondition",
        "seller": {
          "@type": "Organization",
          "name": "Amazon"
        },
        "shippingDetails": {
          "@type": "OfferShippingDetails",
          "shippingRate": {
            "@type": "MonetaryAmount",
            "value": "0",
            "currency": "USD"
          },
          "shippingDestination": {
            "@type": "DefinedRegion",
            "addressCountry": "US"
          },
          "deliveryTime": {
            "@type": "ShippingDeliveryTime",
            "handlingTime": {
              "@type": "QuantitativeValue",
              "minValue": 0,
              "maxValue": 1,
              "unitCode": "DAY"
            },
            "transitTime": {
              "@type": "QuantitativeValue",
              "minValue": 1,
              "maxValue": 5,
              "unitCode": "DAY"
            }
          }
        },
        "hasMerchantReturnPolicy": {
          "@type": "MerchantReturnPolicy",
          "applicableCountry": "US",
          "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
          "merchantReturnDays": 30,
          "returnMethod": "https://schema.org/ReturnByMail",
          "returnFees": "https://schema.org/FreeReturn"
        }
      }
    },
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": product.rating.toString(),
      "bestRating": "5",
      "worstRating": "1"
    },
    "author": {
      "@type": "Organization",
      "name": "CandidFindings",
      "url": "https://candidfindings.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "CandidFindings"
    },
    "datePublished": blog.publishedDate,
    "dateModified": blog.updatedDate || blog.publishedDate
  };
}

/**
 * Generate ItemList schema for category pages
 * Shows collection of products in a category
 */
export function generateItemListSchema(category, products) {
  // Don't generate schema for "All" or if no products
  if (!category || category === 'All' || !products || products.length === 0) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `${category} Products`,
    "description": `Curated collection of ${category} products with expert reviews`,
    "numberOfItems": products.length,
    "itemListElement": products.slice(0, 10).map((product, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Product",
        "name": CleanAndShort(product.title),
        "description": product.description || `${product.title} - ${category}`,
        "image": product.image,
        "url": product.reviewUrl 
          ? `https://candidfindings.com${product.reviewUrl}`
          : affiliateLink(product),
        "offers": {
          "@type": "Offer",
          "price": product.price.toFixed(2),
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock",
          "url": affiliateLink(product)
        },
        "aggregateRating": product.reviews ? {
          "@type": "AggregateRating",
          "ratingValue": product.rating.toString(),
          "reviewCount": product.reviews.toString(),
          "bestRating": "5",
          "worstRating": "1"
        } : undefined,
        "brand": {
          "@type": "Brand",
          "name": product.brand || product.title.split(' ')[0]
        }
      }
    }))
  };
}

/**
 * Generate BreadcrumbList schema for category pages
 * Shows navigation hierarchy: Home > Category
 */
export function generateBreadcrumbSchema(category) {
  // Don't generate schema for "All" or if no category
  if (!category || category === 'All') {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://candidfindings.com/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": category,
        "item": `https://candidfindings.com/category/${categoryToSlug(category)}`
      }
    ]
  };
}

// ============================================================================
// BEST OF PAGE SCHEMAS
// ============================================================================

/**
 * Generate CollectionPage schema for individual best-of posts
 * Shows the post as a curated collection of products
 */
export function generateBestOfCollectionSchema(blog, products) {
  if (!blog || !products || products.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": blog.title,
    "description": blog.metaDescription,
    "url": `https://candidfindings.com/best/${blog.slug}`,
    "mainEntity": {
      "@type": "ItemList",
      "name": blog.title,
      "description": blog.metaDescription,
      "numberOfItems": products.length,
      "itemListElement": products.map((product, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Product",
          "name": CleanAndShort(product.title),
          "description": product.description || `${product.title} featured in ${blog.category}`,
          "image": product.image,
          "url": affiliateLink(product),
          "offers": {
            "@type": "Offer",
            "price": product.price.toFixed(2),
            "priceCurrency": "USD",
            "priceValidUntil": new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0],
            "availability": "https://schema.org/InStock",
            "url": affiliateLink(product),
            "seller": {
              "@type": "Organization",
              "name": "Amazon"
            }
          },
          "aggregateRating": product.rating && product.reviews ? {
            "@type": "AggregateRating",
            "ratingValue": product.rating.toString(),
            "reviewCount": product.reviews.toString(),
            "bestRating": "5",
            "worstRating": "1"
          } : undefined,
          "brand": {
            "@type": "Brand",
            "name": product.brand || product.title.split(' ')[0] || "Various"
          }
        }
      }))
    },
    "author": {
      "@type": "Organization",
      "name": "CandidFindings",
      "url": "https://candidfindings.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "CandidFindings",
      "logo": {
        "@type": "ImageObject",
        "url": "https://candidfindings.com/favicon.png"
      }
    },
    "datePublished": blog.publishedDate,
    "dateModified": blog.updatedDate || blog.publishedDate,
    "about": {
      "@type": "Thing",
      "name": blog.category
    },
    "keywords": blog.keywords ? blog.keywords.join(', ') : undefined
  };
}

/**
 * Generate Article schema for individual best-of posts
 * Alternative to CollectionPage, focuses on the article aspect
 */
export function generateBestOfArticleSchema(blog, products) {
  if (!blog) return null;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": blog.title,
    "description": blog.metaDescription,
    "image": products && products[0] ? products[0].image : undefined,
    "author": {
      "@type": "Organization",
      "name": "CandidFindings",
      "url": "https://candidfindings.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "CandidFindings",
      "logo": {
        "@type": "ImageObject",
        "url": "https://candidfindings.com/favicon.png"
      }
    },
    "datePublished": blog.publishedDate,
    "dateModified": blog.updatedDate || blog.publishedDate,
    "articleSection": blog.category,
    "keywords": blog.keywords ? blog.keywords.join(', ') : undefined,
    "about": {
      "@type": "Thing",
      "name": blog.category
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://candidfindings.com/best/${blog.slug}`
    }
  };
}

/**
 * Generate ItemList schema for best-of list page
 * Shows all best-of posts as a collection
 */
export function generateBestOfListSchema(posts, category = null) {
  if (!posts || posts.length === 0) return null;

  // Filter by category if provided
  const filteredPosts = category && category !== 'All' 
    ? posts.filter(post => post.category === category)
    : posts;

  if (filteredPosts.length === 0) return null;

  const listName = category && category !== 'All'
    ? `Best ${category} Products Collections`
    : 'Best Product Collections';

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": listName,
    "description": category && category !== 'All'
      ? `Curated collections of the best ${category} products`
      : 'Expert-curated collections of the best products across all categories',
    "numberOfItems": filteredPosts.length,
    "itemListElement": filteredPosts.map((post, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Article",
        "headline": post.title,
        "description": post.metaDescription,
        "url": `https://candidfindings.com/best/${post.slug}`,
        "datePublished": post.publishedDate,
        "dateModified": post.updatedDate || post.publishedDate,
        "author": {
          "@type": "Organization",
          "name": "CandidFindings"
        },
        "articleSection": post.category,
        "keywords": post.keywords ? post.keywords.join(', ') : undefined
      }
    }))
  };
}

/**
 * Generate BreadcrumbList schema for best-of pages
 * Shows navigation hierarchy
 */
export function generateBestOfBreadcrumbSchema(blog = null, category = null) {
  const breadcrumbs = [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://candidfindings.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Best Selections",
      "item": "https://candidfindings.com/best"
    }
  ];

  // Add category level if on category page
  if (category && category !== 'All' && !blog) {
    breadcrumbs.push({
      "@type": "ListItem",
      "position": 3,
      "name": category,
      "item": `https://candidfindings.com/best/category/${categoryToSlug(category)}`
    });
  }

  // Add blog post level if on individual post
  if (blog) {
    if (blog.category) {
      breadcrumbs.push({
        "@type": "ListItem",
        "position": 3,
        "name": blog.category,
        "item": `https://candidfindings.com/best/category/${categoryToSlug(blog.category)}`
      });
    }
    breadcrumbs.push({
      "@type": "ListItem",
      "position": blog.category ? 4 : 3,
      "name": blog.title,
      "item": `https://candidfindings.com/best/${blog.slug}`
    });
  }

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs
  };
}

/**
 * Generate WebPage schema for best-of list page
 * Provides general page information
 */
export function generateBestOfWebPageSchema(category = null) {
  const pageName = category && category !== 'All'
    ? `Best ${category} Products`
    : 'Best Product Collections';

  const pageDescription = category && category !== 'All'
    ? `Discover our expert-curated collections of the best ${category} products. Compare top picks and find what's right for you.`
    : 'Browse our curated collections of the best products across all categories. Expert picks to help you make the right choice.';

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": pageName,
    "description": pageDescription,
    "url": category && category !== 'All'
      ? `https://candidfindings.com/best/category/${categoryToSlug(category)}`
      : 'https://candidfindings.com/best',
    "publisher": {
      "@type": "Organization",
      "name": "CandidFindings",
      "logo": {
        "@type": "ImageObject",
        "url": "https://candidfindings.com/favicon.png"
      }
    },
    "inLanguage": "en-US"
  };
}

/**
 * Generate Organization schema for site-wide use
 * Can be included on any page
 */
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "CandidFindings",
    "url": "https://candidfindings.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://candidfindings.com/favicon.png"
    },
    "description": "Expert product reviews and curated collections to help you make informed buying decisions"
  };
}