// Schema generators for SEO

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

export function generateReviewSchema(product, blog) {
  if (!product || !blog) return null;

  return {
    "@context": "https://schema.org",
    "@type": "Review",
    "reviewBody": blog.excerpt || blog.metaDescription,
    "itemReviewed": {
      "@type": "Product",
      "name": product.title,
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