// Enhanced job card data management with proper state handling

// 1. Updated updateJobCardPartsUsed function with better error handling and data validation
const updateJobCardPartsUsed = async (jobCardId, partsUsed) => {
  try {
    console.log(`Updating job card ${jobCardId} with parts:`, partsUsed);
    
    // Validate parts data before sending
    const validatedParts = partsUsed.map(part => ({
      partId: part.partId || part._id,
      partName: part.partName || '',
      partNumber: part.partNumber || '',
      quantity: Number(part.quantity) || 1,
      pricePerUnit: Number(part.pricePerUnit) || 0,
      gstPercentage: Number(part.gstPercentage) || 0,
      totalPrice: Number((part.pricePerUnit || 0) * (part.quantity || 1)),
      gstAmount: Number(((part.pricePerUnit || 0) * (part.quantity || 1) * (part.gstPercentage || 0)) / 100),
      carName: part.carName || '',
      model: part.model || ''
    }));

    const updatePayload = {
      partsUsed: validatedParts
    };

    console.log('Sending update payload:', updatePayload);

    const response = await axios.put(
      `${API_BASE_URL}/jobCards/${jobCardId}`,
      updatePayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': garageToken ? `Bearer ${garageToken}` : '',
        }
      }
    );

    console.log(`Job card ${jobCardId} updated successfully:`, response.data);
    return response.data;
  } catch (err) {
    console.error(`Failed to update job card ${jobCardId}:`, err.response?.data || err.message);
    throw err;
  }
};

// 2. Add a function to fetch job card data to verify updates
const fetchJobCardData = async (jobCardId) => {
  try {
    console.log(`Fetching job card data for ID: ${jobCardId}`);
    
    const response = await axios.get(
      `${API_BASE_URL}/garage/jobCards/${jobCardId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': garageToken ? `Bearer ${garageToken}` : '',
        }
      }
    );

    console.log(`Job card ${jobCardId} data:`, response.data);
    return response.data;
  } catch (err) {
    console.error(`Failed to fetch job card ${jobCardId}:`, err.response?.data || err.message);
    throw err;
  }
};

// 3. Enhanced handleSubmit with proper sequencing and verification
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) return;

  setIsSubmitting(true);
  setError(null);
  setFormErrors({});

  try {
    // Collect all parts used across all assignments with enhanced data
    const allPartsUsed = [];
    taskAssignments.forEach(assignment => {
      assignment.parts.forEach(part => {
        const existingPartIndex = allPartsUsed.findIndex(p => p.partId === part._id);
        const selectedQuantity = part.selectedQuantity || 1;
        
        if (existingPartIndex !== -1) {
          allPartsUsed[existingPartIndex].quantity += selectedQuantity;
        } else {
          allPartsUsed.push({
            partId: part._id,
            partName: part.partName,
            partNumber: part.partNumber || '',
            quantity: selectedQuantity,
            pricePerUnit: part.pricePerUnit || 0,
            gstPercentage: part.gstPercentage || part.taxAmount || 0,
            carName: part.carName || '',
            model: part.model || ''
          });
        }
      });
    });

    const targetJobCardIds = jobCardIds.length > 0 ? jobCardIds : [id];
    console.log('Target job card IDs:', targetJobCardIds);
    console.log('Parts to be added:', allPartsUsed);

    // Step 1: Update job cards with parts used (if any parts are selected)
    if (allPartsUsed.length > 0) {
      console.log('Updating job cards with parts used...');
      
      for (const jobCardId of targetJobCardIds) {
        if (jobCardId) {
          try {
            await updateJobCardPartsUsed(jobCardId, allPartsUsed);
            
            // Verify the update by fetching the job card data
            const updatedJobCard = await fetchJobCardData(jobCardId);
            console.log(`Verification - Job card ${jobCardId} parts after update:`, updatedJobCard.partsUsed);
            
            // Add a small delay to ensure data consistency
            await new Promise(resolve => setTimeout(resolve, 500));
          } catch (updateError) {
            console.error(`Failed to update job card ${jobCardId}:`, updateError);
            throw new Error(`Failed to update job card ${jobCardId}: ${updateError.message}`);
          }
        }
      }
      console.log('All job cards updated successfully');
    }

    // Step 2: Process each task assignment
    console.log('Assigning tasks to engineers...');
    const assignmentPromises = taskAssignments.map(async (assignment, index) => {
      const payload = {
        jobCardIds: targetJobCardIds,
        tasks: assignment.tasks.map(task => ({
          taskId: task.id || task.taskId,
          name: task.name || task.taskName,
          duration: task.duration || `${task.taskDuration} minutes`,
          category: task.category,
          description: task.description
        })),
        parts: assignment.parts.map(part => ({
          partId: part._id,
          partName: part.partName,
          quantity: part.selectedQuantity || 1
        })),
        priority: assignment.priority,
        estimatedDuration: calculateTotalDuration(assignment.tasks),
        notes: assignment.notes
      };

      console.log(`Assignment ${index + 1} - Engineer ${assignment.engineer._id}:`, payload);
      
      return axios.put(
        `${API_BASE_URL}/jobcards/assign-jobcards/${assignment.engineer._id}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': garageToken ? `Bearer ${garageToken}` : '',
          }
        }
      );
    });

    // Execute all task assignments
    const results = await Promise.all(assignmentPromises);
    
    console.log('All assignments completed:', results.map(r => r.data));
    
    // Step 3: Final verification - fetch updated job card data
    if (targetJobCardIds.length > 0) {
      console.log('Final verification of job card updates...');
      for (const jobCardId of targetJobCardIds) {
        if (jobCardId) {
          try {
            const finalJobCard = await fetchJobCardData(jobCardId);
            console.log(`Final verification - Job card ${jobCardId}:`, {
              id: finalJobCard._id,
              partsUsedCount: finalJobCard.partsUsed?.length || 0,
              partsUsed: finalJobCard.partsUsed
            });
          } catch (verificationError) {
            console.warn(`Could not verify job card ${jobCardId}:`, verificationError.message);
          }
        }
      }
    }
    
    setSuccess(true);
    setTimeout(() => {
      navigate(`/Work-In-Progress/${id}`);
    }, 2000);
    
  } catch (err) {
    console.error('Assignment error:', err.response?.data || err.message);
    setError(err.response?.data?.message || err.message || 'Failed to assign tasks to engineers');
  } finally {
    setIsSubmitting(false);
  }
};

