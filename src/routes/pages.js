const express = require('express');
const { bookingWindow } = require('../booking');

const router = express.Router();

const pages = {
  '/': 'index',
  '/about': 'about',
  '/services': 'services',
  '/contact': 'contact',
  '/disclaimer': 'disclaimer',
  '/privacy': 'privacy'
};

// Extra data some pages need when rendering
const pageLocals = {
  contact: () => ({ bookingWindow: bookingWindow() })
};

Object.entries(pages).forEach(([route, view]) => {
  router.get(route, (req, res) => {
    res.render(`pages/${view}`, pageLocals[view] ? pageLocals[view]() : {});
  });
});

// Keep old .html links working
router.get('/:page.html', (req, res, next) => {
  const route = req.params.page === 'index' ? '/' : `/${req.params.page}`;
  if (pages[route]) return res.redirect(301, route);
  next();
});

module.exports = router;
