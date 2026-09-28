const express = require('express');

const router = express.Router();

const pages = {
  '/': 'index',
  '/about': 'about',
  '/services': 'services',
  '/contact': 'contact',
  '/disclaimer': 'disclaimer',
  '/privacy': 'privacy'
};

Object.entries(pages).forEach(([route, view]) => {
  router.get(route, (req, res) => res.render(`pages/${view}`));
});

// Keep old .html links working
router.get('/:page.html', (req, res, next) => {
  const route = req.params.page === 'index' ? '/' : `/${req.params.page}`;
  if (pages[route]) return res.redirect(301, route);
  next();
});

module.exports = router;
