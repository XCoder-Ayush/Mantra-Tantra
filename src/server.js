const ServerConfig = require('./config/server.config');
const PORT = ServerConfig.PORT || 3000;
const connectToDatabase = require('./config/db.config');
const app = require('./app');

connectToDatabase()
  .then(() => {
    app.on('error', (error) => {
      console.error(error);
      throw error;
    });
    app.listen(PORT, () => {
      console.log(`Server Started At ${PORT}`);
    });
  })
  .catch((err) => {
    console.log('DB Connection Failed ', err);
  });
