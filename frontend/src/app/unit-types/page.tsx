'use client';

import React, { useState, useEffect } from 'react';
import { api, formatCurrency } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Home, 
  Settings, 
  Save, 
  X,
  Check,
  AlertCircle,
  Calculator,
  DollarSign,
  TrendingUp,
  Percent,
  Tag
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Types
interface Project {
  id: string;
  name: string;
  code: string;
}

interface UnitTypePrice {
  id: string;
  unitTypeId: string;
  projectId: string;
  project: Project;
  basePrice: number;
  finalPrice: number;
  commissionRate?: number;
  discountPercentage?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UnitType {
  id: string;
  name: string;
  description?: string;
  defaultPrice?: number;
  defaultCommissionRate?: number;
  prices?: UnitTypePrice[];
  createdAt: string;
  updatedAt: string;
}

interface UnitTypeForm {
  name: string;
  defaultPrice: number;
  defaultCommissionRate: number;
}

interface PriceEditForm {
  basePrice: number;
  finalPrice: number;
  commissionRate: number;
  discountPercentage: number;
  isActive: boolean;
}

const UnitTypesPage: React.FC = () => {
  const [unitTypes, setUnitTypes] = useState<UnitType[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUnitType, setEditingUnitType] = useState<UnitType | null>(null);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [selectedUnitType, setSelectedUnitType] = useState<UnitType | null>(null);
  const [editingPrices, setEditingPrices] = useState<Map<string, PriceEditForm>>(new Map());
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [selectedPriceIds, setSelectedPriceIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchUnitTypes();
    fetchProjects();
  }, []);

  const fetchUnitTypes = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/unit-types');
      setUnitTypes(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch unit types:', error);
      toast.error('Failed to load unit types');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this unit type?')) return;
    
    try {
      await api.delete(`/unit-types/${id}`);
      toast.success('Unit type deleted successfully');
      fetchUnitTypes();
    } catch (error) {
      console.error('Failed to delete unit type:', error);
      toast.error('Failed to delete unit type');
    }
  };

  const startEditingPrice = (price: UnitTypePrice) => {
    const editForm: PriceEditForm = {
      basePrice: price.basePrice,
      finalPrice: price.finalPrice,
      commissionRate: price.commissionRate || 0,
      discountPercentage: price.discountPercentage || 0,
      isActive: price.isActive,
    };

    const newEditingPrices = new Map(editingPrices);
    newEditingPrices.set(price.id, editForm);
    setEditingPrices(newEditingPrices);
  };

  const cancelEditingPrice = (priceId: string) => {
    const newEditingPrices = new Map(editingPrices);
    newEditingPrices.delete(priceId);
    setEditingPrices(newEditingPrices);
  };

  const updateEditingPrice = (priceId: string, field: keyof PriceEditForm, value: any) => {
    const newEditingPrices = new Map(editingPrices);
    const editing = newEditingPrices.get(priceId);
    
    if (editing) {
      const updated = { ...editing, [field]: value };
      
      // Auto-calculate final price based on base price and discount
      if (field === 'basePrice' || field === 'discountPercentage') {
        const basePrice = field === 'basePrice' ? value : updated.basePrice;
        const discountPercent = field === 'discountPercentage' ? value : updated.discountPercentage;
        updated.finalPrice = basePrice * (1 - discountPercent / 100);
      }
      
      newEditingPrices.set(priceId, updated);
      setEditingPrices(newEditingPrices);
    }
  };

  const savePrice = async (priceId: string) => {
    const editingData = editingPrices.get(priceId);
    if (!editingData) return;

    try {
      await api.patch(`/unit-type-prices/${priceId}`, editingData);
      toast.success('Price updated successfully');
      fetchUnitTypes();
      cancelEditingPrice(priceId);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update price');
    }
  };

  const addPriceToProject = async (unitTypeId: string, projectId: string) => {
    const unitType = unitTypes.find(ut => ut.id === unitTypeId);
    if (!unitType) return;

    try {
      await api.post('/unit-type-prices', {
        unitTypeId,
        projectId,
        basePrice: unitType.defaultPrice || 1000000,
        finalPrice: unitType.defaultPrice || 1000000,
        commissionRate: unitType.defaultCommissionRate || 2.5,
        discountPercentage: 0,
        isActive: true,
      });
      toast.success('Price added to project successfully');
      fetchUnitTypes();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add price to project');
    }
  };

