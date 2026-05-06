# Deployment and Verification

## 1) Deploy four separate processes

Deploy each service as a separate process:

- logs service: `services/logs-service/server.js`
- users service: `services/users-service/server.js`
- costs service: `services/costs-service/server.js`
- about service: `services/about-service/server.js`

If hosted on one machine, use different ports.

## 2) Set environment variables for each service

- `MONGO_URI`
- `PORT` (unique per service)
- `DEV1_FIRST`, `DEV1_LAST`, `DEV2_FIRST`, `DEV2_LAST` for about service

## 3) Fill test script endpoints

Update these values in `tests/course-sample-test.py`:

- `a` = logs service URL
- `b` = users service URL
- `c` = costs service URL
- `d` = about service URL

## 4) Verify submission database state

Leave only one user before submission:

- `id: 123123`
- `first_name: mosh`
- `last_name: israeli`

## 5) Run tests

- Local unit/integration tests: `npm test`
- Course sample script: `python tests/course-sample-test.py`
