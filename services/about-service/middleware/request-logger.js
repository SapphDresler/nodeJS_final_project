const pino = require("pino");
const Log = require("../models/log.model");
const { serviceName } = require("../config");

const logger = pino({ name: serviceName });

function requestLogger(req, res, next) {
  logger.info({ method: req.method, endpoint: req.originalUrl }, "request_received");
  res.on("finish", async () => {
    try {
      await Log.create({
        service: serviceName,
        method: req.method,
        endpoint: req.originalUrl,
        status: res.statusCode,
        message: "request_finished"
      });
    } catch (error) {
      logger.error({ err: error }, "failed_to_persist_log");
    }
  });
  next();
}

module.exports = { requestLogger, logger };
