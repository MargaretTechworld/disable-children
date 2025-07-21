import React, { useState, useMemo } from 'react';
import ChildrensTable from './ChildrensTable';
import { childrenData } from '../data/mockData';

const ManageChildrenView = () => {
  const [filterField, setFilterField] = useState('firstName');
  const [filterValue, setFilterValue] = useState('');
  const [appliedFilter, setAppliedFilter] = useState({ field: '', value: '' });

  const applyFilters = () => {
    setAppliedFilter({ field: filterField, value: filterValue.trim() });
  };

  const clearFilters = () => {
    setFilterValue('');
    setFilterField('firstName');
    setAppliedFilter({ field: '', value: '' });
  };

  const filteredChildren = useMemo(() => {
    const { field, value } = appliedFilter;
    if (!field || !value) {
      return childrenData;
    }

    return childrenData.filter(child => {
      const childValue = child[field];
      if (childValue === undefined) return false;

      const stringValue = childValue.toString().toLowerCase();
      const searchValue = value.toLowerCase();

      // Exact match for gender, severity, disabilityType
      const exactMatchFields = ['gender', 'severity', 'disabilityType'];

      return exactMatchFields.includes(field)
        ? stringValue === searchValue
        : stringValue.includes(searchValue);
    });
  }, [appliedFilter]);

  return (
    <div className="details">
      <div className="recentOrders">
        <div className="cardHeader">
          <h2>Manage Children</h2>
        </div>

        <div className="filter-controls" style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#f4f4f4',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
        }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <label htmlFor="filter-field"><strong>Filter by:</strong></label>
            <select
              id="filter-field"
              value={filterField}
              onChange={(e) => setFilterField(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '6px' }}
            >
              <option value="firstName">First Name</option>
              <option value="lastName">Last Name</option>
              <option value="age">Age</option>
              <option value="gender">Gender</option>
              <option value="disabilityType">Disability Type</option>
              <option value="severity">Severity</option>
            </select>
          </div>

          <input
            type="text"
            placeholder="Enter value (e.g., John or Male)"
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            style={{
              flexGrow: 1,
              minWidth: '200px',
              padding: '0.5rem',
              borderRadius: '6px',
              border: '1px solid #ccc'
            }}
          />

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={applyFilters} className="btn" style={{ backgroundColor: '#007bff', color: '#fff' }}>
              Apply
            </button>
            <button onClick={clearFilters} className="btn" style={{ backgroundColor: '#6c757d', color: '#fff' }}>
              Clear
            </button>
          </div>
        </div>

        <div style={{ minHeight: '400px' }}>
          <ChildrensTable children={filteredChildren} />
        </div>
      </div>
    </div>
  );
};

export default ManageChildrenView;
