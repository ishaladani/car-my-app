import React, { useState } from 'react';
import { Plus, X, FileText, Trash2 } from 'lucide-react';

const JobDetailsManager = () => {
  // State for current job point being added
  const [currentJobPoint, setCurrentJobPoint] = useState({
    description: ''
  });

  // State for list of job points
  const [jobPoints, setJobPoints] = useState([]);

  // Add a new job point to the list
  const addJobPoint = () => {
    if (currentJobPoint.description.trim()) {
      const newJobPoint = {
        id: Date.now(), // Simple ID generation
        description: currentJobPoint.description.trim()
      };
      
      setJobPoints(prev => [...prev, newJobPoint]);
      
      // Clear the input fields
      setCurrentJobPoint({ description: '' });
    }
  };

  // Remove a job point from the list
  const removeJobPoint = (idToRemove) => {
    setJobPoints(prev => prev.filter(point => point.id !== idToRemove));
  };

  // Handle input changes
  const handleJobPointInputChange = (field, value) => {
    setCurrentJobPoint(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle Enter key press to add point
  const handleJobPointKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addJobPoint();
    }
  };

  // Calculate total price of all job points - REMOVED FUNCTIONALITY
  const calculateJobDetailsTotal = () => {
    return 0; // Always return 0 since we're not tracking prices anymore
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <h1 className="text-3xl font-bold text-center">Job Details Points Manager</h1>
          <p className="text-center mt-2 text-blue-100">Add and manage work description points with pricing</p>
        </div>

        <div className="p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white text-center">
              <div className="text-3xl font-bold">{jobPoints.length}</div>
              <div className="text-blue-100">Total Points</div>
            </div>
          </div>

          {/* Input Section */}
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FileText className="mr-2 text-blue-600" />
              Add New Job Detail Point
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-10 gap-4 mb-4">
              <div className="md:col-span-8">
                <div className="relative">
                  <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Enter detailed job description..."
                    value={currentJobPoint.description}
                    onChange={(e) => handleJobPointInputChange('description', e.target.value)}
                    onKeyPress={handleJobPointKeyPress}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <button
                  onClick={addJobPoint}
                  disabled={!currentJobPoint.description.trim()}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Point
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-600 flex items-center">
              <span className="mr-1">💡</span>
              Tip: Press Enter to quickly add the point
            </p>
          </div>

          {/* Job Points List */}
          {jobPoints.length > 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-blue-600 text-white p-4">
                <h2 className="text-xl font-semibold">
                  Job Details Points ({jobPoints.length})
                </h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {jobPoints.map((point, index) => (
                  <div key={point.id} className="p-4 hover:bg-gray-50 transition-colors group">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 flex items-start">
                        <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3 mt-1">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-900 font-medium leading-6">
                            {point.description}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeJobPoint(point.id)}
                        className="ml-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-12 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
              <FileText className="mx-auto w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No job details added yet
              </h3>
              <p className="text-gray-500">
                Start by adding your first job detail point above
              </p>
            </div>
          )}

          {/* Demo Actions */}
          {jobPoints.length > 0 && (
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setJobPoints([]);
                  setCurrentJobPoint({ description: '' });
                }}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors flex items-center mx-auto"
              >
                <Trash2 className="w-5 h-5 mr-2" />
                Clear All Points
              </button>
            </div>
          )}

          {/* Usage Instructions */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">How to use:</h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Enter a detailed description of the job/service</li>
              <li>• Click "Add Point" or press Enter to add it to the list</li>
              <li>• You can add multiple points to create a comprehensive job details list</li>
              <li>• Remove individual points by clicking the X button</li>
              <li>• Build a complete list of all job tasks and requirements</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsManager;