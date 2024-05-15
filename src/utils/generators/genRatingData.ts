export default (data: any) => {
    if(!data){ return null; }

    return JSON.stringify({
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": data.attributes.name,
        "description": data.attributes.text,
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": data.attributes.mark,
          "bestRating": "5",
          "ratingCount": data.attributes.reviews_count,
          "worstRating": "1"
        }
    }, null, 2)
} 