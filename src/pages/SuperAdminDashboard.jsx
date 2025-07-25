import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Sidebar from '../components/Sidebar';
import apiService from '../services/api';
import '../styles/SuperAdminDashboard.css';
import SuperAdminProfile from '../components/SuperAdminprofile';

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('departments');
  const [departments, setDepartments] = useState([]);
  const [hods, setHods] = useState([]);
  const [newHod, setNewHod] = useState({
    name: '',
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
      console.log('Creating HOD with data:', newHod);
      await apiService.createHod(newHod);
      setMessage('HOD created successfully and credentials sent via email');
      setNewHod({name:'', email: '', password: '', departmentName: '' });
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
          <div className="superadmin-departments-grid">
            {departments.map((dept) => (
              <div key={dept.id} className="superadmin-department-card">
                <div className="superadmin-department-card-header">
                  <h3 className="superadmin-department-card-title">{dept.name}</h3>
                </div>
                <div className="superadmin-department-stats">
                  <p><strong>HOD:</strong> {dept.hod?.email || 'Not assigned'}</p>
                  <p><strong>Professors:</strong> {dept._count.professors}</p>
                  <p><strong>Subjects:</strong> {dept._count.subjects}</p>
                  <p><strong>Students:</strong> {dept._count.students}</p>
                </div>
              </div>
            ))}
          </div>
        );

      case 'hods':
        return (
          <div className="superadmin-hods-grid">
            {hods.map((hod) => (
              <div key={hod.id} className="superadmin-hod-card">
                <div className="superadmin-hod-card-header">
                  <h3 className="superadmin-hod-card-title">{hod.name}</h3>
                </div>
                <div className="superadmin-hod-info">
                  <p><strong>Email:</strong> {hod.email}</p>
                  <p><strong>Department:</strong> {hod.departmentName || 'Not assigned'}</p>
                  <p><strong>Posted On:</strong> {new Date(hod.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        );

      case 'create-hod':
        return (
          <div className="superadmin-create-hod-card">
            <div className="superadmin-create-hod-card-header">
              <h3 className="superadmin-create-hod-card-title">Create New HOD</h3>
            </div>
            <form onSubmit={handleCreateHod}>
              <div className="superadmin-form-group">
                <label htmlFor="name">Name:</label>
                <input
                  type="text"
                  id="name"
                  value={newHod.name}
                  onChange={(e) => setNewHod({ ...newHod, name: e.target.value })}
                  required
                />
              </div>
              <div className="superadmin-form-group">
                <label htmlFor="email">Email:</label>
                <input
                  type="email"
                  id="email"
                  value={newHod.email}
                  onChange={(e) => setNewHod({ ...newHod, email: e.target.value })}
                  required
                />
              </div>
              <div className="superadmin-form-group">
                <label htmlFor="password">Password:</label>
                <input
                  type="password"
                  id="password"
                  value={newHod.password}
                  onChange={(e) => setNewHod({ ...newHod, password: e.target.value })}
                  required
                />
              </div>
              <div className="superadmin-form-group">
                <label htmlFor="departmentName">Department Name:</label>
                <input
                  type="text"
                  id="departmentName"
                  value={newHod.departmentName}
                  onChange={(e) => setNewHod({ ...newHod, departmentName: e.target.value })}
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="superadmin-create-button">
                {loading ? 'Creating...' : 'Create HOD'}
              </button>
            </form>
            {message && (
              <div className={`message ${message.startsWith('Error') ? 'error' : 'success'}`}>
                {message}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Layout
      title={"Dashboard"}
      sidebar={<Sidebar activeTab={activeTab} setActiveTab={setActiveTab} tabs={tabs} />}
      profileComponent={<SuperAdminProfile />}
    >
      {renderContent()}
    </Layout>
  );
};

export default SuperAdminDashboard;