const ServerConfig = require('./server.config');
const { Client } = require('pg');

async function connectToDatabase() {
  const client = new Client({
    connectionString: ServerConfig.DB_URL,
  });

  try {
    await client.connect();
    console.log('Connected @ PostgreSQL Database Successfully ');
  } catch (error) {
    console.error('Error Connecting @ PostgreSQL:', error);
    process.exit(1);
  } finally {
    // Uncomment the following line if you want to close the connection after successful or failed attempt
    // await client.end();
  }
}

module.exports = connectToDatabase;
