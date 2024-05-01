const { Sequelize, Model, DataTypes } = require('sequelize');
const ServerConfig = require('../config/server.config');

const sequelize = new Sequelize({
  database: ServerConfig.DB_NAME,
  username: ServerConfig.DB_USER,
  password: ServerConfig.DB_PASSWORD,
  host: ServerConfig.DB_HOST,
  port: ServerConfig.DB_PORT,
  dialect: 'postgres',
});

const Query = sequelize.define(
  'Query',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    subject: {
      type: DataTypes.STRING(1000),
      allowNull: false,
    },
    content: {
      type: DataTypes.STRING(1000),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'first_name',
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'last_name',
    },
  },
  {
    tableName: 'queries',
    timestamps: true,
  }
);

Query.sync();

module.exports = Query;
