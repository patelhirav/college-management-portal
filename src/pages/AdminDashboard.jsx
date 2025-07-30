import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Sidebar from '../components/Sidebar';
import apiService from '../services/api';
import '../styles/AdminDashboard.css';
import AdminProfile from '../components/AdminProfile';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [department, setDepartment] = useState(null);
  const [newProfessor, setNewProfessor] = useState({
    name: '',
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
  const [expandedSemesters, setExpandedSemesters] = useState([]);
  const [expandedSemestersForm, setExpandedSemestersForm] = useState([]);

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

  const toggleSemester = (semester) => {
    if (expandedSemesters.includes(semester)) {
      setExpandedSemesters(expandedSemesters.filter(s => s !== semester));
    } else {
      setExpandedSemesters([...expandedSemesters, semester]);
    }
  };

  const toggleSemesterForm = (semester) => {
    if (expandedSemestersForm.includes(semester)) {
      setExpandedSemestersForm(expandedSemestersForm.filter(s => s !== semester));
    } else {
      setExpandedSemestersForm([...expandedSemestersForm, semester]);
    }
  };

  const handleCreateProfessor = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await apiService.createProfessor(newProfessor);
      setMessage('Professor created successfully and credentials sent via email');
      setTimeout(() => {
        setMessage('');
      }, 2000);
      setNewProfessor({ name:'', email: '', password: '', subjectIds: [] });
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
      setTimeout(() => {
        setMessage('');
      }, 2000);
      setNewSubject({ name: '', semester: '' });
      fetchDepartmentInfo();
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const groupSubjectsBySemester = (subjects) => {
    const grouped = {};
    subjects?.forEach(subject => {
      if (!grouped[subject.semester]) {
        grouped[subject.semester] = [];
      }
      grouped[subject.semester].push(subject);
    });
    return grouped;
  };

  const renderContent = () => {
    if (!department) return <div>Loading...</div>;

    switch (activeTab) {
      case 'overview':
        return (
          <div className="admin-overview-grid">
            <div className="admin-stats-card">
              <div className="admin-stats-card-header">
                <h3 className="admin-stats-card-title">Department Statistics</h3>
              </div>
              <div className="admin-stats">
                <div className="admin-stat-item">
                  <h3>{department.professors?.length || 0}</h3>
                  <p>Professors</p>
                </div>
                <div className="admin-stat-item">
                  <h3>{department.subjects?.length || 0}</h3>
                  <p>Subjects</p>
                </div>
                <div className="admin-stat-item">
                  <h3>{department.students?.length || 0}</h3>
                  <p>Students</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'professors':
        return (
          <div className="admin-professors-grid">
            {department.professors?.map((professor) => (
              <div key={professor.id} className="admin-professor-card">
                <div className="admin-professor-card-header">
                  <h3 className="admin-professor-card-title">{professor.user.name}</h3>
                </div>
                <div className="admin-professor-info">
                  <p><strong>Email:</strong> {professor.user.email}</p>
                  <p><strong>Subjects:</strong></p>
                  <ul>
                    {professor.subjects.map((sub) => (
                      <li key={sub.id}>{sub.subject.name} (Sem {sub.subject.semester})</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        );

      case 'subjects':
        const groupedSubjects = groupSubjectsBySemester(department.subjects);
        return (
          <div className="admin-subjects-container">
            {Object.keys(groupedSubjects).sort().map(semester => (
              <div key={semester} className="admin-semester-group">
                <div 
                  className="admin-semester-header"
                  onClick={() => toggleSemester(parseInt(semester))}
                >
                  <h3>Semester {semester}</h3>
                  <span className="admin-semester-toggle">
                    {expandedSemesters.includes(parseInt(semester)) ? '−' : '+'}
                  </span>
                </div>
                {expandedSemesters.includes(parseInt(semester)) && (
                  <div className="admin-subjects-grid">
                    {groupedSubjects[semester].map((subject) => (
                      <div key={subject.id} className="admin-subject-card">
                        <div className="admin-subject-card-header">
                          <h3 className="admin-subject-card-title">{subject.name}</h3>
                        </div>
                        <div className="admin-subject-info">
                          <p><strong>Semester:</strong> {subject.semester}</p>
                          <p><strong>Professors:</strong></p>
                          <ul>
                            {subject.professors.map((prof) => (
                              <li key={prof.id}>{prof.professor.user.name}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      case 'create-professor':
        const groupedSubjectsForm = groupSubjectsBySemester(department.subjects);
        return (
          <div className="admin-create-professor-card">
            <div className="admin-create-professor-card-header">
              <h3 className="admin-create-professor-card-title">Add New Professor</h3>
            </div>
            <form onSubmit={handleCreateProfessor}>
              <div className="admin-form-group">
                <label htmlFor="name">Name:</label>
                <input
                  type="name"
                  id="name"
                  value={newProfessor.name}
                  onChange={(e) => setNewProfessor({ ...newProfessor, name: e.target.value })}
                  required
                />
              </div>
              <div className="admin-form-group">
                <label htmlFor="email">Email:</label>
                <input
                  type="email"
                  id="email"
                  value={newProfessor.email}
                  onChange={(e) => setNewProfessor({ ...newProfessor, email: e.target.value })}
                  required
                />
              </div>
              <div className="admin-form-group">
                <label htmlFor="password">Password:</label>
                <input
                  type="password"
                  id="password"
                  value={newProfessor.password}
                  onChange={(e) => setNewProfessor({ ...newProfessor, password: e.target.value })}
                  required
                />
              </div>
              <div className="admin-form-group">
                <label htmlFor="subjects">Assign Subjects:</label>
                <div className="admin-subjects-checkboxes">
                  {Object.keys(groupedSubjectsForm).sort().map(semester => (
                    <div key={semester} className="admin-semester-form-group">
                      <div 
                        className="admin-semester-form-header"
                        onClick={() => toggleSemesterForm(parseInt(semester))}
                      >
                        <h4>Semester {semester}</h4>
                        <span className="admin-semester-toggle">
                          {expandedSemestersForm.includes(parseInt(semester)) ? '−' : '+'}
                        </span>
                      </div>
                      {expandedSemestersForm.includes(parseInt(semester)) && (
                        <div className="admin-semester-subjects">
                          {groupedSubjectsForm[semester].map((subject) => (
                            <label key={subject.id} className="admin-checkbox-label">
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
                              {subject.name}
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <button type="submit" disabled={loading} className="admin-create-button">
                {loading ? 'Creating...' : 'Create Professor'}
              </button>
            </form>
            {message && (
              <div className={`admin-message ${message.startsWith('Error') ? 'error' : 'success'}`}>
                {message}
              </div>
            )}
          </div>
        );

      case 'create-subject':
        return (
          <div className="admin-create-subject-card">
            <div className="admin-create-subject-card-header">
              <h3 className="admin-create-subject-card-title">Add New Subject</h3>
            </div>
            <form onSubmit={handleCreateSubject}>
              <div className="admin-form-group">
                <label htmlFor="name">Subject Name:</label>
                <input
                  type="text"
                  id="name"
                  value={newSubject.name}
                  onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                  required
                />
              </div>
              <div className="admin-form-group">
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
              <button type="submit" disabled={loading} className="admin-create-button">
                {loading ? 'Creating...' : 'Create Subject'}
              </button>
            </form>
            {message && (
              <div className={`admin-message ${message.startsWith('Error') ? 'error' : 'success'}`}>
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
      title={`HOD Dashboard - ${department?.name || 'Department'}`}
      sidebar={<Sidebar activeTab={activeTab} setActiveTab={setActiveTab} tabs={tabs} />}
      profileComponent={<AdminProfile />}
    >
      {renderContent()}
    </Layout>
  );
};

export default AdminDashboard;