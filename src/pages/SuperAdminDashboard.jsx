import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import apiService from '../services/api';
import '../styles/SuperAdminDashboard.css';

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('departments');
  const [departments, setDepartments] = useState([]);
  const [hods, setHods] = useState([]);
  const [newHod, setNewHod] = useState({
    email: '',
    password: '',
    departmentName: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const tabs = [
    { id: 'departments', label: 'Departments' },
    { id: 'hods', label: 'HODs' },
    { id: 'create-hod', label: 'Create HOD' },
  ];

  useEffect(() => {
    if (activeTab === 'departments') {
      fetchDepartments();
    } else if (activeTab === 'hods') {
      fetchHods();
    }
  }, [activeTab]);

  const fetchDepartments = async () => {
    try {
      const data = await apiService.getSuperAdminDepartments();
      setDepartments(data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchHods = async () => {
    try {
      const data = await apiService.getHods();
      setHods(data);
    } catch (error) {
      console.error('Error fetching HODs:', error);
    }
  };

  const handleCreateHod = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await apiService.createHod(newHod);
      setMessage('HOD created successfully and credentials sent via email');
      setNewHod({ email: '', password: '', departmentName: '' });
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'departments':
        return (
          <div className="departments-grid">
            {departments.map((dept) => (
              <Card key={dept.id} title={dept.name} className="department-card">
                <div className="department-stats">
                  <p>HOD: {dept.hod?.email || 'Not assigned'}</p>
                  <p>Professors: {dept._count.professors}</p>
                  <p>Subjects: {dept._count.subjects}</p>
                  <p>Students: {dept._count.students}</p>
                </div>
              </Card>
            ))}
          </div>
        );

      case 'hods':
        return (
          <div className="hods-grid">
            {hods.map((hod) => (
              <Card key={hod.id} title="HOD" className="hod-card">
                <div className="hod-info">
                  <p><strong>Email:</strong> {hod.email}</p>
                  <p><strong>Department:</strong> {hod.admin?.name || 'Not assigned'}</p>
                  <p><strong>Created:</strong> {new Date(hod.createdAt).toLocaleDateString()}</p>
                </div>
              </Card>
            ))}
          </div>
        );

      case 'create-hod':
        return (
          <Card title="Create New HOD" className="create-hod-card">
            <form onSubmit={handleCreateHod}>
              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input
                  type="email"
                  id="email"
                  value={newHod.email}
                  onChange={(e) => setNewHod({ ...newHod, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password:</label>
                <input
                  type="password"
                  id="password"
                  value={newHod.password}
                  onChange={(e) => setNewHod({ ...newHod, password: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="departmentName">Department Name:</label>
                <input
                  type="text"
                  id="departmentName"
                  value={newHod.departmentName}
                  onChange={(e) => setNewHod({ ...newHod, departmentName: e.target.value })}
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="create-button">
                {loading ? 'Creating...' : 'Create HOD'}
              </button>
            </form>
            {message && (
              <div className={`message ${message.startsWith('Error') ? 'error' : 'success'}`}>
                {message}
              </div>
            )}


          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <Layout
      title="Super Admin Dashboard"
      sidebar={<Sidebar activeTab={activeTab} setActiveTab={setActiveTab} tabs={tabs} />}
    >
      {renderContent()}
    </Layout>
  );
};

export default SuperAdminDashboard;