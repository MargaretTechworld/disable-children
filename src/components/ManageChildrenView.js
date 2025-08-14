import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { IonIcon } from '@ionic/react';
import { 
  eyeOutline, 
  createOutline, 
  trashOutline, 
  downloadOutline, 
  searchOutline, 
  closeCircleOutline,
  refreshOutline,
  alertCircleOutline,
} from 'ionicons/icons';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { format, parseISO } from 'date-fns';

// Styles
import '../styles/ManageChildrenView.css';

// Components
import ViewChildModal from './ViewChildModal';
import EditChildModal from './EditChildModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';

// Constants
const ROWS_PER_PAGE = 10;

// Define all possible fields for filtering and display based on the Child model
const CHILD_FIELDS = [
  // Child's Basic Information
  { 
    id: 'childFirstName', 
    label: 'First Name', 
    type: 'text',
    category: 'basic',
    filterable: true,
    sortable: true,
    required: true
  },
  { 
    id: 'childMiddleName', 
    label: 'Middle Name', 
    type: 'text',
    category: 'basic',
    filterable: false
  },
  { 
    id: 'childLastName', 
    label: 'Last Name', 
    type: 'text',
    category: 'basic',
    filterable: true,
    sortable: true,
    required: true
  },
  { 
    id: 'dob', 
    label: 'Date of Birth', 
    type: 'date',
    category: 'basic',
    filterable: true,
    sortable: true,
    format: (value) => value ? format(parseISO(value), 'MMM d, yyyy') : 'N/A',
    required: true
  },
  { 
    id: 'gender', 
    label: 'Gender', 
    type: 'select', 
    options: ['Male', 'Female', 'Other', 'Prefer not to say'],
    category: 'basic',
    filterable: true
  },
  { 
    id: 'address', 
    label: 'Address', 
    type: 'text',
    category: 'basic',
    filterable: true
  },
  
  // Parent/Guardian Information
  { 
    id: 'parentFirstName', 
    label: 'Parent First Name', 
    type: 'text',
    category: 'parent',
    filterable: true,
    required: true
  },
  { 
    id: 'parentLastName', 
    label: 'Parent Last Name', 
    type: 'text',
    category: 'parent',
    filterable: true,
    required: true
  },
  { 
    id: 'relationship', 
    label: 'Relationship to Child', 
    type: 'text',
    category: 'parent',
    filterable: true
  },
  { 
    id: 'contactNumber', 
    label: 'Contact Number', 
    type: 'tel',
    category: 'contact',
    filterable: true,
    required: true
  },
  { 
    id: 'email', 
    label: 'Email', 
    type: 'email',
    category: 'contact',
    filterable: true,
    required: true
  },
  
  // Disability Information
  { 
    id: 'disabilityType', 
    label: 'Disability Type', 
    type: 'text',
    category: 'disability',
    filterable: true
  },
  { 
    id: 'disabilitySeverity', 
    label: 'Disability Severity', 
    type: 'select', 
    options: ['Mild', 'Moderate', 'Severe'],
    category: 'disability',
    filterable: true
  },
  { 
    id: 'specialNeeds', 
    label: 'Special Needs', 
    type: 'textarea',
    category: 'disability'
  },
  
  // Medical Information
  { 
    id: 'medicalConditions', 
    label: 'Medical Conditions', 
    type: 'textarea',
    category: 'medical'
  },
  { 
    id: 'medications', 
    label: 'Medications', 
    type: 'textarea',
    category: 'medical'
  },
  { 
    id: 'allergies', 
    label: 'Allergies', 
    type: 'text',
    category: 'medical',
    filterable: true
  },
  
  // Educational Information
  { 
    id: 'school', 
    label: 'School', 
    type: 'text',
    category: 'education',
    filterable: true
  },
  { 
    id: 'grade', 
    label: 'Grade', 
    type: 'text',
    category: 'education'
  },
  { 
    id: 'iep', 
    label: 'IEP', 
    type: 'text',
    category: 'education',
    description: 'Individualized Education Program'
  },
  
  // Emergency Information
  { 
    id: 'emergencyContactName', 
    label: 'Emergency Contact', 
    type: 'text',
    category: 'emergency',
    required: true
  },
  { 
    id: 'emergencyContactNumber', 
    label: 'Emergency Phone', 
    type: 'tel',
    category: 'emergency',
    required: true
  },
  
  // Additional Information
  { 
    id: 'communicationMethod', 
    label: 'Preferred Communication', 
    type: 'text',
    category: 'additional'
  },
  { 
    id: 'additionalNotes', 
    label: 'Additional Notes', 
    type: 'textarea',
    category: 'additional'
  },
  
  // System Fields (not shown in forms but used in exports)
  { 
    id: 'createdAt', 
    label: 'Date Registered', 
    type: 'date',
    category: 'system',
    format: (value) => format(parseISO(value), 'MMM d, yyyy')
  },
  { 
    id: 'updatedAt', 
    label: 'Last Updated', 
    type: 'date',
    category: 'system',
    format: (value) => format(parseISO(value), 'MMM d, yyyy')
  },
  { 
    id: 'isActive', 
    label: 'Status', 
    type: 'boolean',
    category: 'system',
    format: (value) => value ? 'Active' : 'Inactive',
    filterable: true
  }
];

