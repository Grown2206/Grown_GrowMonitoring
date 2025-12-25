import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Grid,
  Typography,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Divider,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Rating,
} from '@mui/material';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import TimerIcon from '@mui/icons-material/Timer';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StarIcon from '@mui/icons-material/Star';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

interface PhaseSettings {
  name: string;
  durationDays: number;
  environmental: {
    temperature: { min: number; max: number; ideal: number };
    humidity: { min: number; max: number; ideal: number };
    vpd?: { min: number; max: number; ideal: number };
    co2?: number;
  };
  lighting: {
    onTime: string;
    offTime: string;
    intensity: number;
    spectrum?: string;
  };
  watering: {
    frequency: string;
    amount: number;
    method?: string;
  };
  nutrients?: {
    npk: string;
    ec: number;
    ph: { min: number; max: number };
    schedule: string;
  };
  notes?: string;
}

interface GrowRecipe {
  id: number;
  name: string;
  strainType: 'indica' | 'sativa' | 'hybrid' | 'auto' | 'cbd' | 'custom';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  description?: string;
  author?: string;
  isPublic: boolean;
  phases: string;
  tags?: string;
  estimatedYield?: string;
  estimatedDuration?: number;
  usageCount: number;
  rating?: number;
  createdAt: Date;
}

const strainTypeColors: Record<string, string> = {
  indica: '#9C27B0',
  sativa: '#4CAF50',
  hybrid: '#FF9800',
  auto: '#2196F3',
  cbd: '#00BCD4',
  custom: '#607D8B',
};

const difficultyColors: Record<string, 'success' | 'info' | 'warning' | 'error'> = {
  beginner: 'success',
  intermediate: 'info',
  advanced: 'warning',
  expert: 'error',
};

