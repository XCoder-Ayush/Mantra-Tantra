const { Sequelize, Model, DataTypes } = require('sequelize');
const ServerConfig = require('../config/server.config');
const User = require('./user.model');

const sequelize = require('../config/sequelize.config');

const Testimonial = sequelize.define(
  'Testimonial',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    content: {
      type: DataTypes.STRING(1000),
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users', // This should match the table name of the User model
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      field: 'user_id',
    },
    fullName: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: 'testimonials',
    timestamps: true,
  }
);

// Define foreign key constraint
Testimonial.belongsTo(User, { foreignKey: 'userId' });

Testimonial.sync();

module.exports = Testimonial;
