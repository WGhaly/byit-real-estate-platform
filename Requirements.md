# Byit Real Estate Admin Panel - Complete Requirements Document

## 1. System Overview

**Purpose**: A comprehensive real estate commission management platform for the Egyptian market that enables efficient management of developers, projects, brokers, deals, and commission structures.

**Target Market**: Egyptian real estate market with AED/EGP currency support
**Users**: Super Admins, Operations Managers, Finance Managers, Brokers

## 2. Architecture & Technical Stack

### 2.1 Four-Layer Architecture
```
┌─────────────────────────────────────────┐
│           Presentation Layer            │
│  - Admin Panel (Next.js 15, Port 3002) │
│  - React Components & TailwindCSS       │
│  - Real-time Updates (WebSocket)        │
│  - Responsive Design & Mobile Support   │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│            Business Layer               │
│  - REST API (Node.js/Express, Port 4000)│
│  - Authentication & Authorization       │
│  - Business Logic & Validation          │
│  - Commission Calculation Engine        │
│  - WebSocket Service                    │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│            Data Access Layer            │
│  - Prisma ORM                          │
│  - Repository Pattern                   │
│  - Data Validation & Sanitization      │
│  - Caching Layer (Redis)               │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│            Data Storage Layer           │
│  - PostgreSQL Database                  │
│  - File Storage (Local/Cloud)          │
│  - Backup & Recovery                    │
│  - Data Encryption                     │
└─────────────────────────────────────────┘
```

### 2.2 Technology Stack
- **Frontend**: Next.js 15, React, TypeScript, TailwindCSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis
- **Authentication**: JWT with refresh tokens
- **Real-time**: WebSocket integration
- **File Handling**: Multer for uploads
- **Validation**: Zod schemas
- **Testing**: Jest, Playwright for E2E

## 3. Database Schema & Entities

### 3.1 Core Entities

#### Users & Authentication
```typescript
// Admin Users
AdminUser {
  id: string
  email: string (unique)
  password: string (hashed)
  firstName: string
  lastName: string
  role: AdminRole (SUPER_ADMIN, OPERATIONS_MANAGER, FINANCE_MANAGER)
  isActive: boolean
  mustChangePassword: boolean
  lastLogin: DateTime?
  phone: string?
  department: string?
  jobTitle: string?
  sessionTokens: string[]
  lastPasswordChange: DateTime
  createdAt: DateTime
  updatedAt: DateTime
  createdBy: string?
}

// Broker Users
BrokerUser {
  id: string
  email: string (unique)
  password: string (hashed)
  firstName: string
  lastName: string
  phone: string
  role: BrokerRole (LICENSED_BROKER, TRAINEE_BROKER)
  kycStatus: KYCStatus (PENDING, APPROVED, REJECTED)
  isActive: boolean
  licenseNumber: string?
  licenseExpiry: DateTime?
  brokerageCompany: string?
  experienceYears: int?
  totalDeals: int (default 0)
  totalCommissions: decimal (default 0)
  successRate: decimal?
  averageRating: decimal?
  lastLogin: DateTime?
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### Real Estate Entities
```typescript
// Developers
Developer {
  id: string
  name: string
  description: text?
  establishedYear: int?
  licenseNumber: string?
  website: string?
  email: string
  phone: string
  headquarters: string?
  operatingCities: string[]
  certifications: string[]?
  awards: string[]?
  logo: string?
  images: string[]?
  brochures: string[]?
  
  // Commission Settings
  defaultCommissionRate: decimal
  bonusCommissionRate: decimal?
  actualCommissionRate: decimal?
  brokerCommissionRate: decimal?
  platformMarginRate: decimal?
  
  // Contact Information
  salesContactName: string?
  salesContactPhone: string?
  salesContactEmail: string?
  backupContactPhone: string?
  contactNotes: text?
  
  isActive: boolean
  createdAt: DateTime
  updatedAt: DateTime
  createdBy: string?
  
  // Relations
  projects: Project[]
}

// Projects
Project {
  id: string
  name: string
  description: text?
  location: string
  address: string?
  coordinates: string? // lat,lng
  projectType: ProjectType (RESIDENTIAL, COMMERCIAL, MIXED_USE, VACATION_HOMES)
  
  // Unit Information
  totalUnits: int?
  availableUnits: int?
  soldUnits: int?
  priceRange: string? // "1M - 5M AED"
  paymentPlans: string[]?
  
  // Project Status & Timeline
  status: ProjectStatus (PLANNING, UNDER_CONSTRUCTION, READY, DELIVERED)
  launchDate: DateTime?
  completionDate: DateTime?
  handoverDate: DateTime?
  
  // Marketing Materials
  images: string[]?
  brochureUrl: string?
  virtualTourUrl: string?
  amenities: string[]?
  
  // Commission Structure
  commissionRate: decimal?
  bonusCommissionRate: decimal?
  actualCommissionRate: decimal?
  brokerCommissionRate: decimal?
  platformMarginRate: decimal?
  communicatedCommission: decimal?
  
  // Sales Contact
  salesContactName: string?
  salesContactPhone: string?
  salesContactEmail: string?
  
  createdAt: DateTime
  updatedAt: DateTime
  createdBy: string?
  developerId: string
  
  // Relations
  developer: Developer
  categories: ProjectCategory[]
  units: Unit[]
  deals: Deal[]
}

// Categories (Property Types)
Category {
  id: string
  name: string
  categoryType: CategoryType (UNIT_TYPE, PROPERTY_TYPE, AMENITY_TYPE)
  createdAt: DateTime
  updatedAt: DateTime
}

// Project Category Mapping with Commission Overrides
ProjectCategory {
  id: string
  projectId: string
  categoryId: string
  isEnabled: boolean
  actualCommissionRate: decimal?
  brokerCommissionRate: decimal?
  platformMarginRate: decimal?
  communicatedCommission: decimal?
  createdAt: DateTime
  updatedAt: DateTime
  createdBy: string?
  
  // Relations
  project: Project
  category: Category
  unitTypes: ProjectCategoryUnitType[]
}

// Unit Types
UnitType {
  id: string
  name: string (e.g., "Studio", "1BR", "2BR", "Penthouse")
  createdAt: DateTime
  updatedAt: DateTime
}

// Project Category Unit Type Mapping
ProjectCategoryUnitType {
  id: string
  projectId: string
  categoryId: string
  unitTypeId: string
  isEnabled: boolean
  actualCommissionRate: decimal?
  brokerCommissionRate: decimal?
  platformMarginRate: decimal?
  communicatedCommission: decimal?
  createdAt: DateTime
  updatedAt: DateTime
  createdBy: string?
  
  // Relations
  project: Project
  category: Category
  unitType: UnitType
}

// Units
Unit {
  id: string
  unitNumber: string
  floor: int?
  size: decimal? // sq ft/meters
  bedrooms: int?
  bathrooms: int?
  price: decimal
  currency: string (default "AED")
  status: UnitStatus (AVAILABLE, RESERVED, SOLD)
  features: string[]?
  images: string[]?
  floorPlan: string?
  
  projectId: string
  categoryId: string?
  unitTypeId: string?
  
  createdAt: DateTime
  updatedAt: DateTime
  
  // Relations
  project: Project
  category: Category?
  unitType: UnitType?
  deals: Deal[]
}
```

#### Deal & Commission Entities
```typescript
// Deals
Deal {
  id: string
  dealNumber: string (auto-generated, unique)
  
  // Participants
  brokerId: string
  projectId: string
  unitId: string?
  
  // Client Information
  clientName: string
  clientEmail: string?
  clientPhone: string
  clientNationality: string?
  clientType: ClientType (INDIVIDUAL, CORPORATE)
  
  // Deal Details
  dealValue: decimal
  commissionRate: decimal
  commissionAmount: decimal
  paymentMethod: PaymentMethod (CASH, MORTGAGE, INSTALLMENT)
  downPayment: decimal?
  
  // Status & Timeline
  status: DealStatus (DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, CANCELLED)
  submittedAt: DateTime?
  approvedAt: DateTime?
  rejectedAt: DateTime?
  approvedBy: string?
  rejectedBy: string?
  
  // Documentation
  documents: string[]? // file URLs
  brokerNotes: text?
  adminNotes: text?
  rejectionReason: text?
  specialTerms: text?
  
  // Deal Properties
  urgentDeal: boolean (default false)
  expectedClosingDate: DateTime?
  
  createdAt: DateTime
  updatedAt: DateTime
  
  // Commission Source
  commissionSource: string? // which commission structure was used
  unitDetailId: string? // link to specific unit detail
  
  // Relations
  broker: BrokerUser
  project: Project
  unit: Unit?
  commissions: Commission[]
}

// Commission Calculations
Commission {
  id: string
  dealId: string
  brokerId: string
  
  // Financial Details
  dealValue: decimal
  commissionRate: decimal
  grossCommission: decimal
  
  // Enhanced Commission Structure (Phase 3)
  actualCommissionRate: decimal?
  brokerCommissionRate: decimal?
  platformMarginRate: decimal?
  
  // Commission Breakdown
  developerCommissionAmount: decimal? // what developer pays
  brokerCommissionAmount: decimal? // what broker receives
  platformRevenue: decimal? // platform's share
  
  // Deductions
  platformFee: decimal?
  taxDeduction: decimal?
  otherDeductions: decimal?
  netCommission: decimal // final amount after deductions
  
  // Status & Processing
  status: CommissionStatus (CALCULATED, APPROVED, PAID, CANCELLED)
  calculatedAt: DateTime
  approvedAt: DateTime?
  paidAt: DateTime?
  
  // Developer Payment Tracking
  developerPaidAt: DateTime?
  developerPaymentReference: string?
  
  // Commission Source
  commissionSourceType: string? // PROJECT_LEVEL, CATEGORY_LEVEL, UNIT_TYPE_LEVEL
  
  // Processing Information
  processedBy: string?
  paymentMethod: string?
  paymentReference: string?
  paymentNotes: text?
  
  createdAt: DateTime
  updatedAt: DateTime
  
  // Relations
  deal: Deal
  broker: BrokerUser
}
```

### 3.2 Enumerations
```typescript
enum AdminRole {
  SUPER_ADMIN = "SUPER_ADMIN"
  OPERATIONS_MANAGER = "OPERATIONS_MANAGER"
  FINANCE_MANAGER = "FINANCE_MANAGER"
}

enum BrokerRole {
  LICENSED_BROKER = "LICENSED_BROKER"
  TRAINEE_BROKER = "TRAINEE_BROKER"
}

enum KYCStatus {
  PENDING = "PENDING"
  APPROVED = "APPROVED"
  REJECTED = "REJECTED"
}

enum ProjectType {
  RESIDENTIAL = "RESIDENTIAL"
  COMMERCIAL = "COMMERCIAL"
  MIXED_USE = "MIXED_USE"
  VACATION_HOMES = "VACATION_HOMES"
}

enum ProjectStatus {
  PLANNING = "PLANNING"
  UNDER_CONSTRUCTION = "UNDER_CONSTRUCTION"
  READY = "READY"
  DELIVERED = "DELIVERED"
}

enum CategoryType {
  UNIT_TYPE = "UNIT_TYPE"
  PROPERTY_TYPE = "PROPERTY_TYPE"
  AMENITY_TYPE = "AMENITY_TYPE"
}

