console.log("start");

const config = require("../common/config");
const { sequelize, model } = require("../common/db");
const data = {
  authorities: require("../__tests__/data/Authorities.json"),
  users: require("../__tests__/data/Users.json"),
  userAuthorities: require("../__tests__/data/UserAuthorities.json"),
};

const { Authority, User, UserAuthority } = model;

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
    const transaction = await sequelize.transaction();
    try {
      await Authority.bulkCreate(data.authorities, { transaction });
      await User.bulkCreate(data.users, { transaction });
      await UserAuthority.bulkCreate(data.userAuthorities, { transaction });
      await transaction.commit();
      await sequelize.close();
      console.log("finish");
    } catch (e) {
      await transaction.rollback();
      throw e;
    }
  } catch (e) {
    console.error(e);
  }
})();
