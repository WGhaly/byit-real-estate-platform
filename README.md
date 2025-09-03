# Byit Real Estate Admin Panel

A comprehensive real estate commission management platform designed for the Egyptian market.

## 🏗️ Architecture

- **Frontend**: Next.js 14 with TypeScript, TailwindCSS
- **Backend**: Node.js/Express with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with role-based access control
- **Real-time**: WebSocket for live updates

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your database credentials:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/byit_db"
   JWT_SECRET="your-super-secret-jwt-key"
   PORT=4000
   NODE_ENV=development
   ```

4. **Setup database:**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Seed with Egyptian market data:**
   ```bash
   npm run seed
   ```

6. **Start backend server:**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start frontend server:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   Open [http://localhost:3002](http://localhost:3002)

## 🔐 Demo Credentials

- **Super Admin**: `admin` / `admin123`
- **Manager**: `manager` / `manager123`
- **Senior User**: `senior` / `senior123`

## 📊 Features

### Admin Panel Features
- **Hierarchical Management**: Developers → Projects → Categories → Unit Types
- **Commission Engine**: Multi-tier commission calculation with inheritance
- **Real-time Updates**: Live notifications for deals and commission changes
- **Egyptian Market Focus**: EGP currency, Arabic UI support
- **Role-based Access**: 4-tier user hierarchy (Super Admin → Manager → Senior → Junior)

### Core Modules
1. **Developers Management**: Register and manage real estate developers
2. **Projects Management**: Hierarchical project structure with commission inheritance
3. **Brokers Management**: Team hierarchy with commission structures
4. **Deals Management**: Complete sales tracking with commission calculation
5. **Commission Engine**: Real-time commission calculation and approval workflow
6. **Analytics Dashboard**: Performance metrics and revenue tracking

### Commission System
- **Hierarchical Rates**: Developer → Project → Category → Unit Type
- **Automatic Calculation**: Real-time commission computation
- **Approval Workflow**: Multi-tier approval system
- **Egyptian Rates**: Realistic 7-8% developer rates, 4.8-5.5% broker rates

## 🏢 Seeded Egyptian Market Data

### Developers
- **TMG (Talaat Moustafa Group)**: Premium developer with Madinaty project
- **Emaar Misr**: Luxury developer with Uptown Cairo
- **SODIC**: High-end residential with Eastown
- **Palm Hills**: Compound specialist with Palm Hills October
- **Hassan Allam Properties**: Mixed-use developments

### Projects
- **Madinaty**: New Cairo integrated city (TMG)
- **Al Rehab City**: Premium residential compound (TMG)
- **Uptown Cairo**: Modern district (Emaar Misr)
- **Eastown**: Contemporary living (SODIC)

## 🛠️ Technology Stack

### Frontend Stack
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **TailwindCSS**: Utility-first CSS framework
- **Lucide React**: Modern icon library
- **React Query**: Server state management
- **React Hook Form**: Form management with validation
- **Axios**: HTTP client with interceptors

### Backend Stack
- **Express.js**: Web application framework
- **TypeScript**: Type-safe backend development
- **Prisma**: Modern database toolkit and ORM
- **JWT**: JSON Web Token authentication
- **bcryptjs**: Password hashing
- **Zod**: Schema validation
- **ws**: WebSocket library for real-time features

### Database Schema
- **15+ Models**: Comprehensive real estate data modeling
- **Hierarchical Structure**: Multi-level commission inheritance
- **Egyptian Market**: Localized for Egyptian real estate practices
- **Audit Trails**: Complete tracking of changes and activities

## 📁 Project Structure

```
Byit App 2/
├── backend/
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   ├── middleware/      # Authentication & logging
│   │   ├── types/           # TypeScript definitions
│   │   └── server.ts        # Express server setup
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── migrations/      # Database migrations
│   ├── seeds/               # Market data seeding
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js App Router
│   │   ├── components/      # React components
│   │   ├── lib/             # Utilities & API client
│   │   └── types/           # TypeScript definitions
│   ├── public/              # Static assets
│   └── package.json
└── README.md
```

## 🎨 Design System

### Brand Colors
- **Primary Navy**: `#23376f` (Byit brand color)
- **Secondary Orange**: `#db801d` (Byit accent color)
- **Gradient**: Navy to lighter blue for headers
- **Status Colors**: Green (success), Yellow (pending), Red (error)

### UI Components
- **Card System**: Consistent card layout for all modules
- **Hierarchical Display**: Expandable card system for project hierarchy
- **Arabic Support**: RTL text for Arabic content
- **Mobile Responsive**: Full mobile optimization

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Developers
- `GET /api/developers` - List all developers
- `POST /api/developers` - Create new developer
- `GET /api/developers/:id` - Get developer details
- `PUT /api/developers/:id` - Update developer
- `DELETE /api/developers/:id` - Delete developer

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project with hierarchy
- `PUT /api/projects/:id` - Update project

### Deals & Commissions
- `GET /api/deals` - List deals with filters
- `POST /api/deals` - Create new deal
- `GET /api/commissions` - List commissions
- `PUT /api/commissions/:id/approve` - Approve commission

## 🔧 Development Commands

### Backend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run seed         # Seed database with Egyptian data
npx prisma studio    # Open database browser
```

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 🚦 Deployment

### Backend Deployment
1. Set production environment variables
2. Run database migrations: `npx prisma migrate deploy`
3. Build: `npm run build`
4. Start: `npm start`

### Frontend Deployment
1. Build: `npm run build`
2. Deploy to Vercel/Netlify or serve statically

## 📈 Performance Features

- **Caching**: React Query for client-side caching
- **Pagination**: Efficient data loading for large datasets
- **WebSocket**: Real-time updates without polling
- **Code Splitting**: Optimized bundle loading
- **Database Indexing**: Optimized queries for performance

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Granular permission system
- **Password Hashing**: bcryptjs for secure password storage
- **CORS Configuration**: Secure cross-origin requests
- **Rate Limiting**: API rate limiting for security
- **Input Validation**: Zod schema validation

## 🌍 Localization

- **Arabic UI**: Arabic text for Egyptian market
- **EGP Currency**: Egyptian Pound formatting
- **Local Dates**: Arabic date formatting
- **RTL Support**: Right-to-left text direction
- **Cultural Adaptation**: Egyptian real estate practices

## 📝 License

This project is proprietary software for Byit Real Estate platform.

## 🤝 Support

For technical support or questions, please contact the development team.

---

**Built with ❤️ for the Egyptian Real Estate Market**
