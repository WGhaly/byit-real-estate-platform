'use client';

import React, { useState, useEffect } from 'react';
import { BrokerUser, BrokerRole } from '../../types';
import DashboardLayout from '../../components/DashboardLayout';
import CreateBrokerModal from '../../components/modals/CreateBrokerModal';
import { 
  Users,
  Plus, 
  Search, 
  Filter,
  TrendingUp,
  Crown,
  Award,
  ChevronRight,
  ChevronDown,
  Edit2,
  Trash2
} from 'lucide-react';

const BrokersPage = () => {
  const [brokers, setBrokers] = useState<BrokerUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<BrokerRole | 'ALL'>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedBroker, setExpandedBroker] = useState<string | null>(null);

  const toggleBroker = (brokerId: string) => {
    setExpandedBroker(expandedBroker === brokerId ? null : brokerId);
  };

  // Helper functions for commission calculations
  const getBrokerTotalCommissions = (broker: BrokerUser) => {
    return broker.commissions.reduce((total: number, commission: any) => total + commission.amount, 0);
  };

  const getBrokerPaidCommissions = (broker: BrokerUser) => {
    return broker.commissions
      .filter((commission: any) => commission.status === 'PAID')
      .reduce((total: number, commission: any) => total + commission.amount, 0);
  };

  const getBrokerSuccessRate = (broker: BrokerUser) => {
    const totalDeals = broker.deals.length;
    if (totalDeals === 0) return 0;
    const completedDeals = broker.deals.filter((deal: any) => deal.status === 'COMPLETED').length;
    return (completedDeals / totalDeals) * 100;
  };

  const getFirstName = (fullName: string) => {
    return fullName.split(' ')[0] || '';
  };

  const getLastName = (fullName: string) => {
    const parts = fullName.split(' ');
    return parts.slice(1).join(' ') || '';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getRoleIcon = (role: BrokerRole) => {
    switch (role) {
      case BrokerRole.SALES_MANAGER:
        return <Crown className="h-4 w-4 text-yellow-600" />;
      case BrokerRole.TEAM_LEADER:
        return <Award className="h-4 w-4 text-purple-600" />;
      default:
        return <Users className="h-4 w-4 text-blue-600" />;
    }
  };

  const getRoleLabel = (role: BrokerRole) => {
    switch (role) {
      case BrokerRole.SALES_MANAGER:
        return 'Sales Manager';
      case BrokerRole.TEAM_LEADER:
        return 'Team Leader';
      case BrokerRole.BROKER:
        return 'Broker';
      default:
        return 'Broker';
    }
  };

  const fetchBrokers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/brokers');
      if (response.ok) {
        const data = await response.json();
        setBrokers(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching brokers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBrokers();
  }, []);

  const filteredBrokers = brokers.filter(broker => {
    const matchesSearch = broker.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         broker.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'ALL' || broker.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
            <h1 className="text-2xl font-bold text-gray-900">Brokers Management</h1>
            <p className="text-gray-600">Manage your real estate brokers and track their performance</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Broker</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search brokers by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as BrokerRole | 'ALL')}
              className="input min-w-40"
            >
              <option value="ALL">All Roles</option>
              <option value={BrokerRole.SALES_MANAGER}>Sales Managers</option>
              <option value={BrokerRole.TEAM_LEADER}>Team Leaders</option>
              <option value={BrokerRole.BROKER}>Brokers</option>
            </select>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-50">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Brokers</p>
                  <p className="text-2xl font-bold text-gray-900">{brokers.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-50">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Brokers</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {brokers.filter(b => b.isActive).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-yellow-50">
                  <Crown className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Sales Managers</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {brokers.filter(b => b.role === 'SALES_MANAGER').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-50">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Team Leaders</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {brokers.filter(b => b.role === 'TEAM_LEADER').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Brokers Table */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Broker Performance Dashboard</h3>
          </div>
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Broker
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role & Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deals
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commissions Earned
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commissions Paid
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commissions Remaining
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Success Rate
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBrokers.map((broker) => {
                    const totalCommissions = getBrokerTotalCommissions(broker);
                    const paidCommissions = getBrokerPaidCommissions(broker);
                    const remainingCommissions = totalCommissions - paidCommissions;
                    const successRate = getBrokerSuccessRate(broker);
                    const firstName = getFirstName(broker.fullName);
                    const lastName = getLastName(broker.fullName);

                    return (
                      <tr key={broker.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {firstName.charAt(0)}{lastName.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {broker.fullName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {broker.email}
                              </div>
                              {broker.phone && (
                                <div className="text-xs text-gray-400">
                                  {broker.phone}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <div className="flex items-center">
                              {getRoleIcon(broker.role)}
                              <span className="ml-2 text-sm font-medium text-gray-900">
                                {getRoleLabel(broker.role)}
                              </span>
                            </div>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                              broker.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {broker.isActive ? 'Active' : 'Inactive'}
                            </span>
                            {broker.commissionRate && (
                              <span className="text-xs text-gray-500 mt-1">
                                {broker.commissionRate}% commission
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div className="font-medium">{broker.deals.length}</div>
                            <div className="text-xs text-gray-500">total deals</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div className="font-medium text-green-600">
                              {formatCurrency(totalCommissions)}
                            </div>
                            <div className="text-xs text-gray-500">lifetime earned</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div className="font-medium text-blue-600">
                              {formatCurrency(paidCommissions)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {totalCommissions > 0 
                                ? `${((paidCommissions / totalCommissions) * 100).toFixed(1)}%`
                                : '0%'
                              } of earned
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div className={`font-medium ${
                              remainingCommissions > 0 ? 'text-yellow-600' : 'text-gray-400'
                            }`}>
                              {formatCurrency(remainingCommissions)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {remainingCommissions > 0 ? 'pending payment' : 'up to date'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">
                                {successRate.toFixed(1)}%
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                <div 
                                  className={`h-2 rounded-full ${
                                    successRate >= 80 ? 'bg-green-500' :
                                    successRate >= 60 ? 'bg-yellow-500' :
                                    'bg-red-500'
                                  }`}
                                  style={{ width: `${Math.min(successRate, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button 
                              onClick={() => toggleBroker(broker.id)}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="View Details"
                            >
                              {expandedBroker === broker.id ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </button>
                            <button className="text-indigo-600 hover:text-indigo-900" title="Edit">
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900" title="Delete">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {filteredBrokers.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No brokers found
                </h3>
                <p className="text-gray-500 mb-4">
                  Add your first broker to get started
                </p>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="btn-primary"
                >
                  Add New Broker
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Create Broker Modal */}
        {showCreateModal && (
          <CreateBrokerModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              fetchBrokers();
            }}
            brokers={brokers}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default BrokersPage;
