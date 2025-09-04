'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';

export default function Home() {
  const [customers, setCustomers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [newCustomer, setNewCustomer] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneno: '',
    city: '',
    state: '',
    zipcode: ''
  });

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/customers');
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      } else {
        console.error('Failed to fetch customers');
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCustomer(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingCustomer(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/addCustomer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCustomer),
      });

      if (response.ok) {
        setNewCustomer({ firstName: '', lastName: '', email: '', phoneno: '', city: '', state: '', zipcode: '' });
        setShowAddForm(false);
        fetchCustomers();
      } else {
        console.error('Failed to add customer');
      }
    } catch (error) {
      console.error('Error adding customer:', error);
    }
  };

  const handleEditCustomer = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/updateCustomer', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingCustomer),
      });

      if (response.ok) {
        setShowEditForm(false);
        setEditingCustomer(null);
        fetchCustomers();
      } else {
        console.error('Failed to update customer');
      }
    } catch (error) {
      console.error('Error updating customer:', error);
    }
  };

  const handleDeleteCustomer = async (CID) => {
    try {
      const response = await fetch(`http://localhost:3000/api/deleteCustomer/${CID}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchCustomers(); // Refresh the list
      } else {
        console.error('Failed to delete customer');
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  const openEditForm = (customer) => {
    setEditingCustomer(customer);
    setShowEditForm(true);
  };

  const closeEditForm = () => {
    setShowEditForm(false);
    setEditingCustomer(null);
  };

  const handleSort = (field) => {
    let direction = 'asc';
    if (sortField === field && sortDirection === 'asc') {
      direction = 'desc';
    }
    setSortField(field);
    setSortDirection(direction);
  };

  const getSortedCustomers = () => {
    if (!sortField) return customers;

    return [...customers].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortField) {
        case 'name':
          aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
          bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
          break;
        case 'city':
          aValue = (a.city || '').toLowerCase();
          bValue = (b.city || '').toLowerCase();
          break;
        case 'state':
          aValue = (a.state || '').toLowerCase();
          bValue = (b.state || '').toLowerCase();
          break;
        case 'zipcode':
          aValue = (a.zipcode || '').toLowerCase();
          bValue = (b.zipcode || '').toLowerCase();
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

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading customers...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Customer Manager</h1>
        <button 
          className={styles.addButton}
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancel' : 'Add Customer'}
        </button>
      </div>

      {showAddForm && (
        <div className={styles.addForm}>
          <h2>Add New Customer</h2>
          <form onSubmit={handleAddCustomer}>
            <div className={styles.formRow}>
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={newCustomer.firstName}
                onChange={handleInputChange}
                required
                className={styles.input}
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={newCustomer.lastName}
                onChange={handleInputChange}
                required
                className={styles.input}
              />
            </div>
            <div className={styles.formRow}>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={newCustomer.email}
                onChange={handleInputChange}
                required
                className={styles.input}
              />
              <input
                type="tel"
                name="phoneno"
                placeholder="Phone"
                value={newCustomer.phoneno}
                onChange={handleInputChange}
                className={styles.input}
              />
            </div>
            <div className={styles.formRow}>
              <input
                type="text"
                name="city"
                placeholder="City"
                value={newCustomer.city}
                onChange={handleInputChange}
                className={styles.input}
              />
              <input
                type="text"
                name="state"
                placeholder="State"
                value={newCustomer.state}
                onChange={handleInputChange}
                className={styles.input}
              />
            </div>
            <div className={styles.formRow}>
              <input
                type="text"
                name="zipcode"
                placeholder="Zip Code"
                value={newCustomer.zipcode}
                onChange={handleInputChange}
                className={styles.input}
              />
            </div>
            <button type="submit" className={styles.submitButton}>
              Add Customer
            </button>
          </form>
        </div>
      )}

      {showEditForm && editingCustomer && (
        <div className={styles.editForm}>
          <h2>Edit Customer</h2>
          <form onSubmit={handleEditCustomer}>
            <div className={styles.formRow}>
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={editingCustomer.firstName}
                onChange={handleEditInputChange}
                required
                className={styles.input}
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={editingCustomer.lastName}
                onChange={handleEditInputChange}
                required
                className={styles.input}
              />
            </div>
            <div className={styles.formRow}>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={editingCustomer.email}
                onChange={handleEditInputChange}
                required
                className={styles.input}
              />
              <input
                type="tel"
                name="phoneno"
                placeholder="Phone"
                value={editingCustomer.phoneno}
                onChange={handleEditInputChange}
                className={styles.input}
              />
            </div>
            <div className={styles.formRow}>
              <input
                type="text"
                name="city"
                placeholder="City"
                value={editingCustomer.city}
                onChange={handleEditInputChange}
                className={styles.input}
              />
              <input
                type="text"
                name="state"
                placeholder="State"
                value={editingCustomer.state}
                onChange={handleEditInputChange}
                className={styles.input}
              />
            </div>
            <div className={styles.formRow}>
              <input
                type="text"
                name="zipcode"
                placeholder="Zip Code"
                value={editingCustomer.zipcode}
                onChange={handleEditInputChange}
                className={styles.input}
              />
            </div>
            <div className={styles.editFormButtons}>
              <button type="submit" className={styles.submitButton}>
                Update Customer
              </button>
              <button type="button" onClick={closeEditForm} className={styles.cancelButton}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className={styles.tableContainer}>
        <table className={styles.customerTable}>
          <thead>
            <tr>
              <th 
                className={styles.sortableHeader}
                onClick={() => handleSort('name')}
              >
                Name {getSortIcon('name')}
              </th>
              <th>Email</th>
              <th>Phone</th>
              <th 
                className={styles.sortableHeader}
                onClick={() => handleSort('city')}
              >
                City {getSortIcon('city')}
              </th>
              <th 
                className={styles.sortableHeader}
                onClick={() => handleSort('state')}
              >
                State {getSortIcon('state')}
              </th>
              <th 
                className={styles.sortableHeader}
                onClick={() => handleSort('zipcode')}
              >
                Zip Code {getSortIcon('zipcode')}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {getSortedCustomers().map(customer => (
              <tr key={customer.CID}>
                <td>{customer.firstName} {customer.lastName}</td>
                <td>{customer.email}</td>
                <td>{customer.phoneno}</td>
                <td>{customer.city}</td>
                <td>{customer.state}</td>
                <td>{customer.zipcode}</td>
                <td>
                  <div className={styles.actionButtons}>
                    <button 
                      onClick={() => openEditForm(customer)}
                      className={styles.editButton}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteCustomer(customer.CID)}
                      className={styles.deleteButton}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}