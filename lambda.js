const serverlessExpress = require("@vendia/serverless-express");

const config = require("./common/config");
const api = require("./api");

const requestMapper = ({ event }) => {
  // Your logic here...
  const request = event;
  return request;
};

const responseMapper = ({ statusCode, body, headers, isBase64Encoded }) => {
  // Your logic here...
  const response = { statusCode, body, headers, isBase64Encoded };
  return response;
};

const lambda = serverlessExpress({
  app: api,
  /*
  eventSource: {
    getRequest: requestMapper,
    getResponse: responseMapper,
  },
  */
  logSettings: {
    level: config.log.level || "error", // default: 'error'
  },
});

exports.handler = lambda;
