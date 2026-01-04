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

## Products Endpoints

### GET /api/products

Get paginated list of products with optional filters.

**Query Parameters:**
- `category` (optional): Filter by category ID
- `tag` (optional): Filter by tag (new, coming_soon, order_to_buy)
- `available` (optional): Filter by availability status (true/false)
- `search` (optional): Search in title and short description
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter
- `sortBy` (optional): Sort order (newest, price_asc, price_desc, trending, views, likes)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

**Response (200):**
```json
{
  "products": [
    {
      "id": "uuid",
      "title": "Product Name",
      "shortDescription": "Brief description",
      "fullDescription": "Full description",
      "price": 99.99,
      "cost": 80.00,
      "currency": "SAR",
      "categoryId": "uuid",
      "category": {
        "id": "uuid",
        "nameEn": "Electronics",
        "nameAr": "إلكترونيات"
      },
      "tags": ["new"],
      "images": ["https://example.com/image.jpg"],
      "stockCount": 50,
      "available": true,
      "viewsCount": 100,
      "likes": 20,
      "dislikes": 0,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

### GET /api/products/:id

Get detailed product information including comments.

**Response (200):**
```json
{
  "id": "uuid",
  "title": "Product Name",
  "shortDescription": "Brief description",
  "fullDescription": "Full description",
  "price": 99.99,
  "cost": 80.00,
  "currency": "SAR",
  "categoryId": "uuid",
  "category": { ... },
  "tags": ["new"],
  "images": ["https://example.com/image.jpg"],
  "stockCount": 50,
  "available": true,
  "viewsCount": 100,
  "likes": 20,
  "dislikes": 0,
  "comments": [
    {
      "id": "uuid",
      "productId": "uuid",
      "userId": "uuid",
      "user": {
        "id": "uuid",
        "name": "John Doe"
      },
      "text": "Great product!",
      "rating": 5,
      "flagged": false,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### GET /api/products/category/:categoryId

Get products by category.

**Query Parameters:** Same as GET /api/products

### POST /api/products/:id/views (Protected)

Increment product view count.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true
}
```

### POST /api/products/:id/like (Protected)

Toggle like status for a product.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "liked": true,
  "likesCount": 21
}
```

### POST /api/products/:id/comments (Protected)

Add a comment to a product.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "text": "Great product!",
  "rating": 5
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "productId": "uuid",
  "userId": "uuid",
  "user": {
    "id": "uuid",
    "name": "John Doe"
  },
  "text": "Great product!",
  "rating": 5,
  "flagged": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### GET /api/products/:id/comments

Get paginated comments for a product.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

---

## Admin Product Endpoints

### POST /api/admin/products (Admin Only)

Create a new product.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "title": "Product Name",
  "shortDescription": "Brief description",
  "fullDescription": "Full description",
  "price": 99.99,
  "cost": 80.00,
  "currency": "SAR",
  "categoryId": "uuid",
  "tags": ["new", "order_to_buy"],
  "images": ["https://example.com/image.jpg"],
  "stockCount": 50,
  "available": true,
  "expiryTimer": "2024-12-31T23:59:59.000Z"
}
```

**Response (201):** Returns created product object

### GET /api/admin/products (Admin Only)

Get all products including soft-deleted ones.

**Headers:** `Authorization: Bearer <token>`

**Response (200):** Returns array of products

### GET /api/admin/products/:id (Admin Only)

Get product details including soft-deleted ones.

**Headers:** `Authorization: Bearer <token>`

**Response (200):** Returns product object with comments

### PATCH /api/admin/products/:id (Admin Only)

Update product details.

**Headers:** `Authorization: Bearer <token>`

**Request:** Any subset of product fields

**Response (200):** Returns updated product

### DELETE /api/admin/products/:id (Admin Only)

Soft delete a product.

**Headers:** `Authorization: Bearer <token>`

**Response (204):** No content

### PATCH /api/admin/products/:id/availability (Admin Only)

Toggle product availability.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "available": true
}
```

**Response (200):** Returns updated product

### PATCH /api/admin/products/:id/stock (Admin Only)

Update product stock count.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "stockCount": 100
}
```

**Response (200):** Returns updated product

---

## Categories Endpoints

### GET /api/categories

Get all categories with product counts.

**Response (200):**
```json
{
  "categories": [
    {
      "id": "uuid",
      "nameEn": "Electronics",
      "nameAr": "إلكترونيات",
      "parentId": null,
      "productCount": 25,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET /api/categories/:id

Get category details.

**Response (200):** Returns category object with parent/children

### POST /api/admin/categories (Admin Only)

Create a new category.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "nameEn": "Electronics",
  "nameAr": "إلكترونيات",
  "parentId": "uuid"
}
```

**Response (201):** Returns created category

### PATCH /api/admin/categories/:id (Admin Only)

Update category.

**Headers:** `Authorization: Bearer <token>`

**Request:** Any subset of category fields

**Response (200):** Returns updated category

### DELETE /api/admin/categories/:id (Admin Only)

Delete a category.

**Headers:** `Authorization: Bearer <token>`

**Response (204):** No content

---

## Token Expiry

- **Access Token**: 15 minutes (900 seconds)
- **Refresh Token**: 7 days (604800 seconds)

Use the refresh token endpoint to get new access tokens without re-authenticating.
