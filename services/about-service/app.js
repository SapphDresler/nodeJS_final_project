const express = require("express");
const { requestLogger, logger } = require("./middleware/request-logger");
const { errorToJson } = require("./utils/error");
const { teamMembers } = require("./config");

const app = express();
app.use(express.json());
app.use(requestLogger);

app.get("/api/about", async (req, res) => {
  res.json(teamMembers.map((member) => ({ first_name: member.first_name, last_name: member.last_name })));
});

app.use((error, req, res, next) => {
  logger.error({ err: error }, "request_failed");
  res.status(error.status || 500).json(errorToJson(error));
});

module.exports = app;
