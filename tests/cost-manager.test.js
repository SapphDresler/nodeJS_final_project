const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");

jest.setTimeout(120000);

let mongoServer;
let usersApp;
let costsApp;
let logsApp;
let aboutApp;
let User;
let Cost;
let Log;
let MonthlyReport;
let connectUsersDb;
let connectCostsDb;
let connectLogsDb;
let connectAboutDb;
let usersMongoose;
let costsMongoose;
let logsMongoose;
let aboutMongoose;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri();
  process.env.DEV1_FIRST = "Alice";
  process.env.DEV1_LAST = "Smith";
  process.env.DEV2_FIRST = "Bob";
  process.env.DEV2_LAST = "Jones";

  usersApp = require("../services/users-service/app");
  costsApp = require("../services/costs-service/app");
  logsApp = require("../services/logs-service/app");
  aboutApp = require("../services/about-service/app");
  connectUsersDb = require("../services/users-service/db").connectDb;
  connectCostsDb = require("../services/costs-service/db").connectDb;
  connectLogsDb = require("../services/logs-service/db").connectDb;
  connectAboutDb = require("../services/about-service/db").connectDb;

  await connectUsersDb();
  await connectCostsDb();
  await connectLogsDb();
  await connectAboutDb();

  User = require("../services/users-service/models/user.model");
  Cost = require("../services/costs-service/models/cost.model");
  Log = require("../services/logs-service/models/log.model");
  MonthlyReport = require("../services/costs-service/models/monthly_report.model");
  usersMongoose = require("../services/users-service/node_modules/mongoose");
  costsMongoose = require("../services/costs-service/node_modules/mongoose");
  logsMongoose = require("../services/logs-service/node_modules/mongoose");
  aboutMongoose = require("../services/about-service/node_modules/mongoose");
});

afterAll(async () => {
  await Promise.all([
    usersMongoose.disconnect(),
    costsMongoose.disconnect(),
    logsMongoose.disconnect(),
    aboutMongoose.disconnect()
  ]);
  await mongoServer.stop();
});

beforeEach(async () => {
  await Promise.all([User.deleteMany({}), Cost.deleteMany({}), Log.deleteMany({}), MonthlyReport.deleteMany({})]);
  await User.create({
    id: 123123,
    first_name: "mosh",
    last_name: "israeli",
    birthday: new Date("1990-01-01")
  });
});

test("GET /api/about returns team members names only", async () => {
  const response = await request(aboutApp).get("/api/about");
  expect(response.statusCode).toBe(200);
  expect(response.body).toEqual([
    { first_name: "Alice", last_name: "Smith" },
    { first_name: "Bob", last_name: "Jones" }
  ]);
});

test("GET /api/users returns all users", async () => {
  const response = await request(usersApp).get("/api/users");
  expect(response.statusCode).toBe(200);
  expect(response.body[0].id).toBe(123123);
});

test("POST /api/add in users service creates a user", async () => {
  const response = await request(usersApp).post("/api/add").send({
    id: 222222,
    first_name: "new",
    last_name: "user",
    birthday: "1999-09-09"
  });
  expect(response.statusCode).toBe(201);
  expect(response.body.id).toBe(222222);
});

test("GET /api/users/:id returns total cost", async () => {
  await Cost.create({
    userid: 123123,
    description: "milk",
    category: "food",
    sum: 8,
    created_at: new Date()
  });
  const response = await request(usersApp).get("/api/users/123123");
  expect(response.statusCode).toBe(200);
  expect(response.body.total).toBe(8);
});

test("POST /api/add in costs service validates category", async () => {
  const response = await request(costsApp).post("/api/add").send({
    userid: 123123,
    description: "test",
    category: "invalid",
    sum: 1
  });
  expect(response.statusCode).toBe(400);
  expect(response.body.id).toBe("validation_error");
});

test("POST /api/add in costs service creates cost", async () => {
  const response = await request(costsApp).post("/api/add").send({
    userid: 123123,
    description: "milk",
    category: "food",
    sum: 8
  });
  expect(response.statusCode).toBe(201);
  expect(response.body.userid).toBe(123123);
});

test("GET /api/report returns all required categories", async () => {
  await Cost.create({
    userid: 123123,
    description: "book",
    category: "education",
    sum: 25,
    created_at: new Date(Date.UTC(2026, 0, 15))
  });

  const response = await request(costsApp).get("/api/report?id=123123&year=2026&month=1");
  expect(response.statusCode).toBe(200);
  expect(response.body.userid).toBe(123123);
  expect(response.body.costs).toEqual(
    expect.arrayContaining([
      { food: expect.any(Array) },
      { health: expect.any(Array) },
      { housing: expect.any(Array) },
      { sports: expect.any(Array) },
      { education: expect.any(Array) }
    ])
  );
});

test("GET /api/logs returns persisted logs", async () => {
  await request(usersApp).get("/api/users");
  const response = await request(logsApp).get("/api/logs");
  expect(response.statusCode).toBe(200);
  expect(response.body.length).toBeGreaterThan(0);
});
