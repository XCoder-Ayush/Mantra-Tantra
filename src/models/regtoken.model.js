const { Sequelize, Model, DataTypes } = require('sequelize');
const ServerConfig = require('../config/server.config');

const sequelize = require('../config/sequelize.config');

const RegToken = sequelize.define(
  'RegToken',
  {
    regToken: {
      type: DataTypes.STRING(1000),
      allowNull: false,
      field: 'reg_token',
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'expires_at',
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: 'reg_tokens',
    timestamps: false,
  }
);

RegToken.sync();

module.exports = RegToken;
