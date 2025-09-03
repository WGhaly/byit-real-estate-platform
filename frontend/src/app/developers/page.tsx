'use client';

import React, { useState, useEffect } from 'react';
import { api, formatCurrency } from '@/lib/api';
import { Developer, Project } from '@/types';
import DashboardLayout from '@/components/DashboardLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { 
  Building2, 
  Plus, 
  Edit2, 
  Trash2,
  ChevronDown,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  Globe,
  TrendingUp
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const DevelopersPage: React.FC = () => {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedDeveloper, setExpandedDeveloper] = useState<string | null>(null);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  useEffect(() => {
    fetchDevelopers();
  }, []);

  const fetchDevelopers = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/developers?includeProjects=true');
      setDevelopers(response.data.data);
    } catch (error) {
      console.error('Failed to fetch developers:', error);
      toast.error('Failed to load developers data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProjectDetails = async (projectId: string) => {
    try {
      const response = await api.get(`/projects/${projectId}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch project details:', error);
      return null;
    }
  };

  const toggleDeveloper = (developerId: string) => {
    setExpandedDeveloper(expandedDeveloper === developerId ? null : developerId);
    setExpandedProject(null); // Close any expanded project
  };

  const toggleProject = (projectId: string) => {
    setExpandedProject(expandedProject === projectId ? null : projectId);
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
            <h1 className="text-2xl font-bold text-gray-900">Developer Management</h1>
            <p className="text-gray-600 mt-1">
              Manage real estate developers and their projects in the Egyptian market
            </p>
          </div>
          <button className="btn-primary flex items-center">
            <Plus className="h-5 w-5 ml-2" />
            Add New Developer
          </button>
        </div>

        {/* Developers List */}
        <div className="space-y-4">
          {developers.map((developer) => (
            <DeveloperCard
              key={developer.id}
              developer={developer}
              isExpanded={expandedDeveloper === developer.id}
              onToggle={() => toggleDeveloper(developer.id)}
              expandedProject={expandedProject}
              onToggleProject={toggleProject}
            />
          ))}
        </div>

        {developers.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No developers registered
            </h3>
            <p className="text-gray-500 mb-4">
              Start by adding the first real estate developer in the system
            </p>
            <button className="btn-primary">
              Add New Developer
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

interface DeveloperCardProps {
  developer: Developer;
  isExpanded: boolean;
  onToggle: () => void;
  expandedProject: string | null;
  onToggleProject: (projectId: string) => void;
}

const DeveloperCard: React.FC<DeveloperCardProps> = ({
  developer,
  isExpanded,
  onToggle,
  expandedProject,
  onToggleProject,
}) => {
  return (
    <div className="card">
      {/* Developer Header */}
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center cursor-pointer" onClick={onToggle}>
            {isExpanded ? (
              <ChevronDown className="h-5 w-5 text-gray-500 ml-2" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-500 ml-2" />
            )}
            <div className="flex items-center">
              <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center ml-3">
                <Building2 className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {developer.name}
                </h3>
                <p className="text-sm text-gray-500">
                  Commission Rate: {developer.actualCommissionRate || 0}%
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`badge-${developer.isActive ? 'success' : 'error'}`}>
              {developer.isActive ? 'Active' : 'Inactive'}
            </span>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <Edit2 className="h-4 w-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-red-600">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Developer Details */}
      {isExpanded && (
        <div className="card-body border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Developer Info */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Developer Information</h4>
              <div className="space-y-3">
                {developer.description && (
                  <p className="text-gray-600">{developer.description}</p>
                )}
                {developer.contactEmail && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Mail className="h-4 w-4 ml-2" />
                    {developer.contactEmail}
                  </div>
                )}
                {developer.contactPhone && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Phone className="h-4 w-4 ml-2" />
                    {developer.contactPhone}
                  </div>
                )}
                {developer.address && (
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 ml-2" />
                    {developer.address}
                  </div>
                )}
                {developer.website && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Globe className="h-4 w-4 ml-2" />
                    <a 
                      href={developer.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:underline"
                    >
                      {developer.website}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Statistics</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Number of Projects:</span>
                  <span className="font-medium">{developer.projects?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Commission Rate:</span>
                  <span className="font-medium">{developer.actualCommissionRate || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`badge-${developer.isActive ? 'success' : 'error'}`}>
                    {developer.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Projects */}
          {developer.projects && developer.projects.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">
                Projects ({developer.projects.length})
              </h4>
              <div className="space-y-3">
                {developer.projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    isExpanded={expandedProject === project.id}
                    onToggle={() => onToggleProject(project.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface ProjectCardProps {
  project: Project;
  isExpanded: boolean;
  onToggle: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  isExpanded,
  onToggle,
}) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [editingCommission, setEditingCommission] = useState<{
    type: 'project' | 'category' | 'unitType';
    id: string;
    value: number;
  } | null>(null);

  const handleCommissionEdit = (type: 'project' | 'category' | 'unitType', id: string, currentValue: number) => {
    setEditingCommission({ type, id, value: currentValue });
  };

  const handleCommissionSave = async () => {
    if (!editingCommission) return;
    
    try {
      const { type, id, value } = editingCommission;
      let endpoint = '';
      
      switch (type) {
        case 'project':
          endpoint = `/projects/${id}`;
          break;
        case 'category':
          endpoint = `/project-categories/${id}`;
          break;
        case 'unitType':
          endpoint = `/project-unit-types/${id}`;
          break;
      }
      
      await api.patch(endpoint, { commissionRate: value });
      toast.success('Commission rate updated successfully');
      
      // Refresh data
      window.location.reload();
    } catch (error) {
      console.error('Failed to update commission rate:', error);
      toast.error('Failed to update commission rate');
    } finally {
      setEditingCommission(null);
    }
  };

  const handleCommissionCancel = () => {
    setEditingCommission(null);
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center cursor-pointer" onClick={onToggle}>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-gray-500 ml-2" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-500 ml-2" />
          )}
          <div>
            <h5 className="font-medium text-gray-900">{project.name}</h5>
            <p className="text-sm text-gray-500">{project.location}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Commission:</span>
            {editingCommission?.type === 'project' && editingCommission?.id === project.id ? (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={editingCommission.value}
                  onChange={(e) => setEditingCommission({
                    ...editingCommission,
                    value: parseFloat(e.target.value) || 0
                  })}
                  className="w-16 px-1 py-0.5 text-xs border rounded"
                  step="0.1"
                  min="0"
                  max="100"
                />
                <span className="text-xs">%</span>
                <button
                  onClick={handleCommissionSave}
                  className="text-green-600 hover:text-green-700"
                >
                  ✓
                </button>
                <button
                  onClick={handleCommissionCancel}
                  className="text-red-600 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleCommissionEdit('project', project.id, project.actualCommissionRate || 0)}
                className="text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                {project.actualCommissionRate || 0}%
              </button>
            )}
          </div>
          <span className={`badge-${project.isActive ? 'success' : 'error'}`}>
            {project.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
          {/* Project Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              {project.description && (
                <p className="text-sm text-gray-600">{project.description}</p>
              )}
              {project.address && (
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-3 w-3 ml-1" />
                  {project.address}
                </div>
              )}
              {project.totalUnits && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Units:</span>
                  <span className="font-medium">{project.totalUnits}</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              {project.minPrice && project.maxPrice && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Price Range:</span>
                  <span className="font-medium">
                    {formatCurrency(project.minPrice)} - {formatCurrency(project.maxPrice)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Categories:</span>
                <span className="font-medium">{project.categories?.length || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Deals:</span>
                <span className="font-medium">{project.deals?.length || 0}</span>
              </div>
            </div>
          </div>

          {/* Categories Hierarchy */}
          {project.categories && project.categories.length > 0 && (
            <div>
              <h6 className="font-medium text-gray-900 mb-3">Categories</h6>
              <div className="space-y-2">
                {project.categories.map((category) => (
                  <div key={category.id} className="bg-white rounded-lg p-3 border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center cursor-pointer" 
                           onClick={() => setExpandedCategory(
                             expandedCategory === category.id ? null : category.id
                           )}>
                        {expandedCategory === category.id ? (
                          <ChevronDown className="h-3 w-3 text-gray-500 ml-2" />
                        ) : (
                          <ChevronRight className="h-3 w-3 text-gray-500 ml-2" />
                        )}
                        <span className="font-medium text-gray-800">{category.category.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">Commission:</span>
                        {editingCommission?.type === 'category' && editingCommission?.id === category.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={editingCommission.value}
                              onChange={(e) => setEditingCommission({
                                ...editingCommission,
                                value: parseFloat(e.target.value) || 0
                              })}
                              className="w-14 px-1 py-0.5 text-xs border rounded"
                              step="0.1"
                              min="0"
                              max="100"
                            />
                            <span className="text-xs">%</span>
                            <button
                              onClick={handleCommissionSave}
                              className="text-green-600 hover:text-green-700"
                            >
                              ✓
                            </button>
                            <button
                              onClick={handleCommissionCancel}
                              className="text-red-600 hover:text-red-700"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleCommissionEdit('category', category.id, category.actualCommissionRate || 0)}
                            className="text-xs font-medium text-primary-600 hover:text-primary-700"
                          >
                            {category.actualCommissionRate || 0}%
                          </button>
                        )}
                      </div>
                    </div>

                    {expandedCategory === category.id && category.unitTypes && category.unitTypes.length > 0 && (
                      <div className="mt-3 pl-4 space-y-2">
                        <div className="text-sm font-medium text-gray-700 mb-2">Unit Types</div>
                        {category.unitTypes.map((unitType) => (
                          <div key={unitType.id} className="bg-gray-50 rounded p-2 flex items-center justify-between">
                            <div>
                              <span className="text-sm font-medium text-gray-700">{unitType.unitType.name}</span>
                              <span className="text-xs text-gray-500 ml-2">({unitType.unitType.name})</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-600">Commission:</span>
                              {editingCommission?.type === 'unitType' && editingCommission?.id === unitType.id ? (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    value={editingCommission.value}
                                    onChange={(e) => setEditingCommission({
                                      ...editingCommission,
                                      value: parseFloat(e.target.value) || 0
                                    })}
                                    className="w-14 px-1 py-0.5 text-xs border rounded"
                                    step="0.1"
                                    min="0"
                                    max="100"
                                  />
                                  <span className="text-xs">%</span>
                                  <button
                                    onClick={handleCommissionSave}
                                    className="text-green-600 hover:text-green-700"
                                  >
                                    ✓
                                  </button>
                                  <button
                                    onClick={handleCommissionCancel}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleCommissionEdit('unitType', unitType.id, unitType.actualCommissionRate || 0)}
                                  className="text-xs font-medium text-primary-600 hover:text-primary-700"
                                >
                                  {unitType.actualCommissionRate || 0}%
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DevelopersPage;