enum UnitStatus {
  AVAILABLE = "AVAILABLE"
  RESERVED = "RESERVED"
  SOLD = "SOLD"
}

enum ClientType {
  INDIVIDUAL = "INDIVIDUAL"
  CORPORATE = "CORPORATE"
}

enum PaymentMethod {
  CASH = "CASH"
  MORTGAGE = "MORTGAGE"
  INSTALLMENT = "INSTALLMENT"
}

enum DealStatus {
  DRAFT = "DRAFT"
  SUBMITTED = "SUBMITTED"
  UNDER_REVIEW = "UNDER_REVIEW"
  APPROVED = "APPROVED"
  REJECTED = "REJECTED"
  CANCELLED = "CANCELLED"
}

enum CommissionStatus {
  CALCULATED = "CALCULATED"
  APPROVED = "APPROVED"
  PAID = "PAID"
  CANCELLED = "CANCELLED"
}
```

## 4. Admin Panel Pages & Features

### 4.1 Authentication & Access Control

#### Login Page (`/login`)
**Features:**
- Email/password authentication
- JWT token management
- Remember me functionality
- Password reset link
- Session timeout handling
- Multi-language support (EN/AR)

**UI/UX Requirements:**
- Clean, professional design
- Byit branding elements
- Responsive layout
- Form validation with real-time feedback
- Loading states and error handling
- Accessibility compliance (WCAG 2.1)

### 4.2 Dashboard & Navigation

#### Main Dashboard (`/dashboard`)
**Features:**
- Real-time statistics overview
- Quick action buttons
- Recent activity feed
- Performance metrics
- Alert notifications
- System health indicators

**Key Metrics:**
- Total deals (this month/quarter)
- Commission revenue
- Active brokers
- Project performance
- Deal conversion rates
- Top-performing brokers

**UI/UX Requirements:**
- Card-based layout with visual hierarchy
- Interactive charts and graphs
- Color-coded status indicators
- Responsive grid system
- Dark/light mode support
- Export capabilities

#### Navigation Structure
```
├── Dashboard
├── Projects
│   ├── All Projects
│   ├── Add New Project
│   └── Project Details
├── Developers
│   ├── All Developers
│   ├── Add New Developer
│   └── Developer Profile
├── Brokers
│   ├── All Brokers
│   ├── Broker Applications
│   ├── KYC Management
│   └── Broker Performance
├── Deals
│   ├── All Deals
│   ├── Deal Approval Queue
│   ├── Deal Analytics
│   └── Commission Tracking
├── Categories
│   ├── Unit Types
│   ├── Property Types
│   └── Amenities
├── Financials
│   ├── Commission Reports
│   ├── Payment Tracking
│   ├── Revenue Analytics
│   └── Payout Management
├── Reports & Analytics
│   ├── Performance Reports
│   ├── Financial Reports
│   └── Custom Reports
├── System Settings
│   ├── User Management
│   ├── Role Permissions
│   ├── System Configuration
│   └── Audit Logs
└── Support
    ├── Help Documentation
    ├── Contact Support
    └── System Status
