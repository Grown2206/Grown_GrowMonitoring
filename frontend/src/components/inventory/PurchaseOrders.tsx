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
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ShoppingCart as CartIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as ApprovedIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

export interface PurchaseOrderItem {
  id: string;
  itemName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplier: string;
  orderDate: Date;
  expectedDeliveryDate: Date;
  status: OrderStatus;
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  notes?: string;
  approvedBy?: string;
  approvedDate?: Date;
}

export type OrderStatus =
  | 'draft'
  | 'pending-approval'
  | 'approved'
  | 'ordered'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface PurchaseOrdersProps {
  orders?: PurchaseOrder[];
  onAddOrder?: (order: Omit<PurchaseOrder, 'id'>) => void;
  onUpdateOrder?: (id: string, order: Partial<PurchaseOrder>) => void;
  onDeleteOrder?: (id: string) => void;
  onApproveOrder?: (id: string) => void;
}

export function PurchaseOrders({
  orders: initialOrders,
  onAddOrder,
  onUpdateOrder,
  onDeleteOrder,
  onApproveOrder,
}: PurchaseOrdersProps) {
  const [orders, setOrders] = useState<PurchaseOrder[]>(
    initialOrders || getSampleOrders()
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [itemsDialogOpen, setItemsDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

  // Form state
  const [formOrderNumber, setFormOrderNumber] = useState('');
  const [formSupplier, setFormSupplier] = useState('');
  const [formOrderDate, setFormOrderDate] = useState<Date | null>(new Date());
  const [formDeliveryDate, setFormDeliveryDate] = useState<Date | null>(new Date());
  const [formItems, setFormItems] = useState<PurchaseOrderItem[]>([]);
  const [formTax, setFormTax] = useState(0);
  const [formShipping, setFormShipping] = useState(0);
  const [formNotes, setFormNotes] = useState('');

  // Item form state
  const [itemName, setItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState(0);
  const [itemUnit, setItemUnit] = useState('');
  const [itemUnitPrice, setItemUnitPrice] = useState(0);

  const calculateSubtotal = (items: PurchaseOrderItem[]) => {
    return items.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const calculateTotal = (subtotal: number, tax: number, shipping: number) => {
    return subtotal + tax + shipping;
  };

  const handleOpenDialog = (order?: PurchaseOrder) => {
    if (order) {
      setEditingOrder(order);
      setFormOrderNumber(order.orderNumber);
      setFormSupplier(order.supplier);
      setFormOrderDate(order.orderDate);
      setFormDeliveryDate(order.expectedDeliveryDate);
      setFormItems([...order.items]);
      setFormTax(order.tax);
      setFormShipping(order.shippingCost);
      setFormNotes(order.notes || '');
    } else {
      setEditingOrder(null);
      resetForm();
      generateOrderNumber();
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingOrder(null);
    resetForm();
  };

  const resetForm = () => {
    setFormOrderNumber('');
    setFormSupplier('');
    setFormOrderDate(new Date());
    setFormDeliveryDate(new Date());
    setFormItems([]);
    setFormTax(0);
    setFormShipping(0);
    setFormNotes('');
  };

  const generateOrderNumber = () => {
    const timestamp = Date.now();
    const orderNum = `PO-${timestamp}`;
    setFormOrderNumber(orderNum);
  };

  const handleAddItem = () => {
    const totalPrice = itemQuantity * itemUnitPrice;
    const newItem: PurchaseOrderItem = {
      id: `item-${Date.now()}`,
      itemName,
      quantity: itemQuantity,
      unit: itemUnit,
      unitPrice: itemUnitPrice,
      totalPrice,
    };
    setFormItems([...formItems, newItem]);
    setItemsDialogOpen(false);
    setItemName('');
    setItemQuantity(0);
    setItemUnit('');
    setItemUnitPrice(0);
  };

  const handleRemoveItem = (itemId: string) => {
    setFormItems(formItems.filter((item) => item.id !== itemId));
  };

  const handleSaveOrder = () => {
    if (!formOrderDate || !formDeliveryDate) return;

    const subtotal = calculateSubtotal(formItems);
    const total = calculateTotal(subtotal, formTax, formShipping);

    const orderData = {
      orderNumber: formOrderNumber,
      supplier: formSupplier,
      orderDate: formOrderDate,
      expectedDeliveryDate: formDeliveryDate,
      status: 'draft' as OrderStatus,
      items: formItems,
      subtotal,
      tax: formTax,
      shippingCost: formShipping,
      total,
      notes: formNotes,
    };

    if (editingOrder) {
      const updated = orders.map((order) =>
        order.id === editingOrder.id ? { ...order, ...orderData } : order
      );
      setOrders(updated);
      onUpdateOrder?.(editingOrder.id, orderData);
    } else {
      const newOrder: PurchaseOrder = {
        id: `order-${Date.now()}`,
        ...orderData,
      };
      setOrders([...orders, newOrder]);
      onAddOrder?.(orderData);
    }

    handleCloseDialog();
  };

  const handleDeleteOrder = (id: string) => {
    setOrders(orders.filter((order) => order.id !== id));
    onDeleteOrder?.(id);
  };

  const handleApproveOrder = (id: string) => {
    const updated = orders.map((order) =>
      order.id === id
        ? {
            ...order,
            status: 'approved' as OrderStatus,
            approvedDate: new Date(),
            approvedBy: 'Current User',
          }
        : order
    );
    setOrders(updated);
    onApproveOrder?.(id);
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'draft':
        return 'default';
      case 'pending-approval':
        return 'warning';
      case 'approved':
        return 'info';
      case 'ordered':
        return 'primary';
      case 'shipped':
        return 'success';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'draft':
        return <CartIcon />;
      case 'pending-approval':
        return <PendingIcon />;
      case 'approved':
        return <ApprovedIcon />;
      case 'ordered':
      case 'shipped':
        return <ShippingIcon />;
      case 'delivered':
        return <ApprovedIcon />;
      case 'cancelled':
        return <CancelIcon />;
    }
  };

  const filteredOrders = orders.filter(
    (order) => statusFilter === 'all' || order.status === statusFilter
  );

  const pendingOrders = orders.filter((o) => o.status === 'pending-approval').length;
  const activeOrders = orders.filter(
    (o) => o.status === 'approved' || o.status === 'ordered' || o.status === 'shipped'
  ).length;
  const totalValue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, order) => sum + order.total, 0);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5">Purchase Orders</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage procurement and supplier orders
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Create Order
        </Button>
      </Stack>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Orders
                  </Typography>
                  <Typography variant="h4">{orders.length}</Typography>
                </Box>
                <CartIcon color="primary" sx={{ fontSize: 40 }} />
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
                    Pending Approval
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {pendingOrders}
                  </Typography>
                </Box>
                <PendingIcon color="warning" sx={{ fontSize: 40 }} />
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
                    Active Orders
                  </Typography>
                  <Typography variant="h4">{activeOrders}</Typography>
                </Box>
                <ShippingIcon color="info" sx={{ fontSize: 40 }} />
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
                  <Typography variant="h4">${totalValue.toFixed(2)}</Typography>
                </Box>
                <ApprovedIcon color="success" sx={{ fontSize: 40 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Status Filter</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="pending-approval">Pending Approval</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="ordered">Ordered</MenuItem>
              <MenuItem value="shipped">Shipped</MenuItem>
              <MenuItem value="delivered">Delivered</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order #</TableCell>
              <TableCell>Supplier</TableCell>
              <TableCell>Order Date</TableCell>
              <TableCell>Expected Delivery</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Items</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {order.orderNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>{order.supplier}</TableCell>
                  <TableCell>{order.orderDate.toLocaleDateString()}</TableCell>
                  <TableCell>{order.expectedDeliveryDate.toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(order.status)}
                      label={order.status.replace('-', ' ')}
                      size="small"
                      color={getStatusColor(order.status)}
                    />
                  </TableCell>
                  <TableCell>{order.items.length}</TableCell>
                  <TableCell align="right">${order.total.toFixed(2)}</TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      <IconButton size="small" onClick={() => handleOpenDialog(order)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteOrder(order.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                      {order.status === 'pending-approval' && (
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleApproveOrder(order.id)}
                        >
                          <ApprovedIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredOrders.length}
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
        <DialogTitle>{editingOrder ? 'Edit Order' : 'Create Purchase Order'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Order Number"
                value={formOrderNumber}
                onChange={(e) => setFormOrderNumber(e.target.value)}
                fullWidth
                required
                disabled
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
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Order Date"
                value={formOrderDate}
                onChange={(newValue) => setFormOrderDate(newValue)}
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Expected Delivery"
                value={formDeliveryDate}
                onChange={(newValue) => setFormDeliveryDate(newValue)}
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />
            </Grid>
            <Grid item xs={12}>
              <Divider />
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ my: 2 }}
              >
                <Typography variant="h6">Items</Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setItemsDialogOpen(true)}
                >
                  Add Item
                </Button>
              </Stack>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell align="right">Qty</TableCell>
                      <TableCell>Unit</TableCell>
                      <TableCell align="right">Unit Price</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.itemName}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell align="right">${item.unitPrice.toFixed(2)}</TableCell>
                        <TableCell align="right">${item.totalPrice.toFixed(2)}</TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            <Grid item xs={12}>
              <Divider />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Tax Amount"
                type="number"
                value={formTax}
                onChange={(e) => setFormTax(Number(e.target.value))}
                fullWidth
                InputProps={{ startAdornment: '$' }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Shipping Cost"
                type="number"
                value={formShipping}
                onChange={(e) => setFormShipping(Number(e.target.value))}
                fullWidth
                InputProps={{ startAdornment: '$' }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Total"
                value={calculateTotal(
                  calculateSubtotal(formItems),
                  formTax,
                  formShipping
                ).toFixed(2)}
                fullWidth
                disabled
                InputProps={{ startAdornment: '$' }}
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
          <Button variant="contained" onClick={handleSaveOrder}>
            {editingOrder ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={itemsDialogOpen}
        onClose={() => setItemsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Item</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                label="Item Name"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Quantity"
                type="number"
                value={itemQuantity}
                onChange={(e) => setItemQuantity(Number(e.target.value))}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Unit"
                value={itemUnit}
                onChange={(e) => setItemUnit(e.target.value)}
                fullWidth
                placeholder="kg, liters, pieces"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Unit Price"
                type="number"
                value={itemUnitPrice}
                onChange={(e) => setItemUnitPrice(Number(e.target.value))}
                fullWidth
                InputProps={{ startAdornment: '$' }}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setItemsDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddItem}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function getSampleOrders(): PurchaseOrder[] {
  return [
    {
      id: '1',
      orderNumber: 'PO-2024-001',
      supplier: 'GrowTech Supplies',
      orderDate: new Date('2024-12-15'),
      expectedDeliveryDate: new Date('2024-12-25'),
      status: 'ordered',
      items: [
        {
          id: 'i1',
          itemName: 'Hydroponic Nutrient Solution A',
          quantity: 50,
          unit: 'liters',
          unitPrice: 24.99,
          totalPrice: 1249.5,
        },
        {
          id: 'i2',
          itemName: 'pH Sensor Calibration Solution',
          quantity: 20,
          unit: 'bottles',
          unitPrice: 15.99,
          totalPrice: 319.8,
        },
      ],
      subtotal: 1569.3,
      tax: 125.54,
      shippingCost: 50.0,
      total: 1744.84,
      approvedBy: 'Manager Smith',
      approvedDate: new Date('2024-12-16'),
    },
    {
      id: '2',
      orderNumber: 'PO-2024-002',
      supplier: 'Container World',
      orderDate: new Date('2024-12-20'),
      expectedDeliveryDate: new Date('2025-01-05'),
      status: 'pending-approval',
      items: [
        {
          id: 'i3',
          itemName: '5-Gallon Growing Containers',
          quantity: 200,
          unit: 'units',
          unitPrice: 3.5,
          totalPrice: 700.0,
        },
      ],
      subtotal: 700.0,
      tax: 56.0,
      shippingCost: 75.0,
      total: 831.0,
      notes: 'Urgent - need for new facility expansion',
    },
    {
      id: '3',
      orderNumber: 'PO-2024-003',
      supplier: 'ProLight Systems',
      orderDate: new Date('2024-12-18'),
      expectedDeliveryDate: new Date('2025-01-10'),
      status: 'approved',
      items: [
        {
          id: 'i4',
          itemName: 'LED Grow Light 600W',
          quantity: 5,
          unit: 'units',
          unitPrice: 299.99,
          totalPrice: 1499.95,
        },
      ],
      subtotal: 1499.95,
      tax: 119.99,
      shippingCost: 100.0,
      total: 1719.94,
      approvedBy: 'Manager Smith',
      approvedDate: new Date('2024-12-19'),
      notes: 'Full spectrum, 5-year warranty',
    },
  ];
}
