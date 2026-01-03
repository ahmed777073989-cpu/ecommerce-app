# Testing Guide

This guide provides quick commands to test the e-commerce app functionality.

## Prerequisites

- Backend running on http://localhost:3000
- Docker containers (PostgreSQL + Redis) running
- Database seeded with test data

## Quick Start

```bash
# From project root
./start-dev.sh
```

## Authentication Flow Testing

### 1. Login as Super Admin

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+966500000001",
    "password": "admin123"
  }' | jq
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "name": "Super Admin",
      "phone": "+966500000001",
      "role": "super_admin",
      "active": true
    },
    "accessToken": "...",
    "refreshToken": "...",
    "expiresIn": 900
  }
}
```

### 2. Generate Access Codes (Admin)

First, login and get the access token:

```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "+966500000001", "password": "admin123"}' \
  | jq -r '.data.accessToken')

echo "Token: $TOKEN"
```

Then generate codes:

```bash
curl -X POST http://localhost:3000/api/admin/access-codes/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "role": "user",
    "validDays": 30,
    "usesAllowed": 1,
    "count": 3,
    "note": "Test batch codes"
  }' | jq
```

### 3. List Access Codes

```bash
curl -X GET "http://localhost:3000/api/admin/access-codes?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN" | jq
```

### 4. Register New User

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "phone": "+966500000200",
    "password": "john123456",
    "confirmPassword": "john123456"
  }' | jq
```

### 5. Activate Account

Use one of the access codes from step 2 or seeded data:

```bash
curl -X POST http://localhost:3000/api/auth/activate \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+966500000200",
    "password": "john123456",
    "accessCode": "YOUR_ACCESS_CODE_HERE"
  }' | jq
```

### 6. Login as New User

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+966500000200",
    "password": "john123456"
  }' | jq
```

### 7. Get Current User Profile

```bash
USER_TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "+966500000200", "password": "john123456"}' \
  | jq -r '.data.accessToken')

curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $USER_TOKEN" | jq
```

### 8. Refresh Token

```bash
REFRESH_TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "+966500000200", "password": "john123456"}' \
  | jq -r '.data.refreshToken')

curl -X POST http://localhost:3000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}" | jq
```

### 9. Logout

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer $USER_TOKEN" | jq
```

## Error Testing

### Test Invalid Phone Format

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "phone": "123456",
    "password": "test123",
    "confirmPassword": "test123"
  }' | jq
```

### Test Duplicate Phone

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Duplicate User",
    "phone": "+966500000001",
    "password": "test123",
    "confirmPassword": "test123"
  }' | jq
```

### Test Invalid Access Code

```bash
curl -X POST http://localhost:3000/api/auth/activate \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+966500000200",
    "password": "john123456",
    "accessCode": "INVALID1"
  }' | jq
```

### Test Login Without Activation

```bash
# First signup a new user
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Inactive User",
    "phone": "+966500000300",
    "password": "test123",
    "confirmPassword": "test123"
  }' | jq

# Try to login without activation
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+966500000300",
    "password": "test123"
  }' | jq
```

## Rate Limiting Testing

Try making more than 10 requests per minute to test throttling:

```bash
for i in {1..12}; do
  echo "Request $i:"
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"phone": "+966500000001", "password": "wrong"}' 2>/dev/null | jq -c
  sleep 1
done
```

## Seeded Test Data

After running `npm run seed` in backend, you'll have:

- **Super Admin**: +966500000001 / admin123
- **10 Access Codes**: Check console output or query the database

## Database Queries

Connect to PostgreSQL:

```bash
docker exec -it ecommerce_postgres psql -U admin -d ecommerce_app
```

Useful queries:

```sql
-- List all users
SELECT id, name, phone, role, active FROM users;

-- List all access codes
SELECT code, role, uses_count, uses_allowed, is_used, valid_until FROM access_codes;

-- Check sessions
SELECT user_id, expires_at FROM sessions;

-- Audit logs
SELECT admin_id, action, resource_type, created_at FROM audit_logs;
```

## Admin Dashboard Testing

1. Start the admin dashboard:
   ```bash
   cd admin-dashboard
   npm install
   npm run dev
   ```

2. Open http://localhost:5173

3. Login with: +966500000001 / admin123

4. Test:
   - Generate access codes
   - View access code list
   - Check pagination

## Mobile App Testing

1. Start Expo:
   ```bash
   cd mobile
   npm install
   npm start
   ```

2. Open in Expo Go or simulator

3. Test flow:
   - Signup → Activation → Login → Home
   - Logout functionality
   - Error handling

## Troubleshooting

### Backend not starting

```bash
# Check logs
tail -f backend.log

# Or in backend directory
cd backend && npm run start:dev
```

### Database connection issues

```bash
# Restart Docker services
docker compose down
docker compose up -d
sleep 5

# Re-seed
cd backend && npm run seed
```

### Clear all data and restart

```bash
# Stop everything
docker compose down -v
pkill -f 'ts-node-dev'

# Restart fresh
docker compose up -d
sleep 5
cd backend && npm run seed
npm run start:dev
```