```

### 4.3 Project Management

#### Projects Listing Page (`/projects`)
**Features:**
- Comprehensive project table with sorting/filtering
- Search by name, location, developer
- Filter by status, type, commission rate
- Bulk operations (activate/deactivate)
- Export to Excel/PDF
- Pagination with customizable page sizes

**Table Columns:**
- Project name with thumbnail
- Developer name
- Location
- Project type
- Status badge
- Total units / Available units
- Commission rate
- Launch date
- Actions (View, Edit, Commission Setup)

**UI/UX Requirements:**
- Advanced filtering sidebar
- Column customization options
- Responsive table with mobile view
- Quick preview modal
- Bulk selection capabilities
- Real-time status updates

#### Project Details Page (`/projects/{id}`)
**Features:**
- Complete project information display
- Image gallery with zoom functionality
- Commission structure configuration
- Unit management interface
- Deal history and performance
- Marketing materials management

**Sections:**
1. **Basic Information**
   - Project details form
   - Image upload and management
   - Location mapping
   - Contact information

2. **Commission Setup**
   - Multi-level commission configuration
   - Category-specific rates
   - Unit type overrides
   - Bulk commission updates

3. **Units Management**
   - Unit grid/list view
   - Bulk unit operations
   - Availability tracking
   - Price management

4. **Performance Analytics**
   - Sales metrics
   - Deal conversion rates
   - Revenue tracking
   - Broker performance

#### Add/Edit Project Page (`/projects/new`, `/projects/{id}/edit`)
**Features:**
- Multi-step form wizard
- Real-time validation
- Auto-save functionality
- Image upload with preview
- Commission calculator
- Integration with mapping services

**Form Steps:**
1. Basic Information
2. Location & Contact Details
3. Units & Pricing
4. Commission Structure
5. Marketing Materials
6. Review & Submit

### 4.4 Developer Management

#### Developers Listing Page (`/developers`)
**Features:**
- Developer directory with search
- Performance metrics display
- Contact management
- Commission rate overview
- Project portfolio view
- Export capabilities

#### Developer Profile Page (`/developers/{id}`)
**Features:**
- Complete developer information
- Project portfolio
- Performance analytics
- Commission settings
- Contact history
- Document management

### 4.5 Broker Management

#### Brokers Listing Page (`/brokers`)
**Features:**
- Broker directory with advanced filtering
- KYC status tracking
- Performance metrics
- License management
- Communication tools
- Bulk operations

**Statistics Panel:**
- Total brokers
- Active/inactive counts
- KYC approval rates
- Performance distributions
- Commission earnings

#### Broker Profile Page (`/brokers/{id}`)
**Features:**
- Complete broker profile
- Deal history
- Commission tracking
- Performance analytics
- KYC document review
- Communication log

#### KYC Management Page (`/brokers/kyc`)
**Features:**
- Document review interface
- Approval workflow
- Rejection reasons tracking
- Bulk processing
- Status notifications
- Audit trail

### 4.6 Deal Management

#### Deals Listing Page (`/deals`)
**Features:**
- Comprehensive deal tracking
- Status-based filtering
- Approval queue management
- Bulk operations
- Export capabilities
- Real-time updates

**Advanced Filtering:**
- Deal status
- Date ranges
- Broker selection
- Project selection
- Commission ranges
- Payment methods

#### Deal Details Page (`/deals/{id}`)
**Features:**
- Complete deal information
- Document management
- Approval workflow
- Commission calculation
- Communication log
- Status history

#### Deal Approval Interface
**Features:**
- Quick approval/rejection actions
- Bulk processing capabilities
- Validation checklist
- Comments and notes
- Notification system
- Escalation workflows

### 4.7 Financial Management

#### Financials Dashboard (`/financials`)
**Features:**
- Revenue overview
- Commission tracking
- Payment status monitoring
- Financial analytics
- Export capabilities
- Real-time updates

**Key Sections:**
1. **Commission Overview**
   - Total commissions
   - Paid/pending amounts
   - Monthly trends
   - Top earning brokers

2. **Payment Tracking**
   - Payment queue
   - Processing status
   - Payment methods
   - Transaction history

3. **Revenue Analytics**
   - Revenue by project
   - Revenue by developer
   - Monthly/quarterly reports
   - Profit margin analysis

#### Commission Management Page (`/financials/commissions`)
**Features:**
- Commission calculation engine
- Payment processing interface
- Dispute resolution
- Audit trail
- Bulk operations
- Integration with payment systems

**Commission Calculation:**
- Multi-tier commission structure
- Automatic calculations
- Manual override capabilities
- Approval workflows
- Payment scheduling
- Tax calculations

#### Payout Management Page (`/financials/payouts`)
**Features:**
- Payment queue management
- Batch payment processing
- Payment method configuration
- Transaction tracking
- Reconciliation tools
- Report generation

### 4.8 Categories Management

#### Categories Page (`/categories`)
**Features:**
- Category hierarchy management
- Unit type configuration
- Property type definitions
- Amenity management
- Bulk operations
- Commission overrides

**Category Types:**
- Unit Types (Studio, 1BR, 2BR, etc.)
- Property Types (Apartment, Villa, etc.)
- Amenities (Pool, Gym, etc.)

### 4.9 Reports & Analytics

#### Analytics Dashboard (`/analytics`)
**Features:**
- Performance dashboards
- Custom report builder
- Data visualization
- Export capabilities
- Scheduled reports
- Real-time updates

**Report Types:**
- Sales performance
- Broker performance
- Commission reports
- Financial reports
- Project analytics
- Market insights

#### Custom Reports Page (`/reports/custom`)
**Features:**
- Report builder interface
- Data source selection
- Filter configuration
- Visualization options
- Scheduling capabilities
- Sharing and distribution

### 4.10 System Administration

#### User Management Page (`/admin/users`)
**Features:**
- Admin user management
- Role assignment
- Permission configuration
- Access control
- Activity monitoring
- Bulk operations

#### System Settings Page (`/admin/settings`)
**Features:**
- Global configuration
- Email templates
- Notification settings
- Integration configuration
- Security settings
- Backup management

#### Audit Logs Page (`/admin/audit`)
**Features:**
- Complete audit trail
- User activity tracking
- System event logging
- Search and filtering
- Export capabilities
- Compliance reporting

## 5. Commission Engine Requirements

### 5.1 Multi-Level Commission Structure

#### Hierarchy Levels:
1. **Platform Level** - Default system rates
2. **Developer Level** - Developer-specific rates
3. **Project Level** - Project-specific overrides
4. **Category Level** - Property type specific rates
5. **Unit Type Level** - Most granular level

#### Commission Types:
- **Actual Commission Rate** - What developer pays
- **Broker Commission Rate** - What broker receives
- **Platform Margin Rate** - Platform's share
- **Communicated Commission** - Rate shown to brokers

### 5.2 Calculation Engine Features

#### Automatic Calculations:
- Real-time commission computation
- Multi-currency support (AED/EGP)
- Tax calculations
- Deduction management
- Net commission calculation

#### Override Capabilities:
- Manual rate adjustments
- Special deal commissions
- Promotional rates
- Bonus calculations
- Penalty deductions

#### Gross Profit Analysis:
- Revenue breakdown
- Cost analysis
- Profit margin calculations
- Performance metrics
- ROI tracking

### 5.3 Payment Processing

#### Payment Workflows:
- Automatic payment scheduling
- Approval workflows
- Multi-method payments
- Batch processing
- Reconciliation tools

#### Integration Requirements:
- Banking API integration
- Payment gateway support
- Currency conversion
- Transaction tracking
- Compliance monitoring

## 6. UI/UX Design System

### 6.1 Design Principles

#### Visual Hierarchy:
- Clear information architecture
- Consistent spacing system
- Typography scale
- Color psychology
- Visual emphasis

#### User Experience:
- Intuitive navigation
- Minimal cognitive load
- Progressive disclosure
- Error prevention
- Accessibility first

#### Brand Color Scheme:
- **Primary Color**: #23376f (Navy Blue) - Used for headers, navigation, primary buttons
- **Accent Color**: #db801d (Orange) - Used for CTAs, highlights, active states
- **Background Color**: #ffffff (White) - Used for all page backgrounds and card backgrounds
- **Text Color**: #000000 (Black) - Used for all text content on white backgrounds
- **Color Usage Guidelines**:
  - Primary color for navigation bars, main headers, and primary action buttons
  - Accent color for secondary buttons, links, badges, and interactive elements
  - White backgrounds for maximum readability and clean aesthetic
  - Black text for optimal contrast and accessibility compliance

### 6.2 Component Library

#### Layout Components:
- Grid system
- Card layouts
- Modal dialogs
- Sidebar navigation
- Header components

#### Form Components:
- Input fields with validation
- Select dropdowns
- Date pickers
- File uploaders
- Multi-step wizards

#### Data Display:
- Tables with sorting/filtering
- Charts and graphs
- Statistics cards
- Progress indicators
- Status badges

#### Interactive Elements:
- Buttons and CTAs
- Loading states
- Tooltips and hints
- Notification toasts
- Confirmation dialogs

### 6.3 Responsive Design

#### Breakpoints:
- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px - 1439px
- Large Desktop: 1440px+

#### Mobile Optimizations:
- Touch-friendly interfaces
- Simplified navigation
- Condensed layouts
- Swipe gestures
- Performance optimization

### 6.4 Accessibility Standards

#### WCAG 2.1 Compliance:
- Keyboard navigation
- Screen reader support
- Color contrast ratios
- Alt text for images
- ARIA labels

#### Internationalization:
- RTL language support
- Multi-language content
- Cultural adaptations
- Local formatting
- Currency localization

## 7. Real-time Features & WebSocket Integration

### 7.1 Real-time Updates

#### Live Data Synchronization:
- Deal status changes
- Commission calculations
- User activities
- System notifications
- Performance metrics

#### Collaborative Features:
- Multi-user editing
- Live cursors
- Conflict resolution
- Auto-save functionality
- Version control

### 7.2 Notification System

#### Notification Types:
- Deal approvals/rejections
- Commission payments
- System alerts
- User activities
- Performance milestones

#### Delivery Channels:
- In-app notifications
- Email notifications
- SMS alerts
- Push notifications
- WebSocket updates

## 8. Security & Compliance

### 8.1 Authentication & Authorization

#### Security Measures:
- JWT with refresh tokens
- Multi-factor authentication
- Password policies
- Session management
- Rate limiting

#### Role-Based Access:
- Granular permissions
- Resource-level access
- Action-based authorization
- Audit logging
- Compliance tracking

### 8.2 Data Protection

#### Security Features:
- Data encryption
- Secure file uploads
- Input validation
- SQL injection prevention
- XSS protection

#### Compliance Standards:
- GDPR compliance
- Financial regulations
- Audit requirements
- Data retention policies
- Privacy protection

## 9. Performance & Scalability

### 9.1 Performance Optimization

#### Frontend Optimization:
- Code splitting
- Lazy loading
- Image optimization
- Caching strategies
- Bundle optimization

#### Backend Optimization:
- Database indexing
- Query optimization
- Caching layers
- Connection pooling
- Load balancing

### 9.2 Scalability Planning

#### Infrastructure:
- Horizontal scaling
- Database sharding
- CDN integration
- Microservices architecture
- Container orchestration

#### Monitoring:
- Performance metrics
- Error tracking
- User analytics
- System health
- Alert systems

## 10. Testing Strategy

### 10.1 Testing Levels

#### Unit Testing:
- Component testing
- Business logic testing
- Utility function testing
- API endpoint testing
- Database operation testing

#### Integration Testing:
- API integration tests
- Database integration
- Third-party service integration
- WebSocket testing
- Authentication flows

#### End-to-End Testing:
- User journey testing
- Cross-browser testing
- Mobile device testing
- Performance testing
- Security testing

### 10.2 Quality Assurance

#### Code Quality:
- Code reviews
- Static analysis
- Type checking
- Linting rules
- Documentation standards

#### Testing Automation:
- Automated test suites
- Continuous integration
- Deployment testing
- Regression testing
- Performance monitoring

## 11. Deployment & DevOps

### 11.1 Environment Management

#### Environment Stages:
- Development environment
- Staging environment
- Production environment
- Testing environment
- Demo environment

#### Configuration Management:
- Environment variables
- Secret management
- Feature flags
- Database migrations
- Rollback procedures

### 11.2 Monitoring & Maintenance

#### System Monitoring:
- Application performance
- Database performance
- Error tracking
- User behavior
- Security monitoring

#### Maintenance Procedures:
- Regular backups
- Security updates
- Performance optimization
- Database maintenance
- Documentation updates

## 12. Success Metrics & KPIs

### 12.1 Business Metrics

#### Platform Performance:
- Deal processing time
- Commission accuracy
- User satisfaction
- System uptime
- Error rates

#### Financial Metrics:
- Revenue growth
- Commission processing efficiency
- Cost per transaction
- ROI measurement
- Profit margins

### 12.2 Technical Metrics

#### Performance Indicators:
- Page load times
- API response times
- Database query performance
- Error rates
- User engagement

#### Quality Metrics:
- Code coverage
- Bug detection rate
- Security vulnerabilities
- Accessibility compliance
- User experience scores

## 13. Future Enhancements

### 13.1 Planned Features

#### Phase 2 Enhancements:
- Mobile application
- Advanced analytics
- AI-powered insights
- Integration APIs
- White-label solutions

#### Phase 3 Innovations:
- Machine learning algorithms
- Predictive analytics
- Blockchain integration
- IoT device support
- AR/VR experiences

### 13.2 Roadmap Planning

#### Short-term Goals (3-6 months):
- Core functionality completion
- User acceptance testing
- Performance optimization
- Security hardening
- Documentation finalization

#### Medium-term Goals (6-12 months):
- Feature enhancements
- Mobile app development
- API ecosystem
- Third-party integrations
- Market expansion

#### Long-term Vision (1+ years):
- Platform evolution
- Technology modernization
- Global expansion
- Industry leadership
- Innovation initiatives

## 14. Application Context and Business Model

### 14.1 Business Overview
Byit operates as an intermediary platform in the Egyptian real estate market, connecting property developers with real estate brokers. We facilitate deal closures by managing the entire transaction process and commission distribution.

### 14.2 Core Business Model
- **Intermediary Role**: We serve as the bridge between developers and brokers
- **Deal Management**: We handle the complete deal lifecycle from lead to closure
- **Commission Management**: We manage complex commission structures and distributions
- **Market Focus**: All operations are focused on the Egyptian real estate market
- **Currency**: All financial transactions and data are in EGP (Egyptian Pounds)
- **Language**: All user interfaces and communications are in English

### 14.3 Commission Structure
The platform operates on a three-tier commission model:

1. **Actual Commission**: The commission we receive from the developer
2. **Communicated Commission**: The commission we communicate to brokers (what we tell them we're getting)
3. **Broker Commission**: The commission the broker receives from our communicated commission

**Gross Profit Calculation**: `Actual Commission - (Communicated Commission - Broker Commission)`

### 14.4 Value Proposition
- Streamlined deal management for brokers
- Consistent commission payments upon deal closure
- Access to multiple developer projects through a single platform
- Transparent commission structures and real-time tracking

## 15. Enhanced Developer Management

### 15.1 Developer Card Expansion System
The developer page must implement a hierarchical card expansion system:

#### 15.1.1 Primary Developer Card
- **Basic Information Display**: Developer name, logo, contact info, total projects
- **Expand Button**: Clear visual indicator to expand for project details
- **Commission Overview**: Summary of default commission rates

#### 15.1.2 Project Cards (Nested Level 1)
When developer card is expanded:
- **Project List**: All projects under the developer displayed as cards
- **Project Summary**: Name, location, status, unit count
- **Expand Button**: Each project card expandable to show categories
- **Enable/Disable Toggle**: Master toggle for entire project

#### 15.1.3 Category Cards (Nested Level 2)
When project card is expanded:
- **Category Display**: All categories (Apartments, Villas, Commercial, etc.)
- **Category Toggle**: Enable/disable entire category
- **Unit Count**: Number of unit types in each category
- **Commission Inheritance**: Visual indication of inherited vs. custom rates
- **Expand Button**: Each category expandable to show unit types

#### 15.1.4 Unit Type Cards (Nested Level 3)
When category card is expanded:
- **Unit Type List**: All unit types (Studio, 1BR, 2BR, etc.)
- **Individual Toggles**: Enable/disable specific unit types
- **Commission Display**: Inherited or custom commission rates
- **Price Information**: Current pricing for unit type

### 15.2 Hierarchical Enable/Disable Logic
```
Developer
├── Project 1 [Toggle: Enable/Disable]
│   ├── Category A [Toggle: Enable/Disable]
│   │   ├── Unit Type 1 [Toggle: Enable/Disable]
│   │   ├── Unit Type 2 [Toggle: Enable/Disable]
│   │   └── Unit Type 3 [Toggle: Enable/Disable]
│   └── Category B [Toggle: Enable/Disable]
│       ├── Unit Type 4 [Toggle: Enable/Disable]
│       └── Unit Type 5 [Toggle: Enable/Disable]
└── Project 2 [Toggle: Enable/Disable]
    └── [Similar nested structure...]
