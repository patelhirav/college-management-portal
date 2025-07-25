"use client"

import { useState, createContext, useContext } from "react"
import { FiUser, FiX, FiMenu } from "react-icons/fi"
import "../styles/Layout.css"

// Create a context for sidebar control
const SidebarContext = createContext()

// Custom hook to use sidebar context
export const useSidebar = () => {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

// Wrapper component for sidebar content
export const SidebarContent = ({ children }) => {
  const { closeMobileSidebar } = useSidebar()

  // Add click handler to close sidebar when any link/button is clicked
  const handleContentClick = (e) => {
    // Check if the clicked element is a link or button
    const target = e.target.closest('a, button, [role="button"]')
    if (target) {
      // Small delay to allow navigation to complete
      setTimeout(() => {
        closeMobileSidebar()
      }, 100)
    }
  }

  return <div onClick={handleContentClick}>{children}</div>
}

const Layout = ({ children, title, sidebar, profileComponent }) => {
  const [showProfile, setShowProfile] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const toggleProfile = () => {
    setShowProfile(!showProfile)
  }

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen)
  }

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false)
  }

  // Close sidebar when clicking outside
  const handleOverlayClick = () => {
    closeMobileSidebar()
  }

  const sidebarContextValue = {
    isMobileSidebarOpen,
    toggleMobileSidebar,
    closeMobileSidebar,
  }

  return (
    <SidebarContext.Provider value={sidebarContextValue}>
      <div className="layout">
        {/* Header */}
        <header className="layout-header">
          <div className="header-content">
            <button
              className="mobile-sidebar-toggle"
              onClick={toggleMobileSidebar}
              aria-label={isMobileSidebarOpen ? "Close menu" : "Open menu"}
            >
              {isMobileSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
            <h1 className="layout-title">{title}</h1>
            <button className="profile-button" onClick={toggleProfile}>
              <FiUser />
              <span>{showProfile ? "Close" : "Profile"}</span>
            </button>
          </div>
        </header>

        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && <div className="mobile-sidebar-overlay" onClick={handleOverlayClick} />}

        {/* Main Content */}
        <div className="layout-main">
          {/* Sidebar */}
          {sidebar && (
            <aside className={`layout-sidebar ${isMobileSidebarOpen ? "mobile-open" : ""}`}>
              <div className="sidebar-header">
                <button className="sidebar-close-btn" onClick={closeMobileSidebar} aria-label="Close sidebar">
                  <FiX size={20} />
                </button>
              </div>
              <SidebarContent>{sidebar}</SidebarContent>
            </aside>
          )}

          {/* Main Content Area */}
          <main className="layout-content">{children}</main>
        </div>

        {/* Profile Modal */}
        {showProfile && (
          <div className="modal-overlay" onClick={toggleProfile}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={toggleProfile}>
                <FiX size={24} />
              </button>
              <div className="profile-content">{profileComponent}</div>
            </div>
          </div>
        )}
      </div>
    </SidebarContext.Provider>
  )
}

export default Layout