  const bulkUpdatePrices = async (updates: Partial<PriceEditForm>) => {
    try {
      await api.patch('/unit-type-prices/bulk-update', {
        priceIds: Array.from(selectedPriceIds),
        ...updates,
      });
      toast.success(`Updated ${selectedPriceIds.size} prices successfully`);
      fetchUnitTypes();
      setBulkEditMode(false);
      setSelectedPriceIds(new Set());
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to bulk update prices');
    }
  };

  const togglePriceSelection = (priceId: string) => {
    const newSelection = new Set(selectedPriceIds);
    if (newSelection.has(priceId)) {
      newSelection.delete(priceId);
    } else {
      newSelection.add(priceId);
    }
    setSelectedPriceIds(newSelection);
  };

  const getTotalPrices = () => {
    return unitTypes.reduce((total, unitType) => total + (unitType.prices?.length || 0), 0);
  };

  const getActivePrices = () => {
    return unitTypes.reduce((total, unitType) => 
      total + (unitType.prices?.filter(p => p.isActive).length || 0), 0
    );
  };

  const getAveragePrice = () => {
    const allPrices = unitTypes.flatMap(ut => ut.prices || []);
    if (allPrices.length === 0) return 0;
    return allPrices.reduce((sum, p) => sum + p.finalPrice, 0) / allPrices.length;
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
            <h1 className="text-2xl font-bold text-gray-900">Unit Types</h1>
            <p className="text-gray-600">Manage property unit types and pricing</p>
          </div>
          <div className="flex gap-3">
            {bulkEditMode && selectedPriceIds.size > 0 && (
              <BulkPriceEditor
                selectedCount={selectedPriceIds.size}
                onUpdate={bulkUpdatePrices}
                onCancel={() => {
                  setBulkEditMode(false);
                  setSelectedPriceIds(new Set());
                }}
              />
            )}
            <button
              onClick={() => setBulkEditMode(!bulkEditMode)}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                bulkEditMode
                  ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              {bulkEditMode ? 'Exit Bulk Edit' : 'Bulk Edit Prices'}
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Unit Type
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Home className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Unit Types</p>
                <p className="text-2xl font-semibold text-gray-900">{unitTypes.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-50 rounded-lg">
                <Tag className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Prices</p>
                <p className="text-2xl font-semibold text-gray-900">{getTotalPrices()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Prices</p>
                <p className="text-2xl font-semibold text-gray-900">{getActivePrices()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-50 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Price</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(getAveragePrice())}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Unit Types List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Unit Types</h2>
            
            {unitTypes.length === 0 ? (
              <div className="text-center py-12">
                <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No unit types found</h3>
                <p className="text-gray-600 mb-4">Get started by creating your first unit type.</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add Unit Type
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {unitTypes.map((unitType) => (
                  <div key={unitType.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{unitType.name}</h3>
                        {unitType.description && (
                          <p className="text-gray-600 mt-1">{unitType.description}</p>
                        )}
                        <div className="flex gap-4 mt-2">
                          <span className="text-sm text-gray-500">
                            Default Price: {formatCurrency(unitType.defaultPrice || 0)}
                          </span>
                          <span className="text-sm text-gray-500">
                            Default Commission: {unitType.defaultCommissionRate || 0}%
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedUnitType(unitType);
                            setShowPricingModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-md transition-colors"
                          title="Manage Pricing"
                        >
                          <DollarSign className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingUnitType(unitType)}
                          className="text-gray-600 hover:text-gray-700 p-2 hover:bg-gray-50 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(unitType.id)}
                          className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Project Prices */}
                    {unitType.prices && unitType.prices.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Project Pricing</h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                {bulkEditMode && (
                                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Select
                                  </th>
                                )}
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Project
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Base Price
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Discount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Final Price
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Commission
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
                              {unitType.prices.map((price) => {
                                const isEditing = editingPrices.has(price.id);
                                const editData = editingPrices.get(price.id);

                                return (
                                  <tr key={price.id} className="hover:bg-gray-50">
                                    {bulkEditMode && (
                                      <td className="px-3 py-4 whitespace-nowrap">
                                        <input
                                          type="checkbox"
                                          checked={selectedPriceIds.has(price.id)}
                                          onChange={() => togglePriceSelection(price.id)}
                                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                      </td>
                                    )}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm font-medium text-gray-900">
                                        {price.project.name}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {price.project.code}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      {isEditing ? (
                                        <input
                                          type="number"
                                          value={editData?.basePrice || 0}
                                          onChange={(e) => updateEditingPrice(price.id, 'basePrice', parseFloat(e.target.value) || 0)}
                                          className="w-32 px-3 py-1 border border-gray-300 rounded-md text-sm"
                                        />
                                      ) : (
                                        <span className="text-sm font-medium text-gray-900">
                                          {formatCurrency(price.basePrice)}
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      {isEditing ? (
                                        <div className="flex items-center gap-1">
                                          <input
                                            type="number"
                                            value={editData?.discountPercentage || 0}
                                            onChange={(e) => updateEditingPrice(price.id, 'discountPercentage', parseFloat(e.target.value) || 0)}
                                            className="w-20 px-3 py-1 border border-gray-300 rounded-md text-sm"
                                            step="0.1"
                                            min="0"
                                            max="100"
                                          />
                                          <Percent className="w-3 h-3 text-gray-400" />
                                        </div>
                                      ) : (
                                        <span className="text-sm text-gray-900">
                                          {price.discountPercentage || 0}%
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className="text-sm font-medium text-gray-900">
                                        {formatCurrency(isEditing ? editData?.finalPrice || 0 : price.finalPrice)}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      {isEditing ? (
                                        <div className="flex items-center gap-1">
                                          <input
                                            type="number"
                                            value={editData?.commissionRate || 0}
                                            onChange={(e) => updateEditingPrice(price.id, 'commissionRate', parseFloat(e.target.value) || 0)}
                                            className="w-20 px-3 py-1 border border-gray-300 rounded-md text-sm"
                                            step="0.1"
                                            min="0"
                                          />
                                          <Percent className="w-3 h-3 text-gray-400" />
                                        </div>
                                      ) : (
                                        <span className="text-sm text-gray-900">
                                          {price.commissionRate || 0}%
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      {isEditing ? (
                                        <label className="flex items-center">
                                          <input
                                            type="checkbox"
                                            checked={editData?.isActive || false}
                                            onChange={(e) => updateEditingPrice(price.id, 'isActive', e.target.checked)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                          />
                                          <span className="ml-2 text-sm text-gray-900">Active</span>
                                        </label>
                                      ) : (
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                          price.isActive
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                        }`}>
                                          {price.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                      {isEditing ? (
                                        <div className="flex gap-2">
                                          <button
                                            onClick={() => savePrice(price.id)}
                                            className="text-green-600 hover:text-green-700 p-1 hover:bg-green-50 rounded transition-colors"
                                            title="Save"
                                          >
                                            <Check className="w-4 h-4" />
                                          </button>
                                          <button
                                            onClick={() => cancelEditingPrice(price.id)}
                                            className="text-gray-600 hover:text-gray-700 p-1 hover:bg-gray-50 rounded transition-colors"
                                            title="Cancel"
                                          >
                                            <X className="w-4 h-4" />
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => startEditingPrice(price)}
                                          className="text-blue-600 hover:text-blue-700 p-1 hover:bg-blue-50 rounded transition-colors"
                                          title="Edit Price"
                                        >
                                          <Edit2 className="w-4 h-4" />
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Add Price to Project */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-3">
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              addPriceToProject(unitType.id, e.target.value);
                              e.target.value = '';
                            }
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                          defaultValue=""
                        >
                          <option value="">Add to project...</option>
                          {projects
                            .filter(project => !unitType.prices?.some(p => p.projectId === project.id))
                            .map(project => (
                              <option key={project.id} value={project.id}>
                                {project.name} ({project.code})
                              </option>
                            ))
                          }
                        </select>
                        <span className="text-sm text-gray-500">
                          Add this unit type to a project with default pricing
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Create/Edit Modal */}
        {(showCreateModal || editingUnitType) && (
          <UnitTypeModal
            unitType={editingUnitType}
            onClose={() => {
              setShowCreateModal(false);
              setEditingUnitType(null);
            }}
            onSuccess={() => {
              setShowCreateModal(false);
              setEditingUnitType(null);
              fetchUnitTypes();
            }}
          />
        )}

        {/* Pricing Management Modal */}
        {showPricingModal && selectedUnitType && (
          <PricingModal
            unitType={selectedUnitType}
            projects={projects}
            onClose={() => {
              setShowPricingModal(false);
              setSelectedUnitType(null);
            }}
            onSuccess={() => {
              fetchUnitTypes();
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

// Unit Type Create/Edit Modal Component
interface UnitTypeModalProps {
  unitType?: UnitType | null;
  onClose: () => void;
  onSuccess: () => void;
}

const UnitTypeModal: React.FC<UnitTypeModalProps> = ({ unitType, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<UnitTypeForm>({
    name: unitType?.name || '',
    defaultPrice: unitType?.defaultPrice || 1000000,
    defaultCommissionRate: unitType?.defaultCommissionRate || 2.5,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (unitType) {
        await api.patch(`/unit-types/${unitType.id}`, formData);
        toast.success('Unit type updated successfully');
      } else {
        await api.post('/unit-types', formData);
        toast.success('Unit type created successfully');
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save unit type');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {unitType ? 'Edit Unit Type' : 'Create Unit Type'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default Price
            </label>
            <input
              type="number"
              value={formData.defaultPrice}
              onChange={(e) => setFormData({ ...formData, defaultPrice: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              min="0"
              step="1000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default Commission Rate (%)
            </label>
            <input
              type="number"
              value={formData.defaultCommissionRate}
              onChange={(e) => setFormData({ ...formData, defaultCommissionRate: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              min="0"
              max="100"
              step="0.1"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : (unitType ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Bulk Price Editor Component
interface BulkPriceEditorProps {
  selectedCount: number;
  onUpdate: (updates: Partial<PriceEditForm>) => void;
  onCancel: () => void;
}

const BulkPriceEditor: React.FC<BulkPriceEditorProps> = ({ selectedCount, onUpdate, onCancel }) => {
  const [updates, setUpdates] = useState<Partial<PriceEditForm>>({});

  const handleUpdate = () => {
    onUpdate(updates);
    setUpdates({});
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900">Bulk Edit ({selectedCount} selected)</h4>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Commission Rate</label>
          <input
            type="number"
            placeholder="Leave empty to skip"
            value={updates.commissionRate || ''}
            onChange={(e) => setUpdates({
              ...updates,
              commissionRate: e.target.value ? parseFloat(e.target.value) : undefined
            })}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            step="0.1"
            min="0"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Discount %</label>
          <input
            type="number"
            placeholder="Leave empty to skip"
            value={updates.discountPercentage || ''}
            onChange={(e) => setUpdates({
              ...updates,
              discountPercentage: e.target.value ? parseFloat(e.target.value) : undefined
            })}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            step="0.1"
            min="0"
            max="100"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={updates.isActive !== undefined}
            onChange={(e) => setUpdates({
              ...updates,
              isActive: e.target.checked ? true : undefined
            })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-900">Set Active Status</span>
        </label>

        <button
          onClick={handleUpdate}
          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
        >
          Update All
        </button>
      </div>
    </div>
  );
};

// Pricing Management Modal Component
interface PricingModalProps {
  unitType: UnitType;
  projects: Project[];
  onClose: () => void;
  onSuccess: () => void;
}

const PricingModal: React.FC<PricingModalProps> = ({ unitType, projects, onClose, onSuccess }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Pricing Management - {unitType.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <span className="ml-2 text-sm font-medium text-blue-900">Default Price</span>
              </div>
              <p className="text-xl font-semibold text-blue-900 mt-1">
                {formatCurrency(unitType.defaultPrice || 0)}
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Percent className="w-5 h-5 text-green-600" />
                <span className="ml-2 text-sm font-medium text-green-900">Default Commission</span>
              </div>
              <p className="text-xl font-semibold text-green-900 mt-1">
                {unitType.defaultCommissionRate || 0}%
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Tag className="w-5 h-5 text-purple-600" />
                <span className="ml-2 text-sm font-medium text-purple-900">Active Prices</span>
              </div>
              <p className="text-xl font-semibold text-purple-900 mt-1">
                {unitType.prices?.filter(p => p.isActive).length || 0}
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Project Pricing Overview</h4>
            {unitType.prices && unitType.prices.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Project
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Base Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Final Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Commission
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {unitType.prices.map((price) => (
                      <tr key={price.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {price.project.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {price.project.code}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(price.basePrice)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(price.finalPrice)}
                          </span>
                          {price.discountPercentage && price.discountPercentage > 0 && (
                            <span className="ml-2 text-xs text-red-600">
                              (-{price.discountPercentage}%)
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {price.commissionRate || 0}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            price.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {price.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <Calculator className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No pricing configured for any projects yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnitTypesPage;
