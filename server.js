const config = require('./src/config');
const { createApp } = require('./src/app');

createApp().listen(config.port, () => {
  console.log(`Server running at http://localhost:${config.port} (${config.env})`);
});
