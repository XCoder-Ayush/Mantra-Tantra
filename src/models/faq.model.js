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

const FAQ = sequelize.define(
  'FAQ',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    question: {
      type: DataTypes.STRING(1000),
      allowNull: false,
    },
    answer: {
      type: DataTypes.STRING(1000),
      allowNull: false,
    },
  },
  {
    tableName: 'faqs',
    timestamps: true,
  }
);

FAQ.sync();

module.exports = FAQ;
