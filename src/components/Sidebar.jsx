import React from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/Sidebar.css';

const Sidebar = ({ activeTab, setActiveTab, tabs }) => {
  const { logout } = useAuth();

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`sidebar-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon && <span className="tab-icon">{tab.icon}</span>}
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
      <button className="logout-button" onClick={logout}>
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;
