const path = require('path');
const express = require('express');
const pageRoutes = require('./routes/pages');

function createApp() {
  const app = express();

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, '..', 'views'));

  app.use(express.static(path.join(__dirname, '..', 'public')));

  app.use(pageRoutes);

  app.use((req, res) => {
    res.status(404).render('pages/404');
  });

  return app;
}

module.exports = { createApp };
