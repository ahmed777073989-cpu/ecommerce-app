# Setup Guide

This guide will help you set up the development environment for the ecommerce app.

## Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- Git

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ecommerce-app
```

### 2. Start Database Services

Start PostgreSQL and Redis using Docker Compose:

```bash
docker-compose up -d
```

Verify services are running:

```bash
docker-compose ps
```

### 3. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` if needed (default values should work for local development).

Seed the database:

```bash
npm run seed
```

Start the backend server:

```bash
npm run start:dev
```

The backend should now be running at `http://localhost:3000`.

### 4. Mobile App Setup

```bash
cd mobile
npm install
cp .env.example .env
```

Start the Expo development server:

```bash
npm start
```

Follow the Expo CLI instructions to run on:
- iOS Simulator: Press `i`
- Android Emulator: Press `a`
- Physical device: Scan QR code with Expo Go app

### 5. Admin Dashboard Setup

```bash
cd admin-dashboard
npm install
cp .env.example .env
```

Start the development server:

```bash
npm run dev
```

The admin dashboard should now be running at `http://localhost:5173`.

## Default Credentials

### Super Admin
- Phone: `+966500000001`
- Password: `admin123`

### Test Access Codes

After seeding, you'll get 10 sample access codes displayed in the console.

## Testing the Flow

1. **Sign up** via mobile app or test with API
2. **Activate** account with one of the seeded access codes
3. **Login** with your credentials
4. **Admin Dashboard**: Login with super admin credentials to manage access codes

## Troubleshooting

### Database Connection Issues

If you get database connection errors:

```bash
docker-compose down
docker-compose up -d
# Wait 10 seconds for PostgreSQL to start
npm run seed
```

### Port Conflicts

If ports are already in use:
- Backend (3000): Change `PORT` in `backend/.env`
- Admin Dashboard (5173): Change port in `admin-dashboard/vite.config.ts`
- PostgreSQL (5432): Change port mapping in `docker-compose.yml`
- Redis (6379): Change port mapping in `docker-compose.yml`

### Mobile App Not Connecting to Backend

Make sure you're using the correct IP address in `mobile/.env`:
- For iOS Simulator: `http://localhost:3000`
- For Android Emulator: `http://10.0.2.2:3000`
- For Physical Device: `http://YOUR_LOCAL_IP:3000`

## Next Steps

- Read [API_SPEC.md](./API_SPEC.md) for API documentation
- Read [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for database schema details
- Start building features for Phase 1.5!
