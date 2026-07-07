# Fieldstock — MERN E-commerce Store

A full-stack e-commerce application built with MongoDB, Express, React, and Node.js.
Includes customer storefront, cart/checkout, order tracking, and a role-based admin
dashboard (product, order, and user management). Ships with Docker configs, a
GitHub Actions CI/CD pipeline that deploys to an AWS EC2 instance, and an automated
MongoDB → S3 backup job.

## Features

- **Storefront**: browse/search/filter products, product detail pages with reviews,
  cart, checkout with shipping address and order summary.
- **Auth**: JWT-based registration/login (httpOnly cookie + bearer token fallback),
  password hashing with bcrypt, role field (`user` / `admin`).
- **Admin dashboard**: stats overview, product CRUD, order status management,
  user role/active-status management.
- **Order flow**: server-side stock validation and price calculation (never trusts
  client-supplied prices), stock decrement on order placement.
- **Security**: helmet, CORS lockdown to a single client origin, rate limiting on
  auth routes, centralized error handling.
- **Deployment**: Dockerized backend + frontend (nginx), docker-compose for EC2,
  GitHub Actions workflow for CI + SSH deploy, nightly MongoDB backups to S3.

## Tech stack

| Layer     | Choice                                              |
|-----------|------------------------------------------------------|
| Database  | MongoDB (Mongoose ODM)                               |
| Backend   | Node.js, Express, JWT, bcrypt                        |
| Frontend  | React 18, Vite, React Router, Zustand, Tailwind CSS  |
| Infra     | Docker, Docker Compose, Nginx, GitHub Actions, AWS EC2/S3 |

---

## 1. Local development

### Prerequisites
- Node.js 18+
- MongoDB running locally, or a MongoDB Atlas connection string
- (optional) Docker, if you'd rather run everything in containers

### Backend
```bash
cd backend
cp .env.example .env      # then edit MONGO_URI, JWT_SECRET, etc.
npm install
npm run seed               # creates an admin user + sample products
npm run dev                 # starts on http://localhost:5000
```

### Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev                 # starts on http://localhost:5173
```

The Vite dev server proxies `/api` to `http://localhost:5000`, so the two apps
talk to each other with no extra config. Log in with the admin credentials
printed by `npm run seed` (defaults to `admin@example.com` / `ChangeMe123!` —
**change `ADMIN_PASSWORD` in `.env` before seeding**).

---

## 2. Running with Docker locally (optional, mirrors production)
```bash
# from the repo root
cp backend/.env.example backend/.env   # edit values
docker compose up --build
```
This starts MongoDB, the API, and the nginx-served frontend, wired together
exactly as they run in production. The app is available at `http://localhost`.

---

## 3. Deploying to AWS (EC2 + S3 + GitHub Actions)

### Step 1 — Launch the EC2 instance
1. Launch an Ubuntu 22.04 (or similar) EC2 instance — a `t3.small` is enough to start.
2. Security group: allow inbound **22** (SSH, restrict to your IP), **80** (HTTP),
   and **443** (HTTPS, if you add a certificate later).
3. SSH in and install Docker + the Compose plugin:
   ```bash
   sudo apt-get update
   sudo apt-get install -y docker.io docker-compose-plugin
   sudo usermod -aG docker $USER
   ```
4. Create the app directory the workflow will deploy into, e.g. `/home/ubuntu/app`.
5. Install `mongodb-database-tools` on the instance so the backup script's
   `mongodump` command works:
   ```bash
   sudo apt-get install -y mongodb-database-tools
   ```

### Step 2 — Create the S3 backup bucket
1. Create an S3 bucket (e.g. `my-mern-ecommerce-backups`) with default settings
   (block public access ON).
2. Create an IAM user or role with a policy limited to that bucket, e.g.:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": ["s3:PutObject", "s3:ListBucket"],
         "Resource": [
           "arn:aws:s3:::my-mern-ecommerce-backups",
           "arn:aws:s3:::my-mern-ecommerce-backups/*"
         ]
       }
     ]
   }
   ```
   Prefer attaching this as an **IAM instance role** to the EC2 instance rather
   than long-lived access keys — the AWS SDK in `backupToS3.js` will pick up
   instance-role credentials automatically with no extra config.

### Step 3 — Add GitHub repository secrets
Go to **Settings → Secrets and variables → Actions** in your GitHub repo and add:

| Secret               | Description                                      |
|-----------------------|---------------------------------------------------|
| `EC2_HOST`            | Public IP or DNS of the EC2 instance               |
| `EC2_USER`            | SSH user, e.g. `ubuntu`                            |
| `EC2_SSH_PRIVATE_KEY` | Private key (PEM contents) matching the instance's key pair |
| `EC2_APP_PATH`        | Absolute path on the server, e.g. `/home/ubuntu/app` |
| `CLIENT_URL`          | Public URL of the frontend, e.g. `http://your-domain.com` |
| `JWT_SECRET`          | A long random string                               |
| `STRIPE_SECRET_KEY`   | (optional) Stripe test/live secret key              |
| `AWS_REGION`          | e.g. `us-east-1`                                    |
| `S3_BACKUP_BUCKET`    | Your backup bucket name                             |
| `ADMIN_EMAIL`         | Initial admin login email                           |
| `ADMIN_PASSWORD`      | Initial admin login password                        |

