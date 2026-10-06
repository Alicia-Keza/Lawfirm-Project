const express = require('express');
const config = require('../config');
const { allServices } = require('../data/services');

const router = express.Router();

const STATIC_PAGES = [
  { path: '/', priority: '1.0' },
  { path: '/services', priority: '0.9' },
  { path: '/contact', priority: '0.9' },
  { path: '/about', priority: '0.8' },
  { path: '/faq', priority: '0.7' },
  { path: '/disclaimer', priority: '0.3' },
  { path: '/privacy', priority: '0.3' }
];

const escapeXml = (s) =>
  s.replace(
    /[<>&'"]/g,
    (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]
  );

router.get('/robots.txt', (req, res) => {
  res
    .type('text/plain')
    .send(
      [
        'User-agent: *',
        'Allow: /',
        'Disallow: /admin',
        'Disallow: /api',
        '',
        `Sitemap: ${config.siteUrl}/sitemap.xml`,
        ''
      ].join('\n')
    );
});

router.get('/sitemap.xml', (req, res) => {
  const pages = [
    ...STATIC_PAGES,
    ...allServices.map((s) => ({ path: `/services/${s.slug}`, priority: '0.6' }))
  ];
  const urls = pages
    .map(
      (p) =>
        `  <url>\n    <loc>${escapeXml(config.siteUrl + p.path)}</loc>\n    <priority>${p.priority}</priority>\n  </url>`
    )
    .join('\n');
  res
    .type('application/xml')
    .send(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
    );
});

module.exports = router;
