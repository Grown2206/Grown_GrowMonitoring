import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Note as NoteIcon,
} from '@mui/icons-material';
import { notesAPI } from '../../services/api';
import { Note } from '../../types';
import { RichTextEditor } from './RichTextEditor';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

interface NoteEditorProps {
  plantId: number;
  onUpdate?: () => void;
}

const NOTE_CATEGORIES = [
  { value: 'general', label: 'Allgemein', color: 'default' as const },
  { value: 'growth', label: 'Wachstum', color: 'success' as const },
  { value: 'health', label: 'Gesundheit', color: 'info' as const },
  { value: 'feeding', label: 'Düngung', color: 'warning' as const },
  { value: 'environment', label: 'Umgebung', color: 'primary' as const },
  { value: 'observation', label: 'Beobachtung', color: 'secondary' as const },
];

export const NoteEditor: React.FC<NoteEditorProps> = ({ plantId, onUpdate }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
  });

  useEffect(() => {
    loadNotes();
  }, [plantId]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const response = await notesAPI.getAll(plantId);
      setNotes(response.data);
    } catch (error) {
      console.error('Error loading notes:', error);
      toast.error('Fehler beim Laden der Notizen');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (note?: Note) => {
    if (note) {
      setEditingNote(note);
      setFormData({
        title: note.title,
        content: note.content,
        category: note.category || 'general',
      });
    } else {
      setEditingNote(null);
      setFormData({
        title: '',
        content: '',
        category: 'general',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingNote(null);
  };

  const handleSave = async () => {
    try {
      const data = {
        ...formData,
        plantId,
      };

      if (editingNote) {
        await notesAPI.update(editingNote.id, data);
        toast.success('Notiz aktualisiert');
      } else {
        await notesAPI.create(data);
        toast.success('Notiz erstellt');
      }

      handleCloseDialog();
      loadNotes();
      onUpdate?.();
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Fehler beim Speichern');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Notiz wirklich löschen?')) return;

    try {
      await notesAPI.delete(id);
      toast.success('Notiz gelöscht');
      loadNotes();
      onUpdate?.();
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Fehler beim Löschen');
    }
  };

  const getCategoryInfo = (category: string) => {
    return NOTE_CATEGORIES.find(c => c.value === category) || NOTE_CATEGORIES[0];
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">
          <NoteIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Notizen
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Neue Notiz
        </Button>
      </Box>

      <Grid container spacing={2}>
        {notes.map((note) => {
          const categoryInfo = getCategoryInfo(note.category || 'general');
          return (
            <Grid item xs={12} key={note.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box flex={1}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Typography variant="h6">{note.title}</Typography>
                        <Chip
                          label={categoryInfo.label}
                          size="small"
                          color={categoryInfo.color}
                        />
                      </Box>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        dangerouslySetInnerHTML={{ __html: note.content }}
                        sx={{
                          mb: 1,
                          '& p': { margin: 0, marginBottom: 1 },
                          '& img': { maxWidth: '100%', height: 'auto' },
                          '& ul, & ol': { marginLeft: 2 },
                        }}
                      />

                      <Typography variant="caption" color="text.secondary">
                        Erstellt: {format(new Date(note.createdAt), 'dd.MM.yyyy HH:mm')}
                      </Typography>
                      {note.updatedAt !== note.createdAt && (
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                          • Aktualisiert: {format(new Date(note.updatedAt), 'dd.MM.yyyy HH:mm')}
                        </Typography>
                      )}
                    </Box>

                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(note)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(note.id)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {notes.length === 0 && !loading && (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight={200}
          textAlign="center"
        >
          <NoteIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Keine Notizen vorhanden
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Erstelle deine erste Notiz um Beobachtungen zu dokumentieren
          </Typography>
        </Box>
      )}

      {/* Dialog for creating/editing note */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingNote ? 'Notiz bearbeiten' : 'Neue Notiz'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Titel"
              fullWidth
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />

            <FormControl fullWidth>
              <InputLabel>Kategorie</InputLabel>
              <Select
                value={formData.category}
                label="Kategorie"
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {NOTE_CATEGORIES.map((cat) => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box>
              <Typography variant="body2" gutterBottom sx={{ mb: 1 }}>
                Inhalt
              </Typography>
              <RichTextEditor
                value={formData.content}
                onChange={(value) => setFormData({ ...formData, content: value })}
                placeholder="Schreibe deine Notiz hier..."
                height={400}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Abbrechen</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={!formData.title || !formData.content}
          >
            Speichern
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
