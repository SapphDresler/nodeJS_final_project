const app = require("./app");
const { connectDb } = require("./db");
const { port } = require("./config");

async function start() {
  await connectDb();
  app.listen(port, () => {
    // single-line comment: start info for local debug
    console.log(`users-service listening on port ${port}`);
  });
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
