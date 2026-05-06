const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  port: Number(process.env.PORT || 3004),
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/cost_manager",
  serviceName: "about-service",
  teamMembers: [
    { first_name: process.env.DEV1_FIRST || "team", last_name: process.env.DEV1_LAST || "member1" },
    { first_name: process.env.DEV2_FIRST || "team", last_name: process.env.DEV2_LAST || "member2" }
  ]
};
