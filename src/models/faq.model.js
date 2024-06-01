const { Sequelize, Model, DataTypes } = require('sequelize');
const ServerConfig = require('../config/server.config');

const sequelize = require('../config/sequelize.config');

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
