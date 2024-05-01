const { Sequelize, Model, DataTypes } = require('sequelize');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ServerConfig = require('../config/server.config');

const sequelize = new Sequelize({
  database: ServerConfig.DB_NAME,
  username: ServerConfig.DB_USER,
  password: ServerConfig.DB_PASSWORD,
  host: ServerConfig.DB_HOST,
  port: ServerConfig.DB_PORT,
  dialect: 'postgres',
});

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      lowercase: true,
      trim: true,
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
    avatar: {
      type: DataTypes.STRING, // cloudinary url
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(60),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(10), // Define phone number as a string with length 10
      allowNull: false,
      unique: true,
      validate: {
        len: [10, 10], // Ensure the length is exactly 10 characters
      },
    },
    niyam: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0, // Default value if not provided
    },
    mantraChanted: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'mantra_chanted',
    },
  },
  {
    timestamps: true,
    tableName: 'users',
    hooks: {
      beforeCreate: async (user, options) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
      beforeUpdate: async (user, options) => {
        console.log(user);
        if (!user.changed('password')) {
          // If the password is not changed, skip the hashing process
          return; // No need to call next()
        }
        try {
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(user.password, salt);
          user.password = hashedPassword;
        } catch (error) {
          throw new Error('Error hashing password: ' + error.message);
          // If an error occurs, throw it to indicate a failure
        }
      },
    },
  }
);

User.sync();

// // the defined model is the class itself
// console.log(User === sequelize.models.User); // true

User.prototype.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

User.prototype.generateAccessToken = async function () {
  return await jwt.sign(
    {
      id: this.id,
      email: this.email,
      fullName: this.firstName + ' ' + this.lastName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

// User.prototype.generateRefreshToken = function () {
//   return jwt.sign(
//     {
//       _id: this._id,
//     },
//     process.env.REFRESH_TOKEN_SECRET,
//     {
//       expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
//     }
//   );
// };

module.exports = User;
