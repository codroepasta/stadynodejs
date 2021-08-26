const { performance } = require("perf_hooks");
const bunyan = require("bunyan");
const bunyanFormat = require("bunyan-format");
const onFinished = require("on-finished");
const { getCurrentInvoke } = require("@vendia/serverless-express");

const config = require("./config");
const w = require("./wrapper");

const logs = {};

const log = (name = config.log.name) => {
  if (name in logs) return logs[name];

  const opt = {
    name,
    level: config.log.level,
    stream: bunyanFormat({ outputMode: "json", levelInString: true }),
    serializers: {
      error: (error) => {
        if (!error) return {};
        const { name, message, stack } = error;
        return { name, message, stack };
      },
      lambda: ({ event, context }) => {
        if (!event || !context) return {};
        const { path, httpMethod, headers, identity } = event;
        const { awsRequestId, functionName, functionVersion } = context;
        return {
          path,
          httpMethod,
          headers,
          identity,
          awsRequestId,
          functionName,
          functionVersion,
        };
      },
      payload: (payload) => {
        if (!payload) return {};
        return JSON.parse(unescape(payload));
      },
      performance: (performance) => {
        const { start, finish } = performance;
        return Math.round(finish - start);
      },
    },
  };
  const logger = bunyan.createLogger(opt);

  const get = (args = null, req = null) => {
    const { event, context } = getCurrentInvoke();
    let result = { express: {}, lambda: { event, context } };
    if (args) result = Object.assign(result, args);
    if (req) {
      result.express.url = req.url.split("?")[0];
      result.express.method = req.method;
    }
    return result;
  };

  const newLog = {
    fatal: (error, req = null, status = "FATAL") => {
      if (config.nodeEnv === "__tests__") return;
      logger.fatal(get({ error }, req), status);
    },
    error: (error, req = null, status = "ERROR") => {
      if (config.nodeEnv === "__tests__") return;
      logger.error(get({ error }, req), status);
    },
    info: (message, req = null, status = "RUNNING") => {
      if (config.nodeEnv === "__tests__") return;
      logger.info(get({ message }, req), status);
    },
    warn: (message, req = null, status = "RUNNING") => {
      if (config.nodeEnv === "__tests__") return;
      logger.warn(get({ message }, req), status);
    },
    debug: (message, req = null, status = "RUNNING") => {
      if (config.nodeEnv === "__tests__") return;
      return logger.debug(get({ message }, req), status);
    },
    handler: () =>
      w((req, res, next) => {
        if (config.nodeEnv === "__tests__") return next();
        const start = performance.now();
        const onPerformance = () => {
          const finish = performance.now();
          logger.info(
            get({ performance: { start, finish } }, req),
            "PERFORMANCE"
          );
        };
        const { params, query, body, header } = req;
        logger.info(get({ params, query, body, header }, req), "START");
        const chunks = [];
        const { write, end } = res;
        res.write = function (chunk) {
          chunks.push(chunk);
          return write.apply(res, arguments);
        };
        res.end = function (chunk) {
          chunks.push(chunk);
          return end.apply(res, arguments);
        };
        onFinished(res, (e) => {
          const payload = Buffer.concat(chunks).toString("utf8");
          logger.info(get({ payload }, req), "END");
          onPerformance();
        });
        next();
      }),
  };

  logs[name] = newLog;
  return logs[name];
};

module.exports = log;
