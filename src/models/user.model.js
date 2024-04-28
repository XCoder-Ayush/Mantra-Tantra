const { Sequelize, DataTypes } = require("sequelize");

const ServerConfig = require("../config/server.config");

const sequelize = new Sequelize({
  database: ServerConfig.DB_NAME,
  username: ServerConfig.DB_USER,
  password: ServerConfig.DB_PASSWORD,
  host: ServerConfig.DB_HOST,
  port: ServerConfig.DB_PORT,
  dialect: "postgres",
});

const User = sequelize.define("User", {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  birthday: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

User.sync();

module.exports = User;
