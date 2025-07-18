import React from 'react';
import '../styles/Layout.css';

const Layout = ({ children, title, sidebar }) => {
  return (
    <div className="layout">
      <header className="layout-header">
        <h1 className="layout-title">{title}</h1>
      </header>

      <div className="layout-main">
        {sidebar && <aside className="layout-sidebar">{sidebar}</aside>}
        <main className="layout-content">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
