import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import apiService from '../services/api';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [department, setDepartment] = useState(null);
  const [newProfessor, setNewProfessor] = useState({
    email: '',
    password: '',
    subjectIds: [],
  });
  const [newSubject, setNewSubject] = useState({
    name: '',
    semester: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'professors', label: 'Professors' },
    { id: 'subjects', label: 'Subjects' },
    { id: 'create-professor', label: 'Add Professor' },
    { id: 'create-subject', label: 'Add Subject' },
  ];

  useEffect(() => {
    fetchDepartmentInfo();
  }, []);

  const fetchDepartmentInfo = async () => {
    try {
      const data = await apiService.getDepartmentInfo();
      setDepartment(data);
    } catch (error) {
      console.error('Error fetching department info:', error);
    }
  };

  const handleCreateProfessor = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await apiService.createProfessor(newProfessor);
      setMessage('Professor created successfully and credentials sent via email');
      setNewProfessor({ email: '', password: '', subjectIds: [] });
      fetchDepartmentInfo();
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await apiService.createSubject({
        ...newSubject,
        semester: parseInt(newSubject.semester),
      });
      setMessage('Subject created successfully');
      setNewSubject({ name: '', semester: '' });
      fetchDepartmentInfo();
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (!department) return <div>Loading...</div>;

    switch (activeTab) {
      case 'overview':
        return (
          <div className="overview-grid">
            <Card title="Department Statistics" className="stats-card">
              <div className="stats">
                <div className="stat-item">
                  <h3>{department.professors?.length || 0}</h3>
                  <p>Professors</p>
                </div>
                <div className="stat-item">
                  <h3>{department.subjects?.length || 0}</h3>
                  <p>Subjects</p>
                </div>
                <div className="stat-item">
                  <h3>{department.students?.length || 0}</h3>
                  <p>Students</p>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'professors':
        return (
          <div className="professors-grid">
            {department.professors?.map((professor) => (
              <Card key={professor.id} title="Professor" className="professor-card">
                <div className="professor-info">
                  <p><strong>Email:</strong> {professor.user.email}</p>
                  <p><strong>Subjects:</strong></p>
                  <ul>
                    {professor.subjects.map((sub) => (
                      <li key={sub.id}>{sub.subject.name} (Sem {sub.subject.semester})</li>
                    ))}
                  </ul>
                </div>
              </Card>
            ))}
          </div>
        );

      case 'subjects':
        return (
          <div className="subjects-grid">
            {department.subjects?.map((subject) => (
              <Card key={subject.id} title={subject.name} className="subject-card">
                <div className="subject-info">
                  <p><strong>Semester:</strong> {subject.semester}</p>
                  <p><strong>Professors:</strong></p>
                  <ul>
                    {subject.professors.map((prof) => (
                      <li key={prof.id}>{prof.professor.user.email}</li>
                    ))}
                  </ul>
                </div>
              </Card>
            ))}
          </div>
        );

      case 'create-professor':
        return (
          <Card title="Add New Professor" className="create-professor-card">
            <form onSubmit={handleCreateProfessor}>
              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input
                  type="email"
                  id="email"
                  value={newProfessor.email}
                  onChange={(e) => setNewProfessor({ ...newProfessor, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password:</label>
                <input
                  type="password"
                  id="password"
                  value={newProfessor.password}
                  onChange={(e) => setNewProfessor({ ...newProfessor, password: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="subjects">Assign Subjects:</label>
                <div className="subjects-checkboxes">
                  {department.subjects?.map((subject) => (
                    <label key={subject.id} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={newProfessor.subjectIds.includes(subject.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewProfessor({
                              ...newProfessor,
                              subjectIds: [...newProfessor.subjectIds, subject.id],
                            });
                          } else {
                            setNewProfessor({
                              ...newProfessor,
                              subjectIds: newProfessor.subjectIds.filter((id) => id !== subject.id),
                            });
                          }
                        }}
                      />
                      {subject.name} (Sem {subject.semester})
                    </label>
                  ))}
                </div>
              </div>
              <button type="submit" disabled={loading} className="create-button">
                {loading ? 'Creating...' : 'Create Professor'}
              </button>
            </form>
            {message && <div className="message">{message}</div>}
            
          </Card>
        );

      case 'create-subject':
        return (
          <Card title="Add New Subject" className="create-subject-card">
            <form onSubmit={handleCreateSubject}>
              <div className="form-group">
                <label htmlFor="name">Subject Name:</label>
                <input
                  type="text"
                  id="name"
                  value={newSubject.name}
                  onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="semester">Semester:</label>
                <select
                  id="semester"
                  value={newSubject.semester}
                  onChange={(e) => setNewSubject({ ...newSubject, semester: e.target.value })}
                  required
                >
                  <option value="">Select Semester</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <option key={sem} value={sem}>
                      Semester {sem}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" disabled={loading} className="create-button">
                {loading ? 'Creating...' : 'Create Subject'}
              </button>
            </form>
            {message && <div className="message">{message}</div>}
            
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <Layout
      title={`HOD Dashboard - ${department?.name || 'Department'}`}
      sidebar={<Sidebar activeTab={activeTab} setActiveTab={setActiveTab} tabs={tabs} />}
    >
      {renderContent()}
    </Layout>
  );
};

export default AdminDashboard;