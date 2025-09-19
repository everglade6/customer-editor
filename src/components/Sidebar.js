'use client';

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styles from './Sidebar.module.css';

export default function Sidebar({ activePageId, onNavigate }) {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const { logout, user } = useAuth();

  // Navigation items for the sidebar
  const navigationItems = [
    { id: 'customers', name: 'CIF Inquiry', icon: '👥', path: '/' },
    { id: 'analytics', name: 'For Approval', icon: '📊', path: '/approval' },
    { id: 'reports', name: 'CIF Report', icon: '📈', path: '/reports' },
    { id: 'admin', name: 'Admin Settings', icon: '⚙️', path: '/admin' },
  ];

  const handleSidebarToggle = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  const handleNavItemClick = (item) => {
    if (onNavigate) {
      onNavigate(item);
    }
  };

  return (
    <div className={`${styles.sidebar} ${sidebarExpanded ? styles.sidebarExpanded : styles.sidebarCollapsed}`}>
      <div className={styles.sidebarHeader}>
        <button 
          className={styles.sidebarToggle}
          onClick={handleSidebarToggle}
          aria-label="Toggle sidebar"
        >
          {sidebarExpanded ? '◀' : '▶'}
        </button>
        {sidebarExpanded && <h2 className={styles.sidebarTitle}>Logic One Systems</h2>}
      </div>
      
      <nav className={styles.sidebarNav}>
        {navigationItems.map(item => (
          <button
            key={item.id}
            className={`${styles.navItem} ${activePageId === item.id ? styles.navItemActive : ''}`}
            onClick={() => handleNavItemClick(item)}
            title={!sidebarExpanded ? item.name : ''}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            {sidebarExpanded && <span className={styles.navText}>{item.name}</span>}
          </button>
        ))}
        
        {/* User info and logout */}
        <div className={styles.sidebarFooter}>
          {sidebarExpanded && user && (
            <div className={styles.userInfo}>
              <div className={styles.userName}>
                {user.FirstName} {user.LastName}
              </div>
              <div className={styles.userEmail}>{user.Email}</div>
            </div>
          )}
          <button
            className={styles.logoutButton}
            onClick={logout}
            title={!sidebarExpanded ? 'Logout' : ''}
          >
            <span className={styles.navIcon}>🚪</span>
            {sidebarExpanded && <span className={styles.navText}>Logout</span>}
          </button>
        </div>
      </nav>
    </div>
  );
}