```

#### Business Rules:
- **Category Dependency**: Unit types cannot be enabled if parent category is disabled
- **Project Dependency**: Categories cannot be enabled if parent project is disabled
- **Cascade Disable**: Disabling a category automatically disables all unit types within it
- **Independent Enable**: Enabling a category does not automatically enable unit types (manual selection required)

### 15.3 Commission Inheritance and Override System

#### 15.3.1 Inheritance Hierarchy
1. **Developer Level**: Base commission rates set at developer level
2. **Project Override**: Projects can override developer-level rates
3. **Category Override**: Categories can override project-level rates
4. **Unit Type Override**: Individual unit types can override category-level rates

#### 15.3.2 Visual Inheritance Indicators
- **Inherited Values**: Display with subtle gray text and inheritance icon
- **Overridden Values**: Display with bold text and override badge
- **Edit Capability**: Click to edit with inline editing interface
- **Reset Option**: Button to reset to inherited value

#### 15.3.3 Commission Types (All Editable)
- **Actual Commission**: Our commission from developer (percentage or fixed EGP)
- **Communicated Commission**: Rate communicated to brokers
- **Broker Commission**: Broker's cut from communicated commission

## 16. Enhanced Project Management

### 16.1 Project Creation Flow

#### 16.1.1 Developer Association
- **Mandatory Selection**: Projects must be created under specific developer
- **Developer Context**: Auto-inherit developer's default settings
- **Override Capability**: Option to customize project-specific settings

#### 16.1.2 Category and Unit Type Management
- **Category Creation**: Ability to create custom categories for project
- **Standard Categories**: Pre-defined categories (Apartments, Villas, Commercial)
- **Unit Type Assignment**: Assign unit types to categories
- **Bulk Operations**: Create multiple categories/unit types simultaneously

### 16.2 Project Card Detailed Configuration

#### 16.2.1 Editable Financial Fields (Click-to-Edit Interface)
Each financial field must implement the following UX pattern:

**Price Configuration:**
- **Unit Price**: Base price in EGP (click number to edit)
- **Price per SQM**: Calculated automatically based on unit size
- **Payment Plans**: Multiple payment structure options

**Commission Configuration (Three-Tier System):**
- **Actual Commission**: Our commission from developer
  - Type: Percentage or Fixed EGP amount
  - Visual: Click to edit, save button appears
  - Inheritance: Shows if inherited from category/developer
- **Communicated Commission**: Commission we tell brokers
  - Type: Percentage or Fixed EGP amount  
  - Validation: Cannot exceed actual commission
  - Auto-calculation: Updates gross profit in real-time
- **Broker Commission**: Broker's cut from communicated commission
  - Type: Percentage of communicated commission
  - Validation: Cannot exceed 100% of communicated commission
  - Real-time: Updates net broker payout automatically

#### 16.2.2 Timeline and Delivery Configuration
- **Delivery Date**: Project completion timeline (date picker)
- **Construction Phases**: Multiple delivery phases if applicable
- **Status Tracking**: Current construction status

#### 16.2.3 Payment Structure Configuration
**Installment Calculator with Real-time Updates:**

```
Installment Configuration:
┌─────────────────────────────────────┐
│ Total Price: 2,500,000 EGP          │
│ Down Payment: 500,000 EGP (20%)     │
│ Remaining: 2,000,000 EGP            │
│                                     │
│ Payment Plan:                       │
│ ┌─ Number of Years: [5] ←→ Auto Calc│
│ └─ Monthly Installment: [33,333] ←→ │
│                                     │
│ Interest Rate: 8% annually          │
│ Total Interest: 400,000 EGP         │
└─────────────────────────────────────┘
```

**Auto-calculation Logic:**
- **Input Years → Calculate Monthly**: `(Remaining Amount + Interest) / (Years × 12)`
- **Input Monthly → Calculate Years**: `(Remaining Amount + Interest) / Monthly Amount / 12`
- **Real-time Updates**: Both fields update instantly when either is changed
- **Interest Calculation**: Applied based on payment term
- **Down Payment**: Configurable percentage or fixed amount

#### 16.2.4 UX/UI Patterns for Editing

**Click-to-Edit Implementation:**
1. **Display Mode**: Show value with subtle edit indicator (pencil icon on hover)
2. **Edit Mode**: Click transforms field to input with:
   - Focus on input field
   - Save button (checkmark)
   - Cancel button (X)
   - Validation indicators
3. **Save Confirmation**: Green checkmark animation on successful save
4. **Error Handling**: Red border and error message for invalid inputs
5. **Auto-save**: Optional auto-save after 2 seconds of inactivity

**Validation Rules:**
- **Positive Values**: All financial values must be positive
- **Realistic Ranges**: Price validation against market standards
- **Commission Logic**: Broker commission ≤ Communicated commission ≤ Actual commission
- **Currency Format**: Automatic EGP formatting with commas

## 17. Enhanced Financial Reporting and Gross Profit Calculation

### 17.1 Gross Profit Calculation Engine

#### 17.1.1 Correct Formula Implementation
```javascript
// Correct Gross Profit Calculation
grossProfit = actualCommission - (communicatedCommission - brokerCommission)

