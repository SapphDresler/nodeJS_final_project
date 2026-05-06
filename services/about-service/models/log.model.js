const mongoose = require("mongoose");

const logSchema = new mongoose.Schema(
  {
    service: { type: String, required: true },
    method: { type: String, required: true },
    endpoint: { type: String, required: true },
    status: { type: Number, required: true },
    message: { type: String, default: "" },
    created_at: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

module.exports = mongoose.models.Log || mongoose.model("Log", logSchema, "logs");
