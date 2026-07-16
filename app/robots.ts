import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/seller', '/orders', '/profile', '/checkout', '/payment-success', '/payment-failed', '/reset-password'],
    },
    sitemap: 'https://codebazaar.in/sitemap.xml',
  };
}
