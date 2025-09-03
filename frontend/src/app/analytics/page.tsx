'use client';

import React, { useState, useEffect } from 'react';
import { api, formatCurrency, formatDate } from '@/lib/api';
import { DashboardStats, RevenueChart, TopPerformer } from '@/types';
import DashboardLayout from '@/components/DashboardLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Users,
  Building2,
  Target,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Award,
  Star,
  Crown
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const AnalyticsPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueChart, setRevenueChart] = useState<RevenueChart[]>([]);
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const [statsRes, chartRes, performersRes] = await Promise.all([
        api.get('/analytics/dashboard-stats', {
          params: { from: dateRange.from, to: dateRange.to }
        }),
        api.get('/analytics/revenue-chart', {
          params: { from: dateRange.from, to: dateRange.to }
        }),
        api.get('/analytics/top-performers', {
          params: { from: dateRange.from, to: dateRange.to }
        }),
      ]);

      setStats(statsRes.data.data);
      setRevenueChart(chartRes.data.data);
      setTopPerformers(performersRes.data.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  const exportReport = async () => {
    try {
      const response = await api.get('/analytics/export-report', {
        params: { from: dateRange.from, to: dateRange.to },
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${dateRange.from}-${dateRange.to}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Report exported successfully');
    } catch (error) {
      toast.error('Failed to export report');
    }
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
            <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
            <p className="text-gray-600 mt-1">
              Comprehensive dashboard for performance and sales tracking
            </p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={fetchAnalytics}
              className="btn-outline flex items-center"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Refresh
            </button>
            <button 
              onClick={exportReport}
              className="btn-primary flex items-center"
            >
              <Download className="h-5 w-5 mr-2" />
              Export Report
            </button>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-700">Time Period:</span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                  className="input-field text-sm"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                  className="input-field text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-blue-50">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="mr-4">
                    <p className="text-sm font-medium text-gray-600">Total Sales</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(stats.monthlyRevenue)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {stats.totalDeals} deals
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-green-50">
                    <Target className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="mr-4">
                    <p className="text-sm font-medium text-gray-600">Total Commissions</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(stats.totalCommissions)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {stats.pendingCommissions} pending
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-purple-50">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="mr-4">
                    <p className="text-sm font-medium text-gray-600">Brokers</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalBrokers}</p>
                    <p className="text-xs text-gray-500">
                      {stats.activeBrokers} active
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-orange-50">
                    <Building2 className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="mr-4">
                    <p className="text-sm font-medium text-gray-600">Active Projects</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeProjects}</p>
                    <p className="text-xs text-gray-500">
                      from {stats.totalDevelopers} developers
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Revenue Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Monthly Sales Progress
              </h3>
            </div>
            <div className="card-body">
              {revenueChart.length > 0 ? (
                <div className="space-y-4">
                  {revenueChart.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium text-gray-900">{item.month}</p>
                        <p className="text-sm text-gray-600">{item.deals} deals</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{formatCurrency(item.revenue)}</p>
                        <p className="text-sm text-gray-600">{formatCurrency(item.commissions)} commission</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No data available for selected period</p>
                </div>
              )}
            </div>
          </div>

          {/* Top Performers */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Top Performing Brokers
              </h3>
            </div>
            <div className="card-body">
              {topPerformers.length > 0 ? (
                <div className="space-y-4">
                  {topPerformers.map((performer, index) => (
                    <div key={performer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 ml-3">
                          {index === 0 && <Crown className="h-6 w-6 text-yellow-500" />}
                          {index === 1 && <Star className="h-6 w-6 text-gray-400" />}
                          {index === 2 && <Award className="h-6 w-6 text-orange-500" />}
                          {index > 2 && (
                            <div className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-xs font-bold text-gray-600">{index + 1}</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{performer.name}</p>
                          <p className="text-sm text-gray-600">{performer.deals} deals</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{formatCurrency(performer.revenue)}</p>
                        <p className="text-sm text-gray-600">{formatCurrency(performer.commissions)} commission</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No performance data available for selected period</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Commission Status Breakdown */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Commission Status</h3>
            </div>
            <div className="card-body">
              {stats && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Pending</span>
                    <span className="font-medium text-yellow-600">{stats.pendingCommissions}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Approved</span>
                    <span className="font-medium text-green-600">
                      {stats.totalCommissions - stats.pendingCommissions}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Commissions</span>
                    <span className="font-bold text-gray-900">{stats.totalCommissions}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Activity Summary */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Activity Summary</h3>
            </div>
            <div className="card-body">
              {stats && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">New Deals</span>
                    <span className="font-medium text-blue-600">{stats.totalDeals}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Active Brokers</span>
                    <span className="font-medium text-green-600">{stats.activeBrokers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Active Projects</span>
                    <span className="font-medium text-purple-600">{stats.activeProjects}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
            </div>
            <div className="card-body">
              {stats && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Average Deal Value</span>
                    <span className="font-medium text-gray-900">
                      {stats.totalDeals > 0 
                        ? formatCurrency(stats.monthlyRevenue / stats.totalDeals)
                        : formatCurrency(0)
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Commission Rate</span>
                    <span className="font-medium text-gray-900">
                      {stats.monthlyRevenue > 0 
                        ? ((stats.totalCommissions / stats.monthlyRevenue) * 100).toFixed(1)
                        : '0'
                      }%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Productivity</span>
                    <span className="font-medium text-gray-900">
                      {stats.activeBrokers > 0 
                        ? (stats.totalDeals / stats.activeBrokers).toFixed(1)
                        : '0'
                      } deals/broker
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="flex items-center p-3 bg-blue-50 rounded">
                <div className="p-2 rounded bg-blue-100">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">New deals today</p>
                  <p className="text-xs text-gray-600">Several new deals have been added</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-green-50 rounded">
                <div className="p-2 rounded bg-green-100">
                  <Target className="h-4 w-4 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Commissions approved</p>
                  <p className="text-xs text-gray-600">Pending commissions have been processed</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-purple-50 rounded">
                <div className="p-2 rounded bg-purple-100">
                  <Users className="h-4 w-4 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">New brokers</p>
                  <p className="text-xs text-gray-600">New brokers have been added to the team</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage;
