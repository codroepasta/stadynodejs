const { Sequelize } = require("sequelize");
const bcrypt = require("bcrypt");

const config = require("../config");

const entity = (sequelize) => {
  const { attributes, options } = require("./entity")(sequelize);
  return sequelize.define(
    "User",
    attributes({
      login_id: {
        type: Sequelize.STRING(16),
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING(60),
        allowNull: false,
        set(value) {
          const salt = bcrypt.genSaltSync(config.salt.rounds);
          const hash = bcrypt.hashSync(value, salt);
          this.setDataValue("password", hash);
        },
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        defaultValue: "No name",
      },
      activate: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      remark: {
        type: Sequelize.STRING(1024),
        allowNull: false,
        defaultValue: "",
      },
    }),
    options({ modelName: "User", tableName: "t_m_user" })
  );
};

module.exports = entity;
