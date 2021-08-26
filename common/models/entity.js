const moment = require("moment-timezone");
const { Sequelize } = require("sequelize");

const config = require("../config");

moment.tz.setDefault(config.timezone);

const entity = (sequelize) => {
  const date = {
    get(self, column) {
      const value = self.getDataValue(column);
      const result = value
        ? moment.utc(value).format("YYYY-MM-DD HH:mm:ss.SSS")
        : value;
      return result;
    },
    set(self, column, value) {
      const result = value
        ? moment(value).format("YYYY-MM-DD HH:mm:ss.SSS")
        : value;
      self.setDataValue(column, result);
    },
  };
  const attributes = (obj) => {
    return Object.assign(
      {
        id: {
          type: Sequelize.INTEGER /*.UNSIGNED*/,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
      },
      obj,
      {
        created_user: {
          type: Sequelize.STRING(255),
          allowNull: false,
          defaultValue: "SYSTEM",
        },
        created_date: {
          type: Sequelize.DATE(3),
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
          get() {
            return date.get(this, "created_date");
          },
          set(value) {
            date.set(this, "created_date", value);
          },
        },
        updated_user: {
          type: Sequelize.STRING(255),
          allowNull: false,
          defaultValue: "SYSTEM",
        },
        updated_date: {
          type: Sequelize.DATE(3),
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
          onUpdate: Sequelize.literal("CURRENT_TIMESTAMP"),
          get() {
            return date.get(this, "updated_date");
          },
          set(value) {
            date.set(this, "updated_date", value);
          },
        },
        deleted_user: { type: Sequelize.STRING(255), defaultValue: null },
        deleted_date: {
          type: Sequelize.DATE(3),
          allowNull: true,
          defaultValue: null,
          onDelete: Sequelize.literal("CURRENT_TIMESTAMP"),
          get() {
            return date.get(this, "deleted_date");
          },
          set(value) {
            date.set(this, "deleted_date", value);
          },
        },
      }
    );
  };
  const options = (obj) => {
    return Object.assign(obj, {
      sequelize,
      freezeTableName: true,
      timestamps: true,
      underscored: true,
      paranoid: true,
      createdAt: "created_date",
      updatedAt: "updated_date",
      deletedAt: "deleted_date",
    });
  };
  return { date, attributes, options };
};

module.exports = entity;
