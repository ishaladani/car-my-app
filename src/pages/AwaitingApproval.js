import React from 'react';

const AwaitingApproval = () => {
  const CheckIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
    </svg>
  );

  const HourglassIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 2v6h.01L6 8.01 10 12l-4 4 .01.01H6V22h12v-5.99h-.01L18 16l-4-4 4-3.99-.01-.01H18V2H6zm10 14.5V20H8v-3.5l4-4 4 4z"/>
    </svg>
  );

  const PaymentIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
    </svg>
  );

  const UserIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
    </svg>
  );

  const AdminIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17 11c.34 0 .67.04 1 .09V6.27L10.5 3 3 6.27v4.91c0 4.54 3.2 8.79 7.5 9.82.55-.13 1.08-.32 1.6-.55-.69-.98-1.1-2.17-1.1-3.45 0-3.31 2.69-6 6-6z"/>
      <path d="M17 13c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm-1.41 6.41L14 18l1.41-1.41L17 18.17l3.59-3.58L22 16l-5 5z"/>
    </svg>
  );

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    card: {
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      overflow: 'hidden',
      maxWidth: '600px',
      width: '100%',
      animation: 'slideUp 0.6s ease-out'
    },
    header: {
      background: 'linear-gradient(135deg, #4CAF50, #2E7D32)',
      color: 'white',
      padding: '3rem 2rem',
      textAlign: 'center'
    },
    headerIcon: {
      width: '80px',
      height: '80px',
      background: 'rgba(255,255,255,0.2)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 1.5rem',
      border: '3px solid rgba(255,255,255,0.3)'
    },
    headerTitle: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      margin: '0 0 0.5rem 0'
    },
    headerSubtitle: {
      fontSize: '1.1rem',
      opacity: 0.9,
      margin: 0
    },
    content: {
      padding: '2rem'
    },
    statusCard: {
      border: '2px solid',
      borderRadius: '12px',
      padding: '1.5rem',
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      transition: 'transform 0.2s ease'
    },
    statusCardSuccess: {
      borderColor: '#4CAF50',
      backgroundColor: 'rgba(76, 175, 80, 0.05)'
    },
    statusCardPending: {
      borderColor: '#FF9800',
      backgroundColor: 'rgba(255, 152, 0, 0.05)'
    },
    statusIcon: {
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: '1rem',
      flexShrink: 0
    },
    statusIconSuccess: {
      backgroundColor: '#4CAF50',
      color: 'white'
    },
    statusIconPending: {
      backgroundColor: '#FF9800',
      color: 'white'
    },
    statusContent: {
      flex: 1
    },
    statusTitle: {
      fontSize: '1.2rem',
      fontWeight: 'bold',
      margin: '0 0 0.25rem 0'
    },
    statusTitleSuccess: {
      color: '#2E7D32'
    },
    statusTitlePending: {
      color: '#E65100'
    },
    statusDescription: {
      color: '#666',
      margin: 0,
      fontSize: '0.9rem'
    },
    chip: {
      padding: '0.25rem 0.75rem',
      borderRadius: '16px',
      fontSize: '0.8rem',
      fontWeight: 'bold',
      border: 'none'
    },
    chipSuccess: {
      backgroundColor: '#4CAF50',
      color: 'white'
    },
    chipPending: {
      backgroundColor: '#FF9800',
      color: 'white'
    },
    divider: {
      height: '1px',
      background: '#eee',
      margin: '2rem 0',
      border: 'none'
    },
    progressSection: {
      marginBottom: '2rem'
    },
    progressTitle: {
      fontSize: '1.3rem',
      fontWeight: 'bold',
      marginBottom: '1.5rem',
      color: '#333'
    },
    stepper: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'relative',
      marginBottom: '1rem'
    },
    stepperLine: {
      position: 'absolute',
      top: '20px',
      left: '20px',
      right: '20px',
      height: '2px',
      background: '#ddd',
      zIndex: 1
    },
    stepperProgress: {
      position: 'absolute',
      top: '20px',
      left: '20px',
      height: '2px',
      background: '#4CAF50',
      width: '66.66%',
      zIndex: 2
    },
    step: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'relative',
      zIndex: 3
    },
    stepIcon: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '0.5rem'
    },
    stepIconComplete: {
      backgroundColor: '#4CAF50',
      color: 'white'
    },
    stepIconPending: {
      backgroundColor: '#FF9800',
      color: 'white'
    },
    stepLabel: {
      fontSize: '0.85rem',
      fontWeight: 'bold',
      textAlign: 'center',
      color: '#666'
    },
    infoBox: {
      border: '1px solid #2196F3',
      borderRadius: '12px',
      padding: '1.5rem',
      backgroundColor: 'rgba(33, 150, 243, 0.05)',
      marginBottom: '2rem'
    },
    infoTitle: {
      fontSize: '1.2rem',
      fontWeight: 'bold',
      color: '#1976D2',
      marginBottom: '1rem'
    },
    infoText: {
      color: '#666',
      lineHeight: '1.6',
      marginBottom: '1rem'
    },
    infoNote: {
      color: '#666',
      fontSize: '0.9rem',
      lineHeight: '1.5'
    },
    buttonGroup: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'center',
      flexWrap: 'wrap'
    },
    button: {
      padding: '0.875rem 2rem',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      minWidth: '140px'
    },
    buttonPrimary: {
      backgroundColor: '#1976D2',
      color: 'white',
      border: 'none'
    },
    buttonSecondary: {
      backgroundColor: 'transparent',
      color: '#1976D2',
      border: '2px solid #1976D2'
    }
  };

  // Add keyframe animation
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .status-card:hover {
        transform: translateY(-2px);
      }
      
      .button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0,0,0,0.15);
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const steps = [
    { label: 'Account Created', icon: <UserIcon />, completed: true },
    { label: 'Payment Processed', icon: <PaymentIcon />, completed: true },
    { label: 'Admin Review', icon: <AdminIcon />, completed: false }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerIcon}>
            <CheckIcon />
          </div>
          <h1 style={styles.headerTitle}>Thank You!</h1>
          <p style={styles.headerSubtitle}>Your registration is almost complete</p>
        </div>

        {/* Content */}
        <div style={styles.content}>
          {/* Status Cards */}
          <div>
            <div 
              className="status-card"
              style={{...styles.statusCard, ...styles.statusCardSuccess}}
            >
              <div style={{...styles.statusIcon, ...styles.statusIconSuccess}}>
                <CheckIcon />
              </div>
              <div style={styles.statusContent}>
                <h3 style={{...styles.statusTitle, ...styles.statusTitleSuccess}}>
                  Account Created Successfully
                </h3>
                <p style={styles.statusDescription}>
                  Your account has been set up with all provided information
                </p>
              </div>
              <span style={{...styles.chip, ...styles.chipSuccess}}>Complete</span>
            </div>

            <div 
              className="status-card"
              style={{...styles.statusCard, ...styles.statusCardSuccess}}
            >
              <div style={{...styles.statusIcon, ...styles.statusIconSuccess}}>
                <PaymentIcon />
              </div>
              <div style={styles.statusContent}>
                <h3 style={{...styles.statusTitle, ...styles.statusTitleSuccess}}>
                  Payment Processed
                </h3>
                <p style={styles.statusDescription}>
                  Your payment has been successfully processed and confirmed
                </p>
              </div>
              <span style={{...styles.chip, ...styles.chipSuccess}}>Complete</span>
            </div>

            <div 
              className="status-card"
              style={{...styles.statusCard, ...styles.statusCardPending}}
            >
              <div style={{...styles.statusIcon, ...styles.statusIconPending}}>
                <HourglassIcon />
              </div>
              <div style={styles.statusContent}>
                <h3 style={{...styles.statusTitle, ...styles.statusTitlePending}}>
                  Pending Admin Review
                </h3>
                <p style={styles.statusDescription}>
                  An administrator will review your account shortly
                </p>
              </div>
              <span style={{...styles.chip, ...styles.chipPending}}>Pending</span>
            </div>
          </div>

          <hr style={styles.divider} />

          {/* Progress Section */}
          <div style={styles.progressSection}>
            <h3 style={styles.progressTitle}>Registration Progress</h3>
            <div style={styles.stepper}>
              <div style={styles.stepperLine}></div>
              <div style={styles.stepperProgress}></div>
              {steps.map((step, index) => (
                <div key={index} style={styles.step}>
                  <div style={{
                    ...styles.stepIcon,
                    ...(step.completed ? styles.stepIconComplete : styles.stepIconPending)
                  }}>
                    {step.icon}
                  </div>
                  <span style={styles.stepLabel}>{step.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Info Box */}
          <div style={styles.infoBox}>
            <h3 style={styles.infoTitle}>What happens next?</h3>
            <p style={styles.infoText}>
              Our team will review your account within 24-48 hours. You'll receive an email 
              notification once your account has been approved and is ready to use.
            </p>
            <p style={styles.infoNote}>
              <strong>Need help?</strong> Contact our support team if you have any questions 
              about your account status.
            </p>
          </div>

          {/* Buttons */}
          <div style={styles.buttonGroup}>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AwaitingApproval;