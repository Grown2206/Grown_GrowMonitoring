import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Chip,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  alpha,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  ZoomIn as ZoomIcon,
  PhotoCamera as CameraIcon,
  FilterVintage as FlowerIcon,
  Eco as LeafIcon,
} from '@mui/icons-material';
import { plantsAPI } from '../services/api';
import { Plant } from '../types';
import { useToast } from '../contexts/ToastContext';

interface Photo {
  id: number;
  plantId: number;
  imageUrl: string;
  title: string;
  description?: string;
  takenAt: string;
  plant?: Plant;
}

export function PhotoGallery() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<number | 'all'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialog, setViewDialog] = useState<Photo | null>(null);
  const [formData, setFormData] = useState({
    plantId: '',
    title: '',
    description: '',
    imageUrl: '',
    takenAt: new Date().toISOString().split('T')[0],
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const { success, error: showError } = useToast();

  // Demo photos
  const demoPhotos: Photo[] = [
    {
      id: 1,
      plantId: 1,
      imageUrl: 'https://images.unsplash.com/photo-1536331968687-67cfbcabe082?w=400',
      title: 'Tag 1 - Keimung',
      description: 'Erste Anzeichen von Keimung',
      takenAt: '2024-01-01',
    },
    {
      id: 2,
      plantId: 1,
      imageUrl: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400',
      title: 'Tag 7 - Sämling',
      description: 'Sämling entwickelt sich gut',
      takenAt: '2024-01-07',
    },
    {
      id: 3,
      plantId: 1,
      imageUrl: 'https://images.unsplash.com/photo-1584441405886-bc91be61e56a?w=400',
      title: 'Tag 14 - Wachstum',
      description: 'Starkes Blattwachstum',
      takenAt: '2024-01-14',
    },
    {
      id: 4,
      plantId: 2,
      imageUrl: 'https://images.unsplash.com/photo-1587334207346-84a92264e16e?w=400',
      title: 'Tag 21 - Vegetativ',
      description: 'Vegetative Phase',
      takenAt: '2024-01-21',
    },
    {
      id: 5,
      plantId: 2,
      imageUrl: 'https://images.unsplash.com/photo-1616776003236-b13b26cf85c1?w=400',
      title: 'Tag 35 - Vorblüte',
      description: 'Erste Blütenanzeichen',
      takenAt: '2024-02-04',
    },
    {
      id: 6,
      plantId: 3,
      imageUrl: 'https://images.unsplash.com/photo-1608181031959-e459e1c40269?w=400',
      title: 'Tag 50 - Blüte',
      description: 'Volle Blüte',
      takenAt: '2024-02-19',
    },
  ];

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const plantsRes = await plantsAPI.getAll();
      setPlants(plantsRes.data);
      // In a real app, fetch photos from API
      setPhotos(demoPhotos);
    } catch (err) {
      showError('Fehler beim Laden der Galerie');
    }
  }

  const filteredPhotos = selectedPlant === 'all' ? photos : photos.filter((p) => p.plantId === selectedPlant);

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
        setFormData({ ...formData, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  }

  function handleCameraCapture() {
    // Trigger file input with camera
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Use rear camera
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
          setFormData({ ...formData, imageUrl: reader.result as string });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }

  async function handleAddPhoto() {
    if (!formData.imageUrl && !selectedFile) {
      showError('Bitte wählen Sie ein Bild aus');
      return;
    }

    // In a real app, upload to server with FormData
    // const formDataToSend = new FormData();
    // if (selectedFile) formDataToSend.append('photo', selectedFile);
    // formDataToSend.append('plantId', formData.plantId);
    // formDataToSend.append('title', formData.title);
    // await api.post('/photos', formDataToSend);

    const newPhoto: Photo = {
      id: photos.length + 1,
      plantId: parseInt(formData.plantId),
      imageUrl: formData.imageUrl || previewUrl,
      title: formData.title,
      description: formData.description,
      takenAt: formData.takenAt,
    };
    setPhotos([...photos, newPhoto]);
    success('Foto hinzugefügt');
    setDialogOpen(false);
    resetForm();
  }

  function handleDelete(id: number) {
    if (window.confirm('Foto wirklich löschen?')) {
      setPhotos(photos.filter((p) => p.id !== id));
      success('Foto gelöscht');
    }
  }

  function resetForm() {
    setFormData({
      plantId: '',
      title: '',
      description: '',
      imageUrl: '',
      takenAt: new Date().toISOString().split('T')[0],
    });
    setSelectedFile(null);
    setPreviewUrl('');
  }

  const photosByPlant = plants.map((plant) => ({
    plant,
    photos: photos.filter((p) => p.plantId === plant.id),
  }));

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">📸 Foto-Galerie</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
          Foto hinzufügen
        </Button>
      </Box>

      {/* Stats */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: alpha('#2196F3', 0.1) }}>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Gesamt Fotos
              </Typography>
              <Typography variant="h4">{photos.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: alpha('#4CAF50', 0.1) }}>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Pflanzen mit Fotos
              </Typography>
              <Typography variant="h4">{new Set(photos.map((p) => p.plantId)).size}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: alpha('#FF9800', 0.1) }}>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Neueste Foto
              </Typography>
              <Typography variant="h6">
                {photos.length > 0
                  ? new Date(photos[photos.length - 1].takenAt).toLocaleDateString()
                  : 'Keine Fotos'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter Tabs */}
      <Box mb={3}>
        <Tabs
          value={selectedPlant}
          onChange={(_, v) => setSelectedPlant(v)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Alle" value="all" icon={<CameraIcon />} iconPosition="start" />
          {plants.map((plant) => (
            <Tab
              key={plant.id}
              label={`${plant.name} (${photos.filter((p) => p.plantId === plant.id).length})`}
              value={plant.id}
              icon={plant.phase === 'flowering' ? <FlowerIcon /> : <LeafIcon />}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Box>

      {/* Photo Gallery */}
      {selectedPlant === 'all' ? (
        // Group by plant
        <Box>
          {photosByPlant.map(
            ({ plant, photos: plantPhotos }) =>
              plantPhotos.length > 0 && (
                <Box key={plant.id} mb={4}>
                  <Typography variant="h5" gutterBottom>
                    {plant.name}
                  </Typography>
                  <ImageList cols={4} gap={16} sx={{ mb: 3 }}>
                    {plantPhotos.map((photo) => (
                      <ImageListItem key={photo.id}>
                        <img
                          src={photo.imageUrl}
                          alt={photo.title}
                          loading="lazy"
                          style={{ height: 250, objectFit: 'cover', borderRadius: 8 }}
                        />
                        <ImageListItemBar
                          title={photo.title}
                          subtitle={new Date(photo.takenAt).toLocaleDateString()}
                          actionIcon={
                            <Box>
                              <IconButton
                                sx={{ color: 'rgba(255, 255, 255, 0.8)' }}
                                onClick={() => setViewDialog(photo)}
                              >
                                <ZoomIcon />
                              </IconButton>
                              <IconButton
                                sx={{ color: 'rgba(255, 255, 255, 0.8)' }}
                                onClick={() => handleDelete(photo.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          }
                        />
                      </ImageListItem>
                    ))}
                  </ImageList>
                </Box>
              )
          )}
        </Box>
      ) : (
        // Single plant view
        <ImageList cols={4} gap={16}>
          {filteredPhotos.map((photo) => (
            <ImageListItem key={photo.id}>
              <img
                src={photo.imageUrl}
                alt={photo.title}
                loading="lazy"
                style={{ height: 250, objectFit: 'cover', borderRadius: 8 }}
              />
              <ImageListItemBar
                title={photo.title}
                subtitle={new Date(photo.takenAt).toLocaleDateString()}
                actionIcon={
                  <Box>
                    <IconButton
                      sx={{ color: 'rgba(255, 255, 255, 0.8)' }}
                      onClick={() => setViewDialog(photo)}
                    >
                      <ZoomIcon />
                    </IconButton>
                    <IconButton
                      sx={{ color: 'rgba(255, 255, 255, 0.8)' }}
                      onClick={() => handleDelete(photo.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                }
              />
            </ImageListItem>
          ))}
        </ImageList>
      )}

      {filteredPhotos.length === 0 && (
        <Box textAlign="center" py={8}>
          <CameraIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Keine Fotos vorhanden
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Fügen Sie Fotos hinzu, um das Wachstum Ihrer Pflanzen zu dokumentieren
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
            Erstes Foto hinzufügen
          </Button>
        </Box>
      )}

      {/* Add Photo Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Neues Foto hinzufügen</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            select
            label="Pflanze"
            value={formData.plantId}
            onChange={(e) => setFormData({ ...formData, plantId: e.target.value })}
            margin="normal"
          >
            {plants.map((plant) => (
              <MenuItem key={plant.id} value={plant.id}>
                {plant.name} - {plant.phase}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Titel"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            margin="normal"
          />

          {/* Camera/File Upload */}
          <Box mt={2} mb={2}>
            <Typography variant="subtitle2" gutterBottom>
              Foto auswählen
            </Typography>
            <Box display="flex" gap={2}>
              <Button
                variant="outlined"
                startIcon={<CameraIcon />}
                onClick={handleCameraCapture}
                fullWidth
              >
                Kamera
              </Button>
              <Button
                variant="outlined"
                component="label"
                startIcon={<AddIcon />}
                fullWidth
              >
                Datei wählen
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleFileSelect}
                />
              </Button>
            </Box>
            {previewUrl && (
              <Box mt={2}>
                <img
                  src={previewUrl}
                  alt="Vorschau"
                  style={{ width: '100%', borderRadius: 8, maxHeight: 300, objectFit: 'cover' }}
                />
              </Box>
            )}
          </Box>

          <Divider sx={{ my: 2 }}>ODER</Divider>

          <TextField
            fullWidth
            label="Bild-URL"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            margin="normal"
            helperText="Direkt URL eingeben (z.B. von Unsplash)"
          />

          <TextField
            fullWidth
            label="Beschreibung"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
          <TextField
            fullWidth
            type="date"
            label="Aufnahmedatum"
            value={formData.takenAt}
            onChange={(e) => setFormData({ ...formData, takenAt: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Abbrechen</Button>
          <Button
            onClick={handleAddPhoto}
            variant="contained"
            disabled={!formData.plantId || !formData.title || (!formData.imageUrl && !previewUrl)}
          >
            Hinzufügen
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialog !== null} onClose={() => setViewDialog(null)} maxWidth="md" fullWidth>
        {viewDialog && (
          <>
            <DialogTitle>{viewDialog.title}</DialogTitle>
            <DialogContent>
              <Box mb={2}>
                <img
                  src={viewDialog.imageUrl}
                  alt={viewDialog.title}
                  style={{ width: '100%', borderRadius: 8 }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Aufgenommen am: {new Date(viewDialog.takenAt).toLocaleDateString()}
              </Typography>
              {viewDialog.description && (
                <Typography variant="body1" paragraph>
                  {viewDialog.description}
                </Typography>
              )}
            </DialogContent>
            <DialogActions>
              <Button startIcon={<DownloadIcon />}>Herunterladen</Button>
              <Button onClick={() => setViewDialog(null)}>Schließen</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
