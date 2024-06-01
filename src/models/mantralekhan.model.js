const { Sequelize, Model, DataTypes } = require('sequelize');
const ServerConfig = require('../config/server.config');
const User = require('./user.model');

const sequelize = require('../config/sequelize.config');

const Mantralekhan = sequelize.define(
  'Mantralekhan',
  {
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'users', // This should match the table name of the User model
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      field: 'user_id',
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      primaryKey: true,
    },
    count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: 'mantralekhans',
    timestamps: true,
    uniqueKeys: {
      unique_user_date: {
        fields: ['user_id', 'date'],
      },
    },
  }
);

// Define foreign key constraint
Mantralekhan.belongsTo(User, { foreignKey: 'userId' });

Mantralekhan.sync();

module.exports = Mantralekhan;
