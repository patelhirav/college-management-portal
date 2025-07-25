import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Sidebar from '../components/Sidebar';
import apiService from '../services/api';
import '../styles/StudentDashboard.css';
import StudentProfile from '../components/StudentProfile';

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('subjects');
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
    { id: 'subjects', label: 'My Subjects' },
    { id: 'tasks', label: 'Tasks' },
  ];

  useEffect(() => {
    if (activeTab === 'subjects') {
      fetchSubjects();
    } else if (activeTab === 'tasks') {
      fetchTasks();
    }
  }, [activeTab]);

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
      console.log('Fetched tasks:', data);
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
      case 'subjects':
        return (
          <div className="student-subjects-grid">
            {subjects.map((subject) => (
              <div key={subject.id} className="student-subject-card">
                <div className="student-subject-card-header">
                  <h3 className="student-subject-card-title">{subject.name}</h3>
                </div>
                <div className="student-subject-info">
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
        );

      case 'tasks':
        return (
          <div className="student-tasks-grid">
            {tasks.map((taskAssignment) => (
              <div key={taskAssignment.id} className="student-task-card">
                <div className="student-task-card-header">
                  <h3 className="student-task-card-title">{taskAssignment.task.title}</h3>
                </div>
                <div className="student-task-info">
                  <p><strong>Subject:</strong> {taskAssignment.task.subject.name}</p>
                  <p><strong>Professor:</strong> {taskAssignment.task.professor.user.email}</p>
                  <p><strong>Description:</strong> {taskAssignment.task.description}</p>
                  <p><strong>Assigned:</strong> {new Date(taskAssignment.task.createdAt).toLocaleDateString()}</p>
                  
                  {taskAssignment.task.imageUrl && (
                    <div className="student-task-image">
                      <img src={taskAssignment.task.imageUrl} alt="Task" />
                    </div>
                  )}
                  
                  <div className={`task-status ${getStatusColor(taskAssignment.status)}`}>
                    <strong>Status:</strong> {taskAssignment.status.replace('_', ' ')}
                  </div>
                  
                  <div className="student-task-actions">
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
                    <div className="student-submission-link">
                      <a href={taskAssignment.submissionUrl} target="_blank" rel="noopener noreferrer">
                        View Submission
                      </a>
                    </div>
                  )}
                </div>
              </div>
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
      profileComponent={<StudentProfile />}
    >
      {renderContent()}
    </Layout>
  );
};

export default StudentDashboard;