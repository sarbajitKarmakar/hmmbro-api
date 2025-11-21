#  (Node.js + Express + PostgreSQL + MVC)

A secure, scalable, production-ready **RESTful API backend** built with **Node.js**, **Express**, and **PostgreSQL** following an **MVC architecture**. The project implements multi-layered authentication (API Key + JWT) and role-based authorization for admin operations.

---

## 🔎 Quick summary

* **Tech:** Node.js, Express, PostgreSQL, jsonwebtoken, bcrypt, dotenv
* **Architecture:** MVC (controllers, models, routes, middleware, services)
* **Auth:** API Key (global), JWT (user sessions), Role-based (admin)
* **Main modules:** Users, Admin (user management), Products

---

## 📁 Project structure (visual)


```
hmmBro-backend-server/
├── controller/
├── middleware/
├── model/
├── routes/
├── services/
├── view/
├── index.js
├── .env
└── package.json
```

---

## 🔐 Authentication & middleware notes

* **API key layer:** Applied globally in `index.js` via `apiAuthenticator` — all requests must include the configured `x-api-key` header.
* **JWT user auth:** `authenticateUser` middleware protects routes that require a logged-in user.
* **Admin check:** `checkAdmin` middleware ensures admin-only actions.
* **Mounting in `index.js`:**

  * `app.use('/api/user', apiAuthenticator, users)`
  * `app.use('/api/admin/user', apiAuthenticator, authenticateUserddd, checkAdmin, admins)`
  * `app.use('/api/products', apiAuthenticator, products)`

Note: some route files also include `authenticateUser`/`checkAdmin` inline for finer-grained protection.

---

## 🔗 Endpoints (implemented routes)

> All routes require the API key header (`x-api-key: <API_KEY>`) because `apiAuthenticator` is applied at the app level.

### Admin — `/api/admin/user` (mounted with `authenticateUser` + `checkAdmin` in `index.js`)

| Method | Path                             | Auth                  | Description                       |
| ------ | -------------------------------- | --------------------- | --------------------------------- |
| GET    | `/api/admin/user/all`            | API_KEY + ADMIN       | Get all users (admin)             |
| GET    | `/api/admin/user/search`         | API_KEY + JWT + ADMIN | Search users (admin)              |
| GET    | `/api/admin/user/:id`            | API_KEY + ADMIN       | Get specific user details (admin) |
| DELETE | `/api/admin/user/:id`            | API_KEY + ADMIN       | Delete user (admin)               |
| PUT    | `/api/admin/user/:id/deactivate` | API_KEY + ADMIN       | Deactivate user account           |
| PUT    | `/api/admin/user/:id/activate`   | API_KEY + ADMIN       | Activate user account             |

**Notes:** Although some routes in the admin router file don't list `authenticateUser`/`checkAdmin` inline, the `index.js` mounts the router behind those middlewares so the endpoints are protected.

---

### User — `/api/user`

| Method | Path            | Auth          | Description                                       |
| ------ | --------------- | ------------- | ------------------------------------------------- |
| POST   | `/api/user/`    | API_KEY       | Create (signup) user                              |
| GET    | `/api/user/`    | API_KEY       | Fetch users / list (implementation-specific)      |
| PATCH  | `/api/user/`    | API_KEY + JWT | Update specific fields for the authenticated user |
| DELETE | `/api/user/:id` | API_KEY + JWT | Deactivate account (authenticated user)           |

---

### Products — `/api/products`

| Method | Path                          | Auth            | Description                                              |
| ------ | ----------------------------- | --------------- | -------------------------------------------------------- |
| GET    | `/api/products/`              | API_KEY         | Get products (supports queries for filtering/pagination) |
| POST   | `/api/products/`              | API_KEY + ADMIN | Insert new product (admin only)                          |
| GET    | `/api/products/search`        | API_KEY + ADMIN | Search products (admin)                                  |
| PATCH  | `/api/products/:id`           | API_KEY + ADMIN | Update product (admin only)                              |
| DELETE | `/api/products/:id`           | API_KEY + ADMIN | Soft-delete product (admin only)                         |
| DELETE | `/api/products/:id/parmanent` | API_KEY + ADMIN | Permanent delete (admin only)                            |
| PUT    | `/api/products/:id/publish`   | API_KEY + ADMIN | Publish product (admin only)                             |
| PUT    | `/api/products/:id/unpublish` | API_KEY + ADMIN | Unpublish product (admin only)                           |

---

## 📦 Example requests

**Headers (all protected routes):**

```
x-api-key: <API_KEY>
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>   // when JWT required
```

**Create user (signup)**

```http
POST /api/user
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "securepass"
}
```

**Create product (admin)**

```http
POST /api/products
Authorization: Bearer <ADMIN_JWT>
{
  "name": "Perfume A",
  "price": 499,
  "stock": 50,
  "variant_id": 2,
  "description": "..."
}
```

**Search users (admin)**

```
GET /api/admin/user/search?q=alice
Authorization: Bearer <ADMIN_JWT>
```

---

## 🛠️ Setup & Run

1. Install dependencies:

```bash
npm install
```

2. Create `.env` in project root and add:

```
PORT=3000
API_KEY=your_api_key
JWT_SECRET=your_jwt_secret
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=your_database
```

3. Start server (development):

```bash
npm run dev
```

Server available at `http://localhost:${process.env.PORT || 3000}`

---
