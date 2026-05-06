const express = require("express");
const User = require("./models/user.model");
const Cost = require("./models/cost.model");
const { requestLogger, logger } = require("./middleware/request-logger");
const { makeError, errorToJson } = require("./utils/error");

const app = express();

app.use(express.json());
app.use(requestLogger);

app.post("/api/add", async (req, res, next) => {
  try {
    const { id, first_name, last_name, birthday } = req.body;

    if (typeof id !== "number" || !first_name || !last_name || !birthday) {
      throw makeError("validation_error", "id, first_name, last_name and birthday are required");
    }

    const createdUser = await User.create({ id, first_name, last_name, birthday });
    res.status(201).json(createdUser.toObject());
  } catch (error) {
    if (error.code === 11000) {
      next(makeError("duplicate_user", "A user with this id already exists", 409));
      return;
    }
    next(error);
  }
});

app.get("/api/users", async (req, res, next) => {
  try {
    const users = await User.find({}).lean();
    res.json(users);
  } catch (error) {
    next(error);
  }
});

app.get("/api/users/:id", async (req, res, next) => {
  try {
    const userId = Number(req.params.id);
    if (Number.isNaN(userId)) {
      throw makeError("validation_error", "id must be a number");
    }

    const user = await User.findOne({ id: userId }).lean();
    if (!user) {
      throw makeError("user_not_found", "User not found", 404);
    }

    const totalAggregate = await Cost.aggregate([
      { $match: { userid: userId } },
      { $group: { _id: null, total: { $sum: "$sum" } } }
    ]);

    res.json({
      first_name: user.first_name,
      last_name: user.last_name,
      id: user.id,
      total: totalAggregate[0] ? totalAggregate[0].total : 0
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/users/check/:id", async (req, res, next) => {
  try {
    const userId = Number(req.params.id);
    if (Number.isNaN(userId)) {
      throw makeError("validation_error", "id must be a number");
    }
    const exists = await User.exists({ id: userId });
    res.json({ id: userId, exists: Boolean(exists) });
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  logger.error({ err: error }, "request_failed");
  res.status(error.status || 500).json(errorToJson(error));
});

module.exports = app;