// Example:
// Actual Commission: 100,000 EGP (what developer pays us)
// Communicated Commission: 80,000 EGP (what we tell broker we get)
// Broker Commission: 60,000 EGP (what broker receives)
// Gross Profit = 100,000 - (80,000 - 60,000) = 100,000 - 20,000 = 80,000 EGP
```

#### 17.1.2 Real-time Profit Display
- **Live Calculation**: Updates automatically when any commission value changes
- **Profit Margin**: Display as percentage of actual commission
- **Visual Indicators**: Color-coded profit margins (red/yellow/green)
- **Breakdown View**: Detailed view showing calculation steps

### 17.2 Financial Dashboard Enhancements

#### 17.2.1 Commission Flow Visualization
```
Developer Pays Us → [Actual Commission: 100,000 EGP]
                           ↓
We Tell Broker → [Communicated Commission: 80,000 EGP]
                           ↓
Broker Receives → [Broker Commission: 60,000 EGP]
                           ↓
Our Gross Profit → [80,000 EGP]
```

#### 17.2.2 Financial Metrics Dashboard
- **Total Gross Profit**: Sum of all deals' gross profits
- **Average Profit Margin**: Average percentage across all deals
- **Commission Efficiency**: Ratio of gross profit to actual commission
- **Broker Payout Ratio**: Percentage of communicated commission paid to brokers

## 18. Database Seeding Requirements for Egyptian Market

### 18.1 Comprehensive Egyptian Real Estate Data

#### 18.1.1 Major Egyptian Developers
**Tier 1 Developers:**
- Talaat Moustafa Group (TMG)
- Emaar Misr
- Sodic
- Palm Hills Developments
- Hassan Allam Properties
- Capital Group Properties
- Orascom Development
- Mountain View

**Sample Developer Data:**
```json
{
  "name": "Talaat Moustafa Group",
  "logo": "tmg_logo.png",
  "establishedYear": 1954,
  "headquarters": "New Cairo, Egypt",
  "phone": "+20 2 26140200",
  "email": "info@tmg.com.eg",
  "website": "https://www.tmg.com.eg",
  "defaultCommissions": {
    "actual": 7.5,
    "communicated": 6.0,
    "broker": 4.5
  }
}
```

#### 18.1.2 Egyptian Real Estate Projects
**New Administrative Capital Projects:**
- Capital Business Park
- Downtown New Capital
- Green River
- Compound R7
- IL Bosco City

**New Cairo Projects:**
- Madinaty
- Katameya Heights
- Fifth Settlement projects
- Stone Residence
- Galleria Moon Valley

**North Coast Projects:**
- Hacienda Bay
- Marina
- Amwaj North Coast
- Marassi
- Zoya North Coast

**Sample Project Data:**
```json
{
  "name": "Madinaty",
  "developer": "Talaat Moustafa Group",
  "location": "New Cairo, Egypt",
  "area": "8,000 acres",
  "launchDate": "2006-03-15",
  "deliveryDate": "2025-12-31",
  "totalUnits": 120000,
  "status": "Under Construction",
  "priceRange": {
    "min": 1500000,
    "max": 15000000,
    "currency": "EGP"
  }
}
```

#### 18.1.3 Egyptian Property Categories and Unit Types

**Residential Categories:**
1. **Apartments**
   - Studio: 35-50 SQM, Price: 800,000 - 1,200,000 EGP
   - 1 Bedroom: 60-80 SQM, Price: 1,200,000 - 2,000,000 EGP
   - 2 Bedroom: 100-130 SQM, Price: 2,000,000 - 3,500,000 EGP
   - 3 Bedroom: 150-200 SQM, Price: 3,500,000 - 6,000,000 EGP
   - Penthouse: 300-500 SQM, Price: 8,000,000 - 20,000,000 EGP

2. **Villas**
   - Townhouse: 200-300 SQM, Price: 4,000,000 - 8,000,000 EGP
   - Twin House: 300-400 SQM, Price: 6,000,000 - 12,000,000 EGP
   - Standalone Villa: 400-800 SQM, Price: 10,000,000 - 30,000,000 EGP

3. **Commercial Units**
   - Shop: 30-100 SQM, Price: 1,500,000 - 5,000,000 EGP
   - Office: 50-200 SQM, Price: 2,000,000 - 8,000,000 EGP
   - Clinic: 40-120 SQM, Price: 1,800,000 - 6,000,000 EGP

#### 18.1.4 Egyptian Commission Structures
**Industry Standard Rates:**
- **Luxury Projects**: 8-12% actual commission
- **Mid-range Projects**: 5-8% actual commission
- **Affordable Housing**: 3-5% actual commission
- **Commercial Properties**: 4-6% actual commission

**Sample Commission Data:**
```json
{
  "actualCommission": 7.5,
  "communicatedCommission": 6.0,
  "brokerCommission": 4.5,
  "grossProfitMargin": 25.0,
  "currency": "EGP"
}
```

### 18.2 Comprehensive Seeding Script Requirements

#### 18.2.1 Database Population Script
```bash
# Command to run seeding
npm run seed:egyptian-data

