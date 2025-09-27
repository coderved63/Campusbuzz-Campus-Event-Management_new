# CampusBuzz

**Campus Event Management System built with Next.js, TypeScript, and Tailwind CSS**

A comprehensive event management platform for campus activities with user authentication, event creation, ticket booking, and admin management features.

## 🚀 Features

### Core Functionality
- **User Authentication**: Register, login, logout with JWT-based authentication
- **Event Management**: Create, read, update, delete events with admin approval system
- **Ticket Booking**: Book tickets with QR code generation
- **Admin Dashboard**: Approve events, manage users, view analytics
- **Real-time Notifications**: Event approval notifications, new event alerts
- **Image Upload**: Support for event images with multiple formats
- **Search & Filter**: Search events by title, category, date
- **Responsive Design**: Mobile-first design with dark mode support

### Technical Features
- **Next.js 14**: Modern React framework with API routes
- **TypeScript**: Full type safety with strict mode enabled
- **Tailwind CSS**: Utility-first styling matching original design
- **MongoDB**: Database with Mongoose ODM and TypeScript models
- **File Upload**: Multer integration for image handling
- **QR Code Generation**: Automatic QR codes for tickets
- **Context API**: State management for user and theme
- **SWR**: Data fetching and caching
- **Responsive UI**: Mobile and desktop optimized

## 📁 Project Structure

```
campusbuzz-next/
├── public/                  # Static assets
│   ├── assets/             # Images, icons
│   └── uploads/            # User uploaded files & QR codes
├── src/
│   ├── components/         # Reusable React components
│   │   ├── EventCard.tsx   # Event display component
│   │   ├── Header.tsx      # Navigation header
│   │   └── Footer.tsx      # Site footer
│   ├── contexts/           # React Context providers
│   │   ├── UserContext.tsx # User authentication state
│   │   └── ThemeContext.tsx# Dark/light theme state
│   ├── lib/                # Utility libraries
│   │   ├── mongodb.ts      # Database connection
│   │   ├── auth.ts         # Authentication helpers
│   │   └── upload.ts       # File upload utilities
│   ├── models/             # MongoDB/Mongoose models
│   │   ├── User.ts         # User data model
│   │   ├── Event.ts        # Event data model
│   │   ├── Ticket.ts       # Ticket data model
│   │   ├── Notification.ts # Notification model
│   │   └── Category.ts     # Category model
│   ├── pages/              # Next.js pages & API routes
│   │   ├── api/            # Backend API endpoints
│   │   │   ├── auth/       # Authentication endpoints
│   │   │   ├── events.ts   # Event CRUD operations
│   │   │   ├── tickets.ts  # Ticket operations
│   │   │   └── ...         # Other API routes
│   │   ├── index.tsx       # Home page
│   │   ├── login.tsx       # Login page
│   │   ├── register.tsx    # Registration page
│   │   └── ...             # Other pages
│   ├── styles/             # Global styles
│   │   └── globals.css     # Tailwind & custom CSS
│   └── types/              # TypeScript type definitions
│       └── index.ts        # Shared interfaces
├── package.json            # Dependencies & scripts
├── tsconfig.json          # TypeScript configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── next.config.js         # Next.js configuration
└── README.md              # This file
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account or local MongoDB instance
- Git

### Step 1: Clone & Install
```bash
git clone <this-repository>
cd campusbuzz-next
npm install
```

### Step 2: Environment Configuration
```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your values:
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/campusbuzz
JWT_SECRET=your_super_secret_jwt_key_here
NEXTAUTH_SECRET=your_nextauth_secret_here
ADMIN_SECRET=your_admin_secret_here
```

### Step 3: Development Server
```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

### Step 4: Build for Production
```bash
# Build application
npm run build

# Start production server
npm start
```

## 🔧 API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/profile` - Get user profile

### Events
- `GET /api/events` - Get all approved events
- `POST /api/events` - Create new event (requires auth)
- `GET /api/event/[id]` - Get single event
- `DELETE /api/event/[id]` - Delete event (owner/admin only)
- `POST /api/event/[id]/approve` - Approve event (admin only)

### Tickets
- `GET /api/tickets` - Get all tickets
- `POST /api/book-ticket` - Book event ticket
- `GET /api/tickets/user/[userId]` - Get user tickets
- `DELETE /api/tickets/[id]` - Cancel ticket