### Step 4 — Push to `main`
The workflow at `.github/workflows/deploy.yml` will:
1. Install dependencies and build the frontend to catch errors early.
2. `rsync` the repository to the EC2 instance.
3. Write `backend/.env` on the server from your GitHub secrets.
4. Run `docker compose build && docker compose up -d` on the instance.

Every push to `main` redeploys automatically. You can also trigger it manually
from the **Actions** tab (`workflow_dispatch`).

### Step 5 — Seed the database on first deploy
SSH into the instance once after the first successful deploy and run:
```bash
cd /home/ubuntu/app
docker compose exec backend npm run seed
```

### Step 6 (optional) — HTTPS
Once you have a domain pointed at the instance, put the frontend container
behind a reverse proxy like Caddy or run `certbot` against nginx directly to
add a free TLS certificate.

---

## 4. Backups

`.github/workflows/backup.yml` runs nightly (3 AM UTC by default) and SSHes into
the instance to run `backend/scripts/backupToS3.js` inside the running container,
which dumps MongoDB with `mongodump`, compresses it, and uploads it to
`s3://<bucket>/backups/`.

If you'd rather not depend on GitHub Actions' scheduler, you can instead add a
cron job directly on the EC2 instance:
```bash
# crontab -e
0 3 * * * cd /home/ubuntu/app && docker compose exec -T backend node scripts/backupToS3.js >> /var/log/mern-backup.log 2>&1
```

---

## 5. Project structure
```
mern-ecommerce/
├── backend/
│   ├── config/         # DB connection
│   ├── controllers/     # Route handlers
│   ├── middleware/       # Auth guard, error handler
│   ├── models/            # Mongoose schemas (User, Product, Order)
│   ├── routes/             # Express routers
│   ├── scripts/backupToS3.js
│   ├── utils/               # Token helper, DB seeder
│   └── server.js
├── frontend/
│   └── src/
│       ├── api/axios.js
│       ├── components/       # Navbar, Footer, ProductCard, route guards
│       ├── context/            # Zustand auth + cart stores
│       └── pages/               # Storefront pages + admin/ subfolder
├── .github/workflows/
│   ├── deploy.yml               # CI + deploy to EC2
│   └── backup.yml                # Nightly S3 backup
└── docker-compose.yml
```

## 6. API reference (summary)

| Method | Endpoint                    | Access        | Description                     |
|--------|------------------------------|---------------|----------------------------------|
| POST   | `/api/auth/register`         | Public        | Create account                   |
| POST   | `/api/auth/login`            | Public        | Log in                           |
| GET    | `/api/auth/me`                | Private       | Current user profile             |
| GET    | `/api/products`               | Public        | List/search/filter products      |
| GET    | `/api/products/:id`           | Public        | Product detail                   |
| POST   | `/api/products`               | Admin         | Create product                   |
| PUT    | `/api/products/:id`           | Admin         | Update product                   |
| DELETE | `/api/products/:id`           | Admin         | Delete product                   |
| POST   | `/api/products/:id/reviews`   | Private       | Add product review               |
| POST   | `/api/orders`                  | Private       | Place an order                    |
| GET    | `/api/orders/mine`             | Private       | Current user's orders             |
| GET    | `/api/orders`                   | Admin         | All orders                         |
| PUT    | `/api/orders/:id/status`        | Admin         | Update order status                |
| GET    | `/api/users`                     | Admin         | List users                          |
| PUT    | `/api/users/:id`                  | Admin         | Update role/active status            |

## 7. Notes and next steps

- Real payment processing (Stripe) is stubbed with a `paymentMethod: 'card'`
  option; wire up `stripe.paymentIntents` in `orderController.js` when ready.
- Product images are passed as URLs — add S3-backed image upload via `multer`
  if you want direct uploads instead of pasting links.
- Consider MongoDB Atlas instead of a self-hosted `mongo` container for managed
  backups/scaling, in which case you can drop the `mongo` service from
  `docker-compose.yml` and point `MONGO_URI` at your Atlas cluster.
