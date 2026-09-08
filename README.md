# SkillX - Skill Exchange Platform

A full-stack web application where users can discover skills, create skill profiles, offer skills, request skills, and connect with other users for learning and teaching.

## Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite
- Tailwind CSS v4
- React Router v6
- Axios
- Lucide React Icons

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs (password hashing)
- Helmet (security headers)
- Rate Limiting
- Socket.IO (real-time messaging ready)

## Features

- **Landing Page** - Professional landing page with features, categories, and CTAs
- **Authentication** - Register, login, logout with JWT and secure password hashing
- **User Profiles** - Create and edit profiles with skills, bio, location, availability
- **Skill Marketplace** - Search, filter, and browse skill listings
- **Skill Listings** - Create, view, update, and delete skill listings
- **Skill Requests** - Send, accept, reject, and track exchange requests
- **Matching System** - Algorithm that matches users based on teach/learn compatibility
- **Messaging** - Real-time messaging between matched users
- **Reviews & Ratings** - Rate and review after completed exchanges
- **Notifications** - System notifications for requests, messages, and reviews
- **Admin Panel** - User management, listing management, platform statistics
- **Responsive Design** - Works on desktop and mobile

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (running locally or MongoDB Atlas)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd skill-exchange
   ```

2. **Backend Setup**
   ```bash
   cd server
   npm install
   # Edit .env with your MongoDB URI and JWT secret
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Seed Sample Data (Optional)**
   ```bash
   cd server
   node seed.js
   ```

### Sample Credentials

After seeding:
- **Email:** alex@example.com | **Password:** password123
- **Email:** sarah@example.com | **Password:** password123
- **Email:** marcus@example.com | **Password:** password123

## Environment Variables

### Server (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/skill-exchange
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
NODE_ENV=development
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update profile

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID

### Skills
- `GET /api/skills` - Get all listings (with filters)
- `GET /api/skills/:id` - Get listing details
- `POST /api/skills` - Create listing
- `PUT /api/skills/:id` - Update listing
- `DELETE /api/skills/:id` - Delete listing

### Requests
- `GET /api/requests/my` - Get my requests
- `POST /api/requests` - Create request
- `PUT /api/requests/:id/status` - Update status
- `PUT /api/requests/:id/complete` - Mark complete

### Matching
- `GET /api/matching` - Get matched users

### Messages
- `GET /api/messages/conversations` - Get conversations
- `POST /api/messages/conversations` - Start conversation
- `GET /api/messages/conversations/:id` - Get messages
- `POST /api/messages/conversations/:id` - Send message

### Reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews/user/:userId` - Get user reviews

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/read-all` - Mark all read

### Admin
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/users` - Manage users
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/listings` - Manage listings
- `DELETE /api/admin/listings/:id` - Delete listing

## Architecture

```
skill-exchange/
├── server/
│   ├── config/         # Database configuration
│   ├── controllers/    # Route handlers
│   ├── middleware/      # Auth, error handling
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Helpers
│   └── index.js        # Server entry
├── frontend/
│   ├── src/
│   │   ├── components/ # Reusable components
│   │   ├── context/    # React context
│   │   ├── hooks/      # Custom hooks
│   │   ├── layouts/    # Layout components
│   │   ├── pages/      # Page components
│   │   ├── services/   # API client
│   │   ├── types/      # TypeScript types
│   │   └── utils/      # Helpers
│   └── index.html
└── README.md
```

## License

MIT
