const express = require('express');
const { bookingWindow } = require('../booking');
const { categories, findService } = require('../data/services');
const { faq } = require('../data/faq');

const router = express.Router();

const pages = {
  '/': 'index',
  '/about': 'about',
  '/services': 'services',
  '/contact': 'contact',
  '/disclaimer': 'disclaimer',
  '/privacy': 'privacy',
  '/faq': 'faq'
};

// Extra data some pages need when rendering
const pageLocals = {
  contact: () => ({ bookingWindow: bookingWindow() }),
  services: () => ({ categories }),
  faq: () => ({ faq })
};

Object.entries(pages).forEach(([route, view]) => {
  router.get(route, (req, res) => {
    res.render(`pages/${view}`, pageLocals[view] ? pageLocals[view]() : {});
  });
});

router.get('/services/:slug', (req, res, next) => {
  const service = findService(req.params.slug);
  if (!service) return next();
  const related = service.category.services.filter((s) => s.slug !== service.slug);
  res.render('pages/service', { service, related });
});

// Keep old .html links working
router.get('/:page.html', (req, res, next) => {
  const route = req.params.page === 'index' ? '/' : `/${req.params.page}`;
  if (pages[route]) return res.redirect(301, route);
  next();
});

module.exports = router;
