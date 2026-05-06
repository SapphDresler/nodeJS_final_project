const mongoose = require("mongoose");

const costSchema = new mongoose.Schema(
  {
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    userid: { type: Number, required: true },
    sum: { type: Number, required: true },
    created_at: { type: Date, required: true, default: Date.now }
  },
  { versionKey: false }
);

module.exports = mongoose.models.Cost || mongoose.model("Cost", costSchema, "costs");
