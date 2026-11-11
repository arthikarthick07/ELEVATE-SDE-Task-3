# CredVault — Certificate Issuing & Verification Platform (Backend)

A backend-only application for submitting certificate applications, tracking their status, approving or rejecting applications through an authenticated admin account, issuing digital certificates, and verifying or revoking certificates.

Built using **Node.js, Express.js, and SQLite** with the pure-JavaScript `sql.js` library.

---

## 1. Tech Stack

| Concern | Technology |
|---|---|
| Runtime | Node.js |
| HTTP Server | Express.js |
| Database | SQLite using sql.js |
| Password Hashing | bcryptjs |
| Authentication | JSON Web Tokens (JWT) |
| Environment Variables | dotenv |
| Input Validation | express-validator |

---

## 2. Project Structure

```text
credvault-backend/
├── .env.example
├── .gitignore
├── package.json
├── README.md
├── seed.js
└── src/
    ├── server.js
    ├── config/
    │   └── database.js
    ├── routes/
    │   ├── publicRoutes.js
    │   └── adminRoutes.js
    ├── controllers/
    │   ├── applicationController.js
    │   ├── certificateController.js
    │   ├── adminController.js
    │   └── managementController.js
    ├── middleware/
    │   ├── auth.js
    │   ├── errors.js
    │   └── validators.js
    ├── models/
    │   ├── Application.js
    │   ├── Certificate.js
    │   └── Admin.js
    └── utils/
        └── helpers.js
```

The SQLite database is created at:

```text
./data/credvault.db
```

The database location can be configured using `DB_PATH`.

---

## 3. Installation and Setup

### Prerequisites

- Node.js
- npm
- Git (optional)

### Step 1: Clone the repository

```bash
git clone https://github.com/arthikarthick07/ELEVATE-SDE-Task-3.git
```

```bash
cd ELEVATE-SDE-Task-3
```

### Step 2: Install dependencies

```bash
npm install
```

### Step 3: Configure environment variables

Create a `.env` file using `.env.example` as a reference.

```env
PORT=3001
NODE_ENV=development
JWT_SECRET=replace_with_a_strong_random_secret
JWT_EXPIRES_IN=8h

SEED_ADMIN=1
SEED_ADMIN_USERNAME=admin
SEED_ADMIN_PASSWORD=change_this_password

DB_PATH=./data/credvault.db
```

**Important:** Never commit the actual `.env` file or expose your JWT secret or admin password.

### Step 4: Start the server

```bash
npm start
```

Expected output:

```text
CredVault API running on http://localhost:3001
Health check: http://localhost:3001/api/health
```

If the admin account already exists, the seed process skips creating a duplicate account.

---

## 4. Database Design

The application uses three SQLite tables.

### Admins

| Column | Type | Description |
|---|---|---|
| id | INTEGER | Primary key |
| username | TEXT | Unique admin username |
| password_hash | TEXT | Bcrypt-hashed password |
| created_at | TEXT | Account creation timestamp |

### Applications

| Column | Type | Description |
|---|---|---|
| id | INTEGER | Primary key |
| application_id | TEXT | Unique application ID |
| name | TEXT | Applicant name |
| phone | TEXT | Contact number |
| gender | TEXT | Gender |
| city | TEXT | City |
| state | TEXT | State |
| status | TEXT | Pending, Approved or Rejected |
| submitted_at | TEXT | Submission timestamp |
| rejection_reason | TEXT | Rejection reason, if applicable |

### Certificates

| Column | Type | Description |
|---|---|---|
| id | INTEGER | Primary key |
| certificate_id | TEXT | Unique certificate ID |
| application_id | TEXT | Related application ID |
| holder_name | TEXT | Certificate holder |
| phone | TEXT | Contact number |
| city | TEXT | City |
| state | TEXT | State |
| issued_at | TEXT | Certificate issue timestamp |
| status | TEXT | Valid or Revoked |
| revoked_at | TEXT | Revocation timestamp |
| revocation_reason | TEXT | Reason for revocation |

---

## 5. API Documentation

**Base URL:**

```text
http://localhost:3001/api
```

### A. Health Check

**GET** `/api/health`

Checks whether the backend server is running.

Example:

```bash
curl http://localhost:3001/api/health
```

Response: `200 OK`

```json
{
  "status": "ok",
  "service": "CredVault API",
  "time": "2026-11-11T07:45:26.780Z",
  "uptime_seconds": 14.08
}
```

### B. Public APIs

#### 1. Submit Application

**POST** `/api/applications`

Request body:

```json
{
  "name": "Aarav Sharma",
  "phone": "9876543210",
  "gender": "Male",
  "city": "Mumbai",
  "state": "Maharashtra"
}
```

Response: `201 Created`

```json
{
  "message": "Application submitted successfully.",
  "application": {
    "application_id": "APP-20261111-3195",
    "name": "Aarav Sharma",
    "status": "Pending"
  }
}
```

The API generates a unique application ID automatically.

#### 2. Track Application

**GET** `/api/applications/track/:applicationId`

Example:

```bash
curl http://localhost:3001/api/applications/track/APP-20261111-3195
```

Returns the application details and current status.

Possible statuses:

- Pending
- Approved
- Rejected

#### 3. Verify Certificate

**GET** `/api/certificates/verify/:certificateId`

Example:

```bash
curl http://localhost:3001/api/certificates/verify/CRT-20261111-922008
```

Response for a valid certificate:

```json
{
  "valid": true,
  "certificate": {
    "certificate_id": "CRT-20261111-922008",
    "status": "Valid"
  }
}
```

For a revoked certificate:

```json
{
  "valid": false,
  "certificate": {
    "certificate_id": "CRT-20261111-922008",
    "status": "Revoked"
  }
}
```

