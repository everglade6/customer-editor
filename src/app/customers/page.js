'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import styles from './customers.module.css';

function CustomersContent() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedCustomerIds, setSelectedCustomerIds] = useState([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCifDetails, setSelectedCifDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', message: string }
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const { apiCall } = useAuth();

  const searchCustomers = async (query) => {
    // Reset error state
    setSearchError('');
    
    // Validate minimum 4 characters
    if (!query || query.trim().length < 4) {
      setCustomers([]);
      if (query && query.trim().length > 0) {
        setSearchError('Search query must be at least 4 characters long');
      }
      return;
    }
    
    try {
      setLoading(true);
      const response = await apiCall(`http://localhost:3000/api/search-cif?query=${encodeURIComponent(query.trim())}`);
      
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
        setCurrentPage(1); // Reset to first page on new search
      } else {
        const errorData = await response.json();
        setSearchError(errorData.error || 'Search failed');
        setCustomers([]);
      }
    } catch (error) {
      console.error('Error searching customers:', error);
      setSearchError('Network error occurred during search');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCifDetails = async (cifKey) => {
    try {
      setLoadingDetails(true);
      const response = await apiCall(`http://localhost:3000/api/cif-details/${encodeURIComponent(cifKey)}`);
      
      if (response.ok) {
        const data = await response.json();
        setSelectedCifDetails(data);
        setShowDetailModal(true);
      } else {
        const errorData = await response.json();
        setToast({ type: 'error', message: errorData.error || 'Failed to fetch CIF details' });
      }
    } catch (error) {
      console.error('Error fetching CIF details:', error);
      setToast({ type: 'error', message: 'Network error occurred while fetching details' });
    } finally {
      setLoadingDetails(false);
    }
  };

  // Remove automatic loading - only search on demand

  // Manual search function
  const handleSearch = () => {
    const trimmed = searchQuery.trim();
    if (trimmed.length >= 4) {
      searchCustomers(trimmed);
    } else if (trimmed.length === 0) {
      setCustomers([]);
      setSearchError('');
    } else {
      setSearchError('Search query must be at least 4 characters long');
    }
  };

  // Handle enter key press in search input
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };


  const handleSort = (field) => {
    let direction = 'asc';
    if (sortField === field && sortDirection === 'asc') {
      direction = 'desc';
    }
    setSortField(field);
    setSortDirection(direction);
  };

  const getSortedCustomers = (list) => {
    if (!sortField) return list;

    return [...list].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortField) {
        case 'name':
          aValue = `${a.FirstName || ''} ${a.LastName || ''}`.toLowerCase();
          bValue = `${b.FirstName || ''} ${b.LastName || ''}`.toLowerCase();
          break;
        case 'cifkey':
          aValue = (a.CIFKey || '').toLowerCase();
          bValue = (b.CIFKey || '').toLowerCase();
          break;
        case 'branch':
          aValue = (a.Branch || '').toLowerCase();
          bValue = (b.Branch || '').toLowerCase();
          break;
        case 'address':
          aValue = (a.Address || '').toLowerCase();
          bValue = (b.Address || '').toLowerCase();
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

  // No client-side filtering needed since search is server-side only
  const getFilteredCustomers = () => {
    return customers;
  };

  const sortedFilteredCustomers = () => {
    const filtered = getFilteredCustomers();
    return getSortedCustomers(filtered);
  };

  // Pagination derived values based on filtered+sorted data
  const paginatedData = () => {
    const data = sortedFilteredCustomers();
    const total = data.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safeCurrent = Math.min(currentPage, totalPages);
    const start = (safeCurrent - 1) * pageSize;
    const end = start + pageSize;
    const items = data.slice(start, end);
    return { items, total, totalPages, current: safeCurrent };
  };

  const { items: visibleCustomers, total: totalFiltered, totalPages, current } = paginatedData();

  // Selection helpers scoped to the visible page
  const visibleIds = visibleCustomers.map(c => c.CIFKey);
  const isAllSelected = visibleIds.length > 0 && visibleIds.every(id => selectedCustomerIds.includes(id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedCustomerIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedCustomerIds(prev => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const toggleSelectOne = (cifKey) => {
    setSelectedCustomerIds(prev =>
      prev.includes(cifKey) ? prev.filter(id => id !== cifKey) : [...prev, cifKey]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedCustomerIds.length === 0) return;
    try {
      await Promise.allSettled(
        selectedCustomerIds.map(CID =>
          apiCall(`http://localhost:3000/api/deleteCustomer/${CID}`, { method: 'DELETE' })
        )
      );
      setSelectedCustomerIds([]);
      // Refresh search results after bulk delete
      if (searchQuery.trim().length >= 4) {
        searchCustomers(searchQuery.trim());
      }
      setToast({ type: 'success', message: 'Selected customers deleted.' });
    } catch (error) {
      console.error('Error deleting selected customers:', error);
      setToast({ type: 'error', message: 'Failed to delete selected customers.' });
    }
  };

  // Auto-hide toasts
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);


  const handleNavigation = (item) => {
    if (item.id === 'admin') {
      window.location.href = '/admin';
    } else if (item.id === 'customers') {
      // Already on customers page
    } else {
      console.log(`Navigate to: ${item.id}`);
    }
  };

  return (
    <div className={styles.appContainer}>
      {/* Sidebar */}
      <Sidebar activePageId="customers" onNavigate={handleNavigation} />

      {/* Main Content */}
      <div className={styles.mainContent}>
        <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Customer Information Summary</h1>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="text"
              placeholder="Search (min 4 characters)..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              style={{ marginRight: '8px' }}
            />
            <button 
              className={styles.searchButton}
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
            {searchError && (
              <span className={styles.searchError}>{searchError}</span>
            )}
          </div>
          {selectedCustomerIds.length > 0 && (
            <button 
              className={styles.deleteButton}
              onClick={handleBulkDelete}
              style={{ marginRight: '8px' }}
            >
              Delete Selected ({selectedCustomerIds.length})
            </button>
          )}
        </div>
      </div>



      <div className={styles.tableContainer}>
        {customers.length === 0 && !loading && searchQuery.trim().length === 0 && (
          <div className={styles.noSearchMessage}>
            <h3>🔍 CIF Inquiry</h3>
            <p>Enter at least 4 characters in the search box to find CIF records.</p>
          </div>
        )}
        {customers.length === 0 && !loading && searchQuery.trim().length >= 4 && !searchError && (
          <div className={styles.noResultsMessage}>
            <h3>No Results Found</h3>
            <p>No CIF records match your search criteria: "{searchQuery}"</p>
          </div>
        )}
        <table className={`${styles.customerTable} ${customers.length === 0 ? styles.hidden : ''}`}>
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
              <th 
                className={styles.sortableHeader}
                onClick={() => handleSort('branch')}
              >
                Branch {getSortIcon('branch')}
              </th>
              <th 
                className={styles.sortableHeader}
                onClick={() => handleSort('cifkey')}
              >
                CIF Key {getSortIcon('cifkey')}
              </th>
              <th 
                className={styles.sortableHeader}
                onClick={() => handleSort('name')}
              >
                First Name {getSortIcon('name')}
              </th>
              <th 
                className={styles.sortableHeader}
                onClick={() => handleSort('name')}
              >
                Last Name {getSortIcon('name')}
              </th>
              <th 
                className={styles.sortableHeader}
                onClick={() => handleSort('address')}
              >
                Address {getSortIcon('address')}
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
                  </tr>
                ))
              : visibleCustomers.map(customer => (
                  <tr key={customer.CIFKey}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedCustomerIds.includes(customer.CIFKey)}
                        onChange={() => toggleSelectOne(customer.CIFKey)}
                        aria-label={`Select ${customer.FirstName} ${customer.LastName}`}
                      />
                    </td>
                    <td>{customer.Branch}</td>
                    <td>{customer.CIFKey}</td>
                    <td>{customer.FirstName}</td>
                    <td>{customer.LastName}</td>
                    <td>{customer.Address}</td>
                    <td>
                      <div className={styles.actionButtons}>
                        <button 
                          onClick={() => fetchCifDetails(customer.CIFKey)}
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
            <span className={styles.totalCount}>{totalFiltered} total</span>
          </div>
        </div>
      )}

        {toast && (
          <div className={`${styles.toast} ${toast.type === 'success' ? styles.toastSuccess : styles.toastError}`}>
            {toast.message}
          </div>
        )}

        {/* CIF Detail Modal */}
        {showDetailModal && selectedCifDetails && (
          <div className={styles.modalOverlay} onClick={() => setShowDetailModal(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>CIF Details - {selectedCifDetails.CIFKey}</h2>
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
                    <div><strong>CIF Key:</strong> {selectedCifDetails.CIFKey}</div>
                    <div><strong>Full Name:</strong> {selectedCifDetails.FullName || `${selectedCifDetails.FirstName} ${selectedCifDetails.MiddleName || ''} ${selectedCifDetails.LastName}`.trim()}</div>
                    <div><strong>First Name:</strong> {selectedCifDetails.FirstName}</div>
                    <div><strong>Middle Name:</strong> {selectedCifDetails.MiddleName}</div>
                    <div><strong>Last Name:</strong> {selectedCifDetails.LastName}</div>
                    <div><strong>Nickname:</strong> {selectedCifDetails.Nickname}</div>
                    <div><strong>Suffix:</strong> {selectedCifDetails.Suffix}</div>
                    <div><strong>Birth Date:</strong> {selectedCifDetails.BirthDate ? new Date(selectedCifDetails.BirthDate).toLocaleDateString() : 'N/A'}</div>
                    <div><strong>Place of Birth:</strong> {selectedCifDetails.PlaceOfBirth}</div>
                    <div><strong>Sex:</strong> {selectedCifDetails.Sex}</div>
                    <div><strong>Civil Status:</strong> {selectedCifDetails.CivilStatus}</div>
                    <div><strong>Citizenship:</strong> {selectedCifDetails.Citizenship}</div>
                    <div><strong>Dependents:</strong> {selectedCifDetails.Dependents}</div>
                    <div><strong>Mother's Maiden Name:</strong> {selectedCifDetails.MothersMaidenName}</div>
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <h3>Contact Information</h3>
                  <div className={styles.detailGrid}>
                    <div><strong>Home Phone:</strong> {selectedCifDetails.HomePhone}</div>
                    <div><strong>Home Mobile:</strong> {selectedCifDetails.HomeMobilePhone}</div>
                    <div><strong>Mobile No:</strong> {selectedCifDetails.MobileNo}</div>
                    <div><strong>Business Phone:</strong> {selectedCifDetails.BusinessPhone}</div>
                    <div><strong>Business Mobile:</strong> {selectedCifDetails.BusinessMobilePhone}</div>
                    <div><strong>Email:</strong> {selectedCifDetails.Email}</div>
                    <div><strong>Home Email:</strong> {selectedCifDetails.HomeEmail}</div>
                    <div><strong>Business Email:</strong> {selectedCifDetails.BusinessEmail}</div>
                    <div><strong>Personal Email:</strong> {selectedCifDetails.PersonalEmailAddress}</div>
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <h3>Address Information</h3>
                  <div className={styles.detailGrid}>
                    <div><strong>Home Address:</strong> {selectedCifDetails.HomeAddress}</div>
                    <div><strong>Home Address 2:</strong> {selectedCifDetails.HomeAddress2}</div>
                    <div><strong>Home Address 3:</strong> {selectedCifDetails.HomeAddress3}</div>
                    <div><strong>Home ZIP:</strong> {selectedCifDetails.HomeZip}</div>
                    <div><strong>Home Region:</strong> {selectedCifDetails.HomeRegion}</div>
                    <div><strong>Home Country:</strong> {selectedCifDetails.HomeCountry}</div>
                    <div><strong>Business Address:</strong> {selectedCifDetails.BusinessAddress}</div>
                    <div><strong>Business Address 2:</strong> {selectedCifDetails.BusinessAddress2}</div>
                    <div><strong>Business Address 3:</strong> {selectedCifDetails.BusinessAddress3}</div>
                    <div><strong>Business ZIP:</strong> {selectedCifDetails.BusinessZIP}</div>
                    <div><strong>Business Region:</strong> {selectedCifDetails.BusinessRegion}</div>
                    <div><strong>Business Country:</strong> {selectedCifDetails.BusinessCountry}</div>
                    <div><strong>Mailing Address:</strong> {selectedCifDetails.MailingAddress}</div>
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <h3>Business Information</h3>
                  <div className={styles.detailGrid}>
                    <div><strong>Business Name:</strong> {selectedCifDetails.BusinessName}</div>
                    <div><strong>Nature of Business:</strong> {selectedCifDetails.NatureOfBusiness}</div>
                    <div><strong>Kind of Business:</strong> {selectedCifDetails.KindOfBusiness}</div>
                    <div><strong>Business Start Date:</strong> {selectedCifDetails.BusinessStartDate ? new Date(selectedCifDetails.BusinessStartDate).toLocaleDateString() : 'N/A'}</div>
                    <div><strong>Annual Gross Income:</strong> {selectedCifDetails.BusinessAnnualGrossIncome}</div>
                    <div><strong>Source of Funds:</strong> {selectedCifDetails.SourceOfFunds}</div>
                    <div><strong>Other Source of Funds:</strong> {selectedCifDetails.OtherSourceOfFunds}</div>
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <h3>Account Information</h3>
                  <div className={styles.detailGrid}>
                    <div><strong>CASA Account Number:</strong> {selectedCifDetails.CASAAccountNumber}</div>
                    <div><strong>Other Bank Accounts:</strong> {selectedCifDetails.OtherBankAccounts}</div>
                    <div><strong>Customer Classification:</strong> {selectedCifDetails.CustomerClassification}</div>
                    <div><strong>Customer Risk Profile:</strong> {selectedCifDetails.CustomerRiskProfile}</div>
                    <div><strong>DOSRI:</strong> {selectedCifDetails.DOSRI ? 'Yes' : 'No'}</div>
                    <div><strong>DOSRI Tag:</strong> {selectedCifDetails.DOSRITag}</div>
                    <div><strong>Bank Employee:</strong> {selectedCifDetails.BankEmployeeIndicator ? 'Yes' : 'No'}</div>
                    <div><strong>Taxable:</strong> {selectedCifDetails.Taxable ? 'Yes' : 'No'}</div>
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <h3>Status Information</h3>
                  <div className={styles.detailGrid}>
                    <div><strong>CIF Status:</strong> {selectedCifDetails.CIFStatus}</div>
                    <div><strong>CIF Sts:</strong> {selectedCifDetails.CIFSts}</div>
                    <div><strong>Approved By:</strong> {selectedCifDetails.ApprovedBy}</div>
                    <div><strong>Date Approved:</strong> {selectedCifDetails.DateApproved ? new Date(selectedCifDetails.DateApproved).toLocaleDateString() : 'N/A'}</div>
                    <div><strong>Date Added:</strong> {selectedCifDetails.DateAdded ? new Date(selectedCifDetails.DateAdded).toLocaleDateString() : 'N/A'}</div>
                    <div><strong>Date Updated:</strong> {selectedCifDetails.DateUpdated ? new Date(selectedCifDetails.DateUpdated).toLocaleDateString() : 'N/A'}</div>
                    <div><strong>Date Sent:</strong> {selectedCifDetails.DateSent ? new Date(selectedCifDetails.DateSent).toLocaleDateString() : 'N/A'}</div>
                    <div><strong>CIF Remark:</strong> {selectedCifDetails.CIFRemark}</div>
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <h3>Other Information</h3>
                  <div className={styles.detailGrid}>
                    <div><strong>CIF Personal ID:</strong> {selectedCifDetails.CIFPersonalID}</div>
                    <div><strong>Old Reference:</strong> {selectedCifDetails.OldReference}</div>
                    <div><strong>Relationship:</strong> {selectedCifDetails.Relationship}</div>
                    <div><strong>Other Info:</strong> {selectedCifDetails.OtherInfo}</div>
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

export default function Customers() {
  return (
    <ProtectedRoute>
      <CustomersContent />
    </ProtectedRoute>
  );
}
