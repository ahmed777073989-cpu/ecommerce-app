# Phase 1 Verification Checklist

Use this checklist to verify all Phase 1 functionality is working correctly.

## Prerequisites ✅

- [ ] Docker installed and running
- [ ] Node.js 18+ installed
- [ ] Project cloned/downloaded

## Setup Verification

### 1. Environment Setup ✅

```bash
# Check Docker
docker --version
docker compose version

# Check Node.js
node --version
npm --version
```

### 2. Start Services ✅

```bash
# Start Docker containers
cd /path/to/project
docker compose up -d

# Verify containers are running
docker compose ps
# Should show: ecommerce_postgres and ecommerce_redis

# Install backend dependencies
cd backend
npm install

# Seed database
npm run seed
# Should show: ✓ Super admin created, ✓ Created 10 access codes

# Start backend
npm run start:dev
# Wait 10 seconds, then check http://localhost:3000
```

### 3. Backend API Tests ✅

Run these curl commands to verify endpoints:

#### Test 1: Super Admin Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "+966500000001", "password": "admin123"}'
```
**Expected:** JSON with `success: true`, user object, accessToken, refreshToken

#### Test 2: User Signup
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "phone": "+966500555555", "password": "test123456", "confirmPassword": "test123456"}'
```
**Expected:** Success message with user object (active: false)

#### Test 3: Generate Access Code (as Admin)
```bash
# Get token first
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "+966500000001", "password": "admin123"}' \
  | jq -r '.data.accessToken')

# Generate codes
curl -X POST http://localhost:3000/api/admin/access-codes/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"role": "user", "validDays": 30, "usesAllowed": 1, "count": 1, "note": "Verification test"}'
```
**Expected:** JSON with generated code(s)

#### Test 4: Activate Account
```bash
# Use a code from the seed or generated above
curl -X POST http://localhost:3000/api/auth/activate \
  -H "Content-Type: application/json" \
  -d '{"phone": "+966500555555", "password": "test123456", "accessCode": "YOUR_CODE_HERE"}'
```
**Expected:** Success message with user object (active: true, role assigned)

#### Test 5: Login as Activated User
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "+966500555555", "password": "test123456"}'
```
**Expected:** Success with tokens

#### Test 6: Get User Profile
```bash
USER_TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "+966500555555", "password": "test123456"}' \
  | jq -r '.data.accessToken')

curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $USER_TOKEN"
```
**Expected:** User profile data

#### Test 7: List Access Codes (Admin)
```bash
curl -X GET "http://localhost:3000/api/admin/access-codes?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```
**Expected:** Paginated list of access codes

#### Test 8: Refresh Token
```bash
REFRESH_TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "+966500555555", "password": "test123456"}' \
  | jq -r '.data.refreshToken')

curl -X POST http://localhost:3000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}"
```
**Expected:** New access and refresh tokens

## Error Handling Tests ✅

#### Test 9: Invalid Phone Format
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name": "Test", "phone": "123456", "password": "test123", "confirmPassword": "test123"}'
```
**Expected:** Error response with validation message

#### Test 10: Duplicate Phone
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name": "Test", "phone": "+966500000001", "password": "test123", "confirmPassword": "test123"}'
```
**Expected:** Error: USER_ALREADY_EXISTS

#### Test 11: Invalid Access Code
```bash
curl -X POST http://localhost:3000/api/auth/activate \
  -H "Content-Type: application/json" \
  -d '{"phone": "+966500555555", "password": "test123456", "accessCode": "INVALID1"}'
```
**Expected:** Error: INVALID_ACCESS_CODE

#### Test 12: Login Without Activation
```bash
# Signup new user
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name": "Inactive", "phone": "+966500666666", "password": "test123", "confirmPassword": "test123"}'

# Try to login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "+966500666666", "password": "test123"}'
```
**Expected:** Error: ACCOUNT_NOT_ACTIVATED

#### Test 13: Wrong Password
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "+966500000001", "password": "wrongpassword"}'
```
**Expected:** Error: INVALID_CREDENTIALS

## Mobile App Verification (Optional)

### Setup
```bash
cd mobile
npm install
# Copy .env.example to .env
cp .env.example .env
```

### Start Expo
```bash
npm start
```

### Manual Tests
- [ ] Splash screen appears for 2 seconds
- [ ] Login screen loads
- [ ] Can navigate to Signup
- [ ] Signup form validation works
- [ ] After signup, redirects to Activation screen with phone/password
- [ ] Activation with valid code works
- [ ] After activation, can login
- [ ] Home screen shows user info
- [ ] Logout works and returns to Login
- [ ] Error messages display properly

## Admin Dashboard Verification (Optional)

### Setup
```bash
cd admin-dashboard
npm install
# Copy .env.example to .env
cp .env.example .env
```

### Start Dev Server
```bash
npm run dev
```

### Manual Tests
- [ ] Open http://localhost:5173
- [ ] Login page loads with Tailwind styling
- [ ] Can login with +966500000001 / admin123
- [ ] Dashboard loads with sidebar
- [ ] Access Codes tab shows generate form
- [ ] Can generate new codes
- [ ] Access codes list displays with pagination
- [ ] Other tabs show placeholder messages
- [ ] Logout works

## Database Verification

### Connect to PostgreSQL
```bash
docker exec -it ecommerce_postgres psql -U admin -d ecommerce_app
```

### Run Queries
```sql
-- Check users table
SELECT id, name, phone, role, active FROM users;
-- Should show super admin and any test users

-- Check access codes
SELECT code, role, uses_count, uses_allowed, is_used, 
       valid_until > NOW() as is_valid 
FROM access_codes;
-- Should show seeded and generated codes

-- Check sessions
SELECT user_id, expires_at > NOW() as is_active FROM sessions;
-- Should show active sessions

-- Check audit logs
SELECT action, resource_type, created_at FROM audit_logs;
-- Should show GENERATE_ACCESS_CODES entries

-- Exit
\q
```

## Security Verification ✅

- [ ] Passwords are hashed (check database - passwordHash field)
- [ ] JWT tokens expire (access: 15 min, refresh: 7 days)
- [ ] Rate limiting works (try 12 requests in 1 minute)
- [ ] Phone validation enforces E.164 format
- [ ] Roles are enforced (try accessing /api/admin as regular user)
- [ ] Invalid tokens are rejected
- [ ] CORS is configured for development

## Documentation Verification ✅

- [ ] README.md has quick start instructions
- [ ] docs/SETUP.md has detailed setup guide
- [ ] docs/API_SPEC.md has all endpoints documented
- [ ] docs/DATABASE_SCHEMA.md describes all tables
- [ ] docs/TESTING_GUIDE.md has test commands
- [ ] docs/PHASE_1_COMPLETION.md summarizes deliverables

## File Structure Verification ✅

```bash
# Verify all key files exist
ls -la backend/src/auth/auth.controller.ts
ls -la backend/src/access-codes/access-codes.service.ts
ls -la backend/src/database/entities/user.entity.ts
ls -la mobile/screens/LoginScreen.tsx
ls -la mobile/store/authStore.ts
ls -la admin-dashboard/src/pages/DashboardPage.tsx
ls -la shared/types/auth.ts
ls -la docker-compose.yml
ls -la start-dev.sh
```

## Final Checklist ✅

- [ ] All backend endpoints working
- [ ] Database seeded successfully
- [ ] Authentication flow complete (signup → activate → login)
- [ ] Admin code generation working
- [ ] Error handling consistent
- [ ] Documentation complete
- [ ] Environment files configured
- [ ] Docker containers running properly
- [ ] Mobile screens implemented (if tested)
- [ ] Admin dashboard functional (if tested)

## Cleanup (After Testing)

```bash
# Stop backend
pkill -f 'ts-node-dev'

# Stop Docker
docker compose down

# To completely reset (delete all data)
docker compose down -v
```

---

**If all tests pass: Phase 1 is complete and ready for Phase 1.5!** ✅
