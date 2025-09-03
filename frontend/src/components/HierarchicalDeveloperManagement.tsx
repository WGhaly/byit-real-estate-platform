import React, { useState, useEffect } from 'react';
import { ChevronDownIcon, ChevronRightIcon, BuildingOfficeIcon, HomeIcon, CurrencyDollarIcon, EyeIcon, PencilIcon, PlusIcon } from '@heroicons/react/24/outline';

interface UnitType {
  id: string;
  name: string;
  size: string;
  price: string;
  available: number;
  total: number;
  commissionRate: number;
}

interface Category {
  id: string;
  name: string;
  unitTypes: UnitType[];
  totalUnits: number;
  availableUnits: number;
  commissionRate: number;
}

interface Project {
  id: string;
  name: string;
  location: string;
  status: string;
  categories: Category[];
  totalUnits: number;
  availableUnits: number;
  commissionRate: number;
  bonusCommissionRate: number;
  priceRange: string;
}

interface Developer {
  id: string;
  name: string;
  logo: string;
  establishedYear: number;
  projects: Project[];
  totalProjects: number;
  totalUnits: number;
  actualCommissionRate: number;
  bonusCommissionRate: number;
  headquarters: string;
}

const HierarchicalDeveloperManagement: React.FC = () => {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [expandedDevelopers, setExpandedDevelopers] = useState<Set<string>>(new Set());
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [editingCommission, setEditingCommission] = useState<{
    type: 'developer' | 'project' | 'category' | 'unitType';
    id: string;
    field: 'commission' | 'bonus';
    value: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDevelopers();
  }, []);

  const fetchDevelopers = async () => {
    try {
      const response = await fetch('/api/developers?include=projects');
      const data = await response.json();
      setDevelopers(data.developers || []);
    } catch (error) {
      console.error('Error fetching developers:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpansion = (type: 'developer' | 'project' | 'category', id: string) => {
    const setters = {
      developer: setExpandedDevelopers,
      project: setExpandedProjects,
      category: setExpandedCategories
    };

    const currentSet = {
      developer: expandedDevelopers,
      project: expandedProjects,
      category: expandedCategories
    }[type];

    const setter = setters[type];
    const newSet = new Set(currentSet);
    
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    
    setter(newSet);
  };

  const handleCommissionEdit = (
    type: 'developer' | 'project' | 'category' | 'unitType',
    id: string,
    field: 'commission' | 'bonus',
    currentValue: number
  ) => {
    setEditingCommission({ type, id, field, value: currentValue });
  };

  const saveCommissionEdit = async () => {
    if (!editingCommission) return;

    try {
      const endpoint = `/api/${editingCommission.type}s/${editingCommission.id}/commission`;
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          field: editingCommission.field,
          value: editingCommission.value
        })
      });

      if (response.ok) {
        await fetchDevelopers(); // Refresh data
        setEditingCommission(null);
      }
    } catch (error) {
      console.error('Error updating commission:', error);
    }
  };

  const cancelCommissionEdit = () => {
    setEditingCommission(null);
  };

  const CommissionEditor: React.FC<{
    value: number;
    isEditing: boolean;
    onEdit: () => void;
    suffix?: string;
  }> = ({ value, isEditing, onEdit, suffix = '%' }) => {
    if (isEditing) {
      return (
        <div className="flex items-center space-x-2">
          <input
            type="number"
            step="0.1"
            min="0"
            max="10"
            value={editingCommission?.value || value}
            onChange={(e) => setEditingCommission(prev => 
              prev ? { ...prev, value: parseFloat(e.target.value) || 0 } : null
            )}
            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-byit-primary focus:border-transparent"
            autoFocus
          />
          <button
            onClick={saveCommissionEdit}
            className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
          >
            Save
          </button>
          <button
            onClick={cancelCommissionEdit}
            className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      );
    }

    return (
      <button
        onClick={onEdit}
        className="flex items-center space-x-1 px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded group"
      >
        <span>{value}{suffix}</span>
        <PencilIcon className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
    );
  };

  const DeveloperCard: React.FC<{ developer: Developer }> = ({ developer }) => {
    const isExpanded = expandedDevelopers.has(developer.id);

    return (
      <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
        {/* Developer Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => toggleExpansion('developer', developer.id)}
                className="flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100"
              >
                {isExpanded ? (
                  <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronRightIcon className="w-5 h-5 text-gray-500" />
                )}
              </button>
              
              <div className="w-12 h-12 bg-gradient-to-br from-byit-primary to-byit-secondary rounded-lg flex items-center justify-center">
                <BuildingOfficeIcon className="w-6 h-6 text-white" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{developer.name}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Established: {developer.establishedYear}</span>
                  <span>HQ: {developer.headquarters}</span>
                  <span>{developer.totalProjects} Projects</span>
                  <span>{developer.totalUnits} Units</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">Default Commission</div>
                <CommissionEditor
                  value={developer.actualCommissionRate}
                  isEditing={editingCommission?.type === 'developer' && editingCommission?.id === developer.id && editingCommission?.field === 'commission'}
                  onEdit={() => handleCommissionEdit('developer', developer.id, 'commission', developer.actualCommissionRate)}
                />
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-500">Bonus Commission</div>
                <CommissionEditor
                  value={developer.bonusCommissionRate}
                  isEditing={editingCommission?.type === 'developer' && editingCommission?.id === developer.id && editingCommission?.field === 'bonus'}
                  onEdit={() => handleCommissionEdit('developer', developer.id, 'bonus', developer.bonusCommissionRate)}
                />
              </div>

              <button className="flex items-center space-x-2 px-3 py-2 text-sm text-byit-primary border border-byit-primary rounded hover:bg-byit-primary hover:text-white transition-colors">
                <EyeIcon className="w-4 h-4" />
                <span>View Details</span>
              </button>
            </div>
          </div>
        </div>

        {/* Projects List */}
        {isExpanded && (
          <div className="p-4 space-y-3">
            {developer.projects.map((project) => (
              <ProjectCard key={project.id} project={project} developerId={developer.id} />
            ))}
            
            <button className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 border-2 border-dashed border-gray-300 rounded hover:border-byit-primary hover:text-byit-primary transition-colors w-full">
              <PlusIcon className="w-4 h-4" />
              <span>Add New Project</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  const ProjectCard: React.FC<{ project: Project; developerId: string }> = ({ project, developerId }) => {
    const isExpanded = expandedProjects.has(project.id);

    return (
      <div className="border border-gray-100 rounded-lg bg-gray-50 ml-8">
        {/* Project Header */}
        <div className="p-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => toggleExpansion('project', project.id)}
                className="flex items-center justify-center w-6 h-6 rounded hover:bg-gray-200"
              >
                {isExpanded ? (
                  <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRightIcon className="w-4 h-4 text-gray-500" />
                )}
              </button>
              
              <div className="w-8 h-8 bg-byit-primary rounded flex items-center justify-center">
                <HomeIcon className="w-4 h-4 text-white" />
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900">{project.name}</h4>
                <div className="flex items-center space-x-3 text-xs text-gray-500">
                  <span>{project.location}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    project.status === 'UNDER_CONSTRUCTION' ? 'bg-yellow-100 text-yellow-800' :
                    project.status === 'READY' ? 'bg-green-100 text-green-800' :
                    project.status === 'DELIVERED' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {project.status === 'UNDER_CONSTRUCTION' ? 'Under Construction' :
                     project.status === 'READY' ? 'Ready' :
                     project.status === 'DELIVERED' ? 'Delivered' : 'Planning'}
                  </span>
                  <span>{project.availableUnits}/{project.totalUnits} Available Units</span>
                  <span>{project.priceRange}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-xs text-gray-500">Project Commission</div>
                <CommissionEditor
                  value={project.commissionRate}
                  isEditing={editingCommission?.type === 'project' && editingCommission?.id === project.id && editingCommission?.field === 'commission'}
                  onEdit={() => handleCommissionEdit('project', project.id, 'commission', project.commissionRate)}
                />
              </div>
              
              <div className="text-right">
                <div className="text-xs text-gray-500">Bonus Commission</div>
                <CommissionEditor
                  value={project.bonusCommissionRate}
                  isEditing={editingCommission?.type === 'project' && editingCommission?.id === project.id && editingCommission?.field === 'bonus'}
                  onEdit={() => handleCommissionEdit('project', project.id, 'bonus', project.bonusCommissionRate)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Categories List */}
        {isExpanded && (
          <div className="p-3 space-y-2">
            {project.categories?.map((category) => (
              <CategoryCard key={category.id} category={category} projectId={project.id} />
            ))}
            
            <button className="flex items-center space-x-2 px-3 py-2 text-xs text-gray-600 border border-dashed border-gray-300 rounded hover:border-byit-primary hover:text-byit-primary transition-colors w-full">
              <PlusIcon className="w-3 h-3" />
              <span>Add New Category</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  const CategoryCard: React.FC<{ category: Category; projectId: string }> = ({ category, projectId }) => {
    const isExpanded = expandedCategories.has(category.id);

    return (
      <div className="border border-gray-100 rounded bg-white ml-6">
        {/* Category Header */}
        <div className="p-2 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => toggleExpansion('category', category.id)}
                className="flex items-center justify-center w-5 h-5 rounded hover:bg-gray-100"
              >
                {isExpanded ? (
                  <ChevronDownIcon className="w-3 h-3 text-gray-500" />
                ) : (
                  <ChevronRightIcon className="w-3 h-3 text-gray-500" />
                )}
              </button>
              
              <div className="w-6 h-6 bg-byit-secondary rounded flex items-center justify-center">
                <CurrencyDollarIcon className="w-3 h-3 text-white" />
              </div>
              
              <div>
                <h5 className="text-sm font-medium text-gray-900">{category.name}</h5>
                <div className="text-xs text-gray-500">
                  {category.availableUnits}/{category.totalUnits} Available Units
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-gray-500">Category Commission</div>
              <CommissionEditor
                value={category.commissionRate}
                isEditing={editingCommission?.type === 'category' && editingCommission?.id === category.id && editingCommission?.field === 'commission'}
                onEdit={() => handleCommissionEdit('category', category.id, 'commission', category.commissionRate)}
              />
            </div>
          </div>
        </div>

        {/* Unit Types List */}
        {isExpanded && (
          <div className="p-2 space-y-1">
            {category.unitTypes?.map((unitType) => (
              <UnitTypeCard key={unitType.id} unitType={unitType} categoryId={category.id} />
            ))}
            
            <button className="flex items-center space-x-2 px-2 py-1 text-xs text-gray-600 border border-dashed border-gray-300 rounded hover:border-byit-primary hover:text-byit-primary transition-colors w-full">
              <PlusIcon className="w-3 h-3" />
              <span>Add Unit Type</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  const UnitTypeCard: React.FC<{ unitType: UnitType; categoryId: string }> = ({ unitType, categoryId }) => {
    return (
      <div className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-100 ml-4">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gradient-to-br from-byit-primary to-byit-secondary rounded"></div>
          <div>
            <div className="text-sm font-medium text-gray-900">{unitType.name}</div>
            <div className="text-xs text-gray-500">
              {unitType.size} • {unitType.price} • {unitType.available}/{unitType.total} Available
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-gray-500">Unit Commission</div>
          <CommissionEditor
            value={unitType.commissionRate}
            isEditing={editingCommission?.type === 'unitType' && editingCommission?.id === unitType.id && editingCommission?.field === 'commission'}
            onEdit={() => handleCommissionEdit('unitType', unitType.id, 'commission', unitType.commissionRate)}
          />
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-byit-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hierarchical Developer Management</h1>
          <p className="text-gray-600">Manage developers, projects, categories and commission rates</p>
        </div>
        
        <button className="flex items-center space-x-2 px-4 py-2 bg-byit-primary text-white rounded-lg hover:bg-byit-primary/90 transition-colors">
          <PlusIcon className="w-5 h-5" />
          <span>Add New Developer</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-byit-primary">{developers.length}</div>
          <div className="text-sm text-gray-600">Total Developers</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-byit-primary">
            {developers.reduce((sum, dev) => sum + dev.totalProjects, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Projects</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-byit-primary">
            {developers.reduce((sum, dev) => sum + dev.totalUnits, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Units</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-byit-primary">
            {developers.length > 0 
              ? (developers.reduce((sum, dev) => sum + dev.actualCommissionRate, 0) / developers.length).toFixed(1)
              : '0'
            }%
          </div>
          <div className="text-sm text-gray-600">Average Commission</div>
        </div>
      </div>

      {/* Developers List */}
      <div className="space-y-4">
        {developers.length > 0 ? (
          developers.map((developer) => (
            <DeveloperCard key={developer.id} developer={developer} />
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <BuildingOfficeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Developers Found</h3>
            <p className="text-gray-600 mb-4">Start by adding your first developer to manage projects and commissions</p>
            <button className="px-4 py-2 bg-byit-primary text-white rounded-lg hover:bg-byit-primary/90">
              Add New Developer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HierarchicalDeveloperManagement;
