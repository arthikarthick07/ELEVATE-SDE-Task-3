# CredVault — Certificate Issuing & Verification Platform (Backend)

A backend-only application for submitting certificate applications, approving/rejecting them as an admin, issuing verifiable certificates, and revoking certificates when needed.

Built with **Node.js**, **Express.js**, and **SQLite** (via the pure-JavaScript `sql.js` library so it runs anywhere Node runs — no native compilation required).

---

## Tech Stack

| Concern | Library |
|---|---|
| HTTP server | `express` |
| Database | `sql.js` (pure-JS SQLite, persisted to a file on disk) |
| Password hashing | `bcryptjs` |
| Admin authentication | `jsonwebtoken` (JWT) |
| Environment variables | `dotenv` |
| Input validation | `express-validator` |

---

## Project Structure

```
credvault-backend/
├── .env.example            # Template for environment variables
├── .gitignore
├── package.json
├── README.md
└── src/
    ├── server.js            # Express app entry point + startup
    ├── config/
    │   └── database.js      # SQLite (sql.js) init, schema, query helpers
    ├── routes/
    │   ├── publicRoutes.js  # /api/applications, /api/certificates
    │   └── adminRoutes.js   # /api/admin/* (JWT-protected)
    ├── controllers/
    │   ├── applicationController.js
    │   ├── certificateController.js
    │   ├── adminController.js
    │   └── managementController.js
    ├── middleware/
    │   ├── auth.js          # JWT verify middleware + token signing
    │   ├── errors.js        # Validation handler, 404, error handler
    │   └── validators.js    # express-validator rule sets
    ├── models/
    │   ├── Application.js
    │   ├── Certificate.js
    │   └── Admin.js
    └── utils/
        ├── helpers.js       # ID generators, response sanitizer
        └── seed.js          # Dev-only admin seeding
```

The SQLite database file is created at `./data/credvault.db` (configurable via `DB_PATH`).

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the template and edit values as needed:

```bash
cp .env.example .env
```

| Variable | Description | Default |
|---|---|---|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `JWT_SECRET` | Secret used to sign JWTs | — (set a strong random value) |
| `JWT_EXPIRES_IN` | Token lifetime | `8h` |
| `SEED_ADMIN` | `1` = seed default admin on startup | `1` |
| `SEED_ADMIN_USERNAME` | Seeded admin username | `admin` |
| `SEED_ADMIN_PASSWORD` | Seeded admin password | `Admin@123` |
| `DB_PATH` | SQLite file path | `./data/credvault.db` |

> **Important:** Never commit your real `.env`. Change the default admin password immediately in any non-local environment.

### 3. Start the server

```bash
npm start
```

You should see:

```
[seed] Seeded default admin 'admin'. Change the password immediately in production.
CredVault API running on http://localhost:3000
```

If the admin already exists, seeding is skipped (it is idempotent and safe to run on every startup).

---

## Database Tables

### `admins`
| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | Auto-increment |
| `username` | TEXT | UNIQUE, NOT NULL |
| `password_hash` | TEXT | bcrypt hash — never returned by any API |
| `created_at` | TEXT | Default `datetime('now')` |

### `applications`
| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | Auto-increment |
| `application_id` | TEXT | UNIQUE, format `APP-YYYYMMDD-XXXX` |
| `name` | TEXT | NOT NULL |
| `phone` | TEXT | NOT NULL |
| `gender` | TEXT | CHECK in (`Male`,`Female`,`Other`) |
| `city` | TEXT | NOT NULL |
| `state` | TEXT | NOT NULL |
| `status` | TEXT | CHECK in (`Pending`,`Approved`,`Rejected`), default `Pending` |
| `submitted_at` | TEXT | Default `datetime('now')` |
| `rejection_reason` | TEXT | Nullable, set on rejection |

Indexes on `application_id` and `status`.

### `certificates`
| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | Auto-increment |
| `certificate_id` | TEXT | UNIQUE, format `CRT-YYYYMMDD-XXXXXX` |
| `application_id` | TEXT | FK → `applications.application_id` |
| `holder_name` | TEXT | NOT NULL |
| `phone` | TEXT | NOT NULL |
| `city` | TEXT | NOT NULL |
| `state` | TEXT | NOT NULL |
| `issued_at` | TEXT | Default `datetime('now')` |
| `status` | TEXT | CHECK in (`Valid`,`Revoked`), default `Valid` |
| `revoked_at` | TEXT | Nullable, set on revocation |
| `revocation_reason` | TEXT | Nullable, set on revocation |

