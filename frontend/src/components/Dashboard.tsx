'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api, formatCurrency, formatNumber } from '@/lib/api';
import { DashboardStats, RevenueChart, TopPerformer } from '@/types';
import { 
  Building2, 
  Users, 
  DollarSign, 
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import DashboardLayout from './DashboardLayout';
import LoadingSpinner from './LoadingSpinner';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueChart[]>([]);
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [statsRes, revenueRes, performersRes] = await Promise.all([
        api.get('/analytics/dashboard-stats'),
        api.get('/analytics/revenue-chart'),
        api.get('/analytics/top-performers'),
      ]);

      setStats(statsRes.data.data);
      setRevenueData(revenueRes.data.data);
      setTopPerformers(performersRes.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
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
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-primary-950 to-primary-800 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold">Welcome, {user?.fullName}</h1>
          <p className="text-primary-200 mt-1">
            Main Dashboard - Real Estate Commission Management System
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Deals"
              value={formatNumber(stats.totalDeals)}
              icon={<Building2 className="h-6 w-6" />}
              color="blue"
            />
            <StatCard
              title="Total Commissions"
              value={formatCurrency(stats.totalCommissions)}
              icon={<DollarSign className="h-6 w-6" />}
              color="green"
            />
            <StatCard
              title="Pending Commissions"
              value={formatCurrency(stats.pendingCommissions)}
              icon={<Clock className="h-6 w-6" />}
              color="yellow"
            />
            <StatCard
              title="Active Brokers"
              value={`${formatNumber(stats.activeBrokers)} of ${formatNumber(stats.totalBrokers)}`}
              icon={<Users className="h-6 w-6" />}
              color="purple"
            />
          </div>
        )}

        {/* Charts and Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Monthly Revenue</h3>
            </div>
            <div className="card-body">
              {revenueData.length > 0 ? (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <TrendingUp className="h-8 w-8 mr-2" />
                  <span>Revenue Chart (Coming Soon)</span>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-400">
                  No data available
                </div>
              )}
            </div>
          </div>

          {/* Top Performers */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Top Brokers</h3>
            </div>
            <div className="card-body">
              {topPerformers.length > 0 ? (
                <div className="space-y-4">
                  {topPerformers.slice(0, 5).map((performer, index) => (
                    <div key={performer.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm font-medium text-primary-800">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{performer.name}</p>
                          <p className="text-sm text-gray-500">
                            {formatNumber(performer.deals)} deals
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {formatCurrency(performer.revenue)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatCurrency(performer.commissions)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center text-gray-400">
                  No data available
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
              <ActivityItem
                icon={<CheckCircle className="h-5 w-5 text-green-500" />}
                title="New deal created"
                description="Deal worth 2,500,000 EGP in New Cairo project"
                time="5 minutes ago"
              />
              <ActivityItem
                icon={<DollarSign className="h-5 w-5 text-blue-500" />}
                title="Commission paid"
                description="Commission of 125,000 EGP paid to broker Ahmed Mohamed"
                time="1 hour ago"
              />
              <ActivityItem
                icon={<AlertCircle className="h-5 w-5 text-yellow-500" />}
                title="Commission pending approval"
                description="Commission of 85,000 EGP requires approval"
                time="2 hours ago"
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'purple';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-500 text-blue-600 bg-blue-50',
    green: 'bg-green-500 text-green-600 bg-green-50',
    yellow: 'bg-yellow-500 text-yellow-600 bg-yellow-50',
    purple: 'bg-purple-500 text-purple-600 bg-purple-50',
  };

  return (
    <div className="card">
      <div className="card-body">
        <div className="flex items-center">
          <div className={`p-3 rounded-lg ${colorClasses[color].split(' ')[2]}`}>
            <div className={colorClasses[color].split(' ')[1]}>
              {icon}
            </div>
          </div>
          <div className="mr-4">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ActivityItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  time: string;
}

const ActivityItem: React.FC<ActivityItemProps> = ({
  icon,
  title,
  description,
  time,
}) => {
  return (
    <div className="flex items-start">
      <div className="flex-shrink-0 mr-4">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <div className="flex-shrink-0 text-sm text-gray-400">{time}</div>
    </div>
  );
};

export default Dashboard;
