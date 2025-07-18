import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import apiService from '../services/api';
import '../styles/StudentDashboard.css';

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [profileForm, setProfileForm] = useState({
    name: '',
    profilePhoto: null,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'subjects', label: 'My Subjects' },
    { id: 'tasks', label: 'Tasks' },
  ];

  useEffect(() => {
    if (activeTab === 'profile') {
      fetchProfile();
    } else if (activeTab === 'subjects') {
      fetchSubjects();
    } else if (activeTab === 'tasks') {
      fetchTasks();
    }
  }, [activeTab]);

  const fetchProfile = async () => {
    try {
      const data = await apiService.getProfile();
      setProfile(data);
      setProfileForm({
        name: data.name,
        profilePhoto: null,
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const data = await apiService.getSubjects();
      setSubjects(data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const data = await apiService.getStudentTasks();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('name', profileForm.name);
      if (profileForm.profilePhoto) {
        formData.append('profilePhoto', profileForm.profilePhoto);
      }

      await apiService.updateProfile(formData);
      setMessage('Profile updated successfully');
      fetchProfile();
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskStatusUpdate = async (taskId, status, file = null) => {
    setLoading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('status', status);
      if (file) {
        formData.append('submissionFile', file);
      }

      await apiService.updateTaskStatus(taskId, formData);
      setMessage('Task status updated successfully');
      fetchTasks();
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'status-pending';
      case 'IN_PROGRESS':
        return 'status-in-progress';
      case 'COMPLETED':
        return 'status-completed';
      default:
        return '';
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <Card title="My Profile" className="profile-card">
            {profile && (
              <div className="profile-info">
                <div className="profile-header">
                  {profile.profilePhoto && (
                    <img
                      src={`http://localhost:5000${profile.profilePhoto}`}
                      alt="Profile"
                      className="profile-photo"
                    />
                  )}
                  <div className="profile-details">
                    <h3>{profile.name}</h3>
                    <p><strong>Email:</strong> {profile.user.email}</p>
                    <p><strong>Semester:</strong> {profile.semester}</p>
                    <p><strong>Department:</strong> {profile.department.name}</p>
                  </div>
                </div>
                <form onSubmit={handleProfileUpdate} className="profile-form">
                  <div className="form-group">
                    <label htmlFor="name">Name:</label>
                    <input
                      type="text"
                      id="name"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="profilePhoto">Profile Photo:</label>
                    <input
                      type="file"
                      id="profilePhoto"
                      accept="image/*"
                      onChange={(e) => setProfileForm({ ...profileForm, profilePhoto: e.target.files[0] })}
                    />
                  </div>
                  <button type="submit" disabled={loading} className="update-button">
                    {loading ? 'Updating...' : 'Update Profile'}
                  </button>
                </form>
                {message && <div className="message">{message}</div>}
                
              </div>
            )}
          </Card>
        );

      case 'subjects':
        return (
          <div className="subjects-grid">
            {subjects.map((subject) => (
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

      case 'tasks':
        return (
          <div className="tasks-grid">
            {tasks.map((taskAssignment) => (
              <Card key={taskAssignment.id} title={taskAssignment.task.title} className="task-card">
                <div className="task-info">
                  <p><strong>Subject:</strong> {taskAssignment.task.subject.name}</p>
                  <p><strong>Professor:</strong> {taskAssignment.task.professor.user.email}</p>
                  <p><strong>Description:</strong> {taskAssignment.task.description}</p>
                  <p><strong>Assigned:</strong> {new Date(taskAssignment.task.createdAt).toLocaleDateString()}</p>
                  
                  {taskAssignment.task.imageUrl && (
                    <div className="task-image">
                      <img src={`http://localhost:5000${taskAssignment.task.imageUrl}`} alt="Task" />
                    </div>
                  )}
                  
                  <div className={`task-status ${getStatusColor(taskAssignment.status)}`}>
                    <strong>Status:</strong> {taskAssignment.status.replace('_', ' ')}
                  </div>
                  
                  <div className="task-actions">
                    <select
                      value={taskAssignment.status}
                      onChange={(e) => handleTaskStatusUpdate(taskAssignment.task.id, e.target.value)}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                    
                    {taskAssignment.status === 'COMPLETED' && (
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleTaskStatusUpdate(taskAssignment.task.id, 'COMPLETED', e.target.files[0])}
                      />
                    )}
                  </div>
                  
                  {taskAssignment.submissionUrl && (
                    <div className="submission-link">
                      <a href={`http://localhost:5000${taskAssignment.submissionUrl}`} target="_blank" rel="noopener noreferrer">
                        View Submission
                      </a>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Layout
      title="Student Dashboard"
      sidebar={<Sidebar activeTab={activeTab} setActiveTab={setActiveTab} tabs={tabs} />}
    >
      {renderContent()}
    </Layout>
  );
};

export default StudentDashboard;