A revoked certificate cannot be considered valid.

### C. Admin APIs

All admin endpoints except login require JWT authentication.

Add this HTTP header:

```text
Authorization: Bearer YOUR_TOKEN
```

#### 4. Admin Login

**POST** `/api/admin/login`

Request body:

```json
{
  "username": "admin",
  "password": "YOUR_ADMIN_PASSWORD"
}
```

Response: `200 OK`

Returns a JWT token and admin information.

#### 5. List All Applications

**GET** `/api/admin/applications`

Returns all submitted applications, newest first.

Requires admin authentication.

#### 6. Approve Application

**PATCH** `/api/admin/applications/:applicationId/approve`

Approves a pending application and automatically generates a unique certificate.

Response includes:

- Updated application details
- Generated certificate details
- Certificate ID

An already-approved application cannot be approved again.

#### 7. Reject Application

**PATCH** `/api/admin/applications/:applicationId/reject`

Request body:

```json
{
  "reason": "Incomplete supporting documents."
}
```

Rejects a pending application and saves the rejection reason.

An already-approved or rejected application cannot be rejected again.

#### 8. List All Certificates

**GET** `/api/admin/certificates`

Returns all issued certificates, newest first.

Requires admin authentication.

#### 9. Revoke Certificate — PATCH

**PATCH** `/api/admin/certificates/:certificateId/revoke`

Recommended REST method for revoking a certificate.

Request body:

```json
{
  "reason": "Fraudulent documentation discovered during audit."
}
```

Changes the certificate status from `Valid` to `Revoked`.

The revocation timestamp and reason are saved.

#### 10. Revoke Certificate — GET

**GET** `/api/admin/certificates/:certificateId/revoke`

Included for compatibility with the official assignment specification.

Requires admin JWT authentication.

Example:

```bash
curl http://localhost:3001/api/admin/certificates/CRT-20261111-922008/revoke \
  -H "Authorization: Bearer YOUR_TOKEN"
```

The GET compatibility endpoint uses a default revocation reason when no reason is supplied.

**Note:** GET is normally intended for read-only operations. PATCH is the recommended revocation method; GET is provided only for assignment compatibility.

---

## 6. Application and Certificate Status Flow

### Application Status

| Current Status | Action | Result |
|---|---|---|
| Pending | Approve | Approved |
| Pending | Reject | Rejected |
| Approved | Approve again | 409 Conflict |
| Approved | Reject | 409 Conflict |
| Rejected | Approve | 409 Conflict |
| Rejected | Reject again | 409 Conflict |

### Certificate Status

| Current Status | Action | Result |
|---|---|---|
| Valid | Revoke | Revoked |
| Revoked | Revoke again | 409 Conflict |

### Important Revocation Behaviour

Revoking a certificate changes only the certificate record.

The original application record remains unchanged.

For example:

```text
Application Status: Approved
Certificate Status: Revoked
```

Public certificate verification returns:

```json
{
  "valid": false
}
```

---

## 7. Authentication and Security

The backend includes:

- JWT-based admin authentication.
- Password hashing using bcryptjs.
- Protected admin routes.
- Input validation using express-validator.
- Parameterized SQL queries.
- Environment-based secret management.
- Password hashes excluded from API responses.
- Appropriate HTTP status codes.
- Duplicate approval and revocation prevention.

Admin credentials should be changed before using the application in a production environment.

---

## 8. HTTP Status Codes

| Code | Meaning |
|---|---|
| 200 | Successful request |
| 201 | Resource created |
| 400 | Invalid input |
| 401 | Unauthorized |
| 404 | Resource or route not found |
| 409 | Conflict or invalid status transition |
| 500 | Internal server error |

---

## 9. Testing

The APIs can be tested using:

- cURL
- Postman

### Recommended Testing Workflow

1. Check server health.
2. Submit a certificate application.
3. Track the application.
4. Log in as admin.
5. Retrieve the JWT token.
6. List applications.
7. Approve a pending application.
8. Verify the generated certificate.
9. List all certificates.
10. Revoke a certificate using PATCH.
11. Test the GET revocation endpoint.
12. Verify that the revoked certificate returns `valid: false`.
13. Confirm that the original application remains Approved after certificate revocation.
14. Test rejection using another pending application.

All protected admin requests must include a valid Bearer token.

---

## 10. Sample API Test Commands

### Submit Application

```bash
curl -X POST http://localhost:3001/api/applications \
-H "Content-Type: application/json" \
-d '{"name":"Test User","phone":"9000000001","gender":"Female","city":"Coimbatore","state":"Tamil Nadu"}'
```

### Admin Login

```bash
curl -X POST http://localhost:3001/api/admin/login \
-H "Content-Type: application/json" \
-d '{"username":"admin","password":"YOUR_ADMIN_PASSWORD"}'
```

### List Applications

```bash
curl http://localhost:3001/api/admin/applications \
-H "Authorization: Bearer YOUR_TOKEN"
```

### List Certificates

```bash
curl http://localhost:3001/api/admin/certificates \
-H "Authorization: Bearer YOUR_TOKEN"
```

---

## 11. Future Enhancements

- Admin management and password update.
- Improved certificate document generation.
- QR-code-based certificate verification.
- Additional authentication controls.
- Enhanced audit logs.
- Frontend integration.

---

## 12. Project Information

**Project:** CredVault — Certificate Issuing & Verification Platform  
**Internship:** ELEVATE Skills — Software Development Engineer Intern  
**Task:** Task 3 — Backend Development  
**Backend:** Node.js and Express.js  
**Database:** SQLite (sql.js)

**Repository:** https://github.com/arthikarthick07/ELEVATE-SDE-Task-3

---

*Developed as part of the ELEVATE Software Development Engineer Internship.*
