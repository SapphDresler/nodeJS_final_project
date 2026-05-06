const app = require("./app");
const { connectDb } = require("./db");
const { port } = require("./config");

async function start() {
  await connectDb();
  app.listen(port, () => {
    console.log(`about-service listening on port ${port}`);
  });
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