export function GrowRecipeBrowser() {
  const [recipes, setRecipes] = useState<GrowRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<GrowRecipe | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [filterStrainType, setFilterStrainType] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');

  const loadRecipes = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filterStrainType !== 'all') params.append('strainType', filterStrainType);
      if (filterDifficulty !== 'all') params.append('difficulty', filterDifficulty);

      const response = await fetch(`/api/grow-recipes?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to load recipes');

      const data = await response.json();
      setRecipes(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaults = async () => {
    try {
      await fetch('/api/grow-recipes/initialize-defaults', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      loadRecipes();
    } catch (err) {
      console.error('Failed to initialize defaults:', err);
    }
  };

  useEffect(() => {
    loadRecipes();
  }, [filterStrainType, filterDifficulty]);

  const handleOpenDetails = (recipe: GrowRecipe) => {
    setSelectedRecipe(recipe);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
  };

  const phases: PhaseSettings[] = selectedRecipe
    ? JSON.parse(selectedRecipe.phases)
    : [];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Grow Recipes</Typography>
        <Button
          variant="outlined"
          onClick={initializeDefaults}
          startIcon={<PlayArrowIcon />}
        >
          Load Default Recipes
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" gutterBottom>
                Strain Type
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                {['all', 'indica', 'sativa', 'hybrid', 'auto', 'cbd'].map((type) => (
                  <Chip
                    key={type}
                    label={type.charAt(0).toUpperCase() + type.slice(1)}
                    onClick={() => setFilterStrainType(type)}
                    color={filterStrainType === type ? 'primary' : 'default'}
                    sx={
                      type !== 'all'
                        ? {
                            bgcolor:
                              filterStrainType === type
                                ? strainTypeColors[type]
                                : undefined,
                            color:
                              filterStrainType === type ? 'white' : undefined,
                          }
                        : undefined
                    }
                  />
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" gutterBottom>
                Difficulty
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                {['all', 'beginner', 'intermediate', 'advanced', 'expert'].map((diff) => (
                  <Chip
                    key={diff}
                    label={diff.charAt(0).toUpperCase() + diff.slice(1)}
                    onClick={() => setFilterDifficulty(diff)}
                    color={filterDifficulty === diff ? 'primary' : 'default'}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Recipe Cards */}
      <Grid container spacing={3}>
        {recipes.map((recipe) => (
          <Grid item xs={12} md={6} lg={4} key={recipe.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderTop: 4,
                borderColor: strainTypeColors[recipe.strainType],
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                  <Typography variant="h6" gutterBottom>
                    {recipe.name}
                  </Typography>
                  <Chip
                    size="small"
                    label={recipe.difficulty}
                    color={difficultyColors[recipe.difficulty]}
                  />
                </Box>

                <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                  <Chip
                    size="small"
                    label={recipe.strainType.toUpperCase()}
                    sx={{
                      bgcolor: strainTypeColors[recipe.strainType],
                      color: 'white',
                    }}
                  />
                  {recipe.rating && (
                    <Chip
                      size="small"
                      icon={<StarIcon />}
                      label={recipe.rating.toFixed(1)}
                    />
                  )}
                  <Chip
                    size="small"
                    label={`${recipe.usageCount} uses`}
                    variant="outlined"
                  />
                </Box>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mb: 2,
                    height: 60,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {recipe.description || 'No description available'}
                </Typography>

                <Divider sx={{ my: 1 }} />

                <Box display="flex" gap={2} mb={1}>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <TimerIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      {recipe.estimatedDuration || '?'} days
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <TrendingUpIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      {recipe.estimatedYield || 'N/A'}
                    </Typography>
                  </Box>
                </Box>

                {recipe.author && (
                  <Typography variant="caption" color="text.secondary">
                    By {recipe.author}
                  </Typography>
                )}
              </CardContent>

              <CardActions>
                <Button size="small" onClick={() => handleOpenDetails(recipe)}>
                  View Details
                </Button>
                <Button size="small" startIcon={<PlayArrowIcon />}>
                  Apply to Plant
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recipe Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        {selectedRecipe && (
          <>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h5">{selectedRecipe.name}</Typography>
                <Chip
                  label={selectedRecipe.difficulty}
                  color={difficultyColors[selectedRecipe.difficulty]}
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" paragraph>
                {selectedRecipe.description}
              </Typography>

              <Table size="small" sx={{ mb: 2 }}>
                <TableBody>
                  <TableRow>
                    <TableCell>Strain Type</TableCell>
                    <TableCell>
                      <Chip
                        label={selectedRecipe.strainType.toUpperCase()}
                        size="small"
                        sx={{
                          bgcolor: strainTypeColors[selectedRecipe.strainType],
                          color: 'white',
                        }}
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Estimated Duration</TableCell>
                    <TableCell>{selectedRecipe.estimatedDuration} days</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Estimated Yield</TableCell>
                    <TableCell>{selectedRecipe.estimatedYield}</TableCell>
                  </TableRow>
                  {selectedRecipe.rating && (
                    <TableRow>
                      <TableCell>Rating</TableCell>
                      <TableCell>
                        <Rating
                          value={selectedRecipe.rating}
                          precision={0.1}
                          readOnly
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <Typography variant="h6" gutterBottom>
                Growth Phases
              </Typography>

              {phases.map((phase, idx) => (
                <Card key={idx} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="h6">
                        {idx + 1}. {phase.name}
                      </Typography>
                      <Chip label={`${phase.durationDays} days`} size="small" />
                    </Box>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" gutterBottom>
                          Environment
                        </Typography>
                        <Typography variant="body2">
                          Temp: {phase.environmental.temperature.ideal}°C (
                          {phase.environmental.temperature.min}-
                          {phase.environmental.temperature.max})
                        </Typography>
                        <Typography variant="body2">
                          Humidity: {phase.environmental.humidity.ideal}% (
                          {phase.environmental.humidity.min}-
                          {phase.environmental.humidity.max})
                        </Typography>
                        {phase.environmental.vpd && (
                          <Typography variant="body2">
                            VPD: {phase.environmental.vpd.ideal} kPa
                          </Typography>
                        )}
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" gutterBottom>
                          Lighting
                        </Typography>
                        <Typography variant="body2">
                          Schedule: {phase.lighting.onTime} - {phase.lighting.offTime}
                        </Typography>
                        <Typography variant="body2">
                          Intensity: {phase.lighting.intensity}%
                        </Typography>
                        {phase.lighting.spectrum && (
                          <Typography variant="body2">
                            Spectrum: {phase.lighting.spectrum}
                          </Typography>
                        )}
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" gutterBottom>
                          Watering
                        </Typography>
                        <Typography variant="body2">
                          Frequency: {phase.watering.frequency}
                        </Typography>
                        <Typography variant="body2">
                          Amount: {phase.watering.amount} ml
                        </Typography>
                      </Grid>

                      {phase.nutrients && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" gutterBottom>
                            Nutrients
                          </Typography>
                          <Typography variant="body2">
                            NPK: {phase.nutrients.npk}
                          </Typography>
                          <Typography variant="body2">
                            EC: {phase.nutrients.ec} | pH: {phase.nutrients.ph.min}-
                            {phase.nutrients.ph.max}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>

                    {phase.notes && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        {phase.notes}
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              ))}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetails}>Close</Button>
              <Button variant="contained" startIcon={<PlayArrowIcon />}>
                Apply to Plant
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
