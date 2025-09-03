export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  fullName: string;
  phone?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  MANAGER = 'MANAGER',
  SENIOR_USER = 'SENIOR_USER',
  JUNIOR_USER = 'JUNIOR_USER'
}

export enum BrokerRole {
  BROKER = 'BROKER',
  TEAM_LEADER = 'TEAM_LEADER',
  SALES_MANAGER = 'SALES_MANAGER'
}

export enum DealStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
}

export enum CommissionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED'
}

export enum UnitType {
  APARTMENT = 'APARTMENT',
  VILLA = 'VILLA',
  TOWNHOUSE = 'TOWNHOUSE',
  PENTHOUSE = 'PENTHOUSE',
  STUDIO = 'STUDIO',
  DUPLEX = 'DUPLEX',
  OFFICE = 'OFFICE',
  SHOP = 'SHOP',
  WAREHOUSE = 'WAREHOUSE',
  LAND = 'LAND'
}

export interface Developer {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  website?: string;
  isActive: boolean;
  actualCommissionRate?: number;
  brokerCommissionRate?: number;
  communicatedCommission?: number;
  projects?: Project[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  location: string;
  address?: string;
  startDate?: Date;
  endDate?: Date;
  totalUnits?: number;
  availableUnits?: number;
  minPrice?: number;
  maxPrice?: number;
  isActive: boolean;
  actualCommissionRate?: number;
  brokerCommissionRate?: number;
  communicatedCommission?: number;
  developerId: string;
  developer?: Developer;
  categories?: ProjectCategory[];
  deals?: Deal[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  categoryType: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UnitTypeModel {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectCategory {
  id: string;
  projectId: string;
  categoryId: string;
  isEnabled: boolean;
  actualCommissionRate?: number;
  brokerCommissionRate?: number;
  communicatedCommission?: number;
  project?: Project;
  category: Category;
  unitTypes: ProjectCategoryUnitType[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectCategoryUnitType {
  id: string;
  projectId: string;
  categoryId: string;
  unitTypeId: string;
  isEnabled: boolean;
  actualCommissionRate?: number;
  brokerCommissionRate?: number;
  communicatedCommission?: number;
  price?: number;
  project?: Project;
  category?: ProjectCategory;
  unitType: UnitTypeModel;
  createdAt: Date;
  updatedAt: Date;
}

export interface BrokerUser {
  id: string;
  username: string;
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role: BrokerRole;
  isActive: boolean;
  commissionRate?: number;
  teamLeaderId?: string;
  teamLeader?: BrokerUser;
  teamMembers: BrokerUser[];
  deals: Deal[];
  commissions: Commission[];
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Deal {
  id: string;
  clientName: string;
  clientEmail?: string;
  clientPhone: string;
  unitNumber?: string;
  unitArea?: number;
  salePrice: number;
  commissionAmount: number;
  status: DealStatus;
  saleDate?: Date;
  notes?: string;
  brokerId: string;
  broker: BrokerUser;
  developerId: string;
  developer: Developer;
  projectId: string;
  project: Project;
  categoryId?: string;
  category?: ProjectCategory;
  unitTypeId?: string;
  unitType?: ProjectCategoryUnitType;
  commissions: Commission[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Commission {
  id: string;
  amount: number;
  rate: number;
  status: CommissionStatus;
  dueDate?: Date;
  paidDate?: Date;
  approvedAt?: Date;
  paidAt?: Date;
  rejectionReason?: string;
  notes?: string;
  dealId: string;
  deal: Deal;
  brokerId: string;
  broker: BrokerUser;
  createdAt: Date;
  updatedAt: Date;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface DeveloperForm {
  name: string;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  website?: string;
  commissionRate: number;
  isActive: boolean;
}

export interface ProjectForm {
  name: string;
  description?: string;
  location: string;
  address?: string;
  startDate?: string;
  endDate?: string;
  totalUnits?: number;
  minPrice?: number;
  maxPrice?: number;
  commissionRate?: number;
  isActive: boolean;
  developerId: string;
}

export interface CategoryForm {
  name: string;
  description?: string;
  commissionRate?: number;
  projectId: string;
}

export interface UnitTypeForm {
  type: UnitType;
  name: string;
  description?: string;
  minArea?: number;
  maxArea?: number;
  minPrice?: number;
  maxPrice?: number;
  commissionRate?: number;
  categoryId: string;
}

export interface BrokerForm {
  username: string;
  email: string;
  password?: string;
  fullName: string;
  phone?: string;
  role: BrokerRole;
  isActive: boolean;
  commissionRate?: number;
  teamLeaderId?: string;
}

export interface DealForm {
  clientName: string;
  clientEmail?: string;
  clientPhone: string;
  unitNumber?: string;
  unitArea?: number;
  salePrice: number;
  status: DealStatus;
  saleDate?: string;
  notes?: string;
  brokerId: string;
  developerId: string;
  projectId: string;
  categoryId?: string;
  unitTypeId?: string;
}

// Analytics Types
export interface DashboardStats {
  totalDeals: number;
  totalCommissions: number;
  pendingCommissions: number;
  monthlyRevenue: number;
  totalBrokers: number;
  activeBrokers: number;
  totalDevelopers: number;
  activeProjects: number;
}

export interface RevenueChart {
  month: string;
  revenue: number;
  commissions: number;
  deals: number;
}

export interface TopPerformer {
  id: string;
  name: string;
  deals: number;
  revenue: number;
  commissions: number;
}

// WebSocket Types
export interface WebSocketMessage {
  type: 'DEAL_CREATED' | 'DEAL_UPDATED' | 'COMMISSION_UPDATED' | 'BROKER_UPDATED';
  data: any;
  timestamp: Date;
}

// Filter Types
export interface DealFilters {
  status?: DealStatus;
  brokerId?: string;
  developerId?: string;
  projectId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface CommissionFilters {
  status?: CommissionStatus;
  brokerId?: string;
  dealId?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type CreateInput<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateInput<T> = Partial<CreateInput<T>>;

// Currency Formatting
export interface CurrencyFormatOptions {
  currency: string;
  locale: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}