// Helper function to get field by ID
const getFieldById = (fieldId) => {
  return CHILD_FIELDS.find(field => field.id === fieldId) || { id: fieldId, label: fieldId, type: 'text' };
};

// Get filterable fields for dropdown
const FILTERABLE_FIELDS = CHILD_FIELDS.filter(field => field.filterable);

const ManageChildrenView = () => {
  // Data state
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter state
  const [filterField, setFilterField] = useState('childFirstName');
  const [filterValue, setFilterValue] = useState('');
  const [filterType, setFilterType] = useState('contains');
  const [activeFilters, setActiveFilters] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // UI state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(ROWS_PER_PAGE);
  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'desc'
  });
  
  // Modal state
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);
  
  // Refs
  const filterInputRef = useRef(null);
  const filterContainerRef = useRef(null);
  
  // Get field configuration for the current filter field
  const currentFieldConfig = useMemo(() => 
    CHILD_FIELDS.find(field => field.id === filterField) || {}
  , [filterField]);

  // Fetch children data from API
  const fetchChildren = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setIsRefreshing(true);
      
      const token = localStorage.getItem('token');
      const config = { 
        headers: { 
          'x-auth-token': token,
          'Accept': 'application/json'
        },
        params: { limit: 100 }, // Increase limit to get more records if needed
        withCredentials: true
      };
      
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await axios.get(`${apiUrl}/api/children`, config);
      
      // Transform data if needed (e.g., format dates, add computed fields)
      const processedData = Array.isArray(response.data) 
        ? response.data.map(child => ({
            ...child,
            fullName: `${child.childFirstName || ''} ${child.childLastName || ''}`.trim(),
            parentFullName: `${child.parentFirstName || ''} ${child.parentLastName || ''}`.trim(),
            age: child.dob ? calculateAge(parseISO(child.dob)) : null,
            formattedDob: child.dob ? format(parseISO(child.dob), 'MMM d, yyyy') : 'N/A',
            formattedCreatedAt: child.createdAt ? format(parseISO(child.createdAt), 'MMM d, yyyy') : 'N/A',
            id: child.id || child._id // Handle both id and _id for MongoDB compatibility
          }))
        : [];
      
      setChildren(processedData);
      setError('');
      return processedData;
    } catch (err) {
      console.error('Error details:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
      
      let errorMessage = 'Failed to fetch children data. ';
      
      if (err.code === 'ECONNABORTED') {
        errorMessage += 'Request timed out. Please check your internet connection.';
      } else if (err.response) {
        // Server responded with a status other than 2xx
        if (err.response.status === 401) {
          errorMessage = 'Your session has expired. Please log in again.';
          // Optionally redirect to login
          // navigate('/login');
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to view this data.';
        } else if (err.response.status === 404) {
          errorMessage = 'The requested resource was not found.';
        } else if (err.response.status >= 500) {
          errorMessage = 'A server error occurred. Please try again later.';
        }
      } else if (err.request) {
        // Request was made but no response was received
        errorMessage += 'No response from server. Please check your internet connection.';
      } else {
        // Something happened in setting up the request
        errorMessage += err.message || 'An unknown error occurred.';
      }
      
      setError(errorMessage);
      setChildren([]); // Clear children to avoid showing stale data
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  // Apply filters and sorting to children data
  const applyFiltersAndSorting = useCallback((data, filters, sortConfig) => {
    if (!data || !Array.isArray(data)) return [];
    
    let result = [...data];
    
    // Apply active filters
    if (filters && filters.length > 0) {
      result = result.filter(child => {
        return filters.every(filter => {
          if (!filter.field || !filter.value) return true;
          
          const fieldValue = String(child[filter.field] || '').toLowerCase();
          const filterValue = String(filter.value).toLowerCase();
          
          switch (filter.type) {
            case 'exact':
              return fieldValue === filterValue;
            case 'startsWith':
              return fieldValue.startsWith(filterValue);
            case 'endsWith':
              return fieldValue.endsWith(filterValue);
            case 'contains':
            default:
              return fieldValue.includes(filterValue);
          }
        });
      });
    }
    
    // Apply sorting
    if (sortConfig && sortConfig.key) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue === bValue) return 0;
        
        const compareResult = 
          typeof aValue === 'string' && typeof bValue === 'string'
            ? aValue.localeCompare(bValue)
            : aValue > bValue ? 1 : -1;
            
        return sortConfig.direction === 'asc' ? compareResult : -compareResult;
      });
    }
    
    return result;
  }, []);
  
  // Handle filter changes
  const handleAddFilter = useCallback(() => {
    if (!filterField || !filterValue.trim()) return;
    
    const newFilter = {
      id: `${filterField}-${Date.now()}`,
      field: filterField,
      value: filterValue.trim(),
      type: filterType,
      label: getFieldById(filterField).label
    };
    
    setActiveFilters(prev => [...prev, newFilter]);
    setFilterValue('');
    setCurrentPage(1); // Reset to first page when filters change
  }, [filterField, filterValue, filterType]);
  
  // Remove a filter
  const handleRemoveFilter = useCallback((filterId) => {
    setActiveFilters(prev => prev.filter(f => f.id !== filterId));
    setCurrentPage(1);
  }, []);
  
  // Clear all filters
  const handleClearAllFilters = useCallback(() => {
    setActiveFilters([]);
    setFilterValue('');
    setCurrentPage(1);
  }, []);
  
  // Handle sort
  const handleSort = useCallback((key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1);
  }, []);
  
  // Calculate filtered and sorted children
  const filteredChildren = useMemo(() => {
    if (!activeFilters || activeFilters.length === 0) {
      return children;
    }
    return applyFiltersAndSorting(children, activeFilters, sortConfig);
  }, [children, activeFilters, sortConfig, applyFiltersAndSorting]);
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredChildren.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredChildren.slice(indexOfFirstRow, indexOfLastRow);
  
  // Initial data fetch
  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);
  
  // Focus the filter input when the filter field changes
  useEffect(() => {
    if (filterInputRef.current) {
      filterInputRef.current.focus();
    }
  }, [filterField]);
  
  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterContainerRef.current && !filterContainerRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Helper function to calculate age from date of birth
  const calculateAge = (dob) => {
    if (!dob) return null;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Modal and Action Handlers
  const handleCloseModals = () => {
    setViewModalOpen(false);
    setEditModalOpen(false);
    setDeleteModalOpen(false);
    setSelectedChild(null);
  };

  const handleViewClick = (child) => {
    setSelectedChild(child);
    setViewModalOpen(true);
  };

  const handleEditClick = (child) => {
    setSelectedChild(child);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (child) => {
    setSelectedChild(child);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedChild) return;
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      await axios.delete(`http://localhost:5000/api/children/${selectedChild.id}`, config);
      setChildren(children.filter(c => c.id !== selectedChild.id));
      handleCloseModals(); // Only close on success
    } catch (err) {
      console.error('Error details:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
      setError('Failed to delete child record. Please try again.');
    }
  };

  const handleConfirmUpdate = async (updatedData) => {
    if (!selectedChild) return;
    try {
      const token = localStorage.getItem('token');
      const config = { 
        headers: { 
          'x-auth-token': token,
          'Content-Type': 'application/json'  // Explicitly set content type
        } 
      };
      
      // Ensure URL has a trailing slash
      const url = `http://localhost:5000/api/children/${selectedChild.id}/`.replace(/([^:]\/)\/+/g, '$1');
      
      const res = await axios.put(url, updatedData, config);
      
      setChildren(children.map(c => (c.id === selectedChild.id ? res.data : c)));
      handleCloseModals();
    } catch (err) {
      console.error('Error details:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
      setError('Failed to update child record. Please try again.');
    }
  };
  const handleEditFromView = (child) => {
    handleCloseModals();
    handleEditClick(child);
  };

  const handleDeleteFromView = (child) => {
    handleCloseModals();
    handleDeleteClick(child);
  };

  // Filtering Logic
  const handleFilter = () => {
    if (filterValue.trim()) {
      const newFilter = {
        id: `${filterField}-${Date.now()}`,
        field: filterField, 
        value: filterValue.trim(),
        type: filterType,
        label: getFieldById(filterField).label
      };
      setActiveFilters(prev => [...prev, newFilter]);
      setFilterValue('');
      setCurrentPage(1);
    }
  };

  const handleClear = () => {
    setFilterValue('');
    setActiveFilters([]);
    setFilterType('contains');
    setCurrentPage(1);
  };
  
  const handleRefresh = () => {
    fetchChildren(false);
  };

  const applyFilter = (child, field, value, type) => {
    if (!value) return true;
    
    const fieldValue = child[field];
    if (fieldValue === undefined || fieldValue === null) return false;
    
    const strValue = String(fieldValue).toLowerCase();
    const searchValue = String(value).toLowerCase();
    
    switch (type) {
      case 'exact':
        return strValue === searchValue;
      case 'startsWith':
        return strValue.startsWith(searchValue);
      case 'endsWith':
        return strValue.endsWith(searchValue);
      case 'contains':
      default:
        return strValue.includes(searchValue);
    }
  };
  
  // Row selection
  const toggleSelectRow = (childId) => {
    const newSelectedRows = new Set(selectedRows);
    if (selectedRows.has(childId)) {
      newSelectedRows.delete(childId);
    } else {
      newSelectedRows.add(childId);
    }
    setSelectedRows(newSelectedRows);
    setSelectAll(false);
  };
  
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedRows(new Set());
    } else {
      const allIds = new Set(filteredChildren.map(child => child.id));
      setSelectedRows(allIds);
    }
    setSelectAll(!selectAll);
  };
  
  // Export to Excel
  const exportToExcel = (data, fileName = 'children_export.xlsx') => {
    setExporting(true);
    
    try {
      // Prepare data for export with proper field mapping
      const exportData = data.map(child => {
        const row = {};
        CHILD_FIELDS.forEach(field => {
          // Map the field ID to the actual child property
          row[field.label] = child[field.id] !== undefined ? child[field.id] : '';
          
          // Format dates for better readability
          if (field.type === 'date' && row[field.label]) {
            try {
              const date = new Date(row[field.label]);
              if (!isNaN(date)) {
                row[field.label] = date.toLocaleDateString();
              }
            } catch (e) {
              console.error(`Error formatting date for ${field.id}:`, e);
            }
          }
          
          // Convert boolean values to Yes/No
          if (field.type === 'boolean' && row[field.label] !== '') {
            row[field.label] = row[field.label] ? 'Yes' : 'No';
          }
        });
        return row;
      });
      
      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
      
      // Set column widths based on content
      const colWidths = CHILD_FIELDS.map(field => ({
        wch: Math.max(
          field.label.length, // Header width
          ...exportData.map(row => 
            String(row[field.label] || '').length // Content width
          )
        )
      }));
      
      ws['!cols'] = colWidths;
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Children Data');
      
      // Generate file and trigger download
      XLSX.writeFile(wb, fileName);
    } catch (err) {
      console.error('Error details:', {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
      setError('Failed to export data. Please try again.');
    } finally {
      setExporting(false);
    }
  };
  
  const handleExport = (filtered = false) => {
    const data = filtered ? filteredChildren : children;
    const fileName = filtered ? 'filtered_children_export.xlsx' : 'all_children_export.xlsx';
    exportToExcel(data, fileName);
  };

  // Loading state
  if (loading && !isRefreshing) {
    return (
      <div className="manage-children-view loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading children's data...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="manage-children-view error">
        <div className="error-message">
          <IonIcon icon={alertCircleOutline} className="error-icon" />
          <h3>Error Loading Data</h3>
          <p>{error}</p>
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={() => fetchChildren()}
            disabled={isRefreshing}
          >
            <IonIcon icon={refreshOutline} className={`btn-icon ${isRefreshing ? 'spinning' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Try Again'}
          </button>
        </div>
      </div>
    );
  }

  // Main component render
  return (
    <div className="manage-children-view">
      {/* Header Section */}
      <header className="page-header">
        <div className="header-content">
          <h1>Children Management</h1>
          <p className="dashboard-subtitle">Manage and monitor children's records</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="content-container">

        {/* Filter Section */}
        <div className="filter-section">
          <div className="filter-container">
            <div className="filter-group-head">
            <div className="filter-group">
              <label htmlFor="filter-field">Filter By</label>
              <select 
                id="filter-field"
                value={filterField}
                onChange={(e) => {
                  setFilterField(e.target.value);
                  setFilterValue('');
                }}
                className="filter-select"
              >
                {CHILD_FIELDS.map(field => (
                  <option key={field.id} value={field.id}>
                    {field.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="filter-type">Match Type</label>
              <select
                id="filter-type"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="filter-select"
              >
                <option value="contains">Contains</option>
                <option value="exact">Exact Match</option>
                <option value="startsWith">Starts With</option>
                <option value="endsWith">Ends With</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="filter-value">
                {currentFieldConfig?.label || 'Value'}
                {currentFieldConfig?.type === 'boolean' ? ' (true/false)' : ''}
              </label>
              {currentFieldConfig?.type === 'select' ? (
                <select
                  id="filter-value"
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  className="filter-select"
                >
                  <option value="">Select {currentFieldConfig?.label || 'value'}</option>
                </select>
              ) : (
                <input
                  type={currentFieldConfig?.type === 'number' ? 'number' : 'text'}
                  id="filter-value"
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  className="filter-input"
                  placeholder={`Enter ${currentFieldConfig?.label?.toLowerCase() || 'value'}`}
                />
              )}
            </div>
              </div>
              <div className="filter-actions-container">
            <div className="filter-actions">
              <button 
                className="btn btn-primary" 
                onClick={handleFilter}
                disabled={!filterValue}
              >
                <IonIcon icon={searchOutline} className="btn-icon" />
                Apply Filter
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={handleClear}
                disabled={!filterValue && activeFilters.length === 0}
              >
                <IonIcon icon={closeCircleOutline} className="btn-icon" />
                Clear Filter
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <IonIcon icon={refreshOutline} className={isRefreshing ? 'spin' : ''} />
                {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
              </button>
            </div>
            </div>
          </div>
        </div>
        
        <div className="export-buttons">
          <button 
            className="btn btn-success" 
            onClick={() => handleExport(true)}
            disabled={exporting || filteredChildren.length === 0}
          >
            <IonIcon icon={downloadOutline} className="btn-icon" />
            {exporting ? 'Exporting...' : 'Export Filtered'}
          </button>
          
          <button 
            className="btn btn-success" 
            onClick={() => handleExport(false)}
            disabled={exporting || children.length === 0}
          >
            <IonIcon icon={downloadOutline} className="btn-icon" />
            {exporting ? 'Exporting...' : 'Export All'}
          </button>
        </div>
        
        {activeFilters.length > 0 && (
          <div className="active-filters">
            <span>Active Filters: </span>
            {activeFilters.map(filter => (
              <span key={filter.id} className="filter-tag">
                {filter.label || filter.field}: 
                <strong>"{filter.value}"</strong>
                <span className="filter-type">({filter.type})</span>
                <button 
                  className="filter-remove"
                  onClick={() => handleRemoveFilter(filter.id)}
                  aria-label={`Remove ${filter.label || filter.field} filter`}
                >
                  ×
                </button>
              </span>
            ))}
            <span className="filter-count">
              {filteredChildren.length} {filteredChildren.length === 1 ? 'record' : 'records'} found
            </span>
            {activeFilters.length > 0 && (
              <button 
                className="btn btn-link btn-clear-filters"
                onClick={handleClearAllFilters}
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Children Table */}
      <div className="table-container">
        <div className="table-header">
          <h3 className="table-title">
            {activeFilters.length > 0 ? 'Filtered Children' : 'All Children'}
            <span className="table-count"> ({filteredChildren.length})</span>
          </h3>
          
          <div className="table-actions">
            {selectedRows.size > 0 && (
              <span className="selected-count">
                {selectedRows.size} {selectedRows.size === 1 ? 'child' : 'children'} selected
              </span>
            )}
            
            {selectedRows.size > 0 && (
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedRows(new Set())}
              >
                Clear Selection
              </button>
            )}
          </div>
        </div>
        
        <div className="table-responsive">
          {filteredChildren.length === 0 ? (
            <div className="empty-state">
              <IonIcon icon={searchOutline} className="empty-state-icon" />
              <h3>No children found</h3>
              <p>{activeFilters.length > 0 
                ? 'No children match your current filter criteria. Try adjusting your filters.'
                : 'No children have been added yet.'}
              </p>
              {activeFilters.length > 0 && (
                <button className="btn btn-primary" onClick={handleClearAllFilters}>
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <table className="children-table">
              <thead>
                <tr>
                  <th className="select-column">
                    <input 
                      type="checkbox" 
                      checked={selectAll}
                      onChange={toggleSelectAll}
                      aria-label={selectAll ? 'Deselect all' : 'Select all'}
                    />
                  </th>
                  {CHILD_FIELDS.slice(0, 6).map(field => (
                    <th key={field.id}>
                      {field.label}
                      {activeFilters.some(f => f.field === field.id) && (
                        <span className="filter-indicator" title={`This column has an active filter`}>*</span>
                      )}
                    </th>
                  ))}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredChildren.map(child => (
                  <tr 
                    key={child.id} 
                    className={selectedRows.has(child.id) ? 'selected' : ''}
                    onClick={() => toggleSelectRow(child.id)}
                  >
                    <td className="select-cell" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        checked={selectedRows.has(child.id)}
                        onChange={() => toggleSelectRow(child.id)}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Select ${child.childFirstName} ${child.childLastName}`}
                      />
                    </td>
                    
                    {CHILD_FIELDS.slice(0, 6).map(field => {
                      let displayValue = child[field.id];
                      
                      // Format special field types
                      if (field.type === 'date' && displayValue) {
                        displayValue = new Date(displayValue).toLocaleDateString();
                      } else if (field.type === 'boolean') {
                        displayValue = displayValue ? 'Yes' : 'No';
                      } else if (!displayValue) {
                        displayValue = '-';
                      }
                      
                      return (
                        <td key={`${child.id}-${field.id}`}>
                          {field.id === 'status' ? (
                            <span className={`status-badge status-${child.status?.toLowerCase() || 'active'}`}>
                              {displayValue || 'Active'}
                            </span>
                          ) : (
                            <span className={`cell-content ${field.type || 'text'}`}>
                              {displayValue}
                            </span>
                          )}
                        </td>
                      );
                    })}
                    
                    <td className="action-cell" onClick={(e) => e.stopPropagation()}>
                      <div className="action-icons">
                        <IonIcon 
                          icon={eyeOutline} 
                          className="action-icon view" 
                          title="View Details"
                          onClick={() => handleViewClick(child)} 
                        />
                        <IonIcon 
                          icon={createOutline} 
                          className="action-icon edit" 
                          title="Edit"
                          onClick={() => handleEditClick(child)} 
                        />
                        <IonIcon 
                          icon={trashOutline} 
                          className="action-icon delete" 
                          title="Delete"
                          onClick={() => handleDeleteClick(child)} 
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {filteredChildren.length > 0 && (
          <div className="table-footer">
            <div className="table-summary">
              Showing {filteredChildren.length} of {children.length} total children
            </div>
            
            <div className="table-pagination">
              {/* Pagination controls would go here */}
              <button className="btn btn-sm btn-secondary" disabled>Previous</button>
              <span className="page-info">Page 1 of 1</span>
              <button className="btn btn-sm btn-secondary" disabled>Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ViewChildModal 
        isOpen={isViewModalOpen} 
        onClose={handleCloseModals} 
        child={selectedChild} 
        onEdit={handleEditFromView}
        onDelete={handleDeleteFromView}
      />
      
      <EditChildModal 
        isOpen={isEditModalOpen} 
        onClose={handleCloseModals} 
        child={selectedChild} 
        onUpdate={handleConfirmUpdate}
      />
      
      <DeleteConfirmationModal 
        isOpen={isDeleteModalOpen} 
        onClose={handleCloseModals} 
        onConfirm={handleConfirmDelete}
        itemName={selectedChild ? `${selectedChild.childFirstName} ${selectedChild.childLastName}` : 'this child'}
      />
      
      {/* Loading overlay for exports */}
      {exporting && (
        <div className="export-overlay">
          <div className="export-spinner"></div>
          <p>Preparing your export...</p>
        </div>
      )}
    </div>
  );
};

export default ManageChildrenView;
