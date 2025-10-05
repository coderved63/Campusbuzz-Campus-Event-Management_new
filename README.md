# 🎓 CampusBuzz - Campus Event Management System

A modern, full-stack event management platform built with **Next.js 14**, **TypeScript**, and **MongoDB**. CampusBuzz streamlines campus event organization with intuitive interfaces, secure authentication, and innovative features like dynamic QR code generation.

## ✨ Key Features

### 🎪 Event Management
- **Event Creation & Publishing**: Rich event creation with image uploads, categories, and detailed descriptions
- **Admin Approval System**: Secure event moderation workflow with admin dashboard
- **Event Discovery**: Browse events with advanced filtering by category, date, and location
- **Real-time Updates**: Live event status updates and notifications

### 🎫 Smart Ticketing System
- **Seamless Booking**: One-click ticket booking with duplicate prevention
- **Dynamic QR Codes**: Real-time QR code generation without file storage - codes are generated on-demand with embedded verification tokens
- **Ticket Verification**: Secure QR code scanning for event entry with HMAC-SHA256 verification
- **Digital Wallet**: Personal ticket management dashboard with all purchased tickets

### 🔐 Security & Authentication
- **JWT Authentication**: Secure user authentication with refresh token rotation
- **Role-based Access**: Admin and user role management with protected routes
- **Input Validation**: Comprehensive server-side and client-side validation

### 🎨 User Experience
- **Responsive Design**: Mobile-first design that works seamlessly across all devices
- **Dark Mode Support**: Toggle between light and dark themes
- **Real-time Notifications**: Instant updates for event approvals and announcements
- **Intuitive Navigation**: Clean, modern interface with smooth transitions

### 🔧 Technical Excellence
- **Type Safety**: Full TypeScript implementation with strict type checking
- **Performance Optimized**: Server-side rendering, image optimization, and efficient data fetching
- **Scalable Architecture**: Modular component structure and clean API design
- **Error Handling**: Comprehensive error management with user-friendly messages

## 🏗️ Architecture Overview

```
campusbuzz-next/
├── 📁 public/
│   ├── assets/              # Static images and icons
│   └── uploads/             # User-uploaded event images
├── 📁 src/
│   ├── 🧩 components/       # Reusable UI components
│   │   ├── EventCard.tsx    # Event display cards
│   │   ├── Header.tsx       # Navigation header
│   │   ├── Footer.tsx       # Site footer
│   │   └── QRCodeComponent.tsx # Dynamic QR code display
│   ├── 🔄 contexts/         # React Context providers
│   │   ├── UserContext.tsx  # Authentication & user state
│   │   ├── ThemeContext.tsx # Dark/light mode
│   │   └── NotificationContext.tsx # Real-time notifications
│   ├── 🛠️ lib/              # Core utilities
│   │   ├── mongodb.ts       # Database connection
│   │   ├── auth.ts          # JWT authentication
│   │   └── upload.ts        # File handling
│   ├── 📊 models/           # Database schemas
│   │   ├── User.ts          # User model
│   │   ├── Event.ts         # Event model
│   │   ├── Ticket.ts        # Ticket model
│   │   └── Category.ts      # Event categories
│   ├── 📄 pages/            # Next.js pages & API routes
│   │   ├── api/             # REST API endpoints
│   │   │   ├── auth/        # Authentication APIs
│   │   │   ├── events/      # Event management
│   │   │   ├── tickets/     # Ticket operations
│   │   │   └── qrcode/      # Dynamic QR generation
│   │   ├── admin/           # Admin dashboard
│   │   ├── event/           # Event pages
│   │   └── user/            # User profile pages
│   ├── 🎨 styles/           # Global styles
│   └── 📝 types/            # TypeScript definitions
```

## 🚀 Technology Stack

### Frontend
- **Next.js 14** - React framework with SSR and API routes
- **TypeScript** - Type-safe JavaScript with strict mode
- **Tailwind CSS** - Utility-first CSS framework
- **React Context API** - State management for user auth and theme
- **Axios** - HTTP client with interceptors for token management

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT Authentication** - Secure user authentication with refresh tokens
- **Multer** - File upload handling for event images
- **Bcrypt.js** - Password hashing and verification

### Key Libraries
- **QRCode (v1.5.3)** - Dynamic QR code generation for tickets
- **Heroicons** - Beautiful SVG icons for UI
- **Date-fns** - Modern date utility library
- **SWR** - Data fetching with caching and revalidation

## ⚡ Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account or local MongoDB instance

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/campusbuzz-next.git
cd campusbuzz-next

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your MongoDB URI and JWT secrets

