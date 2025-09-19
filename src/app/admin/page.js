'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import styles from './admin.module.css';

function AdminContent() {
  const { apiCall } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [toast, setToast] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiCall('http://localhost:3000/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.error('Failed to fetch users');
        setToast({ type: 'error', message: 'Failed to fetch users' });
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setToast({ type: 'error', message: 'Network error occurred while fetching users' });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userID) => {
    try {
      setLoadingDetails(true);
      const response = await apiCall(`http://localhost:3000/api/user-details/${encodeURIComponent(userID)}`);
      
      if (response.ok) {
        const data = await response.json();
        setSelectedUserDetails(data);
        setShowDetailModal(true);
      } else {
        const errorData = await response.json();
        setToast({ type: 'error', message: errorData.error || 'Failed to fetch user details' });
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      setToast({ type: 'error', message: 'Network error occurred while fetching details' });
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSort = (field) => {
    let direction = 'asc';
    if (sortField === field && sortDirection === 'asc') {
      direction = 'desc';
    }
    setSortField(field);
    setSortDirection(direction);
  };

  const getSortedUsers = (list) => {
    if (!sortField) return list;

    return [...list].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortField) {
        case 'name':
          aValue = `${a.FirstName || ''} ${a.LastName || ''}`.toLowerCase();
          bValue = `${b.FirstName || ''} ${b.LastName || ''}`.toLowerCase();
          break;
        case 'email':
          aValue = (a.Email || '').toLowerCase();
          bValue = (b.Email || '').toLowerCase();
          break;
        case 'branch':
          aValue = (a.Branch || '').toLowerCase();
          bValue = (b.Branch || '').toLowerCase();
          break;
        case 'employeeid':
          aValue = (a.EmployeeID || '').toLowerCase();
          bValue = (b.EmployeeID || '').toLowerCase();
          break;
        case 'isactive':
          aValue = a.IsActive ? 'active' : 'inactive';
          bValue = b.IsActive ? 'active' : 'inactive';
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  // Pagination
  const paginatedData = () => {
    const data = getSortedUsers(users);
    const total = data.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safeCurrent = Math.min(currentPage, totalPages);
    const start = (safeCurrent - 1) * pageSize;
    const end = start + pageSize;
    const items = data.slice(start, end);
    return { items, total, totalPages, current: safeCurrent };
  };

  const { items: visibleUsers, total: totalUsers, totalPages, current } = paginatedData();

  // Selection helpers
  const visibleIds = visibleUsers.map(u => u.UserID);
  const isAllSelected = visibleIds.length > 0 && visibleIds.every(id => selectedUserIds.includes(id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedUserIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedUserIds(prev => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const toggleSelectOne = (userID) => {
    setSelectedUserIds(prev =>
      prev.includes(userID) ? prev.filter(id => id !== userID) : [...prev, userID]
    );
  };

  const handleNavigation = (item) => {
    if (item.id === 'customers') {
      window.location.href = '/';
    } else if (item.id === 'admin') {
      // Already on admin page
    } else {
      console.log(`Navigate to: ${item.id}`);
    }
  };

  // Auto-hide toasts
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <div className={styles.appContainer}>
      {/* Sidebar */}
      <Sidebar activePageId="admin" onNavigate={handleNavigation} />

      {/* Main Content */}
      <div className={styles.mainContent}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>Admin Settings - User Management</h1>
            <div>
              <button 
                className={styles.refreshButton}
                onClick={fetchUsers}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>

          <div className={styles.tableContainer}>
            <table className={styles.userTable}>
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={toggleSelectAll}
                      aria-label="Select all"
                    />
                  </th>
                  <th>User ID</th>
                  <th 
                    className={styles.sortableHeader}
                    onClick={() => handleSort('name')}
                  >
                    Name {getSortIcon('name')}
                  </th>
                  <th 
                    className={styles.sortableHeader}
                    onClick={() => handleSort('email')}
                  >
                    Email {getSortIcon('email')}
                  </th>
                  <th>Phone</th>
                  <th 
                    className={styles.sortableHeader}
                    onClick={() => handleSort('branch')}
                  >
                    Branch {getSortIcon('branch')}
                  </th>
                  <th 
                    className={styles.sortableHeader}
                    onClick={() => handleSort('employeeid')}
                  >
                    Employee ID {getSortIcon('employeeid')}
                  </th>
                  <th 
                    className={styles.sortableHeader}
                    onClick={() => handleSort('isactive')}
                  >
                    Status {getSortIcon('isactive')}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 6 }).map((_, idx) => (
                      <tr key={`skeleton-${idx}`}>
                        <td className={styles.skeletonCell}><div className={styles.skeletonBlock} /></td>
                        <td className={styles.skeletonCell}><div className={styles.skeletonBlock} /></td>
                        <td className={styles.skeletonCell}><div className={styles.skeletonBlock} /></td>
                        <td className={styles.skeletonCell}><div className={styles.skeletonBlock} /></td>
                        <td className={styles.skeletonCell}><div className={styles.skeletonBlock} /></td>
                        <td className={styles.skeletonCell}><div className={styles.skeletonBlock} /></td>
                        <td className={styles.skeletonCell}><div className={styles.skeletonBlock} /></td>
                        <td className={styles.skeletonCell}><div className={styles.skeletonBlock} /></td>
                        <td className={styles.skeletonCell}><div className={styles.skeletonBlock} /></td>
                      </tr>
                    ))
                  : visibleUsers.map(user => (
                      <tr key={user.UserID}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedUserIds.includes(user.UserID)}
                            onChange={() => toggleSelectOne(user.UserID)}
                            aria-label={`Select ${user.FirstName} ${user.LastName}`}
                          />
                        </td>
                        <td>{user.UserID}</td>
                        <td>{user.FirstName} {user.LastName}</td>
                        <td>{user.Email}</td>
                        <td>{user.PhoneNumber}</td>
                        <td>{user.Branch}</td>
                        <td>{user.EmployeeID}</td>
                        <td>
                          <span className={`${styles.statusBadge} ${user.IsActive ? styles.statusActive : styles.statusInactive}`}>
                            {user.IsActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className={styles.actionButtons}>
                            <button 
                              onClick={() => fetchUserDetails(user.UserID)}
                              className={styles.viewButton}
                              disabled={loadingDetails}
                            >
                              {loadingDetails ? 'Loading...' : 'View'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          {!loading && (
            <div className={styles.pagination}>
              <div className={styles.paginationLeft}>
                <button 
                  className={styles.pageButton}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={current <= 1}
                >
                  Prev
                </button>
                <span className={styles.pageInfo}>
                  Page {current} of {totalPages}
                </span>
                <button 
                  className={styles.pageButton}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={current >= totalPages}
                >
                  Next
                </button>
              </div>
              <div className={styles.paginationRight}>
                <label>
                  Rows per page: 
                  <select 
                    className={styles.pageSizeSelect}
                    value={pageSize}
                    onChange={(e) => { setPageSize(parseInt(e.target.value, 10)); setCurrentPage(1); }}
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </label>
                <span className={styles.totalCount}>{totalUsers} total</span>
              </div>
            </div>
          )}

          {toast && (
            <div className={`${styles.toast} ${toast.type === 'success' ? styles.toastSuccess : styles.toastError}`}>
              {toast.message}
            </div>
          )}

          {/* User Detail Modal */}
          {showDetailModal && selectedUserDetails && (
            <div className={styles.modalOverlay} onClick={() => setShowDetailModal(false)}>
              <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                  <h2>User Details - {selectedUserDetails.UserID}</h2>
                  <button 
                    className={styles.modalCloseButton}
                    onClick={() => setShowDetailModal(false)}
                  >
                    ×
                  </button>
                </div>
                
                <div className={styles.modalBody}>
                  <div className={styles.detailSection}>
                    <h3>Personal Information</h3>
                    <div className={styles.detailGrid}>
                      <div><strong>User ID:</strong> {selectedUserDetails.UserID}</div>
                      <div><strong>User UID:</strong> {selectedUserDetails.UserUID}</div>
                      <div><strong>First Name:</strong> {selectedUserDetails.FirstName}</div>
                      <div><strong>Last Name:</strong> {selectedUserDetails.LastName}</div>
                      <div><strong>Phone Number:</strong> {selectedUserDetails.PhoneNumber}</div>
                      <div><strong>Email:</strong> {selectedUserDetails.Email}</div>
                      <div><strong>Employee ID:</strong> {selectedUserDetails.EmployeeID}</div>
                      <div><strong>Branch:</strong> {selectedUserDetails.Branch}</div>
                    </div>
                  </div>

                  <div className={styles.detailSection}>
                    <h3>Account Status</h3>
                    <div className={styles.detailGrid}>
                      <div><strong>Is Active:</strong> {selectedUserDetails.IsActive ? 'Yes' : 'No'}</div>
                      <div><strong>Is Deleted:</strong> {selectedUserDetails.IsDeleted ? 'Yes' : 'No'}</div>
                      <div><strong>Lockout Enabled:</strong> {selectedUserDetails.LockoutEnabled ? 'Yes' : 'No'}</div>
                      <div><strong>Lockout End Date:</strong> {selectedUserDetails.LockoutEndDateUtc ? new Date(selectedUserDetails.LockoutEndDateUtc).toLocaleString() : 'N/A'}</div>
                      <div><strong>Access Failed Count:</strong> {selectedUserDetails.AccessFailedCount}</div>
                    </div>
                  </div>

                  <div className={styles.detailSection}>
                    <h3>Security Settings</h3>
                    <div className={styles.detailGrid}>
                      <div><strong>Two Factor Enabled:</strong> {selectedUserDetails.TwoFactorEnabled ? 'Yes' : 'No'}</div>
                      <div><strong>Two Factor Key:</strong> {selectedUserDetails.TwoFactorKey ? '***Hidden***' : 'Not Set'}</div>
                      <div><strong>Password Changed:</strong> {selectedUserDetails.PasswordChanged ? new Date(selectedUserDetails.PasswordChanged).toLocaleString() : 'N/A'}</div>
                      <div><strong>Token Expire Date:</strong> {selectedUserDetails.TokenExpireDate ? new Date(selectedUserDetails.TokenExpireDate).toLocaleString() : 'N/A'}</div>
                    </div>
                  </div>

                  <div className={styles.detailSection}>
                    <h3>Alert Settings</h3>
                    <div className={styles.detailGrid}>
                      <div><strong>Send Alert SMS:</strong> {selectedUserDetails.SendAlertSMS ? 'Yes' : 'No'}</div>
                      <div><strong>Alert SMS Contact:</strong> {selectedUserDetails.AlertSMSContact}</div>
                    </div>
                  </div>

                  <div className={styles.detailSection}>
                    <h3>Timestamps</h3>
                    <div className={styles.detailGrid}>
                      <div><strong>Date Added:</strong> {selectedUserDetails.DateAdded ? new Date(selectedUserDetails.DateAdded).toLocaleString() : 'N/A'}</div>
                      <div><strong>Date Updated:</strong> {selectedUserDetails.DateUpdated ? new Date(selectedUserDetails.DateUpdated).toLocaleString() : 'N/A'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminSettings() {
  return (
    <ProtectedRoute>
      <AdminContent />
    </ProtectedRoute>
  );
}

