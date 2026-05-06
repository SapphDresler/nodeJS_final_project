const mongoose = require("mongoose");

const monthlyReportSchema = new mongoose.Schema(
  {
    userid: { type: Number, required: true },
    year: { type: Number, required: true },
    month: { type: Number, required: true },
    costs: { type: Array, required: true }
  },
  { versionKey: false }
);

monthlyReportSchema.index({ userid: 1, year: 1, month: 1 }, { unique: true });

module.exports =
  mongoose.models.MonthlyReport ||
  mongoose.model("MonthlyReport", monthlyReportSchema, "monthly_reports");
