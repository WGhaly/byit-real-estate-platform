'use client';

import React, { useState, useEffect } from 'react';
import { api, formatCurrency, formatDate, calculateCommission } from '@/lib/api';
import { Deal, DealStatus, Developer, Project, BrokerUser, ProjectCategory, ProjectCategoryUnitType } from '@/types';
import DashboardLayout from '@/components/DashboardLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { 
  DollarSign, 
  Plus, 
  Edit2, 
  Trash2,
  Eye,
  Search,
  Filter,
  Calendar,
  User,
  Building,
  Phone,
  Mail,
  MapPin,
  Calculator
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const DealsPage: React.FC = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [brokers, setBrokers] = useState<BrokerUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    brokerId: '',
    developerId: '',
    projectId: '',
    search: '',
    dateFrom: '',
    dateTo: '',
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const [dealsRes, developersRes, brokersRes] = await Promise.all([
        api.get('/deals'),
        api.get('/developers'),
        api.get('/brokers'),
      ]);

      setDeals(dealsRes.data.data);
      setDevelopers(developersRes.data.data);
      setBrokers(brokersRes.data.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: DealStatus) => {
    switch (status) {
      case DealStatus.PENDING:
        return 'yellow'
      case DealStatus.CONFIRMED:
        return 'green'
      case DealStatus.CANCELLED:
        return 'red'
      case DealStatus.COMPLETED:
        return 'blue'
      default:
        return 'gray'
    }
  }

  const getStatusLabel = (status: DealStatus) => {
    switch (status) {
      case DealStatus.CONFIRMED:
        return 'Confirmed';
      case DealStatus.COMPLETED:
        return 'Completed';
      case DealStatus.PENDING:
        return 'Pending';
      case DealStatus.CANCELLED:
        return 'Cancelled';
      default:
        return status;
    }
  };

  const filteredDeals = deals.filter((deal) => {
    if (filters.status && deal.status !== filters.status) return false;
    if (filters.brokerId && deal.brokerId !== filters.brokerId) return false;
    if (filters.developerId && deal.developerId !== filters.developerId) return false;
    if (filters.projectId && deal.projectId !== filters.projectId) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        deal.clientName.toLowerCase().includes(searchLower) ||
        deal.clientPhone.includes(filters.search) ||
        deal.unitNumber?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Deal Management</h1>
            <p className="text-gray-600 mt-1">
              Track and manage real estate deals and commissions
            </p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="btn-outline flex items-center"
            >
              <Filter className="h-5 w-5 ml-2" />
              Filter
            </button>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center"
            >
              <Plus className="h-5 w-5 ml-2" />
              New Deal
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-50">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">Total Deals</p>
                  <p className="text-2xl font-bold text-gray-900">{deals.length}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-50">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(deals.reduce((sum, deal) => sum + deal.salePrice, 0))}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-yellow-50">
                  <Calculator className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">Total Commissions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(deals.reduce((sum, deal) => sum + deal.commissionAmount, 0))}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-50">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {deals.filter(d => d.status === DealStatus.PENDING).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="card">
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) => setFilters({...filters, search: e.target.value})}
                      className="input-field pl-10"
                      placeholder="Client name, phone, unit number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الحالة
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                    className="input-field"
                  >
                    <option value="">جميع الحالات</option>
                    <option value={DealStatus.PENDING}>معلقة</option>
                    <option value={DealStatus.CONFIRMED}>مؤكدة</option>
                    <option value={DealStatus.COMPLETED}>مكتملة</option>
                    <option value={DealStatus.CANCELLED}>ملغية</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الوسيط
                  </label>
                  <select
                    value={filters.brokerId}
                    onChange={(e) => setFilters({...filters, brokerId: e.target.value})}
                    className="input-field"
                  >
                    <option value="">جميع الوسطاء</option>
                    {brokers.map((broker) => (
                      <option key={broker.id} value={broker.id}>
                        {broker.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    المطور
                  </label>
                  <select
                    value={filters.developerId}
                    onChange={(e) => setFilters({...filters, developerId: e.target.value})}
                    className="input-field"
                  >
                    <option value="">جميع المطورين</option>
                    {developers.map((developer) => (
                      <option key={developer.id} value={developer.id}>
                        {developer.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    من تاريخ
                  </label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    إلى تاريخ
                  </label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                    className="input-field"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Deals Table */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">
              قائمة الصفقات ({filteredDeals.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    العميل
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المشروع
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الوسيط
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    قيمة البيع
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    العمولة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    التاريخ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    إجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDeals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {deal.clientName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {deal.clientPhone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {deal.project.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {deal.developer.name}
                        </div>
                        {deal.unitNumber && (
                          <div className="text-xs text-gray-400">
                            وحدة: {deal.unitNumber}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {deal.broker.fullName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(deal.salePrice)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(deal.commissionAmount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge-${getStatusColor(deal.status)}`}>
                        {getStatusLabel(deal.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {deal.saleDate ? formatDate(deal.saleDate) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedDeal(deal)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredDeals.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              لا توجد صفقات
            </h3>
            <p className="text-gray-500 mb-4">
              ابدأ بإضافة أول صفقة في النظام
            </p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              إضافة صفقة جديدة
            </button>
          </div>
        )}
      </div>

      {/* Create Deal Modal */}
      {showCreateModal && (
        <CreateDealModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchInitialData();
          }}
          developers={developers}
          brokers={brokers}
        />
      )}

      {/* Deal Details Modal */}
      {selectedDeal && (
        <DealDetailsModal
          deal={selectedDeal}
          onClose={() => setSelectedDeal(null)}
        />
      )}
    </DashboardLayout>
  );
};

interface CreateDealModalProps {
  onClose: () => void;
  onSuccess: () => void;
  developers: Developer[];
  brokers: BrokerUser[];
}

const CreateDealModal: React.FC<CreateDealModalProps> = ({
  onClose,
  onSuccess,
  developers,
  brokers,
}) => {
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    unitNumber: '',
    unitArea: '',
    salePrice: '',
    status: DealStatus.PENDING,
    saleDate: '',
    notes: '',
    brokerId: '',
    developerId: '',
    projectId: '',
    categoryId: '',
    unitTypeId: '',
  });
  const [selectedDeveloper, setSelectedDeveloper] = useState<Developer | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<ProjectCategory[]>([]);
  const [unitTypes, setUnitTypes] = useState<ProjectCategoryUnitType[]>([]);
  const [calculatedCommission, setCalculatedCommission] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (formData.developerId) {
      const developer = developers.find(d => d.id === formData.developerId);
      setSelectedDeveloper(developer || null);
      setProjects(developer?.projects || []);
      setFormData(prev => ({ ...prev, projectId: '', categoryId: '', unitTypeId: '' }));
    }
  }, [formData.developerId, developers]);

  useEffect(() => {
    if (formData.projectId && selectedDeveloper && selectedDeveloper.projects) {
      const project = selectedDeveloper.projects.find(p => p.id === formData.projectId);
      setCategories(project?.categories || []);
      setFormData(prev => ({ ...prev, categoryId: '', unitTypeId: '' }));
    }
  }, [formData.projectId, selectedDeveloper]);

  useEffect(() => {
    if (formData.categoryId) {
      const category = categories.find(c => c.id === formData.categoryId);
      setUnitTypes(category?.unitTypes || []);
      setFormData(prev => ({ ...prev, unitTypeId: '' }));
    }
  }, [formData.categoryId, categories]);

  useEffect(() => {
    if (formData.salePrice && selectedDeveloper) {
      const salePrice = parseFloat(formData.salePrice);
      if (!isNaN(salePrice)) {
        let commissionRate = selectedDeveloper.actualCommissionRate || 0;
        
        if (formData.projectId && selectedDeveloper.projects) {
          const project = selectedDeveloper.projects.find(p => p.id === formData.projectId);
          if (project) {
            commissionRate = project.actualCommissionRate || commissionRate;
            
            if (formData.categoryId && project.categories) {
              const category = project.categories.find(c => c.id === formData.categoryId);
              if (category) {
                commissionRate = category.actualCommissionRate || commissionRate;
                
                if (formData.unitTypeId && category.unitTypes) {
                  const unitType = category.unitTypes.find(ut => ut.id === formData.unitTypeId);
                  if (unitType) {
                    commissionRate = unitType.actualCommissionRate || commissionRate;
                  }
                }
              }
            }
          }
        }
        
        setCalculatedCommission(calculateCommission(salePrice, commissionRate));
      }
    } else {
      setCalculatedCommission(0);
    }
  }, [formData.salePrice, formData.projectId, formData.categoryId, formData.unitTypeId, selectedDeveloper]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      
      const payload = {
        ...formData,
        unitArea: formData.unitArea ? parseFloat(formData.unitArea) : undefined,
        salePrice: parseFloat(formData.salePrice),
        saleDate: formData.saleDate || undefined,
        clientEmail: formData.clientEmail || undefined,
        unitNumber: formData.unitNumber || undefined,
        notes: formData.notes || undefined,
        categoryId: formData.categoryId || undefined,
        unitTypeId: formData.unitTypeId || undefined,
      };

      await api.post('/deals', payload);
      toast.success('تم إنشاء الصفقة بنجاح');
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'فشل في إنشاء الصفقة');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">إضافة صفقة جديدة</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto">
            {/* Client Information */}
            <div className="border-b border-gray-200 pb-4">
              <h4 className="font-medium text-gray-900 mb-3">معلومات العميل</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    اسم العميل *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.clientName}
                    onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                    className="input-field"
                    placeholder="أدخل اسم العميل"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    رقم الهاتف *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.clientPhone}
                    onChange={(e) => setFormData({...formData, clientPhone: e.target.value})}
                    className="input-field"
                    placeholder="أدخل رقم الهاتف"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) => setFormData({...formData, clientEmail: e.target.value})}
                    className="input-field"
                    placeholder="أدخل البريد الإلكتروني"
                  />
                </div>
              </div>
            </div>

            {/* Property Information */}
            <div className="border-b border-gray-200 pb-4">
              <h4 className="font-medium text-gray-900 mb-3">معلومات العقار</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    المطور *
                  </label>
                  <select
                    required
                    value={formData.developerId}
                    onChange={(e) => setFormData({...formData, developerId: e.target.value})}
                    className="input-field"
                  >
                    <option value="">اختر المطور</option>
                    {developers.map((developer) => (
                      <option key={developer.id} value={developer.id}>
                        {developer.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    المشروع *
                  </label>
                  <select
                    required
                    value={formData.projectId}
                    onChange={(e) => setFormData({...formData, projectId: e.target.value})}
                    className="input-field"
                    disabled={!formData.developerId}
                  >
                    <option value="">اختر المشروع</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الفئة
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                    className="input-field"
                    disabled={!formData.projectId}
                  >
                    <option value="">اختر الفئة</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    نوع الوحدة
                  </label>
                  <select
                    value={formData.unitTypeId}
                    onChange={(e) => setFormData({...formData, unitTypeId: e.target.value})}
                    className="input-field"
                    disabled={!formData.categoryId}
                  >
                    <option value="">اختر نوع الوحدة</option>
                    {unitTypes.map((unitType) => (
                      <option key={unitType.id} value={unitType.id}>
                        {unitType.unitType.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    رقم الوحدة
                  </label>
                  <input
                    type="text"
                    value={formData.unitNumber}
                    onChange={(e) => setFormData({...formData, unitNumber: e.target.value})}
                    className="input-field"
                    placeholder="مثال: A-101"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    المساحة (متر مربع)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.unitArea}
                    onChange={(e) => setFormData({...formData, unitArea: e.target.value})}
                    className="input-field"
                    placeholder="مثال: 120.5"
                  />
                </div>
              </div>
            </div>

            {/* Deal Information */}
            <div className="border-b border-gray-200 pb-4">
              <h4 className="font-medium text-gray-900 mb-3">معلومات الصفقة</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    قيمة البيع (جنيه) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.salePrice}
                    onChange={(e) => setFormData({...formData, salePrice: e.target.value})}
                    className="input-field"
                    placeholder="مثال: 2500000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    العمولة المحسوبة
                  </label>
                  <div className="input-field bg-gray-50 flex items-center">
                    <Calculator className="h-4 w-4 text-gray-400 ml-2" />
                    {formatCurrency(calculatedCommission)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الوسيط *
                  </label>
                  <select
                    required
                    value={formData.brokerId}
                    onChange={(e) => setFormData({...formData, brokerId: e.target.value})}
                    className="input-field"
                  >
                    <option value="">اختر الوسيط</option>
                    {brokers.map((broker) => (
                      <option key={broker.id} value={broker.id}>
                        {broker.fullName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الحالة
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as DealStatus})}
                    className="input-field"
                  >
                    <option value={DealStatus.PENDING}>معلقة</option>
                    <option value={DealStatus.CONFIRMED}>مؤكدة</option>
                    <option value={DealStatus.COMPLETED}>مكتملة</option>
                    <option value={DealStatus.CANCELLED}>ملغية</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    تاريخ البيع
                  </label>
                  <input
                    type="date"
                    value={formData.saleDate}
                    onChange={(e) => setFormData({...formData, saleDate: e.target.value})}
                    className="input-field"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ملاحظات
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="input-field"
                  rows={3}
                  placeholder="أدخل أي ملاحظات إضافية"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-outline"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary disabled:opacity-50"
              >
                {isLoading ? 'جاري الحفظ...' : 'حفظ الصفقة'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

interface DealDetailsModalProps {
  deal: Deal;
  onClose: () => void;
}

const DealDetailsModal: React.FC<DealDetailsModalProps> = ({ deal, onClose }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">تفاصيل الصفقة</h3>
          
          <div className="space-y-4">
            {/* Client Information */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">معلومات العميل</h4>
              <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                <div className="flex items-center">
                  <User className="h-4 w-4 text-gray-500 ml-2" />
                  <span className="text-sm font-medium">{deal.clientName}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-gray-500 ml-2" />
                  <span className="text-sm">{deal.clientPhone}</span>
                </div>
                {deal.clientEmail && (
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-500 ml-2" />
                    <span className="text-sm">{deal.clientEmail}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Property Information */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">معلومات العقار</h4>
              <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                <div className="flex items-center">
                  <Building className="h-4 w-4 text-gray-500 ml-2" />
                  <span className="text-sm font-medium">{deal.project.name}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-gray-500 ml-2" />
                  <span className="text-sm">{deal.developer.name}</span>
                </div>
                {deal.unitNumber && (
                  <div className="text-sm text-gray-600">
                    رقم الوحدة: {deal.unitNumber}
                  </div>
                )}
                {deal.unitArea && (
                  <div className="text-sm text-gray-600">
                    المساحة: {deal.unitArea} متر مربع
                  </div>
                )}
              </div>
            </div>

            {/* Financial Information */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">المعلومات المالية</h4>
              <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">قيمة البيع:</span>
                  <span className="text-sm font-medium">{formatCurrency(deal.salePrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">العمولة:</span>
                  <span className="text-sm font-medium">{formatCurrency(deal.commissionAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">الوسيط:</span>
                  <span className="text-sm font-medium">{deal.broker.fullName}</span>
                </div>
              </div>
            </div>

            {/* Status and Dates */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">الحالة والتواريخ</h4>
              <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">الحالة:</span>
                  <span className={`badge-${getStatusColor(deal.status)}`}>
                    {getStatusLabel(deal.status)}
                  </span>
                </div>
                {deal.saleDate && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">تاريخ البيع:</span>
                    <span className="text-sm">{formatDate(deal.saleDate)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">تاريخ الإنشاء:</span>
                  <span className="text-sm">{formatDate(deal.createdAt)}</span>
                </div>
              </div>
            </div>

            {deal.notes && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">ملاحظات</h4>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">{deal.notes}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end mt-6">
            <button onClick={onClose} className="btn-primary">
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions (duplicate from deals page utils - should be moved to utils file)
const getStatusColor = (status: DealStatus) => {
  switch (status) {
    case DealStatus.CONFIRMED:
      return 'success';
    case DealStatus.COMPLETED:
      return 'info';
    case DealStatus.PENDING:
      return 'warning';
    case DealStatus.CANCELLED:
      return 'error';
    default:
      return 'info';
  }
};

const getStatusLabel = (status: DealStatus) => {
  switch (status) {
    case DealStatus.CONFIRMED:
      return 'مؤكدة';
    case DealStatus.COMPLETED:
      return 'مكتملة';
    case DealStatus.PENDING:
      return 'معلقة';
    case DealStatus.CANCELLED:
      return 'ملغية';
    default:
      return status;
  }
};

export default DealsPage;