Indexes on `certificate_id`, `application_id`, and `status`.

---

## API Reference

Base URL: `http://localhost:3000/api`

### Health
#### `GET /api/health`
**Response 200**
```json
{
  "status": "ok",
  "service": "CredVault API",
  "time": "2026-11-11T07:45:26.780Z",
  "uptime_seconds": 14.08
}
```

---

### Public APIs

#### 1. `POST /api/applications`
Submit a new certificate application.

**Request body**
```json
{
  "name": "Aarav Sharma",
  "phone": "+919876543210",
  "gender": "Male",
  "city": "Mumbai",
  "state": "Maharashtra"
}
```

**Response 201**
```json
{
  "message": "Application submitted successfully.",
  "application": {
    "id": 1,
    "application_id": "APP-20261111-3195",
    "name": "Aarav Sharma",
    "phone": "+919876543210",
    "gender": "Male",
    "city": "Mumbai",
    "state": "Maharashtra",
    "status": "Pending",
    "submitted_at": "2026-11-11 07:45:29",
    "rejection_reason": null
  }
}
```

**Response 400** (validation error)
```json
{
  "error": "Validation Error",
  "message": "Submitted data is invalid.",
  "errors": [
    { "field": "name", "message": "Name must be between 2 and 100 characters." }
  ]
}
```

#### 2. `GET /api/applications/track/:applicationId`
Track an application by its ID.

**Response 200**
```json
{
  "application": {
    "id": 2,
    "application_id": "APP-20261111-6759",
    "name": "Priya Patel",
    "phone": "9876543210",
    "gender": "Female",
    "city": "Pune",
    "state": "Maharashtra",
    "status": "Pending",
    "submitted_at": "2026-11-11 07:45:33",
    "rejection_reason": null
  }
}
```

**Response 404**
```json
{ "error": "Not Found", "message": "No application found with ID 'APP-NOPE-9999'." }
```

#### 3. `GET /api/certificates/verify/:certificateId`
Verify a certificate by its ID.

**Response 200 (valid)**
```json
{
  "valid": true,
  "certificate": {
    "id": 1,
    "certificate_id": "CRT-20261111-922008",
    "application_id": "APP-20261111-3195",
    "holder_name": "Aarav Sharma",
    "phone": "+919876543210",
    "city": "Mumbai",
    "state": "Maharashtra",
    "issued_at": "2026-11-11 07:45:37",
    "status": "Valid",
    "revoked_at": null,
    "revocation_reason": null
  }
}
```

**Response 200 (revoked)** — `valid: false` with full revocation details.

**Response 404**
```json
{ "error": "Not Found", "message": "No certificate found with ID 'CRT-NOPE-0000'." }
```

---

### Admin APIs

All admin endpoints (except `/api/admin/login`) require the header:

```
Authorization: Bearer <token>
```

#### 4. `POST /api/admin/login`
**Request body**
```json
{ "username": "admin", "password": "Admin@123" }
```

**Response 200**
```json
{
  "message": "Login successful.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": { "id": 1, "username": "admin", "created_at": "2026-11-11 07:45:12" }
}
```

**Response 401** (bad credentials)
```json
{ "error": "Unauthorized", "message": "Invalid username or password." }
```

#### 5. `GET /api/admin/applications`
Returns all applications, newest first.

**Response 200**
```json
{
  "count": 2,
  "applications": [ /* ... */ ]
}
```

#### 6. `PATCH /api/admin/applications/:applicationId/approve`
Approves a `Pending` application and issues a unique certificate. Re-approving an already-approved application returns `409` (duplicate certificate prevention).

**Response 200**
```json
{
  "message": "Application approved and certificate issued.",
  "application": { /* ... status: "Approved" */ },
  "certificate": { /* ... status: "Valid" */ }
}
```

**Response 409** (already approved)
```json
{
  "error": "Conflict",
  "message": "Application already approved. A certificate has been issued.",
  "certificate": { /* ... */ }
}
```

#### 7. `PATCH /api/admin/applications/:applicationId/reject`
Rejects a `Pending` application. Requires a reason.

**Request body**
```json
{ "reason": "Incomplete supporting documents." }
```