### Admin
- `GET /api/events/pending` - Get pending events (admin only)
- `POST /api/create-admin` - Create admin user

## 🎨 Styling & Theming

### Tailwind CSS
The application uses Tailwind CSS with a custom configuration:
- **Primary Color**: Indigo (#6366f1)
- **Dark Mode**: Class-based dark mode support
- **Custom Colors**: `primary`, `darkbg`, `darkcard`, `darktext`
- **Responsive**: Mobile-first breakpoints

### Theme Toggle
- Light/Dark mode toggle in header
- Automatic theme persistence in localStorage
- Consistent theming across all components

## 📱 Pages & Routes

### Public Routes
- `/` - Home page with featured events
- `/login` - User login
- `/register` - User registration
- `/event/[id]` - Individual event details

### Protected Routes (Require Authentication)
- `/useraccount` - User profile & settings
- `/createEvent` - Create new event
- `/calendar` - Calendar view of events
- `/wallet` - User's tickets & bookings
- `/admin-dashboard` - Admin panel (admin only)

## 🔐 Authentication & Authorization

### User Roles
- **Regular User**: Can create events (pending approval), book tickets
- **Admin User**: Can approve events, manage users, see all data

### Security Features
- JWT-based authentication with HTTP-only cookies
- Password hashing with bcryptjs
- Protected API routes with middleware
- CSRF protection via SameSite cookies
- Input validation & sanitization

## 📊 Database Schema

### User Model
```typescript
interface IUser {
  _id: string;
  name: string;
  email: string; // unique
  password: string; // hashed
  isAdmin: boolean; // default: false
  createdAt: Date;
  updatedAt: Date;
}
```

### Event Model
```typescript
interface IEvent {
  _id: string;
  owner: string; // User ID
  title: string;
  description: string;
  date: Date;
  time: string;
  location: string;
  category: string;
  price: number;
  image: string; // file path
  host: string;
  isApproved: boolean; // default: false
  createdAt: Date;
  updatedAt: Date;
}
```

### Ticket Model
```typescript
interface ITicket {
  _id: string;
  userid: string;
  eventid: string;
  ticketDetails: {
    name: string;
    email: string;
    eventname: string;
    eventdate: Date;
    eventtime: string;
    ticketprice: number;
    qr?: string; // QR code path
  };
  count: number;
  createdAt: Date;
  updatedAt: Date;
}
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Environment Variables for Production
```bash
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
NEXTAUTH_SECRET=your_production_nextauth_secret
ADMIN_SECRET=your_production_admin_secret
```

## 🧪 Development

### Code Quality
```bash
# Linting
npm run lint

# Type checking
npx tsc --noEmit

# Formatting
npm run format
```

### Adding New Features
1. Create TypeScript interfaces in `/src/types/`
2. Add API routes in `/src/pages/api/`
3. Create React components in `/src/components/`
4. Add pages in `/src/pages/`
5. Update models if needed in `/src/models/`

## 📋 Migration Checklist

✅ **Completed Features:**
- [x] User authentication (register, login, logout)
- [x] Event CRUD operations with approval system
- [x] Ticket booking with QR code generation  
- [x] File upload for event images
- [x] Admin dashboard and user management
- [x] Responsive design with dark mode
- [x] Search and filtering
- [x] Notification system
- [x] MongoDB integration with TypeScript
- [x] All API endpoints migrated
- [x] Complete UI component migration
- [x] Static asset migration

## 🔍 QA Verification Steps

1. **Authentication Flow**
   - [ ] Register new user
   - [ ] Login with valid credentials
   - [ ] Access protected routes
   - [ ] Logout functionality

2. **Event Management**
   - [ ] Create new event (pending approval)
   - [ ] Admin approve event
   - [ ] Event appears in public listing
   - [ ] Delete event (owner/admin)

3. **Ticket Booking**
   - [ ] Book ticket for approved event
   - [ ] Receive QR code
   - [ ] View tickets in wallet
   - [ ] Prevent duplicate booking

4. **UI/UX**
   - [ ] Responsive design works on mobile
   - [ ] Dark mode toggle functions
   - [ ] Search functionality works
   - [ ] All pages load correctly

5. **Admin Features**
   - [ ] Admin can see pending events
   - [ ] Admin can approve/reject events
   - [ ] Admin can delete any event
   - [ ] Admin notifications work

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Developed by [coderved63](https://github.com/coderved63)**