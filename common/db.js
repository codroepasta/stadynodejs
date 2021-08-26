const { Sequelize } = require("sequelize");
const onFinished = require("on-finished");

const config = require("./config");
const log = require("./log")();
const w = require("./wrapper");

// TODO: Loggerの設定
const options = Object.assign({}, config.db[config.db.type]);
if (config.nodeEnv.indexOf("development") === -1) options.logging = false;
const sequelize = new Sequelize(options);

const Authority = require("./models/authority")(sequelize);
const User = require("./models/user")(sequelize);
const UserAuthority = require("./models/userAuthority")(sequelize);

User.hasMany(UserAuthority, { targetKey: "id", foreignKey: "user_id" });

const model = {
  Authority,
  User,
  UserAuthority,
};

const handler = () =>
  w((req, res, next) => {
    if (config.nodeEnv.indexOf("lambda") !== -1) {
      onFinished(req, (e) => {
        (async () => {
          try {
            await sequelize.close();
          } catch (e) {}
        })();
      });
    }
    next();
  });

const db = { sequelize, model, handler };

module.exports = db;
