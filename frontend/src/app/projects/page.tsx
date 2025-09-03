'use client';

import React, { useState, useEffect } from 'react';
import { api, formatCurrency } from '@/lib/api';
import { 
  Developer, 
  Project, 
  Category,
  UnitTypeModel,
  DeveloperForm,
  ProjectForm
} from '@/types';
import DashboardLayout from '@/components/DashboardLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { 
  Building2, 
  Plus, 
  Edit2, 
  Search,
  Users,
  Home,
  ChevronRight,
  ChevronDown,
  Settings,
  Tag,
  Check,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ProjectsPage: React.FC = () => {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [allUnitTypes, setAllUnitTypes] = useState<UnitTypeModel[]>([]);
  const [selectedDeveloper, setSelectedDeveloper] = useState<Developer | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDeveloperModal, setShowCreateDeveloperModal] = useState(false);
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [showInheritanceModal, setShowInheritanceModal] = useState(false);
  const [editingDeveloper, setEditingDeveloper] = useState<Developer | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [developersRes, categoriesRes, unitTypesRes] = await Promise.all([
        api.get('/developers?includeProjects=true'),
        api.get('/categories'),
        api.get('/unit-types')
      ]);
      
      setDevelopers(developersRes.data.data);
      setAllCategories(categoriesRes.data.data);
      setAllUnitTypes(unitTypesRes.data.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleProjectExpansion = (projectId: string) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  const toggleCategoryExpansion = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const filteredDevelopers = developers.filter(developer =>
    developer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (developer.projects && developer.projects.some(project => 
      project.name.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  );

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
            <h1 className="text-2xl font-bold text-gray-900">Projects & Developers Management</h1>
            <p className="text-gray-600 mt-1">
              Comprehensive management of developers, projects, categories and unit types
            </p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => setShowCreateDeveloperModal(true)}
              className="btn-primary flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Developer
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="card">
          <div className="card-body">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
                placeholder="Search developers and projects..."
              />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-50">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Developers</p>
                  <p className="text-2xl font-bold text-gray-900">{developers.length}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-50">
                  <Building2 className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Projects</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {developers.reduce((sum, dev) => sum + (dev.projects?.length || 0), 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-50">
                  <Tag className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Categories</p>
                  <p className="text-2xl font-bold text-gray-900">{allCategories.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-orange-50">
                  <Home className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Unit Types</p>
                  <p className="text-2xl font-bold text-gray-900">{allUnitTypes.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Developers List */}
        <div className="space-y-4">
          {filteredDevelopers.map((developer) => (
            <div key={developer.id} className="card">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-lg bg-blue-50">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{developer.name}</h3>
                      <p className="text-sm text-gray-600">
                        {developer.projects?.length || 0} projects • Commission Rate: {developer.actualCommissionRate || 0}%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedDeveloper(developer);
                        setShowCreateProjectModal(true);
                      }}
                      className="btn-outline btn-sm flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Project
                    </button>
                    <button
                      onClick={() => setEditingDeveloper(developer)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Projects */}
                {developer.projects && developer.projects.length > 0 && (
                  <div className="mt-4 ml-8 space-y-3">
                    {developer.projects.map((project) => (
                      <div key={project.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded bg-green-50">
                              <Building2 className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <h4 className="text-md font-medium text-gray-900">{project.name}</h4>
                              <p className="text-sm text-gray-600">
                                {project.categories?.length || 0} categories • Commission Rate: {project.actualCommissionRate || developer.actualCommissionRate || 0}%
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setSelectedProject(project);
                                setShowInheritanceModal(true);
                              }}
                              className="btn-outline btn-sm flex items-center"
                            >
                              <Settings className="h-4 w-4 mr-1" />
                              Manage
                            </button>
                            <button
                              onClick={() => setEditingProject(project)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredDevelopers.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No developers found
            </h3>
            <p className="text-gray-500 mb-4">
              Start by adding your first developer to the system
            </p>
            <button 
              onClick={() => setShowCreateDeveloperModal(true)}
              className="btn-primary"
            >
              Add New Developer
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateDeveloperModal && (
        <DeveloperModal
          onClose={() => setShowCreateDeveloperModal(false)}
          onSuccess={() => {
            setShowCreateDeveloperModal(false);
            fetchData();
          }}
        />
      )}

      {editingDeveloper && (
        <DeveloperModal
          developer={editingDeveloper}
          onClose={() => setEditingDeveloper(null)}
          onSuccess={() => {
            setEditingDeveloper(null);
            fetchData();
          }}
        />
      )}

      {showCreateProjectModal && selectedDeveloper && (
        <ProjectModal
          developer={selectedDeveloper}
          onClose={() => {
            setShowCreateProjectModal(false);
            setSelectedDeveloper(null);
          }}
          onSuccess={() => {
            setShowCreateProjectModal(false);
            setSelectedDeveloper(null);
            fetchData();
          }}
        />
      )}

      {editingProject && (
        <ProjectModal
          developer={editingProject.developer!}
          project={editingProject}
          onClose={() => setEditingProject(null)}
          onSuccess={() => {
            setEditingProject(null);
            fetchData();
          }}
        />
      )}

      {showInheritanceModal && selectedProject && (
        <InheritanceModal
          project={selectedProject}
          allCategories={allCategories}
          allUnitTypes={allUnitTypes}
          onClose={() => {
            setShowInheritanceModal(false);
            setSelectedProject(null);
          }}
          onSuccess={() => {
            setShowInheritanceModal(false);
            setSelectedProject(null);
            fetchData();
          }}
        />
      )}
    </DashboardLayout>
  );
};

// Modal Components
interface DeveloperModalProps {
  developer?: Developer;
  onClose: () => void;
  onSuccess: () => void;
}

const DeveloperModal: React.FC<DeveloperModalProps> = ({ developer, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<DeveloperForm>({
    name: developer?.name || '',
    description: developer?.description || '',
    contactEmail: developer?.contactEmail || '',
    contactPhone: developer?.contactPhone || '',
    address: developer?.address || '',
    website: developer?.website || '',
    commissionRate: developer?.actualCommissionRate || 2.5,
    isActive: developer?.isActive ?? true,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      
      if (developer) {
        await api.put(`/developers/${developer.id}`, formData);
        toast.success('Developer updated successfully');
      } else {
        await api.post('/developers', formData);
        toast.success('Developer created successfully');
      }
      
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {developer ? 'Edit Developer' : 'Add New Developer'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Developer Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Commission Rate (%) *
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              required
              value={formData.commissionRate}
              onChange={(e) => setFormData({...formData, commissionRate: parseFloat(e.target.value)})}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={formData.contactPhone}
              onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
              className="input-field"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
              className="h-4 w-4 text-byit-orange focus:ring-byit-orange border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
              Active
            </label>
          </div>

          <div className="flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="btn-outline">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="btn-primary">
              {isLoading ? 'Saving...' : (developer ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface ProjectModalProps {
  developer: Developer;
  project?: Project;
  onClose: () => void;
  onSuccess: () => void;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ developer, project, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<ProjectForm>({
    name: project?.name || '',
    description: project?.description || '',
    location: project?.location || '',
    address: project?.address || '',
    startDate: project?.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
    endDate: project?.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
    totalUnits: project?.totalUnits || undefined,
    minPrice: project?.minPrice || undefined,
    maxPrice: project?.maxPrice || undefined,
    commissionRate: project?.actualCommissionRate || undefined,
    isActive: project?.isActive ?? true,
    developerId: developer.id,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      
      const payload = {
        ...formData,
        actualCommissionRate: formData.commissionRate || undefined,
      };

      if (project) {
        await api.put(`/projects/${project.id}`, payload);
        toast.success('Project updated successfully');
      } else {
        await api.post('/projects', payload);
        toast.success('Project created successfully');
      }
      
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {project ? 'Edit Project' : `Add New Project - ${developer.name}`}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Commission Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.commissionRate || ''}
                onChange={(e) => setFormData({...formData, commissionRate: e.target.value ? parseFloat(e.target.value) : undefined})}
                className="input-field"
                placeholder={`Default: ${developer.actualCommissionRate}%`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Units
              </label>
              <input
                type="number"
                min="0"
                value={formData.totalUnits || ''}
                onChange={(e) => setFormData({...formData, totalUnits: e.target.value ? parseInt(e.target.value) : undefined})}
                className="input-field"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="projectActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
              className="h-4 w-4 text-byit-orange focus:ring-byit-orange border-gray-300 rounded"
            />
            <label htmlFor="projectActive" className="ml-2 text-sm text-gray-700">
              Active
            </label>
          </div>

          <div className="flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="btn-outline">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="btn-primary">
              {isLoading ? 'Saving...' : (project ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface InheritanceModalProps {
  project: Project;
  allCategories: Category[];
  allUnitTypes: UnitTypeModel[];
  onClose: () => void;
  onSuccess: () => void;
}

const InheritanceModal: React.FC<InheritanceModalProps> = ({ 
  project, 
  allCategories, 
  allUnitTypes, 
  onClose, 
  onSuccess 
}) => {
  const [selectedCategories, setSelectedCategories] = useState<{[key: string]: boolean}>({});
  const [selectedUnitTypes, setSelectedUnitTypes] = useState<{[key: string]: {[key: string]: boolean}}>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Initialize with existing project categories
    const catEnabled: {[key: string]: boolean} = {};
    const unitEnabled: {[key: string]: {[key: string]: boolean}} = {};

    project.categories?.forEach(pc => {
      catEnabled[pc.categoryId] = pc.isEnabled;
      unitEnabled[pc.categoryId] = {};
      pc.unitTypes.forEach(ut => {
        unitEnabled[pc.categoryId][ut.unitTypeId] = ut.isEnabled;
      });
    });

    setSelectedCategories(catEnabled);
    setSelectedUnitTypes(unitEnabled);
  }, [project]);

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));

    if (!selectedUnitTypes[categoryId]) {
      setSelectedUnitTypes(prev => ({
        ...prev,
        [categoryId]: {}
      }));
    }
  };

  const handleUnitTypeToggle = (categoryId: string, unitTypeId: string) => {
    setSelectedUnitTypes(prev => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        [unitTypeId]: !prev[categoryId]?.[unitTypeId]
      }
    }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);

      const categoryUpdates = Object.entries(selectedCategories).map(([categoryId, isEnabled]) => ({
        categoryId,
        isEnabled,
        unitTypes: Object.entries(selectedUnitTypes[categoryId] || {}).map(([unitTypeId, utEnabled]) => ({
          unitTypeId,
          isEnabled: utEnabled
        }))
      }));

      await api.put(`/projects/${project.id}/categories`, { categories: categoryUpdates });
      toast.success('Project inheritance updated successfully');
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update inheritance');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-5 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Manage Categories & Unit Types - {project.name}
        </h3>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {allCategories.map((category) => (
            <div key={category.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id={`cat-${category.id}`}
                    checked={selectedCategories[category.id] || false}
                    onChange={() => handleCategoryToggle(category.id)}
                    className="h-4 w-4 text-byit-orange focus:ring-byit-orange border-gray-300 rounded"
                  />
                  <label htmlFor={`cat-${category.id}`} className="text-sm font-medium text-gray-900">
                    {category.name}
                  </label>
                </div>
              </div>

              {selectedCategories[category.id] && (
                <div className="ml-6 space-y-2">
                  <h5 className="text-sm font-medium text-gray-700">Unit Types:</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {allUnitTypes.map((unitType) => (
                      <div key={unitType.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                        <input
                          type="checkbox"
                          id={`ut-${category.id}-${unitType.id}`}
                          checked={selectedUnitTypes[category.id]?.[unitType.id] || false}
                          onChange={() => handleUnitTypeToggle(category.id, unitType.id)}
                          className="h-3 w-3 text-byit-orange focus:ring-byit-orange border-gray-300 rounded"
                        />
                        <label htmlFor={`ut-${category.id}-${unitType.id}`} className="text-xs text-gray-900">
                          {unitType.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button type="button" onClick={onClose} className="btn-outline">
            Cancel
          </button>
          <button onClick={handleSave} disabled={isLoading} className="btn-primary">
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;
