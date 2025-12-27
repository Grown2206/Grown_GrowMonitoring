import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Inventory as InventoryIcon,
  TrendingDown as LowStockIcon,
  LocalShipping as OrderIcon,
} from '@mui/icons-material';

export interface InventoryItem {
  id: string;
  name: string;
  category: ItemCategory;
  sku: string;
  quantity: number;
  unit: string;
  minQuantity: number;
  maxQuantity: number;
  cost: number;
  supplier: string;
  location: string;
  expiryDate?: Date;
  lastRestocked: Date;
  notes?: string;
}

export type ItemCategory =
  | 'nutrients'
  | 'growing-media'
  | 'equipment'
  | 'containers'
  | 'lighting'
  | 'sensors'
  | 'consumables'
  | 'other';

export type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock' | 'overstock';

export interface InventoryTrackerProps {
  items?: InventoryItem[];
  onAddItem?: (item: Omit<InventoryItem, 'id'>) => void;
  onUpdateItem?: (id: string, item: Partial<InventoryItem>) => void;
  onDeleteItem?: (id: string) => void;
  onReorderItem?: (item: InventoryItem) => void;
}

export function InventoryTracker({
  items: initialItems,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onReorderItem,
}: InventoryTrackerProps) {
  const [items, setItems] = useState<InventoryItem[]>(initialItems || getSampleItems());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [categoryFilter, setCategoryFilter] = useState<ItemCategory | 'all'>('all');
  const [stockFilter, setStockFilter] = useState<StockStatus | 'all'>('all');

  // Form state
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<ItemCategory>('nutrients');
  const [formSku, setFormSku] = useState('');
  const [formQuantity, setFormQuantity] = useState(0);
  const [formUnit, setFormUnit] = useState('');
  const [formMinQuantity, setFormMinQuantity] = useState(0);
  const [formMaxQuantity, setFormMaxQuantity] = useState(0);
  const [formCost, setFormCost] = useState(0);
  const [formSupplier, setFormSupplier] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const getStockStatus = (item: InventoryItem): StockStatus => {
    if (item.quantity === 0) return 'out-of-stock';
    if (item.quantity <= item.minQuantity) return 'low-stock';
    if (item.quantity >= item.maxQuantity) return 'overstock';
    return 'in-stock';
  };

  const getStockStatusColor = (status: StockStatus) => {
    switch (status) {
      case 'in-stock':
        return 'success';
      case 'low-stock':
        return 'warning';
      case 'out-of-stock':
        return 'error';
      case 'overstock':
        return 'info';
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStock = stockFilter === 'all' || getStockStatus(item) === stockFilter;
    return matchesCategory && matchesStock;
  });

  const lowStockItems = items.filter(
    (item) => getStockStatus(item) === 'low-stock' || getStockStatus(item) === 'out-of-stock'
  );

  const totalValue = items.reduce((sum, item) => sum + item.quantity * item.cost, 0);

  const handleOpenDialog = (item?: InventoryItem) => {
    if (item) {
      setEditingItem(item);
      setFormName(item.name);
      setFormCategory(item.category);
      setFormSku(item.sku);
      setFormQuantity(item.quantity);
      setFormUnit(item.unit);
      setFormMinQuantity(item.minQuantity);
      setFormMaxQuantity(item.maxQuantity);
      setFormCost(item.cost);
      setFormSupplier(item.supplier);
      setFormLocation(item.location);
      setFormNotes(item.notes || '');
    } else {
      setEditingItem(null);
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
    resetForm();
  };

  const resetForm = () => {
    setFormName('');
    setFormCategory('nutrients');
    setFormSku('');
    setFormQuantity(0);
    setFormUnit('');
    setFormMinQuantity(0);
    setFormMaxQuantity(0);
    setFormCost(0);
    setFormSupplier('');
    setFormLocation('');
    setFormNotes('');
  };

  const handleSaveItem = () => {
    const itemData = {
      name: formName,
      category: formCategory,
      sku: formSku,
      quantity: formQuantity,
      unit: formUnit,
      minQuantity: formMinQuantity,
      maxQuantity: formMaxQuantity,
      cost: formCost,
      supplier: formSupplier,
      location: formLocation,
      notes: formNotes,
      lastRestocked: new Date(),
    };

    if (editingItem) {
      const updated = items.map((item) =>
        item.id === editingItem.id ? { ...item, ...itemData } : item
      );
      setItems(updated);
      onUpdateItem?.(editingItem.id, itemData);
    } else {
      const timestamp = Date.now();
      const newItem: InventoryItem = {
        id: 'item-' + timestamp,
        ...itemData,
      };
      setItems([...items, newItem]);
      onAddItem?.(itemData);
    }

    handleCloseDialog();
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
    onDeleteItem?.(id);
  };

  const handleReorder = (item: InventoryItem) => {
    onReorderItem?.(item);
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5">Inventory Tracker</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage supplies, equipment, and resources
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Add Item
        </Button>
      </Stack>

      {lowStockItems.length > 0 && (
        <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 3 }}>
          <Typography variant="subtitle2">
            {lowStockItems.length} item(s) need reordering
          </Typography>
          <Typography variant="body2">
            {lowStockItems.map((item) => item.name).join(', ')}
          </Typography>
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Items
                  </Typography>
                  <Typography variant="h4">{items.length}</Typography>
                </Box>
                <InventoryIcon color="primary" sx={{ fontSize: 40 }} />
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
                    Total Value
                  </Typography>
                  <Typography variant="h4">{'$'}{totalValue.toFixed(2)}</Typography>
                </Box>
                <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
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
                    Low Stock
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {lowStockItems.length}
                  </Typography>
                </Box>
                <LowStockIcon color="warning" sx={{ fontSize: 40 }} />
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
                    Categories
                  </Typography>
                  <Typography variant="h4">
                    {new Set(items.map((i) => i.category)).size}
                  </Typography>
                </Box>
                <OrderIcon color="info" sx={{ fontSize: 40 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as ItemCategory | 'all')}
              >
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="nutrients">Nutrients</MenuItem>
                <MenuItem value="growing-media">Growing Media</MenuItem>
                <MenuItem value="equipment">Equipment</MenuItem>
                <MenuItem value="containers">Containers</MenuItem>
                <MenuItem value="lighting">Lighting</MenuItem>
                <MenuItem value="sensors">Sensors</MenuItem>
                <MenuItem value="consumables">Consumables</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Stock Status</InputLabel>
              <Select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as StockStatus | 'all')}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="in-stock">In Stock</MenuItem>
                <MenuItem value="low-stock">Low Stock</MenuItem>
                <MenuItem value="out-of-stock">Out of Stock</MenuItem>
                <MenuItem value="overstock">Overstock</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>SKU</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Supplier</TableCell>
              <TableCell align="right">Unit Cost</TableCell>
              <TableCell align="right">Total Value</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredItems
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((item) => {
                const status = getStockStatus(item);
                const stockPercentage = (item.quantity / item.maxQuantity) * 100;

                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {item.name}
                      </Typography>
                    </TableCell>
                    <TableCell>{item.sku}</TableCell>
                    <TableCell>
                      <Chip label={item.category} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell align="right">
                      <Box>
                        <Typography variant="body2">
                          {item.quantity} {item.unit}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(stockPercentage, 100)}
                          sx={{ mt: 0.5 }}
                          color={
                            status === 'low-stock' || status === 'out-of-stock'
                              ? 'warning'
                              : 'primary'
                          }
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={status.replace('-', ' ')}
                        size="small"
                        color={getStockStatusColor(status)}
                      />
                    </TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell>{item.supplier}</TableCell>
                    <TableCell align="right">{'$'}{item.cost.toFixed(2)}</TableCell>
                    <TableCell align="right">
                      {'$'}{(item.quantity * item.cost).toFixed(2)}
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        <IconButton size="small" onClick={() => handleOpenDialog(item)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                        {status === 'low-stock' && (
                          <IconButton
                            size="small"
                            color="warning"
                            onClick={() => handleReorder(item)}
                          >
                            <OrderIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredItems.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Item Name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="SKU"
                value={formSku}
                onChange={(e) => setFormSku(e.target.value)}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select value={formCategory} onChange={(e) => setFormCategory(e.target.value as ItemCategory)}>
                  <MenuItem value="nutrients">Nutrients</MenuItem>
                  <MenuItem value="growing-media">Growing Media</MenuItem>
                  <MenuItem value="equipment">Equipment</MenuItem>
                  <MenuItem value="containers">Containers</MenuItem>
                  <MenuItem value="lighting">Lighting</MenuItem>
                  <MenuItem value="sensors">Sensors</MenuItem>
                  <MenuItem value="consumables">Consumables</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Unit"
                value={formUnit}
                onChange={(e) => setFormUnit(e.target.value)}
                fullWidth
                placeholder="e.g., kg, liters, pieces"
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Quantity"
                type="number"
                value={formQuantity}
                onChange={(e) => setFormQuantity(Number(e.target.value))}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Min Quantity"
                type="number"
                value={formMinQuantity}
                onChange={(e) => setFormMinQuantity(Number(e.target.value))}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Max Quantity"
                type="number"
                value={formMaxQuantity}
                onChange={(e) => setFormMaxQuantity(Number(e.target.value))}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Unit Cost ($)"
                type="number"
                value={formCost}
                onChange={(e) => setFormCost(Number(e.target.value))}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Supplier"
                value={formSupplier}
                onChange={(e) => setFormSupplier(e.target.value)}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Storage Location"
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                fullWidth
                required
              />
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
          <Button variant="contained" onClick={handleSaveItem}>
            {editingItem ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function getSampleItems(): InventoryItem[] {
  return [
    {
      id: '1',
      name: 'Hydroponic Nutrient Solution A',
      category: 'nutrients',
      sku: 'NUT-001-A',
      quantity: 45,
      unit: 'liters',
      minQuantity: 20,
      maxQuantity: 100,
      cost: 24.99,
      supplier: 'GrowTech Supplies',
      location: 'Warehouse A - Shelf 3',
      lastRestocked: new Date('2024-12-01'),
      notes: 'For vegetative stage',
    },
    {
      id: '2',
      name: 'Hydroponic Nutrient Solution B',
      category: 'nutrients',
      sku: 'NUT-001-B',
      quantity: 12,
      unit: 'liters',
      minQuantity: 20,
      maxQuantity: 100,
      cost: 24.99,
      supplier: 'GrowTech Supplies',
      location: 'Warehouse A - Shelf 3',
      lastRestocked: new Date('2024-11-25'),
      notes: 'For flowering stage',
    },
    {
      id: '3',
      name: 'Coco Coir Growing Medium',
      category: 'growing-media',
      sku: 'MED-002',
      quantity: 85,
      unit: 'kg',
      minQuantity: 50,
      maxQuantity: 200,
      cost: 8.5,
      supplier: 'OrganicGrow Inc',
      location: 'Warehouse B - Section 1',
      lastRestocked: new Date('2024-12-10'),
    },
    {
      id: '4',
      name: 'LED Grow Light 600W',
      category: 'lighting',
      sku: 'LIGHT-003',
      quantity: 3,
      unit: 'units',
      minQuantity: 2,
      maxQuantity: 10,
      cost: 299.99,
      supplier: 'ProLight Systems',
      location: 'Equipment Room - Rack 2',
      lastRestocked: new Date('2024-10-15'),
      notes: 'Full spectrum, warranty until 2026',
    },
    {
      id: '5',
      name: 'pH Sensor Calibration Solution',
      category: 'consumables',
      sku: 'CAL-004',
      quantity: 8,
      unit: 'bottles',
      minQuantity: 10,
      maxQuantity: 30,
      cost: 15.99,
      supplier: 'SensorTech',
      location: 'Lab - Cabinet A',
      lastRestocked: new Date('2024-11-30'),
      expiryDate: new Date('2025-11-30'),
    },
    {
      id: '6',
      name: '5-Gallon Growing Containers',
      category: 'containers',
      sku: 'CONT-005',
      quantity: 150,
      unit: 'units',
      minQuantity: 100,
      maxQuantity: 500,
      cost: 3.5,
      supplier: 'Container World',
      location: 'Warehouse C - Stack 1',
      lastRestocked: new Date('2024-12-05'),
    },
    {
      id: '7',
      name: 'Temperature & Humidity Sensor',
      category: 'sensors',
      sku: 'SENS-006',
      quantity: 0,
      unit: 'units',
      minQuantity: 5,
      maxQuantity: 20,
      cost: 45.0,
      supplier: 'SensorTech',
      location: 'Equipment Room - Drawer 3',
      lastRestocked: new Date('2024-09-20'),
      notes: 'OUT OF STOCK - Reorder ASAP',
    },
    {
      id: '8',
      name: 'Irrigation Drip Lines',
      category: 'equipment',
      sku: 'IRR-007',
      quantity: 250,
      unit: 'meters',
      minQuantity: 100,
      maxQuantity: 500,
      cost: 0.75,
      supplier: 'Irrigation Pro',
      location: 'Warehouse A - Shelf 5',
      lastRestocked: new Date('2024-12-12'),
    },
  ];
}
