'use client';

import React, { useState, useEffect } from 'react';
import { api, formatDate } from '@/lib/api';
import { User, UserRole, BrokerUser, BrokerRole } from '@/types';
import DashboardLayout from '@/components/DashboardLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { 
  Users, 
  Plus, 
  Edit2, 
  Trash2,
  Eye,
  Search,
  Filter,
  UserCheck,
  UserX,
  Shield,
  Crown,
  Star,
  User as UserIcon,
  Settings,
  Key,
  Calendar
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const UsersPage: React.FC = () => {
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [brokerUsers, setBrokerUsers] = useState<BrokerUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'admin' | 'broker'>('admin');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [editingUser, setEditingUser] = useState<User | BrokerUser | null>(null);
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    search: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const [adminRes, brokerRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/brokers'),
      ]);

      setAdminUsers(adminRes.data.data);
      setBrokerUsers(brokerRes.data.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('فشل في تحميل المستخدمين');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleIcon = (role: UserRole | BrokerRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return <Crown className="h-4 w-4 text-purple-600" />;
      case UserRole.MANAGER:
        return <Shield className="h-4 w-4 text-blue-600" />;
      case UserRole.SENIOR_USER:
        return <Star className="h-4 w-4 text-yellow-600" />;
      case UserRole.JUNIOR_USER:
        return <UserIcon className="h-4 w-4 text-gray-600" />;
      case BrokerRole.SALES_MANAGER:
        return <Crown className="h-4 w-4 text-purple-600" />;
      case BrokerRole.TEAM_LEADER:
        return <Shield className="h-4 w-4 text-blue-600" />;
      case BrokerRole.BROKER:
        return <UserIcon className="h-4 w-4 text-gray-600" />;
      default:
        return <UserIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleLabel = (role: UserRole | BrokerRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return 'مدير عام';
      case UserRole.MANAGER:
        return 'مدير';
      case UserRole.SENIOR_USER:
        return 'مستخدم كبير';
      case UserRole.JUNIOR_USER:
        return 'مستخدم صغير';
      case BrokerRole.SALES_MANAGER:
        return 'مدير مبيعات';
      case BrokerRole.TEAM_LEADER:
        return 'قائد فريق';
      case BrokerRole.BROKER:
        return 'وسيط';
      default:
        return role;
    }
  };

  const toggleUserStatus = async (userId: string, userType: 'admin' | 'broker') => {
    try {
      const endpoint = userType === 'admin' ? `/admin/users/${userId}/toggle-status` : `/brokers/${userId}/toggle-status`;
      await api.patch(endpoint);
      toast.success('تم تحديث حالة المستخدم بنجاح');
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'فشل في تحديث حالة المستخدم');
    }
  };

  const filteredAdminUsers = adminUsers.filter((user) => {
    if (filters.role && user.role !== filters.role) return false;
    if (filters.status === 'active' && !user.isActive) return false;
    if (filters.status === 'inactive' && user.isActive) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        user.fullName.toLowerCase().includes(searchLower) ||
        user.username.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const filteredBrokerUsers = brokerUsers.filter((user) => {
    if (filters.role && user.role !== filters.role) return false;
    if (filters.status === 'active' && !user.isActive) return false;
    if (filters.status === 'inactive' && user.isActive) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        user.fullName.toLowerCase().includes(searchLower) ||
        user.username.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const currentUsers = activeTab === 'admin' ? filteredAdminUsers : filteredBrokerUsers;

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
            <h1 className="text-2xl font-bold text-gray-900">إدارة المستخدمين</h1>
            <p className="text-gray-600 mt-1">
              إدارة مستخدمي النظام والوسطاء
            </p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="btn-outline flex items-center"
            >
              <Filter className="h-5 w-5 ml-2" />
              تصفية
            </button>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center"
            >
              <Plus className="h-5 w-5 ml-2" />
              مستخدم جديد
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-50">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">مستخدمي النظام</p>
                  <p className="text-2xl font-bold text-gray-900">{adminUsers.length}</p>
                  <p className="text-xs text-gray-500">
                    {adminUsers.filter(u => u.isActive).length} نشط
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-50">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">الوسطاء</p>
                  <p className="text-2xl font-bold text-gray-900">{brokerUsers.length}</p>
                  <p className="text-xs text-gray-500">
                    {brokerUsers.filter(u => u.isActive).length} نشط
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-50">
                  <Crown className="h-6 w-6 text-purple-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">المديرين</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {[...adminUsers.filter(u => u.role === UserRole.SUPER_ADMIN || u.role === UserRole.MANAGER),
                      ...brokerUsers.filter(u => u.role === BrokerRole.SALES_MANAGER)].length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-yellow-50">
                  <UserCheck className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">المستخدمين النشطين</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {adminUsers.filter(u => u.isActive).length + brokerUsers.filter(u => u.isActive).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="card">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('admin')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'admin'
                    ? 'border-byit-orange text-byit-orange'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <Shield className="h-4 w-4 ml-2" />
                  مستخدمي النظام ({adminUsers.length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab('broker')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'broker'
                    ? 'border-byit-orange text-byit-orange'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <Users className="h-4 w-4 ml-2" />
                  الوسطاء ({brokerUsers.length})
                </div>
              </button>
            </nav>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    البحث
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) => setFilters({...filters, search: e.target.value})}
                      className="input-field pl-10"
                      placeholder="الاسم، اسم المستخدم، البريد الإلكتروني"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الدور
                  </label>
                  <select
                    value={filters.role}
                    onChange={(e) => setFilters({...filters, role: e.target.value})}
                    className="input-field"
                  >
                    <option value="">جميع الأدوار</option>
                    {activeTab === 'admin' ? (
                      <>
                        <option value={UserRole.SUPER_ADMIN}>مدير عام</option>
                        <option value={UserRole.MANAGER}>مدير</option>
                        <option value={UserRole.SENIOR_USER}>مستخدم كبير</option>
                        <option value={UserRole.JUNIOR_USER}>مستخدم صغير</option>
                      </>
                    ) : (
                      <>
                        <option value={BrokerRole.SALES_MANAGER}>مدير مبيعات</option>
                        <option value={BrokerRole.TEAM_LEADER}>قائد فريق</option>
                        <option value={BrokerRole.BROKER}>وسيط</option>
                      </>
                    )}
                  </select>
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
                    <option value="active">نشط</option>
                    <option value="inactive">غير نشط</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => setFilters({
                      role: '',
                      status: '',
                      search: '',
                    })}
                    className="btn-outline w-full"
                  >
                    مسح الفلاتر
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المستخدم
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الدور
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    آخر دخول
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تاريخ الإنشاء
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    إجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <UserIcon className="h-5 w-5 text-gray-500" />
                          </div>
                        </div>
                        <div className="mr-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.fullName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.username} • {user.email}
                          </div>
                          {user.phone && (
                            <div className="text-xs text-gray-400">
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getRoleIcon(user.role)}
                        <span className="mr-2 text-sm text-gray-900">
                          {getRoleLabel(user.role)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? (
                          <>
                            <UserCheck className="h-3 w-3 ml-1" />
                            نشط
                          </>
                        ) : (
                          <>
                            <UserX className="h-3 w-3 ml-1" />
                            غير نشط
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 ml-1" />
                        {user.lastLogin ? formatDate(user.lastLogin) : 'لم يدخل بعد'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="text-blue-600 hover:text-blue-900"
                          title="تعديل"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toggleUserStatus(user.id, activeTab)}
                          className={`${
                            user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                          }`}
                          title={user.isActive ? 'إلغاء التفعيل' : 'تفعيل'}
                        >
                          {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </button>
                        <button
                          className="text-gray-600 hover:text-gray-900"
                          title="إعدادات"
                        >
                          <Settings className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {currentUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              لا توجد مستخدمين
            </h3>
            <p className="text-gray-500 mb-4">
              ابدأ بإضافة أول مستخدم في النظام
            </p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              إضافة مستخدم جديد
            </button>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <UserModal
          userType={activeTab}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchUsers();
          }}
          brokers={brokerUsers}
        />
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <UserModal
          user={editingUser}
          userType={activeTab}
          onClose={() => setEditingUser(null)}
          onSuccess={() => {
            setEditingUser(null);
            fetchUsers();
          }}
          brokers={brokerUsers}
        />
      )}
    </DashboardLayout>
  );
};

interface UserModalProps {
  user?: User | BrokerUser;
  userType: 'admin' | 'broker';
  onClose: () => void;
  onSuccess: () => void;
  brokers: BrokerUser[];
}

const UserModal: React.FC<UserModalProps> = ({ user, userType, onClose, onSuccess, brokers }) => {
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    role: user?.role || (userType === 'admin' ? UserRole.JUNIOR_USER : BrokerRole.BROKER),
    password: '',
    confirmPassword: '',
    isActive: user?.isActive ?? true,
    commissionRate: (user as BrokerUser)?.commissionRate || undefined,
    teamLeaderId: (user as BrokerUser)?.teamLeaderId || '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const adminRoles = [
    { value: UserRole.SUPER_ADMIN, label: 'مدير عام' },
    { value: UserRole.MANAGER, label: 'مدير' },
    { value: UserRole.SENIOR_USER, label: 'مستخدم كبير' },
    { value: UserRole.JUNIOR_USER, label: 'مستخدم صغير' },
  ];

  const brokerRoles = [
    { value: BrokerRole.SALES_MANAGER, label: 'مدير مبيعات' },
    { value: BrokerRole.TEAM_LEADER, label: 'قائد فريق' },
    { value: BrokerRole.BROKER, label: 'وسيط' },
  ];

  const roles = userType === 'admin' ? adminRoles : brokerRoles;

  const teamLeaders = brokers.filter(broker => 
    broker.role === BrokerRole.TEAM_LEADER || broker.role === BrokerRole.SALES_MANAGER
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user && formData.password !== formData.confirmPassword) {
      toast.error('كلمات المرور غير متطابقة');
      return;
    }

    try {
      setIsLoading(true);
      
      const payload = {
        username: formData.username,
        email: formData.email,
        fullName: formData.fullName,
        phone: formData.phone || undefined,
        role: formData.role,
        isActive: formData.isActive,
        ...(userType === 'broker' && {
          commissionRate: formData.commissionRate || undefined,
          teamLeaderId: formData.teamLeaderId || undefined,
        }),
        ...(!user && { password: formData.password }),
      };

      const endpoint = userType === 'admin' ? '/admin/users' : '/brokers';
      
      if (user) {
        await api.put(`${endpoint}/${user.id}`, payload);
        toast.success('تم تحديث المستخدم بنجاح');
      } else {
        await api.post(endpoint, payload);
        toast.success('تم إنشاء المستخدم بنجاح');
      }
      
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'فشل في حفظ البيانات');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {user ? 'تعديل المستخدم' : `إضافة ${userType === 'admin' ? 'مستخدم نظام' : 'وسيط'} جديد`}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              اسم المستخدم *
            </label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الاسم الكامل *
            </label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              البريد الإلكتروني *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              رقم الهاتف
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الدور *
            </label>
            <select
              required
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value as UserRole | BrokerRole})}
              className="input-field"
            >
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          {userType === 'broker' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  معدل العمولة (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.commissionRate || ''}
                  onChange={(e) => setFormData({...formData, commissionRate: e.target.value ? parseFloat(e.target.value) : undefined})}
                  className="input-field"
                />
              </div>

              {formData.role === BrokerRole.BROKER && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    قائد الفريق
                  </label>
                  <select
                    value={formData.teamLeaderId}
                    onChange={(e) => setFormData({...formData, teamLeaderId: e.target.value})}
                    className="input-field"
                  >
                    <option value="">اختر قائد الفريق</option>
                    {teamLeaders.map((leader) => (
                      <option key={leader.id} value={leader.id}>
                        {leader.fullName} ({leader.role === BrokerRole.SALES_MANAGER ? 'مدير مبيعات' : 'قائد فريق'})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          {!user && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  كلمة المرور *
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="input-field"
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  تأكيد كلمة المرور *
                </label>
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className="input-field"
                  minLength={6}
                />
              </div>
            </>
          )}

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
              className="h-4 w-4 text-byit-orange focus:ring-byit-orange border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="mr-2 text-sm text-gray-700">
              نشط
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="btn-outline">
              إلغاء
            </button>
            <button type="submit" disabled={isLoading} className="btn-primary">
              {isLoading ? 'جاري الحفظ...' : (user ? 'تحديث' : 'إنشاء')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UsersPage;
