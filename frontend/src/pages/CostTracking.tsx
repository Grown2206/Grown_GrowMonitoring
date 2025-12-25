import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Alert,
  Tabs,
  Tab,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Euro as EuroIcon,
  Assessment as AssessmentIcon,
  AccountBalance as AccountBalanceIcon,
} from '@mui/icons-material';
import axios from 'axios';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface CostEntry {
  id: number;
  plantId?: number;
  growCycleId?: number;
  category: CostCategory;
  description: string;
  amount: number;
  currency: string;
  quantity?: number;
  unit?: string;
  date: string;
  vendor?: string;
  notes?: string;
  isRecurring: boolean;
  recurringInterval?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

type CostCategory =
  | 'seeds'
  | 'nutrients'
  | 'electricity'
  | 'water'
  | 'equipment'
  | 'soil'
  | 'containers'
  | 'maintenance'
  | 'other';

interface CostSummary {
  totalCosts: number;
  currency: string;
  byCategory: Record<CostCategory, number>;
  periodStart: Date;
  periodEnd: Date;
  entryCount: number;
}

interface PlantCostAnalysis {
  plantId: number;
  plantName: string;
  totalCosts: number;
  costPerDay: number;
  growDays: number;
  byCategory: Record<CostCategory, number>;
  projectedFinalCost?: number;
  estimatedCompletionDays?: number;
}

interface ROIAnalysis {
  plantId: number;
  plantName: string;
  totalCosts: number;
  harvestValue: number;
  harvestWeight: number;
  roi: number;
  profit: number;
  costPerGram: number;
  valuePerGram: number;
  breakEven: boolean;
}

interface BudgetAnalysis {
  period: string;
  budgetLimit?: number;
  totalSpent: number;
  percentageUsed?: number;
  remainingBudget?: number;
  averageDaily: number;
  projectedMonthly: number;
  topExpenses: Array<{
    category: CostCategory;
    amount: number;
    percentage: number;
  }>;
}

interface Plant {
  id: number;
  name: string;
  isActive: boolean;
}

const categoryLabels: Record<CostCategory, string> = {
  seeds: 'Samen',
  nutrients: 'Nährstoffe',
  electricity: 'Strom',
  water: 'Wasser',
  equipment: 'Equipment',
  soil: 'Erde',
  containers: 'Töpfe',
  maintenance: 'Wartung',
  other: 'Sonstiges',
};

const categoryColors: Record<CostCategory, string> = {
  seeds: '#4caf50',
  nutrients: '#2196f3',
  electricity: '#ff9800',
  water: '#00bcd4',
  equipment: '#9c27b0',
  soil: '#795548',
  containers: '#607d8b',
  maintenance: '#f44336',
  other: '#9e9e9e',
};

export function CostTracking() {
  const [activeTab, setActiveTab] = useState(0);
  const [entries, setEntries] = useState<CostEntry[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [summary, setSummary] = useState<CostSummary | null>(null);
  const [budgetAnalysis, setBudgetAnalysis] = useState<BudgetAnalysis | null>(null);
  const [plantAnalysis, setPlantAnalysis] = useState<PlantCostAnalysis[]>([]);
  const [roiData, setRoiData] = useState<ROIAnalysis[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CostEntry | null>(null);
  const [budgetLimit, setBudgetLimit] = useState<number>(500);
  const [marketPrice, setMarketPrice] = useState<number>(10);

  // Form state
  const [formData, setFormData] = useState({
    plantId: '',
    category: 'nutrients' as CostCategory,
    description: '',
    amount: '',
    currency: 'EUR',
    quantity: '',
    unit: '',
    date: new Date().toISOString().split('T')[0],
    vendor: '',
    notes: '',
    isRecurring: false,
    recurringInterval: undefined as 'daily' | 'weekly' | 'monthly' | 'yearly' | undefined,
  });

  useEffect(() => {
    loadPlants();
    loadEntries();
    loadSummary();
    loadBudgetAnalysis();
    loadTrends();
  }, []);

  useEffect(() => {
    if (plants.length > 0) {
      loadPlantAnalyses();
      loadROIData();
    }
  }, [plants]);

  const loadPlants = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/plants');
      setPlants(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading plants:', error);
    }
  };

  const loadEntries = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3001/api/cost-tracking');
      setEntries(response.data);
    } catch (error) {
      console.error('Error loading cost entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 3);

      const response = await axios.get('http://localhost:3001/api/cost-tracking/summary/period', {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });
      setSummary(response.data);
    } catch (error) {
      console.error('Error loading summary:', error);
    }
  };

  const loadBudgetAnalysis = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);

      const response = await axios.get('http://localhost:3001/api/cost-tracking/budget/analysis', {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          budgetLimit: budgetLimit,
        },
      });
      setBudgetAnalysis(response.data);
    } catch (error) {
      console.error('Error loading budget analysis:', error);
    }
  };

  const loadPlantAnalyses = async () => {
    try {
      const analyses = await Promise.all(
        plants.slice(0, 5).map(async (plant) => {
          try {
            const response = await axios.get(
              `http://localhost:3001/api/cost-tracking/plant/${plant.id}`
            );
            return response.data;
          } catch (error) {
            return null;
          }
        })
      );
      setPlantAnalysis(analyses.filter((a) => a !== null));
    } catch (error) {
      console.error('Error loading plant analyses:', error);
    }
  };

  const loadROIData = async () => {
    try {
      const roiPromises = plants
        .filter((p) => !p.isActive)
        .slice(0, 5)
        .map(async (plant) => {
          try {
            const response = await axios.get(
              `http://localhost:3001/api/cost-tracking/roi/${plant.id}`,
              {
                params: { marketPricePerGram: marketPrice },
              }
            );
            return response.data;
          } catch (error) {
            return null;
          }
        });

      const results = await Promise.all(roiPromises);
      setRoiData(results.filter((r) => r !== null));
    } catch (error) {
      console.error('Error loading ROI data:', error);
    }
  };

  const loadTrends = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6);

      const response = await axios.get('http://localhost:3001/api/cost-tracking/trends/timeline', {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          groupBy: 'month',
        },
      });
      setTrends(response.data);
    } catch (error) {
      console.error('Error loading trends:', error);
    }
  };

  const handleOpenDialog = (entry?: CostEntry) => {
    if (entry) {
      setEditingEntry(entry);
      setFormData({
        plantId: entry.plantId?.toString() || '',
        category: entry.category,
        description: entry.description,
        amount: entry.amount.toString(),
        currency: entry.currency,
        quantity: entry.quantity?.toString() || '',
        unit: entry.unit || '',
        date: entry.date.split('T')[0],
        vendor: entry.vendor || '',
        notes: entry.notes || '',
        isRecurring: entry.isRecurring,
        recurringInterval: entry.recurringInterval,
      });
    } else {
      setEditingEntry(null);
      setFormData({
        plantId: '',
        category: 'nutrients',
        description: '',
        amount: '',
        currency: 'EUR',
        quantity: '',
        unit: '',
        date: new Date().toISOString().split('T')[0],
        vendor: '',
        notes: '',
        isRecurring: false,
        recurringInterval: undefined,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingEntry(null);
  };

  const handleSave = async () => {
    try {
      const data = {
        ...formData,
        plantId: formData.plantId ? parseInt(formData.plantId) : undefined,
        amount: parseFloat(formData.amount),
        quantity: formData.quantity ? parseFloat(formData.quantity) : undefined,
      };

      if (editingEntry) {
        await axios.put(`http://localhost:3001/api/cost-tracking/${editingEntry.id}`, data);
      } else {
        await axios.post('http://localhost:3001/api/cost-tracking', data);
      }

      handleCloseDialog();
      loadEntries();
      loadSummary();
      loadBudgetAnalysis();
      loadTrends();
    } catch (error) {
      console.error('Error saving entry:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Eintrag wirklich löschen?')) {
      try {
        await axios.delete(`http://localhost:3001/api/cost-tracking/${id}`);
        loadEntries();
        loadSummary();
        loadBudgetAnalysis();
      } catch (error) {
        console.error('Error deleting entry:', error);
      }
    }
  };

  const renderCostEntries = () => (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Kosten-Einträge</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Neuer Eintrag
        </Button>
      </Box>

      {loading ? (
        <LinearProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Datum</TableCell>
                <TableCell>Kategorie</TableCell>
                <TableCell>Beschreibung</TableCell>
                <TableCell>Pflanze</TableCell>
                <TableCell align="right">Menge</TableCell>
                <TableCell align="right">Betrag</TableCell>
                <TableCell>Anbieter</TableCell>
                <TableCell align="center">Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.map((entry) => {
                const plant = plants.find((p) => p.id === entry.plantId);
                return (
                  <TableRow key={entry.id}>
                    <TableCell>{new Date(entry.date).toLocaleDateString('de-DE')}</TableCell>
                    <TableCell>
                      <Chip
                        label={categoryLabels[entry.category]}
                        size="small"
                        sx={{ bgcolor: categoryColors[entry.category], color: 'white' }}
                      />
                    </TableCell>
                    <TableCell>{entry.description}</TableCell>
                    <TableCell>{plant?.name || '-'}</TableCell>
                    <TableCell align="right">
                      {entry.quantity ? `${entry.quantity} ${entry.unit || ''}` : '-'}
                    </TableCell>
                    <TableCell align="right">
                      {entry.amount.toFixed(2)} {entry.currency}
                    </TableCell>
                    <TableCell>{entry.vendor || '-'}</TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={() => handleOpenDialog(entry)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(entry.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );

  const renderSummaryAndTrends = () => (
    <Box>
      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EuroIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Gesamtkosten (3 Monate)</Typography>
              </Box>
              <Typography variant="h3" color="primary">
                {summary?.totalCosts.toFixed(2) || '0.00'} {summary?.currency || 'EUR'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {summary?.entryCount || 0} Einträge
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AssessmentIcon sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h6">Durchschnitt/Tag</Typography>
              </Box>
              <Typography variant="h3" color="success.main">
                {budgetAnalysis?.averageDaily.toFixed(2) || '0.00'} EUR
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Hochrechnung Monat: {budgetAnalysis?.projectedMonthly.toFixed(2) || '0.00'} EUR
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccountBalanceIcon sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="h6">Budget-Status</Typography>
              </Box>
              {budgetAnalysis && budgetAnalysis.budgetLimit ? (
                <>
                  <Typography variant="h3" color={budgetAnalysis.percentageUsed! > 90 ? 'error' : 'warning.main'}>
                    {budgetAnalysis.percentageUsed?.toFixed(1)}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(budgetAnalysis.percentageUsed!, 100)}
                    sx={{ mt: 1, mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Verbleibend: {budgetAnalysis.remainingBudget?.toFixed(2)} EUR
                  </Typography>
                </>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  Kein Budget gesetzt
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Category Breakdown */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Kosten nach Kategorie
            </Typography>
            {summary && (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={Object.entries(summary.byCategory)
                      .filter(([_, value]) => value > 0)
                      .map(([category, value]) => ({
                        name: categoryLabels[category as CostCategory],
                        value: value,
                        fill: categoryColors[category as CostCategory],
                      }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {Object.entries(summary.byCategory).map(([category]) => (
                      <Cell key={category} fill={categoryColors[category as CostCategory]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        {/* Trends */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Kosten-Trend (6 Monate)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="totalCosts" stroke="#8884d8" name="Gesamtkosten" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Top Expenses */}
        {budgetAnalysis && budgetAnalysis.topExpenses.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Top Ausgaben
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={budgetAnalysis.topExpenses}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" tickFormatter={(cat) => categoryLabels[cat as CostCategory]} />
                  <YAxis />
                  <Tooltip
                    formatter={(value: any, name: any, props: any) => [
                      `${value.toFixed(2)} EUR (${props.payload.percentage}%)`,
                      categoryLabels[props.payload.category as CostCategory],
                    ]}
                  />
                  <Bar dataKey="amount" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );

  const renderPlantCosts = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Kosten pro Pflanze
      </Typography>
      <Grid container spacing={3}>
        {plantAnalysis.map((analysis) => (
          <Grid item xs={12} md={6} key={analysis.plantId}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {analysis.plantName}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Gesamtkosten
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {analysis.totalCosts.toFixed(2)} EUR
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Kosten/Tag
                    </Typography>
                    <Typography variant="h6">{analysis.costPerDay.toFixed(2)} EUR</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Grow-Tage
                    </Typography>
                    <Typography variant="h6">{analysis.growDays}</Typography>
                  </Grid>
                  {analysis.projectedFinalCost && (
                    <>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Geschätzte Endkosten
                        </Typography>
                        <Typography variant="h6">{analysis.projectedFinalCost.toFixed(2)} EUR</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Verbleibende Tage
                        </Typography>
                        <Typography variant="h6">{analysis.estimatedCompletionDays}</Typography>
                      </Grid>
                    </>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderROI = () => (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h6">ROI-Analyse</Typography>
        <TextField
          label="Marktpreis (EUR/g)"
          type="number"
          value={marketPrice}
          onChange={(e) => setMarketPrice(parseFloat(e.target.value))}
          size="small"
          sx={{ width: 150 }}
        />
        <Button variant="outlined" onClick={loadROIData}>
          Neu berechnen
        </Button>
      </Box>

      {roiData.length === 0 ? (
        <Alert severity="info">
          Keine ROI-Daten verfügbar. Stellen Sie sicher, dass Pflanzen geerntet wurden und Kostendaten vorhanden sind.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {roiData.map((roi) => (
            <Grid item xs={12} md={6} key={roi.plantId}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {roi.plantName}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      ROI
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography
                        variant="h3"
                        color={roi.roi >= 0 ? 'success.main' : 'error.main'}
                        sx={{ mr: 1 }}
                      >
                        {roi.roi.toFixed(1)}%
                      </Typography>
                      {roi.roi >= 0 ? (
                        <TrendingUpIcon color="success" fontSize="large" />
                      ) : (
                        <TrendingDownIcon color="error" fontSize="large" />
                      )}
                    </Box>
                    <Chip
                      label={roi.breakEven ? 'Break-Even erreicht' : 'Verlust'}
                      color={roi.breakEven ? 'success' : 'error'}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Gesamtkosten
                      </Typography>
                      <Typography variant="h6">{roi.totalCosts.toFixed(2)} EUR</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Erntegewicht
                      </Typography>
                      <Typography variant="h6">{roi.harvestWeight.toFixed(1)} g</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Marktwert
                      </Typography>
                      <Typography variant="h6">{roi.harvestValue.toFixed(2)} EUR</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Gewinn/Verlust
                      </Typography>
                      <Typography variant="h6" color={roi.profit >= 0 ? 'success.main' : 'error.main'}>
                        {roi.profit.toFixed(2)} EUR
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Kosten/Gramm
                      </Typography>
                      <Typography variant="body1">{roi.costPerGram.toFixed(2)} EUR</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Wert/Gramm
                      </Typography>
                      <Typography variant="body1">{roi.valuePerGram.toFixed(2)} EUR</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
          <Tab label="Einträge" />
          <Tab label="Übersicht & Trends" />
          <Tab label="Pflanzen-Kosten" />
          <Tab label="ROI-Analyse" />
        </Tabs>
      </Box>

      {activeTab === 0 && renderCostEntries()}
      {activeTab === 1 && renderSummaryAndTrends()}
      {activeTab === 2 && renderPlantCosts()}
      {activeTab === 3 && renderROI()}

      {/* Entry Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingEntry ? 'Eintrag bearbeiten' : 'Neuer Eintrag'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Pflanze (optional)</InputLabel>
                <Select
                  value={formData.plantId}
                  onChange={(e) => setFormData({ ...formData, plantId: e.target.value })}
                  label="Pflanze (optional)"
                >
                  <MenuItem value="">
                    <em>Keine</em>
                  </MenuItem>
                  {plants.map((plant) => (
                    <MenuItem key={plant.id} value={plant.id}>
                      {plant.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Kategorie</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value as CostCategory })
                  }
                  label="Kategorie"
                >
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <MenuItem key={key} value={key}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Beschreibung"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Betrag"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Währung"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Menge (optional)"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Einheit (optional)"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Datum"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Anbieter (optional)"
                value={formData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notizen (optional)"
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Abbrechen</Button>
          <Button onClick={handleSave} variant="contained">
            Speichern
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
