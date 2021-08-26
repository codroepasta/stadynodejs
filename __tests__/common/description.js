const createError = require("http-errors");

const partition = ",";
const description = (statusCode, ...param) => {
  const statusName = statusCode == 200 ? "OK" : createError(statusCode).name;
  return [statusCode, statusName].concat(param).join(partition);
};

module.exports = description;
