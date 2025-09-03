'use client';

import React, { useState, useEffect } from 'react';
import { api, formatCurrency, formatDate } from '@/lib/api';
import { Commission, CommissionStatus, Deal, BrokerUser } from '@/types';
import DashboardLayout from '@/components/DashboardLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  User,
  Calendar,
  Filter,
  Search,
  FileText,
  Eye,
  Download,
  TrendingUp,
  TrendingDown,
  Edit,
  Plus,
  Save,
  X,
  Calculator,
  Percent,
  ArrowRight,
  Users,
  Building,
  Home,
  CreditCard,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface CommissionRate {
  id: string;
  brokerId: string;
  projectId?: string;
  unitTypeId?: string;
  rate: number;
  isDefault: boolean;
  inheritedFrom?: 'role' | 'team' | 'project' | 'unitType';
  createdAt: string;
  updatedAt: string;
}

interface EditableCommission {
  id: string;
  baseRate: number;
  projectRate?: number;
  unitTypeRate?: number;
  effectiveRate: number;
  calculatedAmount: number;
}

const CommissionsPage: React.FC = () => {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null);
  const [editingCommissions, setEditingCommissions] = useState<Map<string, EditableCommission>>(new Map());
  const [showCommissionEditor, setShowCommissionEditor] = useState(false);
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [selectedCommissionIds, setSelectedCommissionIds] = useState<Set<string>>(new Set());
  const [commissionRates, setCommissionRates] = useState<CommissionRate[]>([]);
  
  const [filters, setFilters] = useState({
    status: '',
    brokerId: '',
    search: '',
    dateFrom: '',
    dateTo: '',
  });

  const getStatusColor = (status: CommissionStatus) => {
    switch (status) {
      case CommissionStatus.PENDING:
        return 'warning';
      case CommissionStatus.APPROVED:
        return 'success';
      case CommissionStatus.PAID:
        return 'info';
      case CommissionStatus.CANCELLED:
        return 'error';
      default:
        return 'info';
    }
  };

  const getStatusLabel = (status: CommissionStatus) => {
    switch (status) {
      case CommissionStatus.PENDING:
        return 'Pending';
      case CommissionStatus.APPROVED:
        return 'Approved';
      case CommissionStatus.PAID:
        return 'Paid';
      case CommissionStatus.CANCELLED:
        return 'Cancelled';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: CommissionStatus) => {
    switch (status) {
      case CommissionStatus.PENDING:
        return <Clock className="h-4 w-4" />;
      case CommissionStatus.APPROVED:
        return <CheckCircle className="h-4 w-4" />;
      case CommissionStatus.PAID:
        return <DollarSign className="h-4 w-4" />;
      case CommissionStatus.CANCELLED:
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  useEffect(() => {
    fetchCommissions();
    fetchCommissionRates();
  }, []);

  const fetchCommissions = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/commissions');
      setCommissions(response.data.data);
    } catch (error) {
      console.error('Failed to fetch commissions:', error);
      toast.error('Failed to load commissions');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCommissionRates = async () => {
    try {
      const response = await api.get('/commission-rates');
      setCommissionRates(response.data.data);
    } catch (error) {
      console.error('Failed to fetch commission rates:', error);
    }
  };

  const calculateEffectiveRate = (baseRate: number, projectRate?: number, unitTypeRate?: number): number => {
    // Priority: unitTypeRate > projectRate > baseRate
    return unitTypeRate || projectRate || baseRate;
  };

  const updateCommissionStatus = async (commissionId: string, status: CommissionStatus, rejectionReason?: string) => {
    try {
      await api.patch(`/commissions/${commissionId}/status`, {
        status,
        rejectionReason,
      });
      
      toast.success('Commission status updated successfully');
      fetchCommissions();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update commission status');
    }
  };

  const updateCommissionRates = async (commissionId: string, rates: Partial<EditableCommission>) => {
    try {
      await api.patch(`/commissions/${commissionId}/rates`, rates);
      toast.success('Commission rates updated successfully');
      fetchCommissions();
      
      // Remove from editing map
      const newEditingCommissions = new Map(editingCommissions);
      newEditingCommissions.delete(commissionId);
      setEditingCommissions(newEditingCommissions);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update commission rates');
    }
  };

  const bulkUpdateCommissionRates = async (rates: Partial<EditableCommission>) => {
    try {
      await api.patch('/commissions/bulk-update-rates', {
        commissionIds: Array.from(selectedCommissionIds),
        ...rates,
      });
      toast.success(`Updated ${selectedCommissionIds.size} commission rates successfully`);
      fetchCommissions();
      setBulkEditMode(false);
      setSelectedCommissionIds(new Set());
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to bulk update commission rates');
    }
  };

  const startEditingCommission = (commission: Commission) => {
    const editableCommission: EditableCommission = {
      id: commission.id,
      baseRate: commission.deal.broker.commissionRate || 0,
      projectRate: (commission.deal.project as any).commissionRate,
      unitTypeRate: (commission.deal.unitType as any)?.commissionRate,
      effectiveRate: commission.deal.developer.actualCommissionRate || 0,
      calculatedAmount: commission.amount,
    };

    const newEditingCommissions = new Map(editingCommissions);
    newEditingCommissions.set(commission.id, editableCommission);
    setEditingCommissions(newEditingCommissions);
  };

  const cancelEditingCommission = (commissionId: string) => {
    const newEditingCommissions = new Map(editingCommissions);
    newEditingCommissions.delete(commissionId);
    setEditingCommissions(newEditingCommissions);
  };

  const updateEditingCommission = (commissionId: string, field: keyof EditableCommission, value: number) => {
    const newEditingCommissions = new Map(editingCommissions);
    const editing = newEditingCommissions.get(commissionId);
    
    if (editing) {
      const updated = { ...editing, [field]: value };
      
      // Recalculate effective rate and amount
      if (field !== 'calculatedAmount') {
        updated.effectiveRate = calculateEffectiveRate(
          updated.baseRate,
          updated.projectRate,
          updated.unitTypeRate
        );
        
        // Find the commission to get sale price
        const commission = commissions.find(c => c.id === commissionId);
        if (commission) {
          updated.calculatedAmount = (commission.deal.salePrice * updated.effectiveRate) / 100;
        }
      }
      
      newEditingCommissions.set(commissionId, updated);
      setEditingCommissions(newEditingCommissions);
    }
  };

  const toggleCommissionSelection = (commissionId: string) => {
    const newSelection = new Set(selectedCommissionIds);
    if (newSelection.has(commissionId)) {
      newSelection.delete(commissionId);
    } else {
      newSelection.add(commissionId);
    }
    setSelectedCommissionIds(newSelection);
  };

  const filteredCommissions = commissions.filter((commission) => {
    if (filters.status && commission.status !== filters.status) return false;
    if (filters.brokerId && commission.deal.brokerId !== filters.brokerId) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        commission.deal.clientName.toLowerCase().includes(searchLower) ||
        commission.deal.broker.fullName.toLowerCase().includes(searchLower) ||
        commission.deal.project.name.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const stats = {
    total: commissions.length,
    totalAmount: commissions.reduce((sum, c) => sum + c.amount, 0),
    pending: commissions.filter(c => c.status === CommissionStatus.PENDING).length,
    approved: commissions.filter(c => c.status === CommissionStatus.APPROVED).length,
    paid: commissions.filter(c => c.status === CommissionStatus.PAID).length,
    rejected: commissions.filter(c => c.status === CommissionStatus.CANCELLED).length,
    pendingAmount: commissions
      .filter(c => c.status === CommissionStatus.PENDING)
      .reduce((sum, c) => sum + c.amount, 0),
    paidAmount: commissions
      .filter(c => c.status === CommissionStatus.PAID)
      .reduce((sum, c) => sum + c.amount, 0),
  };

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
            <h1 className="text-2xl font-bold text-gray-900">Commission Management</h1>
            <p className="text-gray-600 mt-1">
              Track, review, and approve commissions with advanced rate management
            </p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="btn-outline flex items-center"
            >
              <Filter className="h-5 w-5 mr-2" />
              Filter
            </button>
            <button 
              onClick={() => setBulkEditMode(!bulkEditMode)}
              className={`btn-outline flex items-center ${bulkEditMode ? 'bg-blue-50 border-blue-300' : ''}`}
            >
              <Edit className="h-5 w-5 mr-2" />
              {bulkEditMode ? 'Exit Bulk Edit' : 'Bulk Edit'}
            </button>
            <button 
              onClick={() => setShowCommissionEditor(true)}
              className="btn-primary flex items-center"
            >
              <Calculator className="h-5 w-5 mr-2" />
              Rate Calculator
            </button>
            <button className="btn-primary flex items-center">
              <Download className="h-5 w-5 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Bulk Edit Actions */}
        {bulkEditMode && selectedCommissionIds.size > 0 && (
          <div className="card bg-blue-50 border-blue-200">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-blue-900 font-medium">
                    {selectedCommissionIds.size} commissions selected for bulk edit
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <BulkCommissionEditor
                  onUpdate={bulkUpdateCommissionRates}
                  onCancel={() => {
                    setBulkEditMode(false);
                    setSelectedCommissionIds(new Set());
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-50">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Commissions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  <p className="text-xs text-gray-500">
                    {formatCurrency(stats.totalAmount)}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-yellow-50">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                  <p className="text-xs text-gray-500">
                    {formatCurrency(stats.pendingAmount)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-50">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                  <p className="text-xs text-gray-500">
                    Ready for payment
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-50">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Paid</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.paid}</p>
                  <p className="text-xs text-gray-500">
                    {formatCurrency(stats.paidAmount)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Commission Rate Hierarchy Explanation */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calculator className="h-5 w-5 mr-2" />
              Commission Rate Hierarchy
            </h3>
          </div>
          <div className="card-body">
            <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
              <div className="flex items-center space-x-8">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-gray-100">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Base Rate</p>
                    <p className="text-xs text-gray-500">Broker's default rate</p>
                  </div>
                </div>
                
                <ArrowRight className="h-4 w-4 text-gray-400" />
                
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-blue-100">
                    <Building className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Project Rate</p>
                    <p className="text-xs text-gray-500">Project-specific override</p>
                  </div>
                </div>
                
                <ArrowRight className="h-4 w-4 text-gray-400" />
                
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-purple-100">
                    <Home className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Unit Type Rate</p>
                    <p className="text-xs text-gray-500">Highest priority</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="card">
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                      placeholder="Client, broker, project name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                    className="input-field"
                  >
                    <option value="">All Statuses</option>
                    <option value={CommissionStatus.PENDING}>Pending</option>
                    <option value={CommissionStatus.APPROVED}>Approved</option>
                    <option value={CommissionStatus.PAID}>Paid</option>
                    <option value={CommissionStatus.CANCELLED}>Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    From Date
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
                    To Date
                  </label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                    className="input-field"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => setFilters({
                      status: '',
                      brokerId: '',
                      search: '',
                      dateFrom: '',
                      dateTo: '',
                    })}
                    className="btn-outline w-full"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Commissions Table */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">
              Commission List ({filteredCommissions.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {bulkEditMode && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedCommissionIds.size === filteredCommissions.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCommissionIds(new Set(filteredCommissions.map(c => c.id)));
                          } else {
                            setSelectedCommissionIds(new Set());
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Broker
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sale Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commission Rates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCommissions.map((commission) => {
                  const isEditing = editingCommissions.has(commission.id);
                  const editingData = editingCommissions.get(commission.id);
                  
                  return (
                    <tr key={commission.id} className="hover:bg-gray-50">
                      {bulkEditMode && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedCommissionIds.has(commission.id)}
                            onChange={() => toggleCommissionSelection(commission.id)}
                            className="rounded border-gray-300"
                          />
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {commission.deal.clientName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {commission.deal.project.name}
                          </div>
                          {commission.deal.unitNumber && (
                            <div className="text-xs text-gray-400">
                              Unit: {commission.deal.unitNumber}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {commission.deal.broker.fullName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {commission.deal.broker.role}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(commission.deal.salePrice)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isEditing && editingData ? (
                          <CommissionRateEditor
                            editingData={editingData}
                            commission={commission}
                            onUpdate={(field, value) => updateEditingCommission(commission.id, field, value)}
                          />
                        ) : (
                          <CommissionRateDisplay commission={commission} />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {isEditing && editingData 
                            ? formatCurrency(editingData.calculatedAmount)
                            : formatCurrency(commission.amount)
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(commission.status)}
                          <span className={`badge-${getStatusColor(commission.status)} ml-2`}>
                            {getStatusLabel(commission.status)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => editingData && updateCommissionRates(commission.id, editingData)}
                                className="text-green-600 hover:text-green-900"
                                title="Save changes"
                              >
                                <Save className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => cancelEditingCommission(commission.id)}
                                className="text-gray-600 hover:text-gray-900"
                                title="Cancel editing"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEditingCommission(commission)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Edit commission rates"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setSelectedCommission(commission)}
                                className="text-blue-600 hover:text-blue-900"
                                title="View details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          
                          {commission.status === CommissionStatus.PENDING && (
                            <>
                              <button
                                onClick={() => updateCommissionStatus(commission.id, CommissionStatus.APPROVED)}
                                className="text-green-600 hover:text-green-900"
                                title="Approve"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  const reason = prompt('Rejection reason:');
                                  if (reason) {
                                    updateCommissionStatus(commission.id, CommissionStatus.CANCELLED, reason);
                                  }
                                }}
                                className="text-red-600 hover:text-red-900"
                                title="Reject"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          {commission.status === CommissionStatus.APPROVED && (
                            <button
                              onClick={() => updateCommissionStatus(commission.id, CommissionStatus.PAID)}
                              className="text-purple-600 hover:text-purple-900"
                              title="Mark as paid"
                            >
                              <CreditCard className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {filteredCommissions.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No commissions found
            </h3>
            <p className="text-gray-500">
              No commissions match the selected filters
            </p>
          </div>
        )}
      </div>

      {/* Commission Rate Calculator Modal */}
      {showCommissionEditor && (
        <CommissionRateCalculatorModal
          onClose={() => setShowCommissionEditor(false)}
          commissionRates={commissionRates}
          onRatesUpdate={fetchCommissionRates}
        />
      )}

      {/* Commission Details Modal */}
      {selectedCommission && (
        <CommissionDetailsModal
          commission={selectedCommission}
          onClose={() => setSelectedCommission(null)}
          onStatusUpdate={(status, reason) => {
            updateCommissionStatus(selectedCommission.id, status, reason);
            setSelectedCommission(null);
          }}
          getStatusColor={getStatusColor}
          getStatusLabel={getStatusLabel}
          getStatusIcon={getStatusIcon}
        />
      )}
    </DashboardLayout>
  );
};

// Commission Rate Display Component
const CommissionRateDisplay: React.FC<{ commission: Commission }> = ({ commission }) => {
  const baseRate = commission.deal.broker.commissionRate || 0;
  const projectRate = (commission.deal.project as any).commissionRate;
  const unitTypeRate = (commission.deal.unitType as any)?.commissionRate;
  const effectiveRate = commission.deal.developer.actualCommissionRate || 0;

  return (
    <div className="space-y-1">
      <div className="flex items-center space-x-2">
        <User className="h-3 w-3 text-gray-400" />
        <span className="text-xs text-gray-600">Base: {baseRate}%</span>
      </div>
      {projectRate && (
        <div className="flex items-center space-x-2">
          <Building className="h-3 w-3 text-blue-500" />
          <span className="text-xs text-blue-600">Project: {projectRate}%</span>
        </div>
      )}
      {unitTypeRate && (
        <div className="flex items-center space-x-2">
          <Home className="h-3 w-3 text-purple-500" />
          <span className="text-xs text-purple-600">Unit: {unitTypeRate}%</span>
        </div>
      )}
      <div className="text-sm font-semibold text-gray-900 pt-1 border-t border-gray-200">
        Effective: {effectiveRate}%
      </div>
    </div>
  );
};

// Commission Rate Editor Component
interface CommissionRateEditorProps {
  editingData: EditableCommission;
  commission: Commission;
  onUpdate: (field: keyof EditableCommission, value: number) => void;
}

const CommissionRateEditor: React.FC<CommissionRateEditorProps> = ({
  editingData,
  commission,
  onUpdate,
}) => {
  return (
    <div className="space-y-2 min-w-[200px]">
      <div className="flex items-center space-x-2">
        <User className="h-3 w-3 text-gray-400" />
        <input
          type="number"
          value={editingData.baseRate}
          onChange={(e) => onUpdate('baseRate', parseFloat(e.target.value) || 0)}
          className="w-16 text-xs p-1 border rounded"
          step="0.1"
          min="0"
          max="100"
        />
        <span className="text-xs text-gray-600">%</span>
      </div>
      
      <div className="flex items-center space-x-2">
        <Building className="h-3 w-3 text-blue-500" />
        <input
          type="number"
          value={editingData.projectRate || ''}
          onChange={(e) => onUpdate('projectRate', parseFloat(e.target.value) || 0)}
          className="w-16 text-xs p-1 border rounded"
          step="0.1"
          min="0"
          max="100"
          placeholder="Project"
        />
        <span className="text-xs text-gray-600">%</span>
      </div>
      
      <div className="flex items-center space-x-2">
        <Home className="h-3 w-3 text-purple-500" />
        <input
          type="number"
          value={editingData.unitTypeRate || ''}
          onChange={(e) => onUpdate('unitTypeRate', parseFloat(e.target.value) || 0)}
          className="w-16 text-xs p-1 border rounded"
          step="0.1"
          min="0"
          max="100"
          placeholder="Unit"
        />
        <span className="text-xs text-gray-600">%</span>
      </div>
      
      <div className="text-sm font-semibold text-gray-900 pt-1 border-t border-gray-200">
        Effective: {editingData.effectiveRate.toFixed(1)}%
      </div>
    </div>
  );
};

// Bulk Commission Editor Component
interface BulkCommissionEditorProps {
  onUpdate: (rates: Partial<EditableCommission>) => void;
  onCancel: () => void;
}

const BulkCommissionEditor: React.FC<BulkCommissionEditorProps> = ({ onUpdate, onCancel }) => {
  const [rates, setRates] = useState({
    baseRate: '',
    projectRate: '',
    unitTypeRate: '',
  });

  const handleUpdate = () => {
    const updateData: Partial<EditableCommission> = {};
    
    if (rates.baseRate) updateData.baseRate = parseFloat(rates.baseRate);
    if (rates.projectRate) updateData.projectRate = parseFloat(rates.projectRate);
    if (rates.unitTypeRate) updateData.unitTypeRate = parseFloat(rates.unitTypeRate);
    
    if (Object.keys(updateData).length > 0) {
      onUpdate(updateData);
    }
  };

  return (
    <div className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow-sm border">
      <div className="flex items-center space-x-2">
        <User className="h-4 w-4 text-gray-400" />
        <input
          type="number"
          value={rates.baseRate}
          onChange={(e) => setRates({...rates, baseRate: e.target.value})}
          placeholder="Base %"
          className="w-20 text-sm p-1 border rounded"
          step="0.1"
          min="0"
          max="100"
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Building className="h-4 w-4 text-blue-500" />
        <input
          type="number"
          value={rates.projectRate}
          onChange={(e) => setRates({...rates, projectRate: e.target.value})}
          placeholder="Project %"
          className="w-20 text-sm p-1 border rounded"
          step="0.1"
          min="0"
          max="100"
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Home className="h-4 w-4 text-purple-500" />
        <input
          type="number"
          value={rates.unitTypeRate}
          onChange={(e) => setRates({...rates, unitTypeRate: e.target.value})}
          placeholder="Unit %"
          className="w-20 text-sm p-1 border rounded"
          step="0.1"
          min="0"
          max="100"
        />
      </div>
      
      <button
        onClick={handleUpdate}
        className="btn-primary text-sm px-3 py-1"
      >
        Update Selected
      </button>
      
      <button
        onClick={onCancel}
        className="btn-outline text-sm px-3 py-1"
      >
        Cancel
      </button>
    </div>
  );
};

// Commission Rate Calculator Modal Component
interface CommissionRateCalculatorModalProps {
  onClose: () => void;
  commissionRates: CommissionRate[];
  onRatesUpdate: () => void;
}

const CommissionRateCalculatorModal: React.FC<CommissionRateCalculatorModalProps> = ({
  onClose,
  commissionRates,
  onRatesUpdate,
}) => {
  const [salePrice, setSalePrice] = useState<number>(1000000);
  const [selectedRates, setSelectedRates] = useState({
    base: 2.5,
    project: 0,
    unitType: 0,
  });

  const effectiveRate = selectedRates.unitType || selectedRates.project || selectedRates.base;
  const calculatedCommission = (salePrice * effectiveRate) / 100;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-6 border w-full max-w-3xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Commission Rate Calculator</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Sale Price Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sale Price
            </label>
            <input
              type="number"
              value={salePrice}
              onChange={(e) => setSalePrice(parseFloat(e.target.value) || 0)}
              className="input-field w-full"
              placeholder="Enter sale price"
            />
          </div>

          {/* Rate Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <User className="h-4 w-4 mr-2 text-gray-500" />
                Base Rate (%)
              </label>
              <input
                type="number"
                value={selectedRates.base}
                onChange={(e) => setSelectedRates({...selectedRates, base: parseFloat(e.target.value) || 0})}
                className="input-field w-full"
                step="0.1"
                min="0"
                max="100"
              />
              <p className="text-xs text-gray-500">Broker's default commission rate</p>
            </div>

            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <Building className="h-4 w-4 mr-2 text-blue-500" />
                Project Rate (%)
              </label>
              <input
                type="number"
                value={selectedRates.project}
                onChange={(e) => setSelectedRates({...selectedRates, project: parseFloat(e.target.value) || 0})}
                className="input-field w-full"
                step="0.1"
                min="0"
                max="100"
              />
              <p className="text-xs text-gray-500">Project-specific override rate</p>
            </div>

            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <Home className="h-4 w-4 mr-2 text-purple-500" />
                Unit Type Rate (%)
              </label>
              <input
                type="number"
                value={selectedRates.unitType}
                onChange={(e) => setSelectedRates({...selectedRates, unitType: parseFloat(e.target.value) || 0})}
                className="input-field w-full"
                step="0.1"
                min="0"
                max="100"
              />
              <p className="text-xs text-gray-500">Unit type specific rate (highest priority)</p>
            </div>
          </div>

          {/* Calculation Results */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Calculation Results</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Sale Price</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(salePrice)}</p>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Effective Rate</p>
                <p className="text-xl font-bold text-blue-600">{effectiveRate.toFixed(2)}%</p>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedRates.unitType > 0 ? 'Unit Type Rate Applied' :
                   selectedRates.project > 0 ? 'Project Rate Applied' : 'Base Rate Applied'}
                </p>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Commission Amount</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(calculatedCommission)}</p>
              </div>
            </div>
            
            {/* Rate Hierarchy Visualization */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-3">Rate Hierarchy (highest priority wins):</p>
              <div className="flex items-center justify-center space-x-4">
                <div className={`px-3 py-2 rounded-lg text-sm ${
                  !selectedRates.project && !selectedRates.unitType 
                    ? 'bg-gray-800 text-white' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  Base: {selectedRates.base}%
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
                <div className={`px-3 py-2 rounded-lg text-sm ${
                  selectedRates.project > 0 && !selectedRates.unitType 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  Project: {selectedRates.project}%
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
                <div className={`px-3 py-2 rounded-lg text-sm ${
                  selectedRates.unitType > 0 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  Unit: {selectedRates.unitType}%
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
          <button onClick={onClose} className="btn-outline">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

interface CommissionDetailsModalProps {
  commission: Commission;
  onClose: () => void;
  onStatusUpdate: (status: CommissionStatus, reason?: string) => void;
  getStatusColor: (status: CommissionStatus) => string;
  getStatusLabel: (status: CommissionStatus) => string;
  getStatusIcon: (status: CommissionStatus) => React.ReactNode;
}

const CommissionDetailsModal: React.FC<CommissionDetailsModalProps> = ({
  commission,
  onClose,
  onStatusUpdate,
  getStatusColor,
  getStatusLabel,
  getStatusIcon,
}) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionForm, setShowRejectionForm] = useState(false);

  const handleReject = () => {
    if (rejectionReason.trim()) {
      onStatusUpdate(CommissionStatus.CANCELLED, rejectionReason);
    } else {
      toast.error('Please enter rejection reason');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Commission Details</h3>
            <div className="flex items-center">
              {getStatusIcon(commission.status)}
              <span className={`badge-${getStatusColor(commission.status)} ml-2`}>
                {getStatusLabel(commission.status)}
              </span>
            </div>
          </div>
          
          <div className="space-y-6">
            {/* Deal Information */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Deal Information</h4>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Client</p>
                    <p className="font-medium">{commission.deal.clientName}</p>
                    <p className="text-sm text-gray-500">{commission.deal.clientPhone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Project</p>
                    <p className="font-medium">{commission.deal.project.name}</p>
                    <p className="text-sm text-gray-500">{commission.deal.developer.name}</p>
                  </div>
                </div>
                {commission.deal.unitNumber && (
                  <div>
                    <p className="text-sm text-gray-600">Unit Number</p>
                    <p className="font-medium">{commission.deal.unitNumber}</p>
                  </div>
                )}
                {commission.deal.notes && (
                  <div>
                    <p className="text-sm text-gray-600">Deal Notes</p>
                    <p className="text-sm text-gray-800">{commission.deal.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Broker Information */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Broker Information</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-4">
                  <User className="h-8 w-8 text-gray-400" />
                  <div>
                    <p className="font-medium">{commission.deal.broker.fullName}</p>
                    <p className="text-sm text-gray-600">{commission.deal.broker.role}</p>
                    <p className="text-sm text-gray-500">{commission.deal.broker.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Details */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Financial Details</h4>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Sale Price</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(commission.deal.salePrice)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Commission Rate</p>
                    <p className="text-lg font-semibold text-byit-navy">
                      {commission.deal.developer.actualCommissionRate || 0}%
                    </p>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-medium text-gray-600">Total Commission</p>
                    <p className="text-2xl font-bold text-byit-orange">
                      {formatCurrency(commission.amount)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Timeline</h4>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Deal Date:</span>
                  <span className="text-sm font-medium">
                    {commission.deal.saleDate ? formatDate(commission.deal.saleDate) : 'Not specified'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Commission Created:</span>
                  <span className="text-sm font-medium">{formatDate(commission.createdAt)}</span>
                </div>
                {commission.approvedAt && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Approved Date:</span>
                    <span className="text-sm font-medium">{formatDate(commission.approvedAt)}</span>
                  </div>
                )}
                {commission.paidDate && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Payment Date:</span>
                    <span className="text-sm font-medium">{formatDate(commission.paidDate)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Rejection Reason */}
            {commission.rejectionReason && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Rejection Reason</h4>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <p className="text-sm text-red-800">{commission.rejectionReason}</p>
                </div>
              </div>
            )}

            {/* Rejection Form */}
            {showRejectionForm && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Rejection Reason</h4>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="input-field w-full"
                  rows={3}
                  placeholder="Enter commission rejection reason..."
                  required
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
            <button onClick={onClose} className="btn-outline">
              Close
            </button>
            
            <div className="flex space-x-3">
              {commission.status === CommissionStatus.PENDING && (
                <>
                  {showRejectionForm ? (
                    <>
                      <button
                        onClick={() => setShowRejectionForm(false)}
                        className="btn-outline"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleReject}
                        className="btn-error"
                        disabled={!rejectionReason.trim()}
                      >
                        Confirm Rejection
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setShowRejectionForm(true)}
                        className="btn-error flex items-center"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </button>
                      <button
                        onClick={() => onStatusUpdate(CommissionStatus.APPROVED)}
                        className="btn-success flex items-center"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </button>
                    </>
                  )}
                </>
              )}
              
              {commission.status === CommissionStatus.APPROVED && (
                <button
                  onClick={() => onStatusUpdate(CommissionStatus.PAID)}
                  className="btn-primary flex items-center"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Mark as Paid
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommissionsPage;
