import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const InsuranceManagement = () => {
  // State management
   const navigate = useNavigate();
      let garageId = localStorage.getItem("garageId");
    if (!garageId) {
      garageId = localStorage.getItem("garage_id");
    }
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [expiringInsurances, setExpiringInsurances] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [openDialog, setOpenDialog] = useState(false);
  
  // Form state for adding insurance - Updated field names to match API
  const [insuranceForm, setInsuranceForm] = useState({
    policyNumber: '',
    company: '', // Changed from insuranceCompany
    type: '', // Changed from policyType
    startDate: '',
    expiryDate: '', // Changed from endDate
    premiumAmount: '',
    carNumber: '', // Changed from vehicleId
    contactPerson: '',
    phoneNumber: '',
    garageId: '' // Added required field
  });

  const getAuthHeaders = () => {
    
    return {
      'Content-Type': 'application/json',
    };
  };

  // Fetch expiring insurances
  const fetchExpiringInsurances = async () => {
     
    setLoading(true);
    try {
      const response = await fetch('https://garage-management-zi5z.onrender.com/api/garage/insurance/expiring', {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setExpiringInsurances(data || data || []);
        setMessage({ type: 'success', text: 'Expiring insurances loaded successfully!' });
      } else {
        throw new Error('Failed to fetch expiring insurances');
      }
    } catch (error) {
      setMessage({ type: 'error', text: `Error: ${error.message}` });
      console.error('Error fetching expiring insurances:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add new insurance
  const addInsurance = async () => {
    setLoading(true);
    try {
      // Prepare data with correct field names for API
      const insuranceData = {
        policyNumber: insuranceForm.policyNumber,
        company: insuranceForm.company,
        type: insuranceForm.type,
        startDate: insuranceForm.startDate,
        expiryDate: insuranceForm.expiryDate,
        premiumAmount: insuranceForm.premiumAmount,
        carNumber: insuranceForm.carNumber,
        contactPerson: insuranceForm.contactPerson,
        phoneNumber: insuranceForm.phoneNumber,
        garageId: insuranceForm.garageId || 'DEFAULT_GARAGE_ID' // You'll need to set this properly
      };

      console.log('Sending insurance data:', insuranceData); // For debugging

      const response = await fetch('https://garage-management-zi5z.onrender.com/api/garage/insurance/add', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(insuranceData)
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessage({ type: 'success', text: 'Insurance added successfully!' });
        setOpenDialog(false);
        // Reset form
        setInsuranceForm({
          policyNumber: '',
          company: '',
          type: '',
          startDate: '',
          expiryDate: '',
          premiumAmount: '',
          carNumber: '',
          contactPerson: '',
          phoneNumber: '',
          garageId: ''
        });
        // Refresh expiring insurances if on that tab
        if (activeTab === 1) {
          fetchExpiringInsurances();
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Failed to add insurance');
      }
    } catch (error) {
      setMessage({ type: 'error', text: `Error: ${error.message}` });
      console.error('Error adding insurance:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setInsuranceForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle tab change
  const handleTabChange = (tabIndex) => {
    setActiveTab(tabIndex);
    if (tabIndex === 1) {
      fetchExpiringInsurances();
    }
  };

  // Calculate days until expiry
  const getDaysUntilExpiry = (endDate) => {
    const today = new Date();
    const expiry = new Date(endDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get status badge based on days until expiry
  const getStatusBadge = (endDate) => {
    const days = getDaysUntilExpiry(endDate);
    if (days < 0) {
      return <span className="status-badge expired">Expired</span>;
    } else if (days <= 30) {
      return <span className="status-badge warning">{days} days left</span>;
    } else {
      return <span className="status-badge active">Active</span>;
    }
  };

  // Clear messages after 5 seconds
  useEffect(() => {
    if(!garageId){
        navigate("\login")
      }
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Mobile card view for insurance items
  const renderMobileInsuranceCard = (insurance, index) => (
    <div key={index} className="mobile-card">
      <div className="mobile-card-header">
        <h4>{insurance.policyNumber || 'N/A'}</h4>
        {(insurance.expiryDate || insurance.endDate) ? 
          getStatusBadge(insurance.expiryDate || insurance.endDate) : 
          <span className="status-badge">N/A</span>}
      </div>
      <div className="mobile-card-content">
        <div className="mobile-card-row">
          <span className="label">Company:</span>
          <span>{insurance.company || insurance.insuranceCompany || 'N/A'}</span>
        </div>
        <div className="mobile-card-row">
          <span className="label">Type:</span>
          <span>{insurance.type || insurance.policyType || 'N/A'}</span>
        </div>
        <div className="mobile-card-row">
          <span className="label">End Date:</span>
          <span>{insurance.expiryDate || insurance.endDate ? 
            new Date(insurance.expiryDate || insurance.endDate).toLocaleDateString() : 'N/A'}</span>
        </div>
        <div className="mobile-card-row">
          <span className="label">Car Number:</span>
          <span>{insurance.carNumber || insurance.vehicleId || 'N/A'}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Insurance Management System</h1>
      
      {/* Message Alert */}
      {message.text && (
        <div className={`alert alert-${message.type}`} style={styles.alert}>
          <span>{message.text}</span>
          <button 
            onClick={() => setMessage({ type: '', text: '' })}
            style={styles.closeBtn}
          >
            ×
          </button>
        </div>
      )}

      {/* Tabs */}
      <div style={styles.tabContainer}>
        <button 
          className={activeTab === 0 ? 'tab active' : 'tab'}
          onClick={() => handleTabChange(0)}
          style={{...styles.tab, ...(activeTab === 0 ? styles.activeTab : {})}}
        >
          Add Insurance
        </button>
        <button 
          className={activeTab === 1 ? 'tab active' : 'tab'}
          onClick={() => handleTabChange(1)}
          style={{...styles.tab, ...(activeTab === 1 ? styles.activeTab : {})}}
        >
          Expiring Insurances
        </button>
      </div>

      {/* Add Insurance Tab */}
      {activeTab === 0 && (
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Add New Insurance Policy</h2>
            <button
              style={styles.primaryBtn}
              onClick={() => setOpenDialog(true)}
            >
              + Add Insurance
            </button>
          </div>
          
          <p style={styles.description}>
            Click the "Add Insurance" button to create a new insurance policy record.
            All insurance policies will be tracked for expiration dates automatically.
          </p>
        </div>
      )}

      {/* Expiring Insurances Tab */}
      {activeTab === 1 && (
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Expiring Insurance Policies</h2>
            <button
              style={styles.secondaryBtn}
              onClick={fetchExpiringInsurances}
              disabled={loading}
            >
              {loading ? '⟳ Loading...' : '⚠ Refresh'}
            </button>
          </div>

          {loading ? (
            <div style={styles.loading}>
              <div style={styles.spinner}></div>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
            {/* Desktop Table View */}
<div className="desktop-only" style={styles.tableContainer}>
  <table style={styles.table}>
    <thead>
      <tr style={styles.tableHeader}>
        <th>Policy Number</th>
        <th>Company</th>
        <th>Policy Type</th>
        <th>End Date</th>
        <th>Car Number</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      {expiringInsurances.length > 0 ? (
        expiringInsurances.map((insurance, index) => (
          <tr key={insurance._id || index} style={styles.tableRow}>
            <td>{insurance.policyNumber || 'N/A'}</td>
            <td>{insurance.company || 'N/A'}</td>
            <td>{insurance.type || 'N/A'}</td>
            <td>{insurance.expiryDate ? 
              new Date(insurance.expiryDate).toLocaleDateString() : 'N/A'}</td>
            <td>{insurance.carNumber || 'N/A'}</td>
            <td>
              {insurance.expiryDate ? 
                getStatusBadge(insurance.expiryDate) : 'N/A'}
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="6" style={styles.emptyState}>
            No expiring insurances found. Click "Refresh" to check for updates.
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>

{/* Mobile Card View */}
<div className="mobile-only">
  {expiringInsurances.length > 0 ? (
    expiringInsurances.map((insurance, index) => 
      renderMobileInsuranceCard(insurance, index)
    )
  ) : (
    <div style={styles.emptyState}>
      No expiring insurances found. Click "Refresh" to check for updates.
    </div>
  )}
</div>
            </>
          )}
        </div>
      )}

      {/* Add Insurance Dialog */}
      {openDialog && (
        <div style={styles.overlay}>
          <div style={styles.dialog}>
            <div style={styles.dialogHeader}>
              <h3>Add New Insurance Policy</h3>
              <button 
                onClick={() => setOpenDialog(false)}
                style={styles.closeBtn}
              >
                ×
              </button>
            </div>
            
            <div style={styles.dialogContent}>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label>Policy Number *</label>
                  <input
                    type="text"
                    value={insuranceForm.policyNumber}
                    onChange={(e) => handleInputChange('policyNumber', e.target.value)}
                    style={styles.input}
                    required
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <label>Insurance Company *</label>
                  <input
                    type="text"
                    value={insuranceForm.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    style={styles.input}
                    required
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <label>Policy Type *</label>
                  <input
                    type="text"
                    value={insuranceForm.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    style={styles.input}
                    placeholder="e.g., Comprehensive, Third Party"
                    required
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <label>Car Number *</label>
                  <input
                    type="text"
                    value={insuranceForm.carNumber}
                    onChange={(e) => handleInputChange('carNumber', e.target.value)}
                    style={styles.input}
                    placeholder="e.g., ABC-123"
                    required
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <label>Garage ID *</label>
                  <input
                    type="text"
                    value={insuranceForm.garageId}
                    onChange={(e) => handleInputChange('garageId', e.target.value)}
                    style={styles.input}
                    placeholder="Enter garage ID"
                    required
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={insuranceForm.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    style={styles.input}
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <label>Expiry Date *</label>
                  <input
                    type="date"
                    value={insuranceForm.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                    style={styles.input}
                    required
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <label>Premium Amount</label>
                  <input
                    type="number"
                    value={insuranceForm.premiumAmount}
                    onChange={(e) => handleInputChange('premiumAmount', e.target.value)}
                    style={styles.input}
                    placeholder="0.00"
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <label>Contact Person</label>
                  <input
                    type="text"
                    value={insuranceForm.contactPerson}
                    onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                    style={styles.input}
                  />
                </div>
                
                <div style={styles.formGroupFull}>
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={insuranceForm.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    style={styles.input}
                    placeholder="e.g., +1-234-567-8900"
                  />
                </div>
              </div>
            </div>
            
            <div style={styles.dialogActions}>
              <button 
                onClick={() => setOpenDialog(false)}
                style={styles.cancelBtn}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={addInsurance}
                style={{...styles.primaryBtn, opacity: loading ? 0.7 : 1}}
                disabled={loading || !insuranceForm.policyNumber || !insuranceForm.company || !insuranceForm.type || !insuranceForm.carNumber || !insuranceForm.expiryDate}
              >
                {loading ? 'Adding...' : '+ Add Insurance'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .alert-success {
          background-color: #d4edda;
          border-color: #c3e6cb;
          color: #155724;
        }
        
        .alert-error {
          background-color: #f8d7da;
          border-color: #f5c6cb;
          color: #721c24;
        }
        
        .status-badge {
          padding: 4px 12px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }
        
        .status-badge.active {
          background-color: #d4edda;
          color: #155724;
        }
        
        .status-badge.warning {
          background-color: #fff3cd;
          color: #856404;
        }
        
        .status-badge.expired {
          background-color: #f8d7da;
          color: #721c24;
        }
        
        table th, table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e0e0e0;
        }
        
        table th {
          font-weight: 600;
          color: #333;
        }
        
        button:hover {
          opacity: 0.9;
        }
        
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        input:focus {
          outline: none;
          border-color: #1976d2;
          box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
        }
        
        label {
          font-weight: 500;
          color: #333;
          margin-bottom: 4px;
        }

        /* Mobile-first responsive styles */
        .desktop-only {
          display: none;
        }
        
        .mobile-only {
          display: block;
        }
        
        .mobile-card {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          margin-bottom: 16px;
          padding: 16px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .mobile-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .mobile-card-header h4 {
          margin: 0;
          color: #1976d2;
          font-size: 16px;
          font-weight: 600;
        }
        
        .mobile-card-content {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .mobile-card-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 4px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .mobile-card-row:last-child {
          border-bottom: none;
        }
        
        .mobile-card-row .label {
          font-weight: 500;
          color: #666;
          font-size: 14px;
        }
        
        .mobile-card-row span:not(.label) {
          font-size: 14px;
          text-align: right;
          max-width: 60%;
          word-break: break-word;
        }

        /* Tablet and Desktop styles */
        @media (min-width: 768px) {
          .desktop-only {
            display: block;
          }
          
          .mobile-only {
            display: none;
          }
        }

        /* Mobile-specific adjustments */
        @media (max-width: 767px) {
          .container {
            padding: 12px !important;
          }
          
          .title {
            font-size: 1.5rem !important;
            margin-bottom: 16px !important;
          }
          
          .tab-container {
            flex-direction: column !important;
            border: 1px solid #e0e0e0 !important;
            border-radius: 8px !important;
            overflow: hidden !important;
          }
          
          .card-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
          }
          
          .card-title {
            font-size: 1.2rem !important;
            margin: 0 !important;
          }
          
          .primary-btn, .secondary-btn {
            width: 100% !important;
            padding: 12px 16px !important;
          }
          
          .dialog {
            width: 95% !important;
            max-height: 95vh !important;
            margin: 10px !important;
          }
          
          .form-grid {
            grid-template-columns: 1fr !important;
          }
          
          .dialog-actions {
            flex-direction: column !important;
            gap: 8px !important;
          }
          
          .dialog-actions button {
            width: 100% !important;
          }
        }

        /* Small mobile adjustments */
        @media (max-width: 480px) {
          .container {
            padding: 8px !important;
          }
          
          .mobile-card {
            padding: 12px !important;
          }
          
          .mobile-card-header {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
          
          .mobile-card-row {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 4px !important;
          }
          
          .mobile-card-row span:not(.label) {
            max-width: 100% !important;
            text-align: left !important;
          }
        }
      `}</style>
    </div>
  );
};

// Updated responsive styles object
const styles = {
  container: {
    maxWidth: '1200px',
    // margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    marginLeft:"270px"
  },
  title: {
    color: '#1976d2',
    marginBottom: '20px',
    fontSize: '2rem',
    fontWeight: 'bold'
  },
  alert: {
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    border: '1px solid',
    flexWrap: 'wrap',
    gap: '8px'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '0',
    width: '24px',
    height: '24px',
    flexShrink: 0
  },
  tabContainer: {
    display: 'flex',
    borderBottom: '2px solid #e0e0e0',
    marginBottom: '20px'
  },
  tab: {
    padding: '12px 24px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
    color: '#666',
    borderBottom: '2px solid transparent',
    flex: 1,
    textAlign: 'center'
  },
  activeTab: {
    color: '#1976d2',
    borderBottom: '2px solid #1976d2'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: '1px solid #e0e0e0'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    flexWrap: 'wrap',
    gap: '12px'
  },
  cardTitle: {
    margin: 0,
    fontSize: '1.5rem',
    color: '#333'
  },
  description: {
    color: '#666',
    fontSize: '16px',
    lineHeight: '1.5'
  },
  primaryBtn: {
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    minWidth: '140px'
  },
  secondaryBtn: {
    backgroundColor: '#f5f5f5',
    color: '#333',
    border: '1px solid #ddd',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    minWidth: '140px'
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #1976d2',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  tableContainer: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '16px',
    minWidth: '600px'
  },
  tableHeader: {
    backgroundColor: '#f5f5f5'
  },
  tableRow: {
    borderBottom: '1px solid #e0e0e0'
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px',
    color: '#666'
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '10px'
  },
  dialog: {
    backgroundColor: 'white',
    borderRadius: '8px',
    maxWidth: '600px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto'
  },
  dialogHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #e0e0e0'
  },
  dialogContent: {
    padding: '20px'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  formGroupFull: {
    display: 'flex',
    flexDirection: 'column',
    gridColumn: '1 / -1'
  },
  input: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    marginTop: '4px'
  },
  dialogActions: {
    padding: '20px',
    borderTop: '1px solid #e0e0e0',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    flexWrap: 'wrap'
  },
  cancelBtn: {
    backgroundColor: 'transparent',
    color: '#666',
    border: '1px solid #ddd',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    minWidth: '100px'
  }
};

export default InsuranceManagement;