// 4. Add a utility function to check job card parts status
const checkJobCardPartsStatus = async (jobCardId) => {
  try {
    const response = await fetchJobCardData(jobCardId);
    const partsUsed = response.partsUsed || [];
    
    console.log(`Job Card ${jobCardId} Parts Status:`, {
      hasPartsUsed: partsUsed.length > 0,
      partsCount: partsUsed.length,
      parts: partsUsed
    });
    
    return {
      success: true,
      partsUsed,
      hasPartsUsed: partsUsed.length > 0
    };
  } catch (error) {
    console.error(`Error checking job card ${jobCardId} parts status:`, error);
    return {
      success: false,
      error: error.message
    };
  }
};

// 5. Add a function to refresh job card data when needed
const refreshJobCardData = useCallback(async (jobCardId) => {
  try {
    setIsLoading(true);
    const updatedJobCard = await fetchJobCardData(jobCardId);
    
    // You can update your local state here if needed
    console.log('Refreshed job card data:', updatedJobCard);
    
    return updatedJobCard;
  } catch (error) {
    console.error('Failed to refresh job card data:', error);
    setError('Failed to refresh job card data');
    return null;
  } finally {
    setIsLoading(false);
  }
}, []);

// 6. Enhanced API call function with better error handling
const apiCall = useCallback(async (endpoint, options = {}) => {
  try {
    const config = {
      url: `${API_BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': garageToken ? `Bearer ${garageToken}` : '',
        ...options.headers
      },
      timeout: 10000, // 10 second timeout
      ...options
    };

    console.log(`API Call: ${config.method || 'GET'} ${config.url}`);
    if (options.data) {
      console.log('Request payload:', options.data);
    }

    const response = await axios(config);
    
    console.log(`API Response: ${config.url}`, response.data);
    return response;
  } catch (err) {
    console.error(`API call failed for ${endpoint}:`, {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message
    });
    throw err;
  }
}, [garageToken]);

// 7. Add a debug function to check data flow
const debugJobCardDataFlow = async (jobCardId) => {
  console.log('=== DEBUG: Job Card Data Flow ===');
  
  try {
    // Check initial state
    console.log('1. Checking initial job card state...');
    const initialState = await fetchJobCardData(jobCardId);
    console.log('Initial parts:', initialState.partsUsed);
    
    // You can call this before and after updates to track changes
    return initialState;
  } catch (error) {
    console.error('Debug failed:', error);
    return null;
  }
};

// Export the enhanced functions
export {
  updateJobCardPartsUsed,
  fetchJobCardData,
  checkJobCardPartsStatus,
  refreshJobCardData,
  debugJobCardDataFlow,
  handleSubmit
};