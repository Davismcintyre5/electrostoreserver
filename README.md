### **admin/.gitignore**
```gitignore
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Environment files
.env
.env.local
.env.*.local

# Vite cache
.cache
.vite
```

---

### **customer/.gitignore**
```gitignore
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Environment files
.env
.env.local
.env.*.local

# Vite cache
.cache
.vite
```

---

### **backend/README.md**
```markdown
# ElectroStore Backend API

Node.js + Express backend for the ElectroStore e-commerce platform. Provides RESTful APIs for both customer and admin frontends, with MongoDB database, JWT authentication, M-Pesa integration, and real-time notifications via Socket.IO.

## Features

- User authentication (register/login) with role-based access (customer, admin, manager, cashier)
- Product management (CRUD with image upload)
- Shopping cart & wishlist
- Order processing with status tracking
- M-Pesa STK Push payment integration
- Real-time notifications (Socket.IO)
- Promo codes
- Address management (max 3 addresses per customer, default address)
- System settings (store name, VAT, currency)
- Reports generation
- Admin staff management with temporary passwords
- Search and pagination on all list endpoints

## Tech Stack

- Node.js
- Express
- MongoDB with Mongoose
- JWT authentication
- Multer for file uploads
- Socket.IO for real-time
- M-Pesa API integration
- Winston for logging

## Installation

1. Clone the repository
2. Navigate to the backend folder:
   ```bash
   cd electrostore/backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file by copying `.env.example`:
   ```bash
   cp .env.example .env
   ```
5. Edit `.env` with your values (database URI, JWT secret, M-Pesa credentials, etc.)
6. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | Environment (development/production) |
| `PORT` | Server port (default 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for JWT tokens |
| `JWT_EXPIRE` | Token expiration (e.g., 7d) |
| `MPESA_CONSUMER_KEY` | Safaricom API consumer key |
| `MPESA_CONSUMER_SECRET` | Safaricom API consumer secret |
| `MPESA_PASSKEY` | M-Pesa passkey |
| `MPESA_SHORTCODE` | Business shortcode |
| `MPESA_CALLBACK_URL` | Callback URL for M-Pesa |
| `CLIENT_URL` | Customer frontend URL (for CORS) |
| `ADMIN_URL` | Admin frontend URL (for CORS) |

## API Endpoints

### Public
- `GET /` – Server status
- `GET /api` – API information
- `GET /health` – Health check

### Authentication
- `POST /api/auth/register` – Register customer
- `POST /api/auth/login` – Login (all users)
- `PATCH /api/auth/change-password` – Change password (authenticated)

### Customer Routes (prefixed with `/api/customer`)
- Products: `GET /products`, `GET /products/:id`
- Promos: `GET /promos`, `POST /promos/validate`
- Cart: `GET /cart`, `POST /cart`, `PUT /cart`, `DELETE /cart/:productId`
- Checkout: `POST /checkout`
- Orders: `GET /orders`, `GET /orders/:id`
- Addresses: CRUD endpoints
- Wishlist: `GET /wishlist`, `POST /wishlist`, `DELETE /wishlist/:productId`
- Notifications: `GET /notifications`, `GET /unread-count`, `PATCH /mark-read`

### Admin Routes (prefixed with `/api/admin`)
- Dashboard stats
- Products: full CRUD (with image upload)
- Promos: full CRUD
- Orders: list, update status
- Transactions: list
- Customers: list, view
- Users (staff): create, update, delete (admin only)
- Settings: get, update (admin only)
- Reports: sales, top products

### M-Pesa
- `POST /api/mpesa/stkpush` – Initiate STK push
- `POST /api/mpesa/callback` – M-Pesa callback URL

## Scripts

- `npm run dev` – Start development server with nodemon
- `npm start` – Start production server
- `npm run seed` – Seed database with sample data
- `npm run create-admin` – Create admin user (prompts for details)
- `npm run check-admins` – List all staff users
- `npm run drop-db` – Drop the database (with confirmation)

## Folder Structure

```
backend/
├── controllers/        # Route handlers
├── models/             # Mongoose models
├── routes/             # Express routes (admin, customer, auth)
├── middleware/         # Auth, role check, upload, error handler
├── utils/              # Helpers (M-Pesa, socket, logger)
├── scripts/            # Utility scripts (seed, createAdmin, etc.)
├── config/             # Configuration files
├── public/uploads/     # Uploaded images
├── server.js           # Entry point
├── .env.example        # Environment variables example
└── package.json
```

## License

This project is proprietary and confidential.
```

These files should be placed in their respective directories. The `.gitignore` files ensure that sensitive and build files are not committed. The `backend/README.md` provides comprehensive documentation.