const ServerConfig = require('./config/server.config');
const PORT = ServerConfig.PORT || 3000;
const connectToDatabase = require('./config/db.config');
const app = require('./app');
const User = require('./models/user.model');
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
connectToDatabase()
  .then(() => {
    app.on('error', (error) => {
      console.error(error);
      throw error;
    });
    app.listen(PORT, () => {
      console.log(`Server Started At ${PORT}`);
      console.log(`Running in ${process.env.NODE_ENV} mode`);
    });
  })
  .catch((err) => {
    console.log('DB Connection Failed ', err);
  });
