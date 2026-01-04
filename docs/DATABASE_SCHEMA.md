# Database Schema

PostgreSQL database: `ecommerce_app`

## Tables

### users

Stores user account information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique user identifier |
| name | VARCHAR(255) | NOT NULL | User's full name |
| phone | VARCHAR(20) | UNIQUE, NOT NULL | Phone number (international format) |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| role | ENUM | DEFAULT 'user' | Role: super_admin, admin, user |
| active | BOOLEAN | DEFAULT false | Account activation status |
| salary_range | VARCHAR(100) | NULL | Optional salary range |
| interested_categories | TEXT[] | NULL | Array of interested product categories |
| created_at | TIMESTAMP | DEFAULT NOW() | Account creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE INDEX on `phone`
- INDEX on `role`
- INDEX on `active`

---

### access_codes

Stores admin-generated access codes for account activation.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique code identifier |
| code | VARCHAR(8) | UNIQUE, NOT NULL | 8-character alphanumeric code |
| role | ENUM | DEFAULT 'user' | Role granted: super_admin, admin, user |
| valid_from | TIMESTAMP | NOT NULL | Code validity start date |
| valid_until | TIMESTAMP | NOT NULL | Code expiration date |
| uses_allowed | INTEGER | DEFAULT 1 | Maximum number of uses |
| uses_count | INTEGER | DEFAULT 0 | Current usage count |
| is_used | BOOLEAN | DEFAULT false | True when usage limit reached |
| issued_by | UUID | NULL | Admin ID who generated the code |
| note | TEXT | NULL | Optional description/note |
| created_at | TIMESTAMP | DEFAULT NOW() | Code creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE INDEX on `code`
- INDEX on `role`
- INDEX on `is_used`
- INDEX on `valid_until`

**Foreign Keys:**
- `issued_by` REFERENCES `users(id)` ON DELETE SET NULL

---

### sessions

Stores active user sessions and refresh tokens.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique session identifier |
| user_id | UUID | NOT NULL | Associated user ID |
| token | TEXT | NOT NULL | Refresh token (JWT) |
| expires_at | TIMESTAMP | NOT NULL | Token expiration timestamp |
| created_at | TIMESTAMP | DEFAULT NOW() | Session creation timestamp |

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `user_id`
- INDEX on `token`
- INDEX on `expires_at`

**Foreign Keys:**
- `user_id` REFERENCES `users(id)` ON DELETE CASCADE

---

### audit_logs

Tracks admin actions for compliance and security.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique log entry identifier |
| admin_id | UUID | NOT NULL | Admin who performed action |
| action | VARCHAR(100) | NOT NULL | Action type (e.g., GENERATE_ACCESS_CODES) |
| resource_type | VARCHAR(100) | NOT NULL | Resource affected (e.g., access_code, user) |
| resource_id | VARCHAR(255) | NULL | Specific resource identifier |
| old_value | JSONB | NULL | Previous state (for updates) |
| new_value | JSONB | NULL | New state |
| created_at | TIMESTAMP | DEFAULT NOW() | Action timestamp |

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `admin_id`
- INDEX on `action`
- INDEX on `resource_type`
- INDEX on `created_at`

**Foreign Keys:**
- `admin_id` REFERENCES `users(id)` ON DELETE CASCADE

---

### products

Stores product catalog information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique product identifier |
| title | VARCHAR(500) | NOT NULL | Product title |
| short_description | TEXT | NULL | Brief description |
| full_description | TEXT | NULL | Detailed description |
| price | DECIMAL(10,2) | NOT NULL | Selling price |
| cost | DECIMAL(10,2) | NULL | Cost price (admin only) |
| currency | VARCHAR(3) | DEFAULT 'SAR' | Currency code |
| category_id | UUID | NOT NULL | Category reference |
| tags | TEXT[] | NULL | Product tags (new, coming_soon, order_to_buy) |
| images | TEXT[] | NULL | Image URLs |
| stock_count | INTEGER | DEFAULT 0 | Available stock quantity |
| available | BOOLEAN | DEFAULT true | Product availability |
| expiry_timer | TIMESTAMP | NULL | Product expiration date |
| views_count | INTEGER | DEFAULT 0 | Total view count |
| likes | INTEGER | DEFAULT 0 | Total like count |
| dislikes | INTEGER | DEFAULT 0 | Total dislike count |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |
| deleted_at | TIMESTAMP | NULL | Soft delete timestamp |

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `category_id`
- INDEX on `available`
- INDEX on `deleted_at`
- INDEX on `created_at`
- INDEX on `views_count`
- INDEX on `likes`

**Foreign Keys:**
- `category_id` REFERENCES `categories(id)` ON DELETE CASCADE

---

### categories

Stores product categories with bilingual names.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique category identifier |
| name_en | VARCHAR(255) | NOT NULL | English name |
| name_ar | VARCHAR(255) | NOT NULL | Arabic name |
| parent_id | UUID | NULL | Parent category for hierarchy |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `parent_id`

**Foreign Keys:**
- `parent_id` REFERENCES `categories(id)` ON DELETE CASCADE

---

### comments

Stores user comments on products.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique comment identifier |
| product_id | UUID | NOT NULL | Product reference |
| user_id | UUID | NOT NULL | User who commented |
| text | TEXT | NOT NULL | Comment content |
| rating | INTEGER | DEFAULT 5 | Rating (1-5) |
| flagged | BOOLEAN | DEFAULT false | Flagged by admin |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `product_id`
- INDEX on `user_id`
- INDEX on `flagged`

**Foreign Keys:**
- `product_id` REFERENCES `products(id)` ON DELETE CASCADE
- `user_id` REFERENCES `users(id)` ON DELETE CASCADE

---

### product_likes

Stores user likes on products.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique like identifier |
| product_id | UUID | NOT NULL | Product reference |
| user_id | UUID | NOT NULL | User who liked |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE INDEX on (`product_id`, `user_id`)
- INDEX on `product_id`
- INDEX on `user_id`

**Foreign Keys:**
- `product_id` REFERENCES `products(id)` ON DELETE CASCADE
- `user_id` REFERENCES `users(id)` ON DELETE CASCADE

---

## Relationships

```
users (1) ─── (N) access_codes
  └─ issued_by

users (1) ─── (N) sessions
  └─ user_id

users (1) ─── (N) audit_logs
  └─ admin_id

users (1) ─── (N) product_likes
  └─ user_id

users (1) ─── (N) comments
  └─ user_id

categories (1) ─── (N) categories
  └─ parent_id

categories (1) ─── (N) products
  └─ category_id

products (1) ─── (N) comments
  └─ product_id

products (1) ─── (N) product_likes
  └─ product_id
```

---

## Enums

### Role
- `super_admin`: Full system access, can create admins
- `admin`: Can manage users, generate codes, view analytics
- `user`: Regular user access

---

## Seed Data

Initial seeding creates:

1. **Super Admin User**
   - Phone: +966500000001
   - Password: admin123
   - Role: super_admin
   - Active: true

2. **10 Sample Access Codes**
   - 5 user codes (30 days, 1 use)
   - 3 admin codes (365 days, 1 use)
   - 2 multi-use user codes (30 days, 5 uses)

3. **5 Categories** (with bilingual names)
   - Electronics / إلكترونيات
   - Clothing / ملابس
   - Home & Garden / المنزل والحديقة
   - Sports & Outdoors / الرياضة والهواء الطلق
   - Food & Beverages / الطعام والمشروبات

4. **13 Sample Products**
   - 3-4 tagged "new"
   - 2-3 tagged "coming_soon"
   - 2-3 tagged "order_to_buy"
   - Various prices (50-5200 SAR)
   - Mix of stock levels (in-stock, low-stock, out-of-stock)
   - Multiple images per product

5. **15 Sample Comments**
   - 3-5 comments on first 5 products
   - Ratings 4-5 stars
   - From sample users

---

## Security Notes

1. **Password Hashing**: All passwords hashed with bcrypt (cost factor: 10)
2. **Phone Numbers**: Must be in international format (E.164), validated on input
3. **Access Codes**: Case-insensitive, validated as 8-character alphanumeric
4. **Sessions**: Automatically cleaned up on expiry
5. **Audit Logs**: Immutable, never deleted

---

## Future Additions (Phase 2+)

- `orders` table: Order management
- `payments` table: Payment transactions (Stripe)
- `wishlists` table: User wishlists
- `cart_items` table: Shopping cart
- `notifications` table: Push notifications
- `messages` table: Chat messages
