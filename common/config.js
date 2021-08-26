if (
  process.env.NODE_ENV === "development" ||
  process.env.NODE_ENV === "__tests__"
)
  require("dotenv").config();

const errors = require("./errors");

const set = (envName, throwable = true) => {
  if (envName in process.env) return process.env[envName];
  if (throwable) throw errors.config();
  return null;
};
const setNumber = (envName, throwable = true) => {
  if (envName in process.env) return Number(process.env[envName]);
  if (throwable) throw errors.config();
  return null;
};
const setBoolean = (envName, throwable = true) => {
  if (envName in process.env)
    return process.env[envName].toLowerCase() === "true";
  if (throwable) throw errors.config();
  return null;
};
const setArray = (envName, throwable = true) => {
  if (envName in process.env)
    try {
      return JSON.parse(process.env[envName]);
    } catch (e) {}
  if (throwable) throw errors.config();
  return [];
};

const config = {
  env: process.env,
  nodeEnv: set("NODE_ENV"),
  port: setNumber("PORT"),
  timezone: set("TIMEZONE"),
  maintenance: {
    enable: setBoolean("MAINTENANCE_ENABLE"),
  },
  log: {
    name: set("LOG_NAME"),
    level: set("LOG_LEVEL"),
  },
  db: {
    type: set("DB_TYPE"),
    sqlite: {
      dialect: set("SQLITE_DIALECT", set("DB_TYPE") === "sqlite"),
      storage: set("SQLITE_STORAGE", set("DB_TYPE") === "sqlite"),
      pool: {
        max: setNumber("SQLITE_POOL_MAX", set("DB_TYPE") === "sqlite"),
        min: setNumber("SQLITE_POOL_MIN", set("DB_TYPE") === "sqlite"),
        acquire: setNumber("SQLITE_POOL_ACQUIRE", set("DB_TYPE") === "sqlite"),
        idle: setNumber("SQLITE_POOL_IDLE", set("DB_TYPE") === "sqlite"),
      },
    },
  },
  cors: {
    enable: setBoolean("CORS_ENABLE"),
    whiteList: setArray("CORS_WHITE_LIST", setBoolean("CORS_ENABLE")),
  },
  jwt: {
    secret: set("JWT_SECRET"),
    options: {
      expiresIn: set("JWT_OPTIONS_EXPIRES_IN"),
    },
  },
  salt: {
    rounds: setNumber("SALT_ROUNDS"),
  },
};

module.exports = config;