**Response 200**
```json
{
  "message": "Application rejected.",
  "application": { /* ... status: "Rejected", rejection_reason: "..." */ }
}
```

**Response 409** (already rejected), **400** (missing/short reason).

#### 8. `GET /api/admin/certificates`
Returns all certificates, newest first.

#### 9. `PATCH /api/admin/certificates/:certificateId/revoke`
Revokes a `Valid` certificate. Requires a reason. Re-revoking returns `409`.

**Request body**
```json
{ "reason": "Fraudulent documentation discovered during audit." }
```

**Response 200**
```json
{
  "message": "Certificate revoked successfully.",
  "certificate": {
    /* ... status: "Revoked", revoked_at: "...", revocation_reason: "..." */
  }
}
```

---

## State Machine Guards

| Current status | Approve? | Reject? |
|---|---|---|
| Pending | Yes | Yes |
| Approved | 409 (already approved) | 409 (cannot reject approved) |
| Rejected | 409 (cannot approve rejected) | 409 (already rejected) |

| Certificate status | Revoke? |
|---|---|
| Valid | Yes |
| Revoked | 409 (already revoked) |

---

## Testing with Postman

1. Start the server: `npm start`
2. Import or manually create the requests below.

**Quick test flow:**

1. **Health** — `GET http://localhost:3000/api/health`
2. **Submit application** — `POST http://localhost:3000/api/applications` with the JSON body above. Copy the returned `application_id`.
3. **Track** — `GET http://localhost:3000/api/applications/track/{application_id}`
4. **Admin login** — `POST http://localhost:3000/api/admin/login`. Copy the `token` from the response.
5. In Postman, add an Authorization header to all admin requests:
   - Type: `Bearer Token`
   - Token: `{paste token}`
6. **List applications** — `GET http://localhost:3000/api/admin/applications`
7. **Approve** — `PATCH http://localhost:3000/api/admin/applications/{application_id}/approve`. Copy the returned `certificate_id`.
8. **Verify certificate** — `GET http://localhost:3000/api/certificates/verify/{certificate_id}`
9. **List certificates** — `GET http://localhost:3000/api/admin/certificates`
10. **Revoke** — `PATCH http://localhost:3000/api/admin/certificates/{certificate_id}/revoke` with body `{"reason":"..."}`
11. **Verify revoked** — repeat step 8; `valid` will be `false`.

---

## Sample Test Data

Submit a few applications to populate the database:

```bash
curl -s -X POST http://localhost:3000/api/applications \
  -H "Content-Type: application/json" \
  -d '{"name":"Aarav Sharma","phone":"+919876543210","gender":"Male","city":"Mumbai","state":"Maharashtra"}'

curl -s -X POST http://localhost:3000/api/applications \
  -H "Content-Type: application/json" \
  -d '{"name":"Priya Patel","phone":"9876543210","gender":"Female","city":"Pune","state":"Maharashtra"}'

curl -s -X POST http://localhost:3000/api/applications \
  -H "Content-Type: application/json" \
  -d '{"name":"Rahul Verma","phone":"9999999999","gender":"Male","city":"Delhi","state":"Delhi"}'
```

The seeded admin (when `SEED_ADMIN=1`) is:

| Username | Password |
|---|---|
| `admin` | `Admin@123` |

> This is a **development-only** convenience. Always change the password and disable seeding in production by setting `SEED_ADMIN=0`.

---

## Security Notes

- All admin endpoints (except login) are protected by JWT middleware.
- Admin passwords are hashed with bcrypt before storage.
- Password hashes are never included in any API response.
- All inputs are validated with `express-validator`.
- All SQL queries use parameterized statements (no string concatenation) — preventing SQL injection.
- JWT secrets and credentials are read from environment variables, never hardcoded.
- Appropriate HTTP status codes are used throughout (200, 201, 400, 401, 404, 409, 500).

---

## Error Response Format

All errors follow a consistent shape:

```json
{
  "error": "Error name",
  "message": "Human-readable message",
  "errors": [   // present only for validation errors
    { "field": "name", "message": "..." }
  ]
}
```

| Status | Meaning |
|---|---|
| 200 | Success |
| 201 | Resource created |
| 400 | Validation error / bad request |
| 401 | Authentication failed or missing |
| 404 | Resource not found |
| 409 | Conflict (duplicate / invalid state transition) |
| 500 | Internal server error |
