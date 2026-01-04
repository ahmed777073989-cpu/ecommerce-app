# EcommerceApp - Bilingual Mobile E-Commerce Platform

A comprehensive bilingual (Arabic/English) mobile-first e-commerce application with role-based access control, admin dashboard, and Stripe payment integration.

## 🚀 Tech Stack

### Backend
- **NestJS 10+** - Scalable Node.js framework
- **TypeORM** - Database ORM
- **PostgreSQL 15** - Primary database
- **Redis 7** - Session storage and caching
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing

### Mobile (React Native)
- **Expo SDK 51+** - React Native development platform
- **React Navigation** - Navigation library
- **Zustand** - State management
- **Axios** - HTTP client
- **React Native Paper** - UI components
- **i18next** - Internationalization (Arabic/English)

### Admin Dashboard (Web)
- **React 18+** - UI library
- **Vite** - Build tool
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **Zustand** - State management

### DevOps
- **Docker & Docker Compose** - Containerization
- **PostgreSQL & Redis** - Persistent data storage

---

## ✨ Features (Phase 1.5)

### Authentication & Authorization
- ✅ User registration with phone number
- ✅ Account activation via admin-generated access codes
- ✅ JWT-based authentication (15-min access, 7-day refresh)
- ✅ Role-based access control (super_admin, admin, user)
- ✅ Secure password hashing with bcrypt
- ✅ Rate limiting on auth endpoints

### Product Management
- ✅ Product catalog with categories (bilingual: English/Arabic)
- ✅ Product CRUD operations (Create, Read, Update, Delete)
- ✅ Product search, filter, and sorting
- ✅ Product tags (new, coming_soon, order_to_buy)
- ✅ Stock management and availability toggling
- ✅ Product views and likes tracking
- ✅ Product comments and ratings
- ✅ Soft delete support for products
- ✅ 13 sample products seeded

### Admin Dashboard
- ✅ Web-based admin dashboard
- ✅ Products management page with full CRUD
- ✅ Product list with filters and search
- ✅ Add/Edit product modal with validation
- ✅ Low stock alerts widget
- ✅ Recent products widget
- ✅ Category management
- ✅ Generate single or bulk access codes
- ✅ View all access codes with usage statistics
- ✅ Audit logging for admin actions

### Mobile App
- ✅ Complete product browsing screens
- ✅ Home screen with tabs (Browse, Search, Profile)
- ✅ Category and tag filtering
- ✅ Product search functionality
- ✅ Product detail screen with full information
- ✅ Image gallery for products
- ✅ Like/unlike products
- ✅ Add comments with ratings
- ✅ Pull-to-refresh functionality
- ✅ RTL layout support for Arabic
- ✅ Language toggle (English/Arabic)
- ✅ Admin panel access for admin users
- ✅ Splash screen with auto-login
- ✅ Login and signup flows
- ✅ Account activation screen
- ✅ Persistent auth state

---

## 📁 Project Structure

```
/
├── backend/              # NestJS backend (port 3000)
│   ├── src/
│   │   ├── auth/         # Authentication module
│   │   ├── access-codes/ # Access code management
│   │   ├── database/     # TypeORM entities & migrations
│   │   └── common/       # Shared guards, filters, decorators
│   └── package.json
│
├── mobile/               # React Native + Expo
│   ├── screens/          # UI screens
│   ├── api/              # API client
│   ├── store/            # Zustand state
│   └── package.json
│
├── admin-dashboard/      # React admin panel (port 5173)
│   ├── src/
│   │   ├── pages/        # Dashboard pages
│   │   ├── api/          # API client
│   │   ├── store/        # Zustand state
│   │   └── guards/       # Auth guards
│   └── package.json
│
├── shared/               # Shared TypeScript types
│   ├── types/            # Type definitions
│   └── constants/        # Shared constants
│
├── docs/                 # Documentation
│   ├── SETUP.md          # Setup instructions
│   ├── API_SPEC.md       # API documentation
│   └── DATABASE_SCHEMA.md # Database schema
│
├── docker-compose.yml    # PostgreSQL + Redis services
└── README.md            # This file
```

---

## 🏃 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- npm or yarn

### 1. Start Database Services

```bash
docker-compose up -d
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
npm run seed          # Create super admin & sample codes
npm run start:dev     # Start on port 3000
```

### 3. Mobile App Setup

```bash
cd mobile
npm install
cp .env.example .env
npm start             # Start Expo dev server
```

### 4. Admin Dashboard Setup

```bash
cd admin-dashboard
npm install
cp .env.example .env
npm run dev           # Start on port 5173
```

---

## 🔑 Default Credentials

**Super Admin:**
- Phone: `+966500000001`
- Password: `admin123`

**Access Codes:** Run `npm run seed` in backend to generate 10 sample codes (displayed in console)

---

## 📖 Documentation

- **[Setup Guide](./docs/SETUP.md)** - Detailed installation and troubleshooting
- **[API Specification](./docs/API_SPEC.md)** - Complete API documentation with examples
- **[Database Schema](./docs/DATABASE_SCHEMA.md)** - Database tables and relationships

---

## 🔒 Security Features

- Bcrypt password hashing (cost factor: 10)
- JWT with short-lived access tokens (15 min) and refresh tokens (7 days)
- Rate limiting: 10 requests/min on auth endpoints
- Phone number validation (E.164 format)
- Role-based access guards
- Audit logging for all admin actions
- Input validation on all endpoints

---

## 🌐 API Endpoints

### Public Endpoints
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh-token` - Refresh access token

### Protected Endpoints
- `POST /api/auth/activate` - Activate account with code
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Admin Endpoints
- `POST /api/admin/access-codes/generate` - Generate codes (admin/super_admin)
- `GET /api/admin/access-codes` - List codes (admin/super_admin)

See [API_SPEC.md](./docs/API_SPEC.md) for complete documentation with examples.

---

## 🗄️ Database Schema

### Core Tables
- **users** - User accounts with roles
- **access_codes** - Admin-generated activation codes
- **sessions** - Active user sessions
- **audit_logs** - Admin action tracking

See [DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md) for detailed schema.

---

## 🛣️ Roadmap

### Phase 1 ✅ (Current)
- Authentication & authorization
- Access code system
- Admin dashboard
- Mobile app skeleton
- RTL support

### Phase 1.5 (Next)
- Product catalog with categories
- Product CRUD in admin
- Mobile product browsing
- User profile management
- Audit log viewer

### Phase 2
- Stripe payment integration
- Order management
- In-app chat support
- WhatsApp integration
- Analytics dashboard
- Push notifications

---

## 🧪 Testing

### Test Super Admin Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+966500000001",
    "password": "admin123"
  }'
```

### Test Access Code Generation
```bash
curl -X POST http://localhost:3000/api/admin/access-codes/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "role": "user",
    "validDays": 30,
    "usesAllowed": 1,
    "count": 5
  }'
```

---

## 📝 Environment Variables

### Backend
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://admin:admin123@localhost:5432/ecommerce_app
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
JWT_ACCESS_EXPIRY=900
JWT_REFRESH_EXPIRY=604800
```

### Mobile
```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
EXPO_PUBLIC_APP_NAME=EcommerceApp
```

### Admin Dashboard
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_NAME=Admin Dashboard
```

---

## 🤝 Contributing

1. Create a feature branch from `main`
2. Follow existing code style and patterns
3. Write clear commit messages
4. Test thoroughly before submitting PR

---

## 📄 License

ISC

---

## 🐛 Troubleshooting

See [SETUP.md](./docs/SETUP.md) for common issues and solutions.

---

## 📧 Support

For issues or questions, please create an issue in the repository.
