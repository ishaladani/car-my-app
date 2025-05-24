import React, { useState, useEffect } from 'react';
// Icons
import { 
  ArrowLeft, 
  Edit, 
  AlertTriangle, 
  Calendar, 
  Car, 
  Shield, 
  Building2, 
  DollarSign,
  Plus,
  FileText,
  Clock,
  CheckCircle
} from 'lucide-react';


// Material-UI Components (simulated with Tailwind classes and Lucide icons)
const Box = ({ children, className = '', ...props }) => (
  <div className={`${className}`} {...props}>{children}</div>
);

const Typography = ({ variant = 'body1', children, className = '', fontWeight, color = 'inherit', ...props }) => {
  const variants = {
    h4: 'text-3xl font-bold',
    h5: 'text-2xl font-bold',
    h6: 'text-xl font-semibold',
    subtitle1: 'text-lg font-medium',
    body1: 'text-base',
    body2: 'text-sm'
  };
  
  const weightClass = fontWeight === 600 ? 'font-semibold' : fontWeight === 700 ? 'font-bold' : '';
  const colorClass = color === 'textSecondary' ? 'text-gray-600' : color === 'primary' ? 'text-blue-600' : '';
  
  return (
    <div className={`${variants[variant]} ${weightClass} ${colorClass} ${className}`} {...props}>
      {children}
    </div>
  );
};

const Card = ({ children, className = '', elevation = 1, ...props }) => {
  const shadows = {
    1: 'shadow-sm',
    2: 'shadow-md',
    3: 'shadow-lg',
    4: 'shadow-xl'
  };
  
  return (
    <div className={`bg-white rounded-lg ${shadows[elevation]} border border-gray-200 ${className}`} {...props}>
      {children}
    </div>
  );
};

const CardContent = ({ children, className = '', ...props }) => (
  <div className={`p-6 ${className}`} {...props}>{children}</div>
);

const TextField = ({ 
  label, 
  value, 
  onChange, 
  name, 
  type = 'text', 
  required = false, 
  select = false, 
  children,
  InputLabelProps = {},
  className = '',
  fullWidth = false,
  variant = 'outlined',
  placeholder = '',
  ...props 
}) => {
  if (select) {
    return (
      <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <select
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        >
          {children}
        </select>
      </div>
    );
  }
  
  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        {...props}
      />
    </div>
  );
};

const MenuItem = ({ value, children }) => (
  <option value={value}>{children}</option>
);

const Button = ({ 
  children, 
  variant = 'contained', 
  color = 'primary', 
  size = 'medium',
  onClick,
  disabled = false,
  startIcon,
  className = '',
  ...props 
}) => {
  const variants = {
    contained: color === 'primary' ? 'bg-blue-600 hover:bg-blue-700 text-white' :
               color === 'success' ? 'bg-green-600 hover:bg-green-700 text-white' :
               color === 'error' ? 'bg-red-600 hover:bg-red-700 text-white' :
               'bg-gray-600 hover:bg-gray-700 text-white',
    outlined: color === 'primary' ? 'border-blue-600 text-blue-600 hover:bg-blue-50' :
              'border-gray-600 text-gray-600 hover:bg-gray-50',
    text: 'text-blue-600 hover:bg-blue-50'
  };
  
  const sizes = {
    small: 'px-3 py-1 text-sm',
    medium: 'px-4 py-2',
    large: 'px-6 py-3 text-lg'
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variants[variant]} 
        ${sizes[size]} 
        ${variant === 'outlined' ? 'border-2' : ''} 
        rounded-md font-medium transition-colors duration-200 
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center gap-2
        ${className}
      `}
      {...props}
    >
      {startIcon}
      {children}
    </button>
  );
};

const Container = ({ children, maxWidth = 'lg', className = '' }) => {
  const maxWidths = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl'
  };
  
  return (
    <div className={`mx-auto px-4 ${maxWidths[maxWidth]} ${className}`}>
      {children}
    </div>
  );
};

const Table = ({ children, className = '' }) => (
  <table className={`w-full border-collapse ${className}`}>{children}</table>
);

const TableHead = ({ children, className = '' }) => (
  <thead className={`bg-gray-50 ${className}`}>{children}</thead>
);

const TableBody = ({ children }) => <tbody className="divide-y divide-gray-200">{children}</tbody>;

const TableRow = ({ children, className = '' }) => (
  <tr className={`hover:bg-gray-50 transition-colors ${className}`}>{children}</tr>
);

const TableCell = ({ children, className = '', align = 'left' }) => {
  const alignments = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };
  
  return (
    <td className={`px-6 py-4 text-sm ${alignments[align]} ${className}`}>
      {children}
    </td>
  );
};

const TableContainer = ({ children, component: Component = 'div' }) => (
  <div className="overflow-x-auto border border-gray-200 rounded-lg">
    {children}
  </div>
);

const IconButton = ({ children, onClick, className = '' }) => (
  <button
    onClick={onClick}
    className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${className}`}
  >
    {children}
  </button>
);

