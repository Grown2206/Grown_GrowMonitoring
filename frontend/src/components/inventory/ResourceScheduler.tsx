import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tab,
  Tabs,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Build as EquipmentIcon,
  Event as EventIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

export interface ResourceAllocation {
  id: string;
  resourceId: string;
  resourceName: string;
  resourceType: ResourceType;
  allocatedTo: string;
  purpose: string;
  startDate: Date;
  endDate: Date;
  status: AllocationStatus;
  priority: Priority;
  notes?: string;
}

export type ResourceType = 'equipment' | 'personnel' | 'facility' | 'vehicle';
export type AllocationStatus = 'scheduled' | 'in-use' | 'completed' | 'cancelled';
export type Priority = 'low' | 'medium' | 'high' | 'critical';

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  availability: 'available' | 'in-use' | 'maintenance' | 'unavailable';
  location?: string;
}

export interface ResourceSchedulerProps {
  allocations?: ResourceAllocation[];
  resources?: Resource[];
  onAddAllocation?: (allocation: Omit<ResourceAllocation, 'id'>) => void;
  onUpdateAllocation?: (id: string, allocation: Partial<ResourceAllocation>) => void;
  onDeleteAllocation?: (id: string) => void;
}

export function ResourceScheduler({
  allocations: initialAllocations,
  resources: initialResources,
  onAddAllocation,
  onUpdateAllocation,
  onDeleteAllocation,
}: ResourceSchedulerProps) {
  const [allocations, setAllocations] = useState<ResourceAllocation[]>(
    initialAllocations || getSampleAllocations()
  );
  const [resources] = useState<Resource[]>(initialResources || getSampleResources());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAllocation, setEditingAllocation] = useState<ResourceAllocation | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [viewDate, setViewDate] = useState<Date | null>(new Date());

  // Form state
  const [formResourceId, setFormResourceId] = useState('');
  const [formAllocatedTo, setFormAllocatedTo] = useState('');
  const [formPurpose, setFormPurpose] = useState('');
  const [formStartDate, setFormStartDate] = useState<Date | null>(new Date());
  const [formEndDate, setFormEndDate] = useState<Date | null>(new Date());
  const [formPriority, setFormPriority] = useState<Priority>('medium');
  const [formNotes, setFormNotes] = useState('');

  const handleOpenDialog = (allocation?: ResourceAllocation) => {
    if (allocation) {
      setEditingAllocation(allocation);
      setFormResourceId(allocation.resourceId);
      setFormAllocatedTo(allocation.allocatedTo);
      setFormPurpose(allocation.purpose);
      setFormStartDate(allocation.startDate);
      setFormEndDate(allocation.endDate);
      setFormPriority(allocation.priority);
      setFormNotes(allocation.notes || '');
    } else {
      setEditingAllocation(null);
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingAllocation(null);
    resetForm();
  };

  const resetForm = () => {
    setFormResourceId('');
    setFormAllocatedTo('');
    setFormPurpose('');
    setFormStartDate(new Date());
    setFormEndDate(new Date());
    setFormPriority('medium');
    setFormNotes('');
  };

  const handleSaveAllocation = () => {
    if (!formStartDate || !formEndDate) return;

    const resource = resources.find((r) => r.id === formResourceId);
    if (!resource) return;

    const allocationData = {
      resourceId: formResourceId,
      resourceName: resource.name,
      resourceType: resource.type,
      allocatedTo: formAllocatedTo,
      purpose: formPurpose,
      startDate: formStartDate,
      endDate: formEndDate,
      status: 'scheduled' as AllocationStatus,
      priority: formPriority,
      notes: formNotes,
    };

    if (editingAllocation) {
      const updated = allocations.map((allocation) =>
        allocation.id === editingAllocation.id
          ? { ...allocation, ...allocationData }
          : allocation
      );
      setAllocations(updated);
      onUpdateAllocation?.(editingAllocation.id, allocationData);
    } else {
      const newAllocation: ResourceAllocation = {
        id: 'alloc-' + Date.now(),
        ...allocationData,
      };
      setAllocations([...allocations, newAllocation]);
      onAddAllocation?.(allocationData);
    }

    handleCloseDialog();
  };

  const handleDeleteAllocation = (id: string) => {
    setAllocations(allocations.filter((allocation) => allocation.id !== id));
    onDeleteAllocation?.(id);
  };

  const getStatusColor = (status: AllocationStatus) => {
    switch (status) {
      case 'scheduled':
        return 'info';
      case 'in-use':
        return 'success';
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'error';
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'low':
        return 'default';
      case 'medium':
        return 'info';
      case 'high':
        return 'warning';
      case 'critical':
        return 'error';
    }
  };

  const getResourceIcon = (type: ResourceType) => {
    switch (type) {
      case 'equipment':
        return <EquipmentIcon />;
      case 'personnel':
        return <PersonIcon />;
      case 'facility':
        return <CalendarIcon />;
      case 'vehicle':
        return <EventIcon />;
    }
  };

  const filterAllocationsByDate = (date: Date) => {
    return allocations.filter((allocation) => {
      const allocStart = new Date(allocation.startDate);
      const allocEnd = new Date(allocation.endDate);
      return date >= allocStart && date <= allocEnd;
    });
  };

  const upcomingAllocations = allocations.filter(
    (allocation) =>
      allocation.status === 'scheduled' && new Date(allocation.startDate) > new Date()
  );

  const activeAllocations = allocations.filter(
    (allocation) => allocation.status === 'in-use'
  );

  const availableResources = resources.filter((resource) => resource.availability === 'available');

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5">Resource Scheduler</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage resource allocation and scheduling
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Schedule Resource
        </Button>
      </Stack>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Resources
                  </Typography>
                  <Typography variant="h4">{resources.length}</Typography>
                </Box>
                <ScheduleIcon color="primary" sx={{ fontSize: 40 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Available
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {availableResources.length}
                  </Typography>
                </Box>
                <EquipmentIcon color="success" sx={{ fontSize: 40 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Active Allocations
                  </Typography>
                  <Typography variant="h4">{activeAllocations.length}</Typography>
                </Box>
                <EventIcon color="info" sx={{ fontSize: 40 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Upcoming
                  </Typography>
                  <Typography variant="h4">{upcomingAllocations.length}</Typography>
                </Box>
                <CalendarIcon color="warning" sx={{ fontSize: 40 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="All Allocations" />
        <Tab label="By Date" />
        <Tab label="By Resource" />
      </Tabs>

      {activeTab === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              All Allocations
            </Typography>
            <List>
              {allocations.map((allocation) => (
                <ListItem
                  key={allocation.id}
                  secondaryAction={
                    <Stack direction="row" spacing={0.5}>
                      <IconButton
                        edge="end"
                        onClick={() => handleOpenDialog(allocation)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        color="error"
                        onClick={() => handleDeleteAllocation(allocation.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  }
                >
                  <ListItemAvatar>
                    <Avatar>{getResourceIcon(allocation.resourceType)}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle1">
                          {allocation.resourceName}
                        </Typography>
                        <Chip
                          label={allocation.status}
                          size="small"
                          color={getStatusColor(allocation.status)}
                        />
                        <Chip
                          label={allocation.priority}
                          size="small"
                          color={getPriorityColor(allocation.priority)}
                        />
                      </Stack>
                    }
                    secondary={
                      <Stack spacing={0.5}>
                        <Typography variant="body2">
                          Allocated to: {allocation.allocatedTo}
                        </Typography>
                        <Typography variant="body2">
                          Purpose: {allocation.purpose}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {allocation.startDate.toLocaleDateString()} -{' '}
                          {allocation.endDate.toLocaleDateString()}
                        </Typography>
                      </Stack>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Select Date
                </Typography>
                <DatePicker
                  value={viewDate}
                  onChange={(newValue) => setViewDate(newValue)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Allocations on {viewDate?.toLocaleDateString()}
                </Typography>
                <List>
                  {viewDate &&
                    filterAllocationsByDate(viewDate).map((allocation) => (
                      <ListItem key={allocation.id}>
                        <ListItemAvatar>
                          <Avatar>{getResourceIcon(allocation.resourceType)}</Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={allocation.resourceName}
                          secondary={`${allocation.allocatedTo} - ${allocation.purpose}`}
                        />
                        <Chip
                          label={allocation.status}
                          size="small"
                          color={getStatusColor(allocation.status)}
                        />
                      </ListItem>
                    ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Resources and Their Allocations
            </Typography>
            <List>
              {resources.map((resource) => {
                const resourceAllocations = allocations.filter(
                  (a) => a.resourceId === resource.id
                );
                return (
                  <Paper key={resource.id} sx={{ mb: 2, p: 2 }}>
                    <Stack spacing={1}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar>{getResourceIcon(resource.type)}</Avatar>
                          <Box>
                            <Typography variant="subtitle1">{resource.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {resource.type} - {resource.availability}
                            </Typography>
                          </Box>
                        </Stack>
                        <Chip
                          label={`${resourceAllocations.length} allocations`}
                          size="small"
                        />
                      </Stack>
                      {resourceAllocations.length > 0 && (
                        <List dense>
                          {resourceAllocations.map((allocation) => (
                            <ListItem key={allocation.id}>
                              <ListItemText
                                primary={allocation.purpose}
                                secondary={`${allocation.allocatedTo} | ${allocation.startDate.toLocaleDateString()} - ${allocation.endDate.toLocaleDateString()}`}
                              />
                            </ListItem>
                          ))}
                        </List>
                      )}
                    </Stack>
                  </Paper>
                );
              })}
            </List>
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingAllocation ? 'Edit Allocation' : 'Schedule Resource'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Resource</InputLabel>
                <Select
                  value={formResourceId}
                  onChange={(e) => setFormResourceId(e.target.value)}
                >
                  {resources.map((resource) => (
                    <MenuItem key={resource.id} value={resource.id}>
                      {resource.name} ({resource.type}) - {resource.availability}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Allocated To"
                value={formAllocatedTo}
                onChange={(e) => setFormAllocatedTo(e.target.value)}
                fullWidth
                required
                placeholder="Person, team, or department"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Purpose"
                value={formPurpose}
                onChange={(e) => setFormPurpose(e.target.value)}
                fullWidth
                required
                placeholder="Reason for allocation"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Start Date"
                value={formStartDate}
                onChange={(newValue) => setFormStartDate(newValue)}
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="End Date"
                value={formEndDate}
                onChange={(newValue) => setFormEndDate(newValue)}
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formPriority}
                  onChange={(e) => setFormPriority(e.target.value as Priority)}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Notes"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveAllocation}>
            {editingAllocation ? 'Update' : 'Schedule'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function getSampleResources(): Resource[] {
  return [
    {
      id: 'r1',
      name: 'LED Grow Light System A',
      type: 'equipment',
      availability: 'available',
      location: 'Grow Room 1',
    },
    {
      id: 'r2',
      name: 'Irrigation System B',
      type: 'equipment',
      availability: 'in-use',
      location: 'Grow Room 2',
    },
    {
      id: 'r3',
      name: 'John Smith',
      type: 'personnel',
      availability: 'available',
    },
    {
      id: 'r4',
      name: 'Grow Room 3',
      type: 'facility',
      availability: 'available',
      location: 'Building A',
    },
    {
      id: 'r5',
      name: 'Delivery Van',
      type: 'vehicle',
      availability: 'maintenance',
      location: 'Garage',
    },
  ];
}

function getSampleAllocations(): ResourceAllocation[] {
  return [
    {
      id: '1',
      resourceId: 'r1',
      resourceName: 'LED Grow Light System A',
      resourceType: 'equipment',
      allocatedTo: 'Cultivation Team A',
      purpose: 'Vegetative growth phase',
      startDate: new Date('2024-12-20'),
      endDate: new Date('2025-01-15'),
      status: 'in-use',
      priority: 'high',
      notes: 'Monitor light intensity daily',
    },
    {
      id: '2',
      resourceId: 'r3',
      resourceName: 'John Smith',
      resourceType: 'personnel',
      allocatedTo: 'Project Alpha',
      purpose: 'Plant monitoring and maintenance',
      startDate: new Date('2024-12-25'),
      endDate: new Date('2024-12-31'),
      status: 'scheduled',
      priority: 'medium',
    },
    {
      id: '3',
      resourceId: 'r4',
      resourceName: 'Grow Room 3',
      resourceType: 'facility',
      allocatedTo: 'New Strain Testing',
      purpose: 'Experimental cultivation',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-03-31'),
      status: 'scheduled',
      priority: 'critical',
      notes: 'Climate control to be set to 24°C, 65% humidity',
    },
  ];
}
