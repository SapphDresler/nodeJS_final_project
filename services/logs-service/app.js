const express = require("express");
const Log = require("./models/log.model");
const { requestLogger, logger } = require("./middleware/request-logger");
const { errorToJson } = require("./utils/error");

const app = express();
app.use(express.json());
app.use(requestLogger);

app.get("/api/logs", async (req, res, next) => {
  try {
    const logs = await Log.find({}).sort({ created_at: -1 }).lean();
    res.json(logs);
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  logger.error({ err: error }, "request_failed");
  res.status(500).json(errorToJson(error));
});

module.exports = app;
