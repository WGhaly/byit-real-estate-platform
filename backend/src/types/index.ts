// Type definitions for Byit Real Estate Admin Panel Backend

export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  MANAGER = "MANAGER", 
  SENIOR_USER = "SENIOR_USER",
  JUNIOR_USER = "JUNIOR_USER"
}

export enum AdminRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  OPERATIONS_MANAGER = "OPERATIONS_MANAGER", 
  FINANCE_MANAGER = "FINANCE_MANAGER"
}

export enum BrokerRole {
  LICENSED_BROKER = "LICENSED_BROKER",
  TRAINEE_BROKER = "TRAINEE_BROKER"
}

export enum KYCStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED"
}

export enum ProjectType {
  RESIDENTIAL = "RESIDENTIAL",
  COMMERCIAL = "COMMERCIAL",
  MIXED_USE = "MIXED_USE",
  VACATION_HOMES = "VACATION_HOMES"
}

export enum ProjectStatus {
  PLANNING = "PLANNING",
  UNDER_CONSTRUCTION = "UNDER_CONSTRUCTION",
  READY = "READY",
  DELIVERED = "DELIVERED"
}

export enum DealStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED", 
  UNDER_REVIEW = "UNDER_REVIEW",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED"
}

export enum CommissionStatus {
  CALCULATED = "CALCULATED",
  APPROVED = "APPROVED",
  PAID = "PAID", 
  CANCELLED = "CANCELLED"
}

export interface GrossProfitCalculation {
  actualCommission: number;
  communicatedCommission: number;
  brokerCommission: number;
  grossProfit: number;
  profitMargin: number;
}

export interface CommissionBreakdown {
  developerPays: number;
  platformReceives: number;
  brokerReceives: number;
  platformProfit: number;
}

export interface EgyptianMarketData {
  developers: EgyptianDeveloper[];
  projects: EgyptianProject[];
  locations: EgyptianLocation[];
}

export interface EgyptianDeveloper {
  name: string;
  logo?: string;
  establishedYear: number;
  headquarters: string;
  phone: string;
  email: string;
  website?: string;
  defaultCommissions: {
    actual: number;
    communicated: number;
    broker: number;
  };
}

export interface EgyptianProject {
  name: string;
  developerName: string;
  location: string;
  area?: string;
  launchDate: string;
  deliveryDate?: string;
  totalUnits: number;
  status: ProjectStatus;
  priceRange: {
    min: number;
    max: number;
    currency: "EGP";
  };
  categories: ProjectCategory[];
}

export interface ProjectCategory {
  name: string;
  unitTypes: UnitTypeConfig[];
}

export interface UnitTypeConfig {
  name: string;
  size: string; // e.g., "35-50 SQM"
  priceRange: {
    min: number;
    max: number;
  };
  commissions?: {
    actual?: number;
    communicated?: number;
    broker?: number;
  };
}

export interface EgyptianLocation {
  name: string;
  type: "city" | "district" | "compound";
  parent?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// Request/Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateDeveloperRequest {
  name: string;
  description?: string;
  email: string;
  phone: string;
  headquarters?: string;
  website?: string;
  defaultCommissionRate?: number;
  actualCommissionRate?: number;
  brokerCommissionRate?: number;
  platformMarginRate?: number;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  location: string;
  address?: string;
  projectType: ProjectType;
  developerId: string;
  launchDate?: string;
  completionDate?: string;
  totalUnits?: number;
  priceRange?: string;
  commissionRate?: number;
  actualCommissionRate?: number;
  brokerCommissionRate?: number;
  platformMarginRate?: number;
  communicatedCommission?: number;
}

export interface CreateDealRequest {
  clientName: string;
  clientEmail?: string;
  clientPhone: string;
  clientNationality?: string;
  dealValue: number;
  commissionRate: number;
  commissionAmount: number;
  brokerId: string;
  projectId: string;
  unitId?: string;
  paymentMethod?: string;
  downPayment?: number;
  expectedClosingDate?: string;
  brokerNotes?: string;
  specialTerms?: string;
}

// Database model interfaces (matching Prisma schema)
export interface Developer {
  id: string;
  name: string;
  description?: string;
  establishedYear?: number;
  licenseNumber?: string;
  website?: string;
  email: string;
  phone: string;
  headquarters?: string;
  operatingCities: string[];
  certifications: string[];
  awards: string[];
  logo?: string;
  images: string[];
  brochures: string[];
  defaultCommissionRate?: number;
  bonusCommissionRate?: number;
  actualCommissionRate?: number;
  brokerCommissionRate?: number;
  platformMarginRate?: number;
  salesContactName?: string;
  salesContactPhone?: string;
  salesContactEmail?: string;
  backupContactPhone?: string;
  contactNotes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  location: string;
  address?: string;
  coordinates?: string;
  projectType: ProjectType;
  totalUnits?: number;
  availableUnits?: number;
  soldUnits?: number;
  priceRange?: string;
  paymentPlans: string[];
  status: ProjectStatus;
  launchDate?: Date;
  completionDate?: Date;
  handoverDate?: Date;
  images: string[];
  brochureUrl?: string;
  virtualTourUrl?: string;
  amenities: string[];
  commissionRate?: number;
  bonusCommissionRate?: number;
  actualCommissionRate?: number;
  brokerCommissionRate?: number;
  platformMarginRate?: number;
  communicatedCommission?: number;
  salesContactName?: string;
  salesContactPhone?: string;
  salesContactEmail?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  developerId: string;
}

export interface Deal {
  id: string;
  dealNumber: string;
  brokerId: string;
  projectId: string;
  unitId?: string;
  clientName: string;
  clientEmail?: string;
  clientPhone: string;
  clientNationality?: string;
  clientType?: string;
  dealValue: number;
  commissionRate: number;
  commissionAmount: number;
  paymentMethod?: string;
  downPayment?: number;
  status: DealStatus;
  submittedAt?: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  approvedBy?: string;
  rejectedBy?: string;
  documents: string[];
  brokerNotes?: string;
  adminNotes?: string;
  rejectionReason?: string;
  specialTerms?: string;
  urgentDeal: boolean;
  expectedClosingDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  commissionSource?: string;
  unitDetailId?: string;
}

export interface Commission {
  id: string;
  dealId: string;
  brokerId: string;
  dealValue: number;
  commissionRate: number;
  grossCommission: number;
  actualCommissionRate?: number;
  brokerCommissionRate?: number;
  platformMarginRate?: number;
  developerCommissionAmount?: number;
  brokerCommissionAmount?: number;
  platformRevenue?: number;
  platformFee?: number;
  taxDeduction?: number;
  otherDeductions?: number;
  netCommission: number;
  status: CommissionStatus;
  calculatedAt: Date;
  approvedAt?: Date;
  paidAt?: Date;
  developerPaidAt?: Date;
  developerPaymentReference?: string;
  commissionSourceType?: string;
  processedBy?: string;
  paymentMethod?: string;
  paymentReference?: string;
  paymentNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}
