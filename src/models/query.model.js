const { Sequelize, Model, DataTypes } = require('sequelize');
const ServerConfig = require('../config/server.config');

const sequelize = require('../config/sequelize.config');

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
      required: true,
    },
    content: {
      type: DataTypes.STRING(1000),
      allowNull: false,
      required: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      required: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'first_name',
      required: true,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'last_name',
      required: true,
    },
  },
  {
    tableName: 'queries',
    timestamps: true,
  }
);

Query.sync();

module.exports = Query;
