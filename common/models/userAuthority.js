const { Sequelize } = require("sequelize");

const entity = (sequelize) => {
  const { attributes, options } = require("./entity")(sequelize);
  return sequelize.define(
    "UserAuthority",
    attributes({
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      remark: {
        type: Sequelize.STRING(1024),
        allowNull: false,
        defaultValue: "",
      },
    }),
    options({ modelName: "UserAuthority", tableName: "t_m_user_authority" })
  );
};

module.exports = entity;