const Grid = ({ children, container = false, item = false, xs, sm, md, lg, spacing = 0, className = '' }) => {
  if (container) {
    const spacingClass = spacing > 0 ? `gap-${spacing}` : '';
    return <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${spacingClass} ${className}`}>{children}</div>;
  }
  return <div className={className}>{children}</div>;
};

const Alert = ({ severity = 'info', children, className = '' }) => {
  const severities = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };
  
  return (
    <div className={`p-4 border rounded-md ${severities[severity]} ${className}`}>
      {children}
    </div>
  );
};

const CircularProgress = ({ size = 20, className = '' }) => (
  <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${className}`} 
       style={{ width: size, height: size }} />
);


const InsuranceManagement = () => {
  const [formData, setFormData] = useState({
    carName: '',
    insuranceType: '',
    insurancePrice: '',
    company: '',
    expiryDate: '',
    taxAmount: '',
    provider: '',
    policyNumber: ''
  });

  const [insuranceData, setInsuranceData] = useState([]);
  const [expiringInsurance, setExpiringInsurance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const baseUrl = 'https://garage-management-system-cr4w.onrender.com/api/garage';

  // Fetch all insurance data
  const fetchInsuranceData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/admin/insurance`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setInsuranceData(data);
      } else {
        setError('Failed to fetch insurance data');
      }
    } catch (err) {
      setError('Network error while fetching data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch expiring insurance
  const fetchExpiringInsurance = async () => {
    try {
      const response = await fetch(`${baseUrl}/admin/insurance/expiring`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setExpiringInsurance(data);
      }
    } catch (err) {
      console.error('Error fetching expiring insurance:', err);
    }
  };

  // Add new insurance
  const addInsurance = async (insuranceData) => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/admin/insurance/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(insuranceData),
      });
      
      if (response.ok) {
        setSuccess('Insurance added successfully!');
        fetchInsuranceData();
        setFormData({
          carName: '',
          insuranceType: '',
          insurancePrice: '',
          company: '',
          expiryDate: '',
          taxAmount: '',
          provider: '',
          policyNumber: ''
        });
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to add insurance');
      }
    } catch (err) {
      setError('Network error while adding insurance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsuranceData();
    fetchExpiringInsurance();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const apiData = {
      provider: formData.provider || formData.company,
      policyNumber: formData.policyNumber,
      carName: formData.carName,
      insuranceType: formData.insuranceType,
      insurancePrice: parseFloat(formData.insurancePrice),
      company: formData.company,
      expiryDate: formData.expiryDate,
      taxAmount: parseFloat(formData.taxAmount) || 0
    };

    await addInsurance(apiData);
  };

  return (
    <Box className="min-h-screen bg-gray-50">
      <Container maxWidth="xl" className="py-8">
        {/* Header */}
        <Box className="flex items-center mb-8">
          <IconButton className="mr-4 bg-white shadow-md">
            <ArrowLeft className="w-5 h-5" />
          </IconButton>
          <Typography variant="h4" className="text-gray-800 flex items-center">
            <Shield className="w-8 h-8 mr-3 text-blue-600" />
            Insurance Management System
          </Typography>
        </Box>

        {/* Alerts */}
        {error && (
          <Alert severity="error" className="mb-6">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              {error}
            </div>
          </Alert>
        )}

        {success && (
          <Alert severity="success" className="mb-6">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              {success}
            </div>
          </Alert>
        )}

        {/* Expiring Insurance Alert */}
        {expiringInsurance.length > 0 && (
          <Alert severity="warning" className="mb-6">
            <div className="flex items-center mb-2">
              <Clock className="w-5 h-5 mr-2" />
              <Typography variant="h6">Expiring Insurance Policies</Typography>
            </div>
            <Typography variant="body2">
              {expiringInsurance.length} insurance policies are expiring soon and require renewal.
            </Typography>
          </Alert>
        )}

        {/* Statistics Cards */}
        <Grid container spacing={4} className="mb-8">
          <Card className="p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <Shield className="w-12 h-12 text-blue-600" />
            </div>
            <Typography variant="h5" className="text-gray-800 mb-2">
              {insuranceData.length}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Total Policies
            </Typography>
          </Card>
          
          <Card className="p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <AlertTriangle className="w-12 h-12 text-orange-600" />
            </div>
            <Typography variant="h5" className="text-gray-800 mb-2">
              {expiringInsurance.length}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Expiring Soon
            </Typography>
          </Card>
          
          <Card className="p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <Car className="w-12 h-12 text-green-600" />
            </div>
            <Typography variant="h5" className="text-gray-800 mb-2">
              {insuranceData.length - expiringInsurance.length}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Active Policies
            </Typography>
          </Card>
        </Grid>

        {/* Add Insurance Form */}
        <Card className="mb-8" elevation={3}>
          <CardContent>
            <Typography variant="h5" className="mb-6 flex items-center text-gray-800">
              <Plus className="w-6 h-6 mr-2 text-blue-600" />
              Add New Insurance Policy
            </Typography>
            
            <div onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    name="carName"
                    label="Car Name/Number"
                    value={formData.carName}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    placeholder="e.g., BMW X5 - ABC123"
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    name="insuranceType"
                    label="Insurance Type"
                    value={formData.insuranceType}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    select
                  >
                    <MenuItem value="">Select Insurance Type</MenuItem>
                    <MenuItem value="Comprehensive">Comprehensive</MenuItem>
                    <MenuItem value="Third Party">Third Party</MenuItem>
                    <MenuItem value="Collision">Collision</MenuItem>
                    <MenuItem value="Liability">Liability</MenuItem>
                    <MenuItem value="Full Coverage">Full Coverage</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    name="insurancePrice"
                    label="Insurance Price ($)"
                    type="number"
                    value={formData.insurancePrice}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    placeholder="0.00"
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    name="company"
                    label="Insurance Company"
                    value={formData.company}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    placeholder="e.g., Geico, Progressive"
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    name="policyNumber"
                    label="Policy Number"
                    value={formData.policyNumber}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    placeholder="Policy number"
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    name="expiryDate"
                    label="Expiry Date"
                    type="date"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    name="taxAmount"
                    label="Tax Amount ($)"
                    type="number"
                    value={formData.taxAmount}
                    onChange={handleInputChange}
                    fullWidth
                    placeholder="0.00"
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    name="provider"
                    label="Provider Name"
                    value={formData.provider}
                    onChange={handleInputChange}
                    fullWidth
                    placeholder="Insurance provider"
                  />
                </Grid>
              </Grid>

              <Box className="flex justify-center mt-8">
                <Button
                  variant="contained"
                  color="success"
                  size="large"
                  onClick={handleSubmit}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <Plus className="w-5 h-5" />}
                  className="px-8 py-3"
                >
                  {loading ? 'Adding Insurance...' : 'Add Insurance Policy'}
                </Button>
              </Box>
            </div>
          </CardContent>
        </Card>

        {/* Insurance Table */}
        <Card elevation={3}>
          <Box className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
            <Typography variant="h5" className="flex items-center">
              <FileText className="w-6 h-6 mr-2" />
              Insurance Policies Overview
            </Typography>
          </Box>
          
          <CardContent className="p-0">
            <TableContainer>
              <Table>
                <TableHead className="bg-gray-100">
                  <TableRow>
                    <TableCell className="font-semibold text-gray-700">Car Details</TableCell>
                    <TableCell className="font-semibold text-gray-700">Insurance Type</TableCell>
                    <TableCell className="font-semibold text-gray-700">Premium</TableCell>
                    <TableCell className="font-semibold text-gray-700">Company</TableCell>
                    <TableCell className="font-semibold text-gray-700">Policy Number</TableCell>
                    <TableCell className="font-semibold text-gray-700">Expiry Date</TableCell>
                    <TableCell className="font-semibold text-gray-700" align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" className="py-12">
                        <div className="flex items-center justify-center">
                          <CircularProgress className="mr-2" />
                          <Typography>Loading insurance data...</Typography>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : insuranceData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" className="py-12">
                        <div className="text-center">
                          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <Typography variant="h6" color="textSecondary" className="mb-2">
                            No Insurance Policies Found
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Add your first insurance policy using the form above.
                          </Typography>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    insuranceData.map((row, index) => (
                      <TableRow key={row.id || index}>
                        <TableCell>
                          <div className="flex items-center">
                            <Car className="w-5 h-5 text-gray-400 mr-2" />
                            <div>
                              <Typography variant="body2" className="font-medium">
                                {row.carNumber || row.carName}
                              </Typography>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {row.insuranceType}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 text-green-600 mr-1" />
                            <Typography variant="body2" className="font-medium">
                              {row.price || (row.insurancePrice ? `$${row.insurancePrice}` : 'N/A')}
                            </Typography>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                            {row.company || row.provider}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" className="font-mono text-sm">
                            {row.policyNumber || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                            {row.expiry || row.expiryDate}
                          </div>
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Edit className="w-4 h-4" />}
                            className="mr-2"
                          >
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default InsuranceManagement;