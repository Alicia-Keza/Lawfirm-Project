const path = require('path');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

const pages = {
  '/': 'index',
  '/about': 'about',
  '/services': 'services',
  '/contact': 'contact',
  '/disclaimer': 'disclaimer',
  '/privacy': 'privacy'
};

Object.entries(pages).forEach(([route, view]) => {
  app.get(route, (req, res) => res.render(`pages/${view}`));
});

// Keep old .html links working
app.get('/:page.html', (req, res, next) => {
  const route = req.params.page === 'index' ? '/' : `/${req.params.page}`;
  if (pages[route]) return res.redirect(301, route);
  next();
});

app.use((req, res) => {
  res.status(404).render('pages/404');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
