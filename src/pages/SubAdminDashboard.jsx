import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Sidebar from '../components/Sidebar';
import apiService from '../services/api';
import '../styles/SubAdminDashboard.css';
import ProfessorProfile from '../components/ProfessorProfile';

const SubAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('subjects');
  const [subjects, setSubjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    semester: '',
    subjectId: '',
    taskImage: null,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const tabs = [
    { id: 'subjects', label: 'My Subjects' },
    { id: 'tasks', label: 'Tasks' },
    { id: 'create-task', label: 'Create Task' },
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
      const data = await apiService.getAssignedSubjects();
      setSubjects(data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const data = await apiService.getTasks();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('title', newTask.title);
      formData.append('description', newTask.description);
      formData.append('semester', newTask.semester);
      formData.append('subjectId', newTask.subjectId);
      if (newTask.taskImage) {
        formData.append('taskImage', newTask.taskImage);
      }

      await apiService.createTask(formData);
      setMessage('Task created and assigned to all students successfully');
      setNewTask({
        title: '',
        description: '',
        semester: '',
        subjectId: '',
        taskImage: null,
      });
      fetchTasks();
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getTaskStatusCounts = (taskAssignments) => {
    const counts = { PENDING: 0, IN_PROGRESS: 0, COMPLETED: 0 };
    taskAssignments.forEach((assignment) => {
      counts[assignment.status]++;
    });
    return counts;
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'subjects':
        return (
          <div className="subadmin-subjects-grid">
            {subjects.map((subjectAssignment) => (
              <div key={subjectAssignment.id} className="subadmin-subject-card">
                <div className="subadmin-subject-card-header">
                  <h3 className="subadmin-subject-card-title">{subjectAssignment.subject.name}</h3>
                </div>
                <div className="subadmin-subject-info">
                  <p><strong>Semester:</strong> {subjectAssignment.subject.semester}</p>
                  <p><strong>Department:</strong> {subjectAssignment.subject.department?.name}</p>
                </div>
              </div>
            ))}
          </div>
        );

      case 'tasks':
        return (
          <div className="subadmin-tasks-grid">
            {tasks.map((task) => {
              const statusCounts = getTaskStatusCounts(task.taskAssignments);
              return (
                <div key={task.id} className="subadmin-task-card">
                  <div className="subadmin-task-card-header">
                    <h3 className="subadmin-task-card-title">{task.title}</h3>
                    </div>
                  <div className="subadmin-task-info">
                    <p><strong>Subject:</strong> {task.subject.name}</p>
                    <p><strong>Semester:</strong> {task.semester}</p>
                    <p><strong>Description:</strong> {task.description}</p>
                    <p><strong>Created:</strong> {new Date(task.createdAt).toLocaleDateString()}</p>
                    {task.imageUrl && (
                      <div className="subadmin-task-image">
                        <img src={task.imageUrl} alt="Task" />
                      </div>
                    )}
                    <div className="subadmin-task-status">
                      <div className="subadmin-status-item pending">
                        <span>Pending: {statusCounts.PENDING}</span>
                      </div>
                      <div className="subadmin-status-item in-progress">
                        <span>In Progress: {statusCounts.IN_PROGRESS}</span>
                      </div>
                      <div className="subadmin-status-item completed">
                        <span>Completed: {statusCounts.COMPLETED}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );

      case 'create-task':
        return (
          <div className="subadmin-create-task-card">
            <div className="subadmin-create-task-card-header">
              <h3 className="subadmin-create-task-card-title">Create New Task</h3>
            </div>
            <form onSubmit={handleCreateTask}>
              <div className="subadmin-form-group">
                <label htmlFor="title">Task Title:</label>
                <input
                  type="text"
                  id="title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  required
                />
              </div>
              <div className="subadmin-form-group">
                <label htmlFor="description">Description:</label>
                <textarea
                  id="description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  rows="4"
                />
              </div>
              <div className="subadmin-form-group">
                <label htmlFor="subjectId">Subject:</label>
                <select
                  id="subjectId"
                  value={newTask.subjectId}
                  onChange={(e) => setNewTask({ ...newTask, subjectId: e.target.value })}
                  required
                >
                  <option value="">Select Subject</option>
                  {subjects.map((subjectAssignment) => (
                    <option key={subjectAssignment.id} value={subjectAssignment.subject.id}>
                      {subjectAssignment.subject.name} (Sem {subjectAssignment.subject.semester})
                    </option>
                  ))}
                </select>
              </div>
              <div className="subadmin-form-group">
                <label htmlFor="semester">Semester:</label>
                <select
                  id="semester"
                  value={newTask.semester}
                  onChange={(e) => setNewTask({ ...newTask, semester: e.target.value })}
                  required
                >
                  <option value="">Select Semester</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <option key={sem} value={sem}>
                      {sem}
                    </option>
                  ))}
                </select>
              </div>
              <div className="subadmin-form-group">
                <label htmlFor="taskImage">Task Image (Optional):</label>
                <input
                  type="file"
                  id="taskImage"
                  accept="image/*"
                  onChange={(e) => setNewTask({ ...newTask, taskImage: e.target.files[0] })}
                />
              </div>
              <button type="submit" disabled={loading} className="subadmin-create-button">
                {loading ? 'Creating...' : 'Create Task'}
              </button>
            </form>
            {message && <div className="subadmin-message">{message}</div>}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Layout
      title="Professor Dashboard"
      sidebar={<Sidebar activeTab={activeTab} setActiveTab={setActiveTab} tabs={tabs} />}
      profileComponent={<ProfessorProfile/>}
    >
      {renderContent()}
    </Layout>
  );
};

export default SubAdminDashboard;