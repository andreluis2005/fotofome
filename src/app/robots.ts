import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/studio/', '/api/'],
      },
    ],
    sitemap: 'https://fotofome.ai/sitemap.xml',
  };
}
