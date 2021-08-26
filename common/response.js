const { getCurrentInvoke } = require("@vendia/serverless-express");

const config = require("./config");

const response = {
  success(body = null) {
    const { event } = getCurrentInvoke();
    const result = {
      statusCode: 200,
      headers: event ? event.headers : {},
      body: body !== null ? body : {},
      isBase64Encoded: event ? event.headers : false,
    };
    return result;
  },
  failure(e) {
    const { event } = getCurrentInvoke();
    const result = {
      statusCode: e.statusCode || 500,
      headers: event ? event.headers : {},
      errorType: e.name || "Error",
      errorMessage: e.message || "Internal server error",
      stackTrace: [],
      isBase64Encoded: event ? event.headers : false,
    };
    //if (config.nodeEnv.indexOf("development") !== -1) result.stackTrace.push(e.stack);
    if (config.nodeEnv.indexOf("development") !== -1)
      result.stackTrace = e.stack.split("\n");
    return result;
  },
};

module.exports = response;
