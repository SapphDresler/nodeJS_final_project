const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  port: Number(process.env.PORT || 3003),
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/cost_manager",
  serviceName: "costs-service",
  categories: ["food", "health", "housing", "sports", "education"]
};
