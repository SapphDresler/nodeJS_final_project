const pino = require("pino");
const Log = require("../models/log.model");
const { serviceName } = require("../config");

const logger = pino({ name: serviceName });

function requestLogger(req, res, next) {
  const start = Date.now();
  logger.info({ method: req.method, url: req.originalUrl }, "request_received");

  res.on("finish", async () => {
    const message = `Completed in ${Date.now() - start}ms`;
    logger.info({ status: res.statusCode, url: req.originalUrl }, message);
    try {
      await Log.create({
        service: serviceName,
        method: req.method,
        endpoint: req.originalUrl,
        status: res.statusCode,
        message
      });
    } catch (error) {
      logger.error({ err: error }, "failed_to_persist_log");
    }
  });

  next();
}

module.exports = { requestLogger, logger };
