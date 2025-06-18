import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Container,
  IconButton,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  CssBaseline,
  InputAdornment,
  Snackbar,
  Alert,
  CircularProgress,
  Tooltip,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Menu,
  ListItemIcon
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Inventory as InventoryIcon,
  Send as SendIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  ExpandMore as ExpandMoreIcon,
  Schedule as ScheduleIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useThemeContext } from '../Layout/ThemeContext';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

const API_BASE_URL = 'https://garage-management-zi5z.onrender.com/api'; 

const AssignEngineer = () => {
  const { darkMode } = useThemeContext();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const jobCardId = location.state?.jobCardId;
  const garageId = localStorage.getItem('garageId');
  const garageToken = localStorage.getItem('token');

  // Main State
  const [engineers, setEngineers] = useState([]);
  const [taskAssignments, setTaskAssignments] = useState([
    {
      id: Date.now(),
      engineer: null,
      tasks: [],
      parts: [],
      priority: 'medium',
      estimatedDuration: '',
      notes: ''
    }
  ]);
  const [inventoryParts, setInventoryParts] = useState([]);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [jobCardIds, setJobCardIds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingInventory, setIsLoadingInventory] = useState(true);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Add Part Dialog States
  const [openAddPartDialog, setOpenAddPartDialog] = useState(false);
  const [newPart, setNewPart] = useState({
    garageId,
    carName: "",
    model: "",
    partNumber: "",
    partName: "",
    quantity: 1,
    pricePerUnit: 0,
    gstPercentage: 0,
    taxAmount: 0
  });
  const [addingPart, setAddingPart] = useState(false);
  const [partAddSuccess, setPartAddSuccess] = useState(false);
  const [partAddError, setPartAddError] = useState(null);

  // Add Engineer Dialog States
  const [openAddEngineerDialog, setOpenAddEngineerDialog] = useState(false);
  const [newEngineer, setNewEngineer] = useState({
    name: "",
    garageId,
    email: "",
    phone: "",
    specialty: ""
  });
  const [addingEngineer, setAddingEngineer] = useState(false);
  const [engineerAddSuccess, setEngineerAddSuccess] = useState(false);
  const [engineerAddError, setEngineerAddError] = useState(null);

  // Add/Edit Task Dialog States
  const [openAddTaskDialog, setOpenAddTaskDialog] = useState(false);
  const [openEditTaskDialog, setOpenEditTaskDialog] = useState(false);
  const [newTask, setNewTask] = useState({
    taskName: "",
    taskDuration: "1",
    description: "",
    category: "general"
  });
  const [editingTask, setEditingTask] = useState(null);
  const [addingTask, setAddingTask] = useState(false);
  const [updatingTask, setUpdatingTask] = useState(false);
  const [taskError, setTaskError] = useState(null);

  // Task Menu State
  const [taskMenuAnchor, setTaskMenuAnchor] = useState(null);
  const [selectedTaskForMenu, setSelectedTaskForMenu] = useState(null);

  // Utility API Call with Authorization
  const apiCall = useCallback(async (endpoint, options = {}) => {
    try {
      const response = await axios({
        url: `${API_BASE_URL}${endpoint}`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': garageToken ? `Bearer ${garageToken}` : '',
          ...options.headers
        },
        ...options
      });
      return response;
    } catch (err) {
      console.error(`API call failed for ${endpoint}:`, err);
      throw err;
    }
  }, [garageToken]);

  // Initialize job card IDs
  useEffect(() => {
    const initialJobCardIds = [];
    
    if (id) {
      initialJobCardIds.push(id);
    }
    
    if (jobCardId && jobCardId !== id) {
      initialJobCardIds.push(jobCardId);
    }
    
    setJobCardIds(initialJobCardIds);
  }, [id, jobCardId]);

  // Fetch Tasks from API
  const fetchTasks = useCallback(async () => {
    if (!garageToken) {
      setError('No authentication token found');
      return;
    }
    
    try {
      setIsLoadingTasks(true);
      setError(null);
      
      const response = await apiCall('/garage/gettask', { method: 'GET' });
      
      console.log('API Response:', response.data);
      
      let tasks = [];
      
      if (response.data && response.data.tasks && Array.isArray(response.data.tasks)) {
        tasks = response.data.tasks;
      } 
      else if (Array.isArray(response.data)) {
        tasks = response.data;
      }
      else {
        console.log('No tasks found in response:', response.data);
        tasks = [];
      }
      
      const transformedTasks = tasks.map(task => ({
        id: task._id,
        taskId: task._id,
        name: task.taskName,
        taskName: task.taskName,
        duration: `${task.taskDuration} minutes`,
        taskDuration: task.taskDuration,
        category: task.category || 'general',
        description: task.description || `Task: ${task.taskName}`
      }));
      
      setAvailableTasks(transformedTasks);
      
      if (transformedTasks.length === 0) {
        console.log('No tasks available. You can create new tasks using the "Add Task" button.');
      }
      
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      
      if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else if (err.response?.status === 404) {
        setError('Tasks endpoint not found. Please check the API configuration.');
      } else if (err.response?.status >= 500) {
        setError('Server error. Please try again later.');
      } else {
        setError(err.response?.data?.message || 'Failed to load tasks');
      }
      
      setAvailableTasks([]);
    } finally {
      setIsLoadingTasks(false);
    }
  }, [garageToken, apiCall]);

  // Create New Task
  const createTask = async (taskData) => {
    try {
      setAddingTask(true);
      setTaskError(null);
      
      const payload = {
        taskName: taskData.taskName,
        taskDuration: parseInt(taskData.taskDuration)
      };
      
      const response = await apiCall('/garage/task/create', {
        method: 'POST',
        data: payload
      });
      
      await fetchTasks();
      
      setOpenAddTaskDialog(false);
      setNewTask({ taskName: "", taskDuration: "", description: "", category: "general" });
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
    } catch (err) {
      console.error('Create task error:', err);
      setTaskError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setAddingTask(false);
    }
  };

  // Update Task
  const updateTask = async (taskId, taskData) => {
    try {
      setUpdatingTask(true);
      setTaskError(null);
      
      const payload = {
        taskName: taskData.taskName,
        taskDuration: parseInt(taskData.taskDuration)
      };
      
      await apiCall(`/garage/task/${taskId}`, {
        method: 'PUT',
        data: payload
      });
      
      await fetchTasks();
      
      setOpenEditTaskDialog(false);
      setEditingTask(null);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
    } catch (err) {
      console.error('Update task error:', err);
      setTaskError(err.response?.data?.message || 'Failed to update task');
    } finally {
      setUpdatingTask(false);
    }
  };

  // Delete Task
  const deleteTask = async (taskId) => {
    try {
      await apiCall(`/garage/task/${taskId}`, { method: 'DELETE' });
      
      await fetchTasks();
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
    } catch (err) {
      console.error('Delete task error:', err);
      setError(err.response?.data?.message || 'Failed to delete task');
    }
  };

  // Fetch Inventory Parts
  const fetchInventoryParts = useCallback(async () => {
    if (!garageId) {
      return;
    }
    
    try {
      setIsLoadingInventory(true);
      const res = await apiCall(`/garage/inventory/${garageId}`, { method: 'GET' });
      setInventoryParts(res.data?.parts || res.data || []);
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
      setError('Failed to load inventory parts');
    } finally {
      setIsLoadingInventory(false);
    }
  }, [garageId, apiCall]);

  // Fetch Engineers
  const fetchEngineers = useCallback(async () => {
    if (!garageId) {
      return;
    }
    
    try {
      setIsLoading(true);
      const res = await apiCall(`/garage/engineers/${garageId}`, { method: 'GET' });
      setEngineers(res.data?.engineers || res.data || []);
    } catch (err) {
      console.error('Failed to fetch engineers:', err);
      setError(err.response?.data?.message || 'Failed to load engineers');
    } finally {
      setIsLoading(false);
    }
  }, [garageId, apiCall]);

  // Initialize data
  useEffect(() => {
    fetchInventoryParts();
    fetchEngineers();
    fetchTasks();
  }, [fetchInventoryParts, fetchEngineers, fetchTasks]);

  // Add new task assignment
  const addTaskAssignment = () => {
    setTaskAssignments(prev => [...prev, {
      id: Date.now(),
      engineer: null,
      tasks: [],
      parts: [],
      priority: 'medium',
      estimatedDuration: '',
      notes: ''
    }]);
  };

  // Remove task assignment
  const removeTaskAssignment = (assignmentId) => {
    if (taskAssignments.length > 1) {
      setTaskAssignments(prev => prev.filter(assignment => assignment.id !== assignmentId));
    }
  };

  // Update task assignment
  const updateTaskAssignment = (assignmentId, field, value) => {
    setTaskAssignments(prev => prev.map(assignment => 
      assignment.id === assignmentId 
        ? { ...assignment, [field]: value }
        : assignment
    ));

    if (formErrors[`assignment_${assignmentId}_${field}`]) {
      setFormErrors(prev => ({ 
        ...prev, 
        [`assignment_${assignmentId}_${field}`]: null 
      }));
    }
  };

  // Calculate total estimated duration for an assignment


  // Form Validation
  const validateForm = () => {
    const errors = {};
    
    taskAssignments.forEach((assignment, index) => {
      const assignmentKey = `assignment_${assignment.id}`;
      
      if (!assignment.engineer) {
        errors[`${assignmentKey}_engineer`] = 'Please select an engineer';
      }
      
      if (!assignment.tasks || assignment.tasks.length === 0) {
        errors[`${assignmentKey}_tasks`] = 'Please select at least one task';
      }
    });
    
    if (!id && (!jobCardIds || jobCardIds.length === 0)) {
      errors.jobCards = 'No job cards to assign';
    }
    
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      setError('Please fix the form errors');
      return false;
    }
    
    return true;
  };

  // Update Job Card Parts Used
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
        `${API_BASE_URL}/jobCards/${id}`,
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

  // Handle Form Submit
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

      // Update job cards with parts used
      const jobCardUpdatePromises = [];
      const targetJobCardIds = jobCardIds.length > 0 ? jobCardIds : [id];
      
      if (allPartsUsed.length > 0) {
        targetJobCardIds.forEach(jobCardId => {
          if (jobCardId) {
            jobCardUpdatePromises.push(
              updateJobCardPartsUsed(jobCardId, allPartsUsed)
            );
          }
        });
      }

      // Process each task assignment
      const assignmentPromises = taskAssignments.map(async (assignment) => {
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
          // estimatedDuration: calculateTotalDuration(assignment.tasks),
          notes: assignment.notes
        };

        console.log(`Assigning to engineer ${assignment.engineer._id}:`, payload);
        
        return axios.put(
          `https://garage-management-zi5z.onrender.com/api/jobcards/assign-jobcards/${assignment.engineer._id}`,
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );
      });

      // Execute job card updates first (if any parts are selected)
      if (jobCardUpdatePromises.length > 0) {
        console.log('Updating job cards with parts used...');
        await Promise.all(jobCardUpdatePromises);
        console.log('Job cards updated successfully');
      }

      // Execute all task assignments
      console.log('Assigning tasks to engineers...');
      const results = await Promise.all(assignmentPromises);
      
      console.log('All assignments completed:', results.map(r => r.data));
      console.log('Parts used in job cards:', allPartsUsed);
      
      setSuccess(true);
      setTimeout(() => {
        navigate(`/Work-In-Progress/${id}`);
      }, 2000);
      
    } catch (err) {
      console.error('Assignment error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to assign tasks to engineers');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Add Task
  const handleAddTask = () => {
    if (!newTask.taskName.trim() || !newTask.taskDuration.trim()) {
      setTaskError('Please fill in task name and duration');
      return;
    }

    if (isNaN(parseInt(newTask.taskDuration)) || parseInt(newTask.taskDuration) <= 0) {
      setTaskError('Duration must be a positive number in minutes');
      return;
    }

    createTask(newTask);
  };

  // Handle Edit Task
  const handleEditTask = () => {
    if (!editingTask.taskName.trim() || !editingTask.taskDuration.toString().trim()) {
      setTaskError('Please fill in task name and duration');
      return;
    }

    if (isNaN(parseInt(editingTask.taskDuration)) || parseInt(editingTask.taskDuration) <= 0) {
      setTaskError('Duration must be a positive number in minutes');
      return;
    }

    updateTask(editingTask.id || editingTask.taskId, editingTask);
  };

  // Handle Task Menu Actions
  const handleTaskMenuOpen = (event, task) => {
    setTaskMenuAnchor(event.currentTarget);
    setSelectedTaskForMenu(task);
  };

  const handleTaskMenuClose = () => {
    setTaskMenuAnchor(null);
    setSelectedTaskForMenu(null);
  };

  const handleEditTaskClick = () => {
    setEditingTask({
      ...selectedTaskForMenu,
      taskName: selectedTaskForMenu.name || selectedTaskForMenu.taskName,
      taskDuration: selectedTaskForMenu.taskDuration || 
                   (selectedTaskForMenu.duration ? 
                    parseInt(selectedTaskForMenu.duration.match(/\d+/)[0]) : 60)
    });
    setOpenEditTaskDialog(true);
    handleTaskMenuClose();
  };

  const handleDeleteTaskClick = () => {
    if (window.confirm(`Are you sure you want to delete "${selectedTaskForMenu.name || selectedTaskForMenu.taskName}"?`)) {
      deleteTask(selectedTaskForMenu.id || selectedTaskForMenu.taskId);
    }
    handleTaskMenuClose();
  };

  // Add New Engineer
  const handleAddEngineer = async () => {
    if (!newEngineer.name?.trim() || !newEngineer.email?.trim() || !newEngineer.phone?.trim()) {
      setEngineerAddError('Please fill all required fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEngineer.email)) {
      setEngineerAddError('Invalid email format');
      return;
    }

    if (!/^\d{10}$/.test(newEngineer.phone)) {
      setEngineerAddError('Phone number must be exactly 10 digits');
      return;
    }

    setAddingEngineer(true);
    setEngineerAddError(null);

    try {
      const formattedEngineer = {
        ...newEngineer,
        phone: newEngineer.phone,
        garageId
      };

      await apiCall('/garage/engineers/add', {
        method: 'POST',
        data: formattedEngineer
      });

      await fetchEngineers();

      setEngineerAddSuccess(true);
      setTimeout(() => {
        setEngineerAddSuccess(false);
        handleCloseAddEngineerDialog();
      }, 1500);
    } catch (err) {
      console.error('Add engineer error:', err);
      setEngineerAddError(err.response?.data?.message || 'Failed to add engineer');
    } finally {
      setAddingEngineer(false);
    }
  };

  // Add New Part
  const handleAddPart = async () => {
    if (!newPart.partName?.trim()) {
      setPartAddError('Please fill part name');
      return;
    }

    if (newPart.quantity <= 0) {
      setPartAddError('Quantity must be greater than 0');
      return;
    }

    if (newPart.pricePerUnit < 0) {
      setPartAddError('Price cannot be negative');
      return;
    }

    setAddingPart(true);
    setPartAddError(null);

    try {
      await apiCall('/garage/inventory/add', {
        method: 'POST',
        data: newPart
      });

      await fetchInventoryParts();

      setPartAddSuccess(true);
      setTimeout(() => {
        setPartAddSuccess(false);
        handleCloseAddPartDialog();
      }, 1500);
    } catch (err) {
      console.error('Add part error:', err);
      setPartAddError(err.response?.data?.message || 'Failed to add part');
    } finally {
      setAddingPart(false);
    }
  };

  // Close Handlers
  const handleCloseAlert = () => {
    setError(null);
    setSuccess(false);
    setFormErrors({});
  };

  const handleCloseAddEngineerDialog = () => {
    setOpenAddEngineerDialog(false);
    setEngineerAddError(null);
    setEngineerAddSuccess(false);
    setNewEngineer({ 
      name: "", 
      garageId, 
      email: "", 
      phone: "", 
      specialty: "" 
    });
  };

  const handleCloseAddPartDialog = () => {
    setOpenAddPartDialog(false);
    setPartAddError(null);
    setPartAddSuccess(false);
    setNewPart({
      garageId,
      carName: "",
      model: "",
      partNumber: "",
      partName: "",
      quantity: 1,
      pricePerUnit: 0,
      gstPercentage: 0,
      taxAmount: 0
    });
  };

  // Handle input changes for new engineer
  const handleEngineerInputChange = (field, value) => {
    setNewEngineer(prev => ({ ...prev, [field]: value }));
    if (engineerAddError) setEngineerAddError(null);
  };

  // Handle input changes for new part
  const handlePartInputChange = (field, value) => {
    setNewPart(prev => ({ ...prev, [field]: value }));
    if (partAddError) setPartAddError(null);
  };

  // Priority color mapping
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  return (
    <>
      {/* Error & Success Alerts */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={handleCloseAlert}>
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar 
        open={success} 
        autoHideDuration={3000} 
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccess(false)}>
          Tasks assigned successfully to engineers!
        </Alert>
      </Snackbar>

      {/* Main Content */}
      <Box
        sx={{
          flexGrow: 1,
          mb: 4,
          ml: { xs: 0, sm: 35 },
          overflow: "auto",
        }}
      >
        <CssBaseline />
        <Container maxWidth="lg">
          {/* Header */}
          <Box sx={{ 
            mb: 3, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton 
                onClick={() => navigate(-1)} 
                sx={{ mr: 2 }}
                aria-label="Go back"
              >
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h5" fontWeight={600}>
                Assign Multiple Tasks to Engineers
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<RefreshIcon />}
                onClick={fetchTasks}
                size="small"
                disabled={isLoadingTasks}
              >
                Refresh Tasks
              </Button>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => setOpenAddTaskDialog(true)}
                size="small"
              >
                Add Task
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => setOpenAddEngineerDialog(true)}
                size="small"
              >
                Add Engineer
              </Button>
            </Box>
          </Box>

          {/* Task Assignment Summary */}
          <Card sx={{ mb: 3, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Assignment Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {taskAssignments.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Assignments
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {taskAssignments.reduce((total, assignment) => total + assignment.tasks.length, 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Tasks
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {new Set(taskAssignments.filter(a => a.engineer).map(a => a.engineer._id)).size}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Engineers Assigned
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {availableTasks.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Available Tasks
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              
              {/* Parts Summary */}
              {(() => {
                const allPartsUsed = [];
                taskAssignments.forEach(assignment => {
                  assignment.parts.forEach(part => {
                    const existingPartIndex = allPartsUsed.findIndex(p => p._id === part._id);
                    const selectedQuantity = part.selectedQuantity || 1;
                    
                    if (existingPartIndex !== -1) {
                      allPartsUsed[existingPartIndex].quantity += selectedQuantity;
                    } else {
                      allPartsUsed.push({ ...part, quantity: selectedQuantity });
                    }
                  });
                });
                
                if (allPartsUsed.length > 0) {
                  return (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                        Parts to be Updated in Job Card{jobCardIds.length > 1 ? 's' : ''}:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {allPartsUsed.map((part, index) => (
                          <Chip
                            key={index}
                            label={`${part.partName} (Qty: ${part.quantity})`}
                            color="info"
                            variant="outlined"
                            size="small"
                          />
                        ))}
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        These parts will be added to the partsUsed field in job card{jobCardIds.length > 1 ? 's' : ''}: {(jobCardIds.length > 0 ? jobCardIds : [id]).join(', ')}
                      </Typography>
                    </>
                  );
                }
                return null;
              })()}
            </CardContent>
          </Card>

          {/* Main Form Card */}
          <Card sx={{ mb: 4, borderRadius: 2 }}>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" fontWeight={600}>
                    Task Assignments
                  </Typography>
                </Box>

                {/* Task Assignments */}
                {taskAssignments.map((assignment, index) => (
                  <Accordion 
                    key={assignment.id} 
                    defaultExpanded 
                    sx={{ mb: 2, border: '1px solid', borderColor: 'divider' }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', pr: 2 }}>
                        <DragIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                          Assignment #{index + 1}
                          {assignment.engineer && (
                            <Chip 
                              label={assignment.engineer.name} 
                              size="small" 
                              sx={{ ml: 1 }} 
                              color="primary"
                            />
                          )}
                          {assignment.tasks.length > 0 && (
                            <Chip 
                              label={`${assignment.tasks.length} tasks`} 
                              size="small" 
                              sx={{ ml: 1 }} 
                              color="secondary"
                            />
                          )}
                          <Chip 
                            label={assignment.priority} 
                            size="small" 
                            sx={{ ml: 1 }} 
                            color={getPriorityColor(assignment.priority)}
                          />
                        </Typography>
                        {taskAssignments.length > 1 && (
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              removeTaskAssignment(assignment.id);
                            }}
                            size="small"
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={3}>
                        {/* Engineer Selection */}
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                            Select Engineer *
                          </Typography>
                          {isLoading ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', py: 2 }}>
                              <CircularProgress size={20} />
                              <Typography sx={{ ml: 1 }}>Loading engineers...</Typography>
                            </Box>
                          ) : (
                            <Autocomplete
                              fullWidth
                              options={engineers}
                              getOptionLabel={(option) => option.name || ''}
                              value={assignment.engineer}
                              onChange={(event, newValue) => {
                                updateTaskAssignment(assignment.id, 'engineer', newValue);
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  placeholder="Select engineer"
                                  variant="outlined"
                                  error={!!formErrors[`assignment_${assignment.id}_engineer`]}
                                  helperText={formErrors[`assignment_${assignment.id}_engineer`]}
                                  InputProps={{
                                    ...params.InputProps,
                                    startAdornment: (
                                      <>
                                        <InputAdornment position="start">
                                          <PersonIcon color="action" />
                                        </InputAdornment>
                                        {params.InputProps.startAdornment}
                                      </>
                                    ),
                                  }}
                                />
                              )}
                              disabled={engineers.length === 0}
                              noOptionsText="No engineers available"
                            />
                          )}
                        </Grid>

                        {/* Priority Selection */}
                        <Grid item xs={12} md={3}>
                          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                            Priority
                          </Typography>
                          <FormControl fullWidth>
                            <Select
                              value={assignment.priority}
                              onChange={(e) => updateTaskAssignment(assignment.id, 'priority', e.target.value)}
                            >
                              <MenuItem value="low">Low</MenuItem>
                              <MenuItem value="medium">Medium</MenuItem>
                              <MenuItem value="high">High</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>

                        {/* Estimated Duration Display */}
                        {/* <Grid item xs={12} md={3}>
                          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                            Total Duration
                          </Typography>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            p: 1.5, 
                            border: '1px solid', 
                            borderColor: 'divider',
                            borderRadius: 1,
                            backgroundColor: 'action.hover'
                          }}>
                            <ScheduleIcon color="action" sx={{ mr: 1 }} />
                            <Typography variant="body2">
                              {calculateTotalDuration(assignment.tasks)}
                            </Typography>
                          </Box>
                        </Grid> */}

                        {/* Task Selection */}
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                            Select Tasks *
                          </Typography>
                          {isLoadingTasks ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', py: 2 }}>
                              <CircularProgress size={20} />
                              <Typography sx={{ ml: 1 }}>Loading tasks...</Typography>
                            </Box>
                          ) : (
                            <Autocomplete
                              multiple
                              fullWidth
                              options={availableTasks}
                              getOptionLabel={(option) => 
                                `${option.name || option.taskName}  - ${option.category}`
                              }
                              value={assignment.tasks}
                              onChange={(event, newValue) => {
                                updateTaskAssignment(assignment.id, 'tasks', newValue);
                              }}
                              renderTags={(value, getTagProps) =>
                                value.map((option, index) => (
                                  <Chip
                                    variant="outlined"
                                    label={`${option.name || option.taskName}`}
                                    {...getTagProps({ index })}
                                    key={option.id || option.taskId}
                                  />
                                ))
                              }
                              renderOption={(props, option) => (
                                <Box component="li" {...props} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Box>
                                    <Typography variant="body2">
                                      {option.name || option.taskName} 
                                    </Typography>
                                    {/* <Typography variant="caption" color="text.secondary">
                                      {option.category} - {option.description}
                                    </Typography> */}
                                  </Box>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleTaskMenuOpen(e, option);
                                    }}
                                  >
                                    <MoreVertIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              )}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  placeholder="Select multiple tasks"
                                  variant="outlined"
                                  error={!!formErrors[`assignment_${assignment.id}_tasks`]}
                                  helperText={formErrors[`assignment_${assignment.id}_tasks`]}
                                  InputProps={{
                                    ...params.InputProps,
                                    startAdornment: (
                                      <>
                                        <InputAdornment position="start">
                                          <AssignmentIcon color="action" />
                                        </InputAdornment>
                                        {params.InputProps.startAdornment}
                                      </>
                                    ),
                                  }}
                                />
                              )}
                              groupBy={(option) => option.category}
                              noOptionsText="No tasks available"
                            />
                          )}
                        </Grid>

                        {/* Enhanced Parts Selection */}
                        <Grid item xs={12}>
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            mb: 1,
                            flexWrap: 'wrap',
                            gap: 1
                          }}>
                            <Typography variant="subtitle2" fontWeight={600}>
                              Select Parts (Optional)
                            </Typography>
                            <Tooltip title="Add New Part">
                              <Button
                                variant="outlined"
                                color="primary"
                                size="small"
                                startIcon={<AddIcon />}
                                onClick={() => setOpenAddPartDialog(true)}
                              >
                                Add Part
                              </Button>
                            </Tooltip>
                          </Box>
                          
                          {isLoadingInventory ? (
                            <Box sx={{ 
                              display: 'flex', 
                              justifyContent: 'center', 
                              alignItems: 'center',
                              py: 2 
                            }}>
                              <CircularProgress size={20} />
                              <Typography sx={{ ml: 2 }}>
                                Loading parts...
                              </Typography>
                            </Box>
                          ) : (
                            <Autocomplete
                              multiple
                              fullWidth
                              options={inventoryParts}
                              getOptionLabel={(option) => 
                                `${option.partName} (${option.partNumber || 'N/A'}) - ₹${option.pricePerUnit || 0} | GST: ${option.gstPercentage || option.taxAmount || 0}% | Available: ${option.quantity}`
                              }
                              value={assignment.parts}
                              onChange={(event, newValue) => {
                                const updatedParts = newValue.map(part => ({
                                  ...part,
                                  selectedQuantity: part.selectedQuantity || 1
                                }));
                                updateTaskAssignment(assignment.id, 'parts', updatedParts);
                              }}
                              renderTags={(value, getTagProps) =>
                                value.map((option, index) => (
                                  <Chip
                                    variant="outlined"
                                    label={`${option.partName} (${option.partNumber || 'N/A'}) - Qty: ${option.selectedQuantity || 1} @ ₹${option.pricePerUnit || 0}`}
                                    {...getTagProps({ index })}
                                    key={option._id}
                                  />
                                ))
                              }
                              renderOption={(props, option) => (
                                <Box component="li" {...props}>
                                  <Box sx={{ width: '100%' }}>
                                    <Typography variant="body2" fontWeight={500}>
                                      {option.partName}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      Part #: {option.partNumber || 'N/A'} | 
                                      Price: ₹{option.pricePerUnit || 0} | 
                                      GST: {option.gstPercentage || option.taxAmount || 0}% | 
                                      Available: {option.quantity} | 
                                      {option.carName} - {option.model}
                                    </Typography>
                                  </Box>
                                </Box>
                              )}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  placeholder="Select parts needed for these tasks"
                                  variant="outlined"
                                  InputProps={{
                                    ...params.InputProps,
                                    startAdornment: (
                                      <>
                                        <InputAdornment position="start">
                                          <InventoryIcon color="action" />
                                        </InputAdornment>
                                        {params.InputProps.startAdornment}
                                      </>
                                    ),
                                  }}
                                />
                              )}
                              noOptionsText="No parts available"
                            />
                          )}
                          
                          {/* Enhanced Selected Parts with Price Details */}
                          {/* Enhanced Selected Parts with Price Details */}
{assignment.parts.length > 0 && (
  <Box sx={{ mt: 2 }}>
    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
      Selected Parts with Details:
    </Typography>
    <List dense>
      {assignment.parts.map((part, partIndex) => {
        const selectedQuantity = part.selectedQuantity || 1;
        const unitPrice = part.pricePerUnit || 0;
        const gstPercentage = part.gstPercentage || part.taxAmount || 0;
        const totalPrice = unitPrice * selectedQuantity;
        const gstAmount = (totalPrice * gstPercentage) / 100;
        const finalPrice = totalPrice + gstAmount;

        return (
          <ListItem 
            key={part._id} 
            sx={{ 
              border: '1px solid', 
              borderColor: 'divider', 
              borderRadius: 1, 
              mb: 1,
              py: 1,
              flexDirection: 'column',
              alignItems: 'stretch'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" fontWeight={500}>
                  {part.partName}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Part #: {part.partNumber || 'N/A'} | {part.carName} - {part.model}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Available Stock: {part.quantity}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  size="small"
                  type="number"
                  label="Qty"
                  value={selectedQuantity}
                  onChange={(e) => {
                    const newQuantity = Math.max(1, Math.min(part.quantity, Number(e.target.value)));
                    const updatedParts = assignment.parts.map((p, idx) => 
                      idx === partIndex 
                        ? { ...p, selectedQuantity: newQuantity }
                        : p
                    );
                    updateTaskAssignment(assignment.id, 'parts', updatedParts);
                  }}
                  inputProps={{ 
                    min: 1, 
                    max: part.quantity,
                    style: { width: '60px' }
                  }}
                  sx={{ width: '80px' }}
                />
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => {
                    const updatedParts = assignment.parts.filter((_, idx) => idx !== partIndex);
                    updateTaskAssignment(assignment.id, 'parts', updatedParts);
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
            {/* Price Details */}
            <Box sx={{ mt: 1, p: 1, backgroundColor: 'action.hover', borderRadius: 1 }}>
              <Grid container spacing={1} alignItems="center">
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">
                    Price/Unit: ₹{unitPrice.toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="caption" color="text.secondary">
                    GST: {gstPercentage}%
                  </Typography>
                </Grid>
                <Grid item xs={5}>
                  <Typography variant="caption" fontWeight={600} color="primary">
                    Total: ₹{finalPrice.toFixed(2)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </ListItem>
        );
      })}
    </List>
    {/* Total Summary */}
    {(() => {
      const grandTotal = assignment.parts.reduce((total, part) => {
        const selectedQuantity = part.selectedQuantity || 1;
        const unitPrice = part.pricePerUnit || 0;
        const gstPercentage = part.gstPercentage || part.taxAmount || 0;
        const totalPrice = unitPrice * selectedQuantity;
        const gstAmount = (totalPrice * gstPercentage) / 100;
        return total + totalPrice + gstAmount;
      }, 0);
      return (
        <Box sx={{ mt: 1, p: 1, backgroundColor: 'primary.light', borderRadius: 1 }}>
          <Typography variant="subtitle2" fontWeight={600} color="primary.contrastText">
            Assignment Total: ₹{grandTotal.toFixed(2)}
          </Typography>
        </Box>
      );
    })()}
  </Box>
)}
                        </Grid>

                        {/* Notes */}
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                            Additional Notes
                          </Typography>
                          <TextField
                            fullWidth
                            multiline
                            rows={3}
                            placeholder="Add any special instructions or notes for this assignment..."
                            value={assignment.notes}
                            onChange={(e) => updateTaskAssignment(assignment.id, 'notes', e.target.value)}
                          />
                        </Grid>

                        {/* Task Details Summary */}
                        {assignment.tasks.length > 0 && (
                          <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                              Selected Tasks Details
                            </Typography>
                            <List dense>
                              {assignment.tasks.map((task, taskIndex) => (
                                <ListItem key={task.id || task.taskId} sx={{ py: 0.5 }}>
                                  <ListItemText
                                    primary={
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body2" fontWeight={500}>
                                          {task.name || task.taskName}
                                        </Typography>
                                        {/* <Chip 
                                          label={task.duration || `${task.taskDuration} min`} 
                                          size="small" 
                                          variant="outlined"
                                        /> */}
                                        <Chip 
                                          label={task.category} 
                                          size="small" 
                                          color="secondary"
                                        />
                                      </Box>
                                    }
                                    secondary={task.description}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </Grid>
                        )}
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                ))}

                {/* Submit Button */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                    disabled={isSubmitting || isLoading}
                    sx={{ px: 6, py: 1.5, textTransform: 'uppercase' }}
                  >
                    {isSubmitting ? 'Assigning Tasks...' : 'Assign All Tasks to Engineers'}
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Container>

        {/* Task Context Menu */}
        <Menu
          anchorEl={taskMenuAnchor}
          open={Boolean(taskMenuAnchor)}
          onClose={handleTaskMenuClose}
        >
          <MenuItem onClick={handleEditTaskClick}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            Edit Task
          </MenuItem>
          <MenuItem onClick={handleDeleteTaskClick} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            Delete Task
          </MenuItem>
        </Menu>

        {/* Add Task Dialog */}
        <Dialog 
          open={openAddTaskDialog} 
          onClose={() => {
            setOpenAddTaskDialog(false);
            setTaskError(null);
            setNewTask({ taskName: "", taskDuration: "", description: "", category: "general" });
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Add New Task</DialogTitle>
          <DialogContent>
            {taskError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {taskError}
              </Alert>
            )}
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField 
                  fullWidth 
                  label="Task Name *" 
                  value={newTask.taskName} 
                  onChange={(e) => {
                    setNewTask(prev => ({ ...prev, taskName: e.target.value }));
                    if (taskError) setTaskError(null);
                  }}
                  error={!newTask.taskName.trim() && !!taskError}
                />
              </Grid>
              {/* <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label="Duration (minutes) *" 
                  type="number"
                  value={newTask.taskDuration} 
                  onChange={(e) => {
                    setNewTask(prev => ({ ...prev, taskDuration: e.target.value }));
                    if (taskError) setTaskError(null);
                  }}
                  placeholder="e.g., 120"
                  inputProps={{ min: 1 }}
                  error={!newTask.taskDuration.trim() && !!taskError}
                />
              </Grid> */}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => {
                setOpenAddTaskDialog(false);
                setTaskError(null);
                setNewTask({ taskName: "", taskDuration: "", description: "", category: "general" });
              }}
              disabled={addingTask}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddTask} 
              variant="contained"
              disabled={addingTask || !newTask.taskName.trim() || !newTask.taskDuration.trim()}
              startIcon={addingTask ? <CircularProgress size={16} color="inherit" /> : null}
            >
              {addingTask ? 'Creating...' : 'Create Task'}
            </Button>
          </DialogActions>
        </Dialog>
           <Dialog 
                    open={openEditTaskDialog} 
                    onClose={() => {
                      setOpenEditTaskDialog(false);
                      setTaskError(null);
                      setEditingTask(null);
                    }}
                    maxWidth="sm"
                    fullWidth
                  >
                    <DialogTitle>Edit Task</DialogTitle>
                    <DialogContent>
                      {taskError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                          {taskError}
                        </Alert>
                      )}
                      
                      {editingTask && (
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                          <Grid item xs={12}>
                            <TextField 
                              fullWidth 
                              label="Task Name *" 
                              value={editingTask.taskName} 
                              onChange={(e) => {
                                setEditingTask(prev => ({ ...prev, taskName: e.target.value }));
                                if (taskError) setTaskError(null);
                              }}
                              error={!editingTask.taskName.trim() && !!taskError}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField 
                              fullWidth 
                              label="Duration (minutes) *" 
                              type="number"
                              value={editingTask.taskDuration} 
                              onChange={(e) => {
                                setEditingTask(prev => ({ ...prev, taskDuration: e.target.value }));
                                if (taskError) setTaskError(null);
                              }}
                              placeholder="e.g., 120"
                              inputProps={{ min: 1 }}
                              error={!editingTask.taskDuration.toString().trim() && !!taskError}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                              <InputLabel>Category</InputLabel>
                              <Select
                                value={editingTask.category || 'general'}
                                label="Category"
                                onChange={(e) => setEditingTask(prev => ({ ...prev, category: e.target.value }))}
                              >
                                <MenuItem value="general">General</MenuItem>
                                <MenuItem value="engine">Engine</MenuItem>
                                <MenuItem value="brakes">Brakes</MenuItem>
                                <MenuItem value="maintenance">Maintenance</MenuItem>
                                <MenuItem value="tires">Tires</MenuItem>
                                <MenuItem value="hvac">HVAC</MenuItem>
                                <MenuItem value="electrical">Electrical</MenuItem>
                                <MenuItem value="transmission">Transmission</MenuItem>
                                <MenuItem value="suspension">Suspension</MenuItem>
                                <MenuItem value="exhaust">Exhaust</MenuItem>
                                <MenuItem value="diagnostic">Diagnostic</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={12}>
                            <TextField 
                              fullWidth 
                              label="Description" 
                              multiline
                              rows={3}
                              value={editingTask.description || ''} 
                              onChange={(e) => setEditingTask(prev => ({ ...prev, description: e.target.value }))}
                              placeholder="Describe the task in detail..."
                            />
                          </Grid>
                        </Grid>
                      )}
                    </DialogContent>
                    <DialogActions>
                      <Button 
                        onClick={() => {
                          setOpenEditTaskDialog(false);
                          setTaskError(null);
                          setEditingTask(null);
                        }}
                        disabled={updatingTask}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleEditTask} 
                        variant="contained"
                        disabled={updatingTask || !editingTask?.taskName?.trim() || !editingTask?.taskDuration?.toString()?.trim()}
                        startIcon={updatingTask ? <CircularProgress size={16} color="inherit" /> : null}
                      >
                        {updatingTask ? 'Updating...' : 'Update Task'}
                      </Button>
                    </DialogActions>
                  </Dialog>
          
                  {/* Add Part Dialog */}
                  <Dialog 
                    open={openAddPartDialog} 
                    onClose={handleCloseAddPartDialog}
                    maxWidth="md"
                    fullWidth
                  >
                    <DialogTitle>Add New Part</DialogTitle>
                    <DialogContent>
                      {partAddSuccess && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                          Part added successfully!
                        </Alert>
                      )}
                      {partAddError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                          {partAddError}
                        </Alert>
                      )}
                      
                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        {/* <Grid item xs={12} sm={6}>
                          <TextField 
                            fullWidth 
                            label="Car Name *" 
                            value={newPart.carName} 
                            onChange={(e) => handlePartInputChange('carName', e.target.value)}
                            error={!newPart.carName.trim() && !!partAddError}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField 
                            fullWidth 
                            label="Model *" 
                            value={newPart.model} 
                            onChange={(e) => handlePartInputChange('model', e.target.value)}
                            error={!newPart.model.trim() && !!partAddError}
                          />
                        </Grid> */}
                        <Grid item xs={12} sm={6}>
                          <TextField 
                            fullWidth 
                            label="Part Number" 
                            value={newPart.partNumber} 
                            onChange={(e) => handlePartInputChange('partNumber', e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField 
                            fullWidth 
                            label="Part Name *" 
                            value={newPart.partName} 
                            onChange={(e) => handlePartInputChange('partName', e.target.value)}
                            error={!newPart.partName.trim() && !!partAddError}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField 
                            fullWidth 
                            label="Quantity *" 
                            type="number" 
                            value={newPart.quantity} 
                            onChange={(e) => handlePartInputChange('quantity', Math.max(1, Number(e.target.value)))}
                            inputProps={{ min: 1 }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField 
                            fullWidth 
                            label="Price Per Unit" 
                            type="number" 
                            value={newPart.pricePerUnit} 
                            onChange={(e) => handlePartInputChange('pricePerUnit', Math.max(0, Number(e.target.value)))}
                            inputProps={{ min: 0, step: 0.01 }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField 
                            fullWidth 
                            label="Tax Amount" 
                            type="number" 
                            value={newPart.taxAmount} 
                            onChange={(e) => handlePartInputChange('taxAmount', Math.max(0, Number(e.target.value)))}
                            inputProps={{ min: 0, step: 0.01 }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
              <TextField 
                fullWidth 
                label="GST Percentage %" 
                type="number" 
                value={newPart.gstPercentage} 
                onChange={(e) => handlePartInputChange('gstPercentage', Math.max(0, Math.min(100, Number(e.target.value))))}
                inputProps={{ min: 0, max: 100, step: 0.01 }}
                placeholder="e.g., 18"
              />
            </Grid>
                      </Grid>
                    </DialogContent>
                    <DialogActions>
                      <Button 
                        onClick={handleCloseAddPartDialog}
                        disabled={addingPart}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleAddPart} 
                        disabled={addingPart} 
                        variant="contained"
                        startIcon={addingPart ? <CircularProgress size={16} color="inherit" /> : null}
                      >
                        {addingPart ? 'Adding...' : 'Add Part'}
                      </Button>
                    </DialogActions>
                  </Dialog>
          
                  {/* Add Engineer Dialog */}
                  <Dialog 
                    open={openAddEngineerDialog} 
                    onClose={handleCloseAddEngineerDialog}
                    maxWidth="sm"
                    fullWidth
                  >
                    <DialogTitle>Add New Engineer</DialogTitle>
                    <DialogContent>
                      {engineerAddSuccess && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                          Engineer added successfully!
                        </Alert>
                      )}
                      {engineerAddError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                          {engineerAddError}
                        </Alert>
                      )}
                      
                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                          <TextField 
                            fullWidth 
                            label="Name *" 
                            value={newEngineer.name} 
                            onChange={(e) => handleEngineerInputChange('name', e.target.value)}
                            error={!newEngineer.name.trim() && !!engineerAddError}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField 
                            fullWidth 
                            label="Email *" 
                            type="email" 
                            value={newEngineer.email} 
                            onChange={(e) => handleEngineerInputChange('email', e.target.value)}
                            error={!newEngineer.email.trim() && !!engineerAddError}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField 
                            fullWidth 
                            label="Phone *" 
                            value={newEngineer.phone} 
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                              handleEngineerInputChange('phone', value);
                            }}
                            error={!newEngineer.phone.trim() && !!engineerAddError}
                            placeholder="10-digit phone number"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField 
                            fullWidth 
                            label="Specialty" 
                            value={newEngineer.specialty} 
                            onChange={(e) => handleEngineerInputChange('specialty', e.target.value)}
                            placeholder="e.g., Engine Specialist, Brake Expert"
                          />
                        </Grid>
                      </Grid>
                    </DialogContent>
                    <DialogActions>
                      <Button 
                        onClick={handleCloseAddEngineerDialog}
                        disabled={addingEngineer}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleAddEngineer} 
                        disabled={addingEngineer} 
                        variant="contained"
                        startIcon={addingEngineer ? <CircularProgress size={16} color="inherit" /> : null}
                      >
                        {addingEngineer ? 'Adding...' : 'Add Engineer'}
                      </Button>
                    </DialogActions>
                  </Dialog>
                </Box>
              </>
            );
          };
          
          export default AssignEngineer;