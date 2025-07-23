import React, { useState } from 'react';
import { FiUser, FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import '../styles/Layout.css';

const Layout = ({ children, title, sidebar, profileComponent }) => {
  const [showProfile, setShowProfile] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleProfile = () => {
    setShowProfile(!showProfile);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className="layout">
      {/* Header */}
      <header className="layout-header">
        <div className="header-content">
          <div className="mobile-sidebar-toggle" onClick={toggleMobileSidebar}>
            {isMobileSidebarOpen ? <FiX size={24} /> : <FiChevronDown size={24} />}
          </div>
          <h1 className="layout-title">{title}</h1>
          <button className="profile-button" onClick={toggleProfile}>
            <FiUser />
            <span>{showProfile ? 'Close' : 'Profile'}</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="layout-main">
        {/* Sidebar - Desktop */}
        {sidebar && (
          <aside className={`layout-sidebar ${isMobileSidebarOpen ? 'mobile-open' : ''}`}>
            {sidebar}
          </aside>
        )}
        
        {/* Main Content Area */}
        <main className="layout-content">
          {children}
        </main>
      </div>

      {/* Profile Modal */}
      {showProfile && (
        <div className="modal-overlay" onClick={toggleProfile}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={toggleProfile}>
              <FiX size={24} />
            </button>
            <div className="profile-content">
              {profileComponent}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;