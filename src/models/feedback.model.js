const { Sequelize, DataTypes } = require('sequelize');
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
