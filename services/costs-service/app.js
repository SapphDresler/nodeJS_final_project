const express = require("express");
const Cost = require("./models/cost.model");
const User = require("./models/user.model");
const MonthlyReport = require("./models/monthly_report.model");
const { requestLogger, logger } = require("./middleware/request-logger");
const { makeError, errorToJson } = require("./utils/error");
const { categories } = require("./config");

const app = express();

function toYearMonth(date) {
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1 };
}

function isPastMonth(year, month) {
  const now = new Date();
  const current = toYearMonth(now);
  return year < current.year || (year === current.year && month < current.month);
}

function buildCategoryMap() {
  const map = {};
  categories.forEach((category) => {
    map[category] = [];
  });
  return map;
}

function formatReport(userid, year, month, grouped) {
  return {
    userid,
    year,
    month,
    costs: categories.map((category) => ({ [category]: grouped[category] || [] }))
  };
}

async function computeReport(userid, year, month) {
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));
  const costs = await Cost.find({
    userid,
    created_at: { $gte: start, $lt: end }
  }).lean();

  const grouped = buildCategoryMap();
  costs.forEach((cost) => {
    if (!grouped[cost.category]) {
      return;
    }
    grouped[cost.category].push({
      sum: cost.sum,
      description: cost.description,
      day: new Date(cost.created_at).getUTCDate()
    });
  });
  return formatReport(userid, year, month, grouped);
}

app.use(express.json());
app.use(requestLogger);

app.post("/api/add", async (req, res, next) => {
  try {
    const { userid, description, category, sum, created_at } = req.body;
    if (typeof userid !== "number" || !description || !category || typeof sum !== "number") {
      throw makeError("validation_error", "userid, description, category and sum are required");
    }
    if (!categories.includes(category)) {
      throw makeError("validation_error", "Invalid category");
    }

    const userExists = await User.exists({ id: userid });
    if (!userExists) {
      throw makeError("user_not_found", "Cannot add cost for unknown user", 404);
    }

    const costDate = created_at ? new Date(created_at) : new Date();
    if (Number.isNaN(costDate.getTime())) {
      throw makeError("validation_error", "created_at must be a valid date");
    }

    const now = new Date();
    if (costDate < now && created_at) {
      throw makeError("validation_error", "Cannot add costs with dates in the past");
    }

    const doc = await Cost.create({ userid, description, category, sum, created_at: costDate });
    const ym = toYearMonth(costDate);
    await MonthlyReport.deleteOne({ userid, year: ym.year, month: ym.month });

    res.status(201).json(doc.toObject());
  } catch (error) {
    next(error);
  }
});

app.get("/api/report", async (req, res, next) => {
  try {
    const userid = Number(req.query.id);
    const year = Number(req.query.year);
    const month = Number(req.query.month);

    if ([userid, year, month].some((value) => Number.isNaN(value))) {
      throw makeError("validation_error", "id, year and month must be numbers");
    }
    if (month < 1 || month > 12) {
      throw makeError("validation_error", "month must be between 1 and 12");
    }

    const userExists = await User.exists({ id: userid });
    if (!userExists) {
      throw makeError("user_not_found", "User not found", 404);
    }

    /**
     * Computed Design Pattern:
     * For months in the past, cache the computed monthly report in the
     * monthly_reports collection. Future/current months are computed live
     * to reflect incoming costs, while past months are stable and reused.
     */
    if (isPastMonth(year, month)) {
      const existing = await MonthlyReport.findOne({ userid, year, month }).lean();
      if (existing) {
        res.json({ userid, year, month, costs: existing.costs });
        return;
      }
      const computed = await computeReport(userid, year, month);
      await MonthlyReport.create(computed);
      res.json(computed);
      return;
    }

    const liveReport = await computeReport(userid, year, month);
    res.json(liveReport);
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  logger.error({ err: error }, "request_failed");
  res.status(error.status || 500).json(errorToJson(error));
});

module.exports = app;
