import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Car, 
  User, 
  Shield, 
  Wrench, 
  MessageSquare, 
  Trash2, 
  Plus, 
  Save,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const WorkInProgress = () => {
  // All state management (same as original)
  const [parts, setParts] = useState([]);
  const [carDetails, setCarDetails] = useState({
    company: '',
    model: '',
    carNo: ''
  });
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    contactNo: '',
    email: ''
  });
  const [insuranceDetails, setInsuranceDetails] = useState({
    company: '',
    number: '',
    type: '',
    expiry: '',
    regNo: '',
    amount: ''
  });
  const [engineerDetails, setEngineerDetails] = useState({
    fullName: '',
    speciality: '',
    assignedDateTime: ''
  });
  const [status, setStatus] = useState('');
  const [remarks, setRemarks] = useState('');
  const [laborHours, setLaborHours] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Mock data for demonstration (replace with actual API calls)
  useEffect(() => {
    setFetchLoading(true);
    // Simulate API call
    setTimeout(() => {
      setCarDetails({
        company: 'Toyota',
        model: 'Camry 2023',
        carNo: 'ABC-123'
      });
      setCustomerDetails({
        name: 'John Doe',
        contactNo: '+1-234-567-8900',
        email: 'john.doe@email.com'
      });
      setInsuranceDetails({
        company: 'State Farm',
        number: 'SF123456789',
        type: 'Comprehensive',
        expiry: '2025-12-31',
        regNo: 'REG123456',
        amount: '500'
      });
      setEngineerDetails({
        fullName: 'Mike Johnson',
        speciality: 'Engine Specialist',
        assignedDateTime: '2025-06-08T10:00'
      });
      setParts([{
        id: 1,
        partName: 'Brake Pads',
        partNumber: 'BP-001',
        qty: '2',
        pricePerPiece: '50',
        gstPercent: '18',
        totalPrice: '118'
      }]);
      setStatus('Pending');
      setRemarks('Initial inspection completed. Brake pads need replacement.');
      setLaborHours('3');
      setFetchLoading(false);
    }, 1500);
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      showNotification('Work progress updated successfully!', 'success');
      // Navigate to next page would happen here
    }, 2000);
  };

  const handleAddRow = () => {
    const newId = parts.length > 0 ? Math.max(...parts.map(part => part.id)) + 1 : 1;
    setParts([...parts, {
      id: newId,
      partName: '',
      partNumber: '',
      qty: '',
      pricePerPiece: '',
      gstPercent: '',
      totalPrice: ''
    }]);
  };

  const handleDeleteRow = (id) => {
    if (parts.length > 1) {
      setParts(parts.filter(part => part.id !== id));
    } else {
      setParts([{
        id: 1,
        partName: '',
        partNumber: '',
        qty: '',
        pricePerPiece: '',
        gstPercent: '',
        totalPrice: ''
      }]);
    }
  };

  const handlePartChange = (id, field, value) => {
    const updatedParts = parts.map(part => {
      if (part.id === id) {
        const updatedPart = { ...part, [field]: value };
        
        if ((field === 'qty' || field === 'pricePerPiece' || field === 'gstPercent') && 
            updatedPart.qty && updatedPart.pricePerPiece) {
          const qty = parseFloat(updatedPart.qty);
          const price = parseFloat(updatedPart.pricePerPiece);
          const gst = updatedPart.gstPercent ? parseFloat(updatedPart.gstPercent) : 0;
          
          const priceWithoutGst = qty * price;
          const gstAmount = priceWithoutGst * (gst / 100);
          updatedPart.totalPrice = (priceWithoutGst + gstAmount).toFixed(2);
        }
        
        return updatedPart;
      }
      return part;
    });
    setParts(updatedParts);
  };

  if (fetchLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600 text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ marginLeft: '280px', paddingTop: '24px' }}>
      {/* Header */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex items-center mb-6">
          <button className="flex items-center justify-center w-10 h-10 mr-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">Work In Progress</h1>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-8">
            <div className="space-y-6">
              {/* Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Car Details */}
                <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                  <div className="bg-blue-600 text-white px-4 py-3 font-semibold">
                    Car Details
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="relative">
                      <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        placeholder="Company"
                        value={carDetails.company}
                        readOnly
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md bg-gray-50 text-gray-700 text-sm"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Model"
                      value={carDetails.model}
                      readOnly
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-md bg-gray-50 text-gray-700 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Car No."
                      value={carDetails.carNo}
                      readOnly
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-md bg-gray-50 text-gray-700 text-sm"
                    />
                  </div>
                </div>

                {/* Customer Details */}
                <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                  <div className="text-white px-4 py-3 font-semibold" style={{backgroundColor: 'rgb(9, 141, 97)'}}>
                    Customer Details
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        placeholder="Name"
                        value={customerDetails.name}
                        readOnly
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md bg-gray-50 text-gray-700 text-sm"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Contact No."
                      value={customerDetails.contactNo}
                      readOnly
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-md bg-gray-50 text-gray-700 text-sm"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={customerDetails.email}
                      readOnly
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-md bg-gray-50 text-gray-700 text-sm"
                    />
                  </div>
                </div>

                {/* Insurance Details */}
                <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                  <div className="text-white px-4 py-3 font-semibold" style={{backgroundColor: 'rgb(9, 141, 97)'}}>
                    Insurance Details
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        placeholder="Company"
                        value={insuranceDetails.company}
                        readOnly
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md bg-gray-50 text-gray-700 text-sm"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Number"
                      value={insuranceDetails.number}
                      readOnly
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-md bg-gray-50 text-gray-700 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Type"
                      value={insuranceDetails.type}
                      readOnly
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-md bg-gray-50 text-gray-700 text-sm"
                    />
                    <input
                      type="date"
                      value={insuranceDetails.expiry}
                      readOnly
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-md bg-gray-50 text-gray-700 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Reg. No."
                      value={insuranceDetails.regNo}
                      readOnly
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-md bg-gray-50 text-gray-700 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Amount"
                      value={insuranceDetails.amount}
                      readOnly
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-md bg-gray-50 text-gray-700 text-sm"
                    />
                  </div>
                </div>

                {/* Engineer Details */}
                <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                  <div className="text-white px-4 py-3 font-semibold" style={{backgroundColor: 'rgb(9, 141, 97)'}}>
                    Engineer Details
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="relative">
                      <Wrench className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={engineerDetails.fullName}
                        readOnly
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md bg-gray-50 text-gray-700 text-sm"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Speciality"
                      value={engineerDetails.speciality}
                      readOnly
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-md bg-gray-50 text-gray-700 text-sm"
                    />
                    <input
                      type="datetime-local"
                      value={engineerDetails.assignedDateTime}
                      readOnly
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-md bg-gray-50 text-gray-700 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Parts Used */}
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Parts Used</h2>
                <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-white" style={{backgroundColor: 'rgb(9, 141, 97)'}}>
                          <th className="px-3 py-2.5 text-center text-sm font-semibold">Sr.No.</th>
                          <th className="px-3 py-2.5 text-center text-sm font-semibold">Part Name</th>
                          <th className="px-3 py-2.5 text-center text-sm font-semibold">Part Number</th>
                          <th className="px-3 py-2.5 text-center text-sm font-semibold">Qty</th>
                          <th className="px-3 py-2.5 text-center text-sm font-semibold">Price/Piece</th>
                          <th className="px-3 py-2.5 text-center text-sm font-semibold">GST %</th>
                          <th className="px-3 py-2.5 text-center text-sm font-semibold">Total Price</th>
                          <th className="px-3 py-2.5 text-center text-sm font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {parts.map((part) => (
                          <tr key={part.id} className="hover:bg-gray-50">
                            <td className="px-3 py-2.5 text-center text-sm font-medium text-gray-900">{part.id}</td>
                            <td className="px-3 py-2.5">
                              <input
                                type="text"
                                value={part.partName}
                                onChange={(e) => handlePartChange(part.id, 'partName', e.target.value)}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter part name"
                              />
                            </td>
                            <td className="px-3 py-2.5">
                              <input
                                type="text"
                                value={part.partNumber}
                                onChange={(e) => handlePartChange(part.id, 'partNumber', e.target.value)}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Part #"
                              />
                            </td>
                            <td className="px-3 py-2.5">
                              <input
                                type="number"
                                value={part.qty}
                                onChange={(e) => handlePartChange(part.id, 'qty', e.target.value)}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-center focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="0"
                              />
                            </td>
                            <td className="px-3 py-2.5">
                              <input
                                type="number"
                                value={part.pricePerPiece}
                                onChange={(e) => handlePartChange(part.id, 'pricePerPiece', e.target.value)}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-center focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="0.00"
                                step="0.01"
                              />
                            </td>
                            <td className="px-3 py-2.5">
                              <input
                                type="number"
                                value={part.gstPercent}
                                onChange={(e) => handlePartChange(part.id, 'gstPercent', e.target.value)}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-center focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="0"
                              />
                            </td>
                            <td className="px-3 py-2.5">
                              <input
                                type="number"
                                value={part.totalPrice}
                                readOnly
                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-center bg-gray-50 text-gray-600"
                                placeholder="0.00"
                              />
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <button
                                type="button"
                                onClick={() => handleDeleteRow(part.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="p-3 border-t border-gray-200 text-center">
                    <button
                      type="button"
                      onClick={handleAddRow}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      <Plus size={16} />
                      Add Part
                    </button>
                  </div>
                </div>
              </div>

              {/* Additional Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Labour Hours</label>
                  <input
                    type="number"
                    value={laborHours}
                    onChange={(e) => setLaborHours(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Enter labor hours"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="">Select Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* Remarks */}
              <div className="mt-4">
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 text-gray-400" size={20} />
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    required
                    rows={4}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Enter Remarks"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center mt-6">
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="px-8 py-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase tracking-wide shadow-md"
                  style={{ width: '50%' }}
                >
                  {isLoading ? 'SUBMITTING...' : 'SUBMIT REMARKS'}
                </button>
              </div>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* Remarks */}
              <div className="mt-6">
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-4 text-gray-400" size={20} />
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    required
                    rows={4}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter Remarks"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center mt-8">
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase tracking-wide"
                  style={{ width: '50%' }}
                >
                  {isLoading ? 'SUBMITTING...' : 'SUBMIT REMARKS'}
                </button>
              </div>
            </div>
          </div>
        

      {/* Notification */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg ${
            notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkInProgress;