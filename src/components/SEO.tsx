import React from 'react';
import { Helmet } from 'react-helmet-async';
import { COMPANY_PHONE, COMPANY_EMAIL } from '../constants';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  type?: 'website' | 'article' | 'product';
  image?: string;
}

export const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  keywords = "wholesale optical, eyewear b2b, frames india, goggles bulk, atif khan, ayan khan, apna vision", 
  canonical = "https://apnavision.in",
  type = 'website',
  image = "https://images.unsplash.com/photo-1577744062666-4e924d5b784a?q=80&w=2070" 
}) => {
  const siteTitle = "Apna Vision | India's #1 B2B Optical Marketplace";
  const fullTitle = title === "Home" ? siteTitle : `${title} | Apna Vision`;

  // Structured Data (JSON-LD) for Local Business & Organization
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WholesaleStore",
    "name": "Apna Vision",
    "image": image,
    "description": description,
    "telephone": `+91-${COMPANY_PHONE}`,
    "email": COMPANY_EMAIL,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Central Market, Lajpat Nagar",
      "addressLocality": "New Delhi",
      "addressRegion": "Delhi",
      "postalCode": "110024",
      "addressCountry": "IN"
    },
    "founders": [
      {
        "@type": "Person",
        "name": "Atif Khan",
        "jobTitle": "Co-Founder & CTO"
      },
      {
        "@type": "Person",
        "name": "Ayan Khan",
        "jobTitle": "Co-Founder & CEO"
      }
    ],
    "priceRange": "₹₹",
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
      ],
      "opens": "10:00",
      "closes": "19:00"
    },
    "url": "https://apnavisionco.in"
  };

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph / Facebook / WhatsApp */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={canonical} />
      <meta property="og:site_name" content="Apna Vision" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Structured Data for Google */}
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>
    </Helmet>
  );
};