# Or for development
npm run seed:dev
```

#### 18.2.2 Seeding Data Structure
**Minimum Required Data:**
- 20+ Egyptian developers
- 100+ real estate projects across Egypt
- 1000+ unit configurations
- Realistic commission structures
- Egyptian phone numbers (+20 format)
- Egyptian addresses and locations
- Current market pricing in EGP

#### 18.2.3 Data Relationships Validation
- Ensure proper foreign key relationships
- Validate commission inheritance hierarchy
- Test enable/disable cascading logic
- Verify gross profit calculations
- Confirm EGP currency formatting

#### 18.2.4 Seeding Script Features
- **Incremental Seeding**: Add data without duplicates
- **Reset Capability**: Clear and reseed entire database
- **Environment Specific**: Different data volumes for dev/staging/production
- **Validation Checks**: Ensure data integrity after seeding
- **Progress Indicators**: Show seeding progress and completion status

## 19. Enhanced CRUD Operations for Project Hierarchy

### 19.1 Developer Management CRUD

#### 19.1.1 Create Developer
- **Form Fields**: Name, logo, contact information, default commission rates
- **Validation**: Unique name, valid contact details, commission range validation
- **Auto-generation**: Developer ID, creation timestamp, default settings

#### 19.1.2 Developer Project Association
- **Project Creation**: Must select parent developer
- **Project Transfer**: Ability to move projects between developers
- **Bulk Operations**: Create multiple projects under developer

### 19.2 Project Management CRUD

#### 19.2.1 Create Project Under Developer
**Required Fields:**
- Project name (unique within developer)
- Location (Egyptian locations dropdown)
- Project type (Residential/Commercial/Mixed)
- Launch date and expected delivery
- Base pricing structure

#### 19.2.2 Category Management Within Project
**Category CRUD Operations:**
- **Create**: Add new category to project
- **Edit**: Modify category details and commission overrides
- **Delete**: Remove category and reassign unit types
- **Enable/Disable**: Toggle category availability

#### 19.2.3 Unit Type Management Within Category
**Unit Type CRUD Operations:**
- **Create**: Add new unit type to category
- **Edit**: Modify unit specifications and pricing
- **Delete**: Remove unit type (with deal dependency check)
- **Enable/Disable**: Toggle unit type availability
- **Bulk Edit**: Modify multiple unit types simultaneously

### 19.3 Hierarchical Data Integrity

#### 19.3.1 Deletion Rules
- **Developer Deletion**: Only if no active projects
- **Project Deletion**: Only if no active deals
- **Category Deletion**: Reassign unit types or cascade delete
- **Unit Type Deletion**: Check for existing bookings/deals

#### 19.3.2 Status Inheritance
- **Disabled Developer**: All projects become unavailable
- **Disabled Project**: All categories and unit types become unavailable  
- **Disabled Category**: All unit types within category become unavailable
- **Independent Unit Types**: Can be disabled while category remains enabled

---

This comprehensive requirements document serves as the foundation for building a world-class real estate commission management platform specifically designed for the Egyptian market. It encompasses the complete business model, technical specifications, enhanced UI/UX requirements, and detailed implementation guidelines to ensure the platform meets all stakeholder needs while maintaining scalability for future growth and expansion.
