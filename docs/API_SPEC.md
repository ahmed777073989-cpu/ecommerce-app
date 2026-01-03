# API Specification

Base URL: `http://localhost:3000`

All endpoints return JSON responses with the following structure:

## Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

## Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  },
  "statusCode": 400,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/endpoint"
}
```

## Authentication Endpoints

### POST /api/auth/signup

Register a new user account.

**Request:**
```json
{
  "name": "John Doe",
  "phone": "+966500000000",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully. Please activate your account with an access code.",
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "phone": "+966500000000",
    "active": false
  }
}
```

**Errors:**
- `400 VALIDATION_ERROR`: Invalid input (phone format, password mismatch, etc.)
- `409 USER_ALREADY_EXISTS`: Phone number already registered

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "phone": "+966500000000",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

---

### POST /api/auth/activate

Activate user account with an access code. Requires authentication.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request:**
```json
{
  "accessCode": "ABC12XYZ"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Account activated successfully",
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "phone": "+966500000000",
    "role": "user",
    "active": true
  }
}
```

**Errors:**
- `400 INVALID_ACCESS_CODE`: Code doesn't exist
- `400 EXPIRED_CODE`: Code has expired
- `400 CODE_USAGE_LIMIT_REACHED`: Code has been used maximum times
- `401 USER_NOT_FOUND`: User not found

---

### POST /api/auth/login

Login with phone and password.

**Request:**
```json
{
  "phone": "+966500000000",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "phone": "+966500000000",
      "role": "user",
      "active": true
    },
    "accessToken": "jwt_token",
    "refreshToken": "jwt_refresh_token",
    "expiresIn": 900
  }
}
```

**Errors:**
- `401 INVALID_CREDENTIALS`: Wrong phone or password
- `401 ACCOUNT_NOT_ACTIVATED`: Account not yet activated
- `429 RATE_LIMIT_EXCEEDED`: Too many login attempts

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+966500000001",
    "password": "admin123"
  }'
```

---

### POST /api/auth/refresh-token

Refresh access token using refresh token.

**Request:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_token",
    "refreshToken": "new_jwt_refresh_token",
    "expiresIn": 900
  }
}
```

**Errors:**
- `401 INVALID_TOKEN`: Invalid or expired refresh token

---

### POST /api/auth/logout

Logout and invalidate tokens. Requires authentication.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### GET /api/auth/me

Get current user profile. Requires authentication.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "phone": "+966500000000",
    "role": "user",
    "active": true,
    "salaryRange": null,
    "interestedCategories": [],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## Admin Endpoints

### POST /api/admin/access-codes/generate

Generate new access codes. Requires admin or super_admin role.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request:**
```json
{
  "role": "user",
  "validDays": 30,
  "usesAllowed": 1,
  "count": 5,
  "note": "Q1 2024 batch"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Generated 5 access code(s)",
  "data": [
    {
      "id": "uuid",
      "code": "ABC12XYZ",
      "role": "user",
      "validFrom": "2024-01-01T00:00:00.000Z",
      "validUntil": "2024-01-31T00:00:00.000Z",
      "usesAllowed": 1,
      "note": "Q1 2024 batch"
    }
  ]
}
```

**Errors:**
- `403 INSUFFICIENT_PERMISSIONS`: Not an admin
- `400 VALIDATION_ERROR`: Invalid parameters

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/admin/access-codes/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "role": "user",
    "validDays": 30,
    "usesAllowed": 1,
    "count": 5,
    "note": "Test codes"
  }'
```

---

### GET /api/admin/access-codes

List all access codes with pagination. Requires admin or super_admin role.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "code": "ABC12XYZ",
      "role": "user",
      "validFrom": "2024-01-01T00:00:00.000Z",
      "validUntil": "2024-01-31T00:00:00.000Z",
      "usesAllowed": 1,
      "usesCount": 0,
      "isUsed": false,
      "note": "Test code",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "totalPages": 2
  }
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:3000/api/admin/access-codes?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Rate Limiting

- **Login**: 10 requests per minute per IP
- **Signup**: 10 requests per minute per IP
- **All other endpoints**: 10 requests per minute per user

Rate limit exceeded returns `429 RATE_LIMIT_EXCEEDED`.

---

## Token Expiry

- **Access Token**: 15 minutes (900 seconds)
- **Refresh Token**: 7 days (604800 seconds)

Use the refresh token endpoint to get new access tokens without re-authenticating.
