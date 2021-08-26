const { Sequelize } = require("sequelize");

const entity = (sequelize) => {
  const { attributes, options } = require("./entity")(sequelize);
  return sequelize.define(
    "Authority",
    attributes({
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      remark: {
        type: Sequelize.STRING(1024),
        allowNull: false,
        defaultValue: "",
      },
    }),
    options({ modelName: "Authority", tableName: "t_m_authority" })
  );
};

module.exports = entity;
