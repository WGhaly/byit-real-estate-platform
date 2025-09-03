'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { BrokerRole, BrokerUser } from '../../types';

interface CreateBrokerModalProps {
  onClose: () => void;
  onSuccess: () => void;
  brokers: BrokerUser[];
}

const CreateBrokerModal: React.FC<CreateBrokerModalProps> = ({
  onClose,
  onSuccess,
  brokers
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phone: '',
    role: BrokerRole.BROKER as BrokerRole,
    isActive: true,
    commissionRate: '',
    teamLeaderId: ''
  });

  const teamLeaders = brokers.filter(broker => 
    broker.role === BrokerRole.TEAM_LEADER || broker.role === BrokerRole.SALES_MANAGER
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        commissionRate: formData.commissionRate ? parseFloat(formData.commissionRate) : undefined,
        teamLeaderId: formData.teamLeaderId || undefined
      };

      const response = await fetch('/api/brokers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        console.error('Error creating broker:', error);
        alert('Failed to create broker. Please try again.');
      }
    } catch (error) {
      console.error('Error creating broker:', error);
      alert('Failed to create broker. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl m-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Add New Broker</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username *
              </label>
              <input
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleInputChange}
                className="input w-full"
                placeholder="Enter username"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="input w-full"
                placeholder="Enter email address"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="input w-full"
                placeholder="Enter password"
              />
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleInputChange}
                className="input w-full"
                placeholder="Enter full name"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="input w-full"
                placeholder="Enter phone number"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role *
              </label>
              <select
                name="role"
                required
                value={formData.role}
                onChange={handleInputChange}
                className="input w-full"
              >
                <option value={BrokerRole.BROKER}>Broker</option>
                <option value={BrokerRole.TEAM_LEADER}>Team Leader</option>
                <option value={BrokerRole.SALES_MANAGER}>Sales Manager</option>
              </select>
            </div>

            {/* Commission Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commission Rate (%)
              </label>
              <input
                type="number"
                name="commissionRate"
                step="0.01"
                min="0"
                max="100"
                value={formData.commissionRate}
                onChange={handleInputChange}
                className="input w-full"
                placeholder="Enter commission rate"
              />
            </div>

            {/* Team Leader */}
            {formData.role === BrokerRole.BROKER && teamLeaders.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Leader
                </label>
                <select
                  name="teamLeaderId"
                  value={formData.teamLeaderId}
                  onChange={handleInputChange}
                  className="input w-full"
                >
                  <option value="">Select a team leader</option>
                  {teamLeaders.map(leader => (
                    <option key={leader.id} value={leader.id}>
                      {leader.fullName} ({leader.role.replace('_', ' ')})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Active Status */}
          <div className="mt-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm text-gray-700">
                Active (broker can log in and access the system)
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Broker'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBrokerModal;
