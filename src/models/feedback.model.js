const { Sequelize, DataTypes } = require('sequelize');
const ServerConfig = require('../config/server.config');
const User = require('./user.model');

const sequelize = require('../config/sequelize.config');

const Feedback = sequelize.define(
  'Feedback',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: User,
        key: 'email',
      },
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'full_name',
    },
    comment: {
      type: DataTypes.STRING(1000),
      allowNull: false,
    },
  },
  {
    tableName: 'feedbacks',
    timestamps: true,
  }
);

Feedback.belongsTo(User, { foreignKey: 'email', targetKey: 'email' });

Feedback.sync();

module.exports = Feedback;