# Run development server
npm run dev

# Open http://localhost:3000
```

### Environment Variables
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/campusbuzz
JWT_SECRET=your_super_secret_jwt_key_here
JWT_REFRESH_SECRET=your_refresh_token_secret_here
```

## 🎫 Dynamic QR Code System

CampusBuzz features an innovative **dynamic QR code system** that generates QR codes on-demand without storing files:

### Key Features
- **🔄 Real-time Generation**: QR codes are generated dynamically via API endpoints (`/api/qrcode/[ticketId]`)
- **🔒 Security Tokens**: Each QR code includes HMAC-SHA256 verification tokens to prevent tampering
- **💾 Zero File Storage**: No static QR code files - everything generated on-demand using the `qrcode` library
- **📱 Multiple Formats**: Support for SVG and Canvas rendering for optimal display across devices
- **✅ Verification System**: Secure ticket verification with embedded event and user data

### QR Code Data Structure
```json
{
  "ticketId": "unique_ticket_identifier",
  "eventId": "event_identifier",
  "eventName": "Event Title",
  "userName": "Attendee Name",
  "eventDate": "2025-10-05",
  "eventTime": "18:00",
  "eventLocation": "Campus Auditorium",
  "verificationToken": "secure_hash_token",
  "timestamp": "2025-10-05T10:30:00.000Z"
}
```

## 📚 API Reference

### Authentication Endpoints
```http
POST   /api/register        # User registration
POST   /api/login          # User login
POST   /api/logout         # User logout
POST   /api/refresh-token  # Token renewal
GET    /api/profile        # User profile
```

### Event Management
```http
GET    /api/events         # List approved events
POST   /api/events         # Create new event
GET    /api/events/[id]    # Get single event
PUT    /api/events/[id]    # Update event
DELETE /api/events/[id]    # Delete event
```

### Ticket Operations
```http
GET    /api/tickets        # List user tickets
POST   /api/book-ticket    # Book event ticket
GET    /api/qrcode/[id]    # Generate QR code
GET    /api/tickets/verify/[id] # Verify ticket
```

### Admin Operations
```http
GET    /api/admin/events/pending    # Pending events
POST   /api/admin/events/[id]/approve # Approve event
GET    /api/admin/users            # Manage users
GET    /api/admin/analytics        # System analytics
```

## 🎨 UI Components & Design

### Design System
- **Color Palette**: Modern indigo primary with dark mode support
- **Typography**: Clean, readable font hierarchy
- **Responsive Layout**: Mobile-first design with breakpoints at sm, md, lg, xl
- **Accessibility**: ARIA labels, keyboard navigation, color contrast compliance

### Key Components
- **EventCard** - Displays event information with booking status
- **QRCodeComponent** - Dynamic QR code display with loading states  
- **Header** - Navigation with user menu and theme toggle
- **Footer** - Site information and links
- **CategorySelector** - Event category filtering
- **NotificationProvider** - Real-time notification system

## 📊 Database Models

### Enhanced Ticket Model
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
    qr: string;        // Dynamic QR URL
    qrData: string;    // JSON string of QR data
  };
  user: ObjectId;      // Reference to User
  event: ObjectId;     // Reference to Event
  ticketType: string;  // e.g., "General", "VIP"
  quantity: number;    // Number of tickets
  verified: boolean;   // Verification status
  verifiedAt: Date;    // Verification timestamp
  createdAt: Date;
  updatedAt: Date;
}
```



## 🛠️ Development Workflow

### Code Quality Tools
```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Formatting with Prettier
npm run format

# Build production bundle
npm run build
```

### Testing
```bash
# Run tests (when implemented)
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 🔐 Security Features

- **JWT with Refresh Tokens** - Secure authentication with automatic token renewal
- **HTTP-Only Cookies** - Prevents XSS attacks on authentication tokens
- **CSRF Protection** - SameSite cookie policy and token validation
- **Input Validation** - Comprehensive server-side and client-side validation
- **Password Security** - Bcrypt hashing with salt rounds
- **Role-Based Access** - Admin and user permission levels
- **API Rate Limiting** - Prevents abuse of API endpoints


## 🤝 Contributing

### Getting Started
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript strict mode requirements
- Use Tailwind CSS for styling


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing React framework
- **MongoDB** - For the flexible NoSQL database
- **Tailwind CSS** - For the utility-first CSS framework
- **QRCode.js** - For dynamic QR code generation
- **Open Source Community** - For the incredible tools and libraries

---

**Built with ❤️ for campus communities worldwide**
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
