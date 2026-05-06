# Cost Manager Final Project

This repository implements the required RESTful microservices as four separate Node.js processes:

- `logs-service` on `/api/logs`
- `users-service` on `/api/users`, `/api/users/:id`, `/api/add` (user)
- `costs-service` on `/api/add` (cost), `/api/report`
- `about-service` on `/api/about`

## Setup

1. Copy `.env.example` to `.env` in each service folder.
2. Set the same MongoDB Atlas URI in each service `.env`.
3. Install dependencies:
   - Root: `npm install`
   - Each service in `services/*`: `npm install`

## Run

Start each service in a separate terminal:

- `npm run start:logs`
- `npm run start:users`
- `npm run start:costs`
- `npm run start:about`

## Tests

Run endpoint tests:

```bash
npm test
```

## Submission DB Seed

Before submission, keep database empty except one user:

- `id: 123123`
- `first_name: mosh`
- `last_name: israeli`
