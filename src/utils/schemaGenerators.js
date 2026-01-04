// Schema generators for SEO

function CleanAndShort(title) {
  const newTtitle = title.replace(/®/g, '')
    .replace(/™/g, '')
    .replace(/©/g, '')
  return newTtitle.length > 150 ? newTtitle.substring(0, 147) + '...' : newTtitle;
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
        "url": product.affiliate,
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
          : product.affiliate,
        "offers": {
          "@type": "Offer",
          "price": product.price.toFixed(2),
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock",
          "url": product.affiliate
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
        "item": `https://candidfindings.com/?category=${encodeURIComponent(category)}`
      }
    ]
  };
}