const { Sequelize, Model, DataTypes } = require('sequelize');
const ServerConfig = require('../config/server.config');
const User = require('./user.model');

const sequelize = new Sequelize({
  database: ServerConfig.DB_NAME,
  username: ServerConfig.DB_USER,
  password: ServerConfig.DB_PASSWORD,
  host: ServerConfig.DB_HOST,
  port: ServerConfig.DB_PORT,
  dialect: 'postgres',
});

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
