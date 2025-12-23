import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  Box,
  Typography,
} from '@mui/material';
import { Alert } from '../types';

interface AlertConfigDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (alert: Partial<Alert>) => void;
  alert?: Alert;
}

export function AlertConfigDialog({ open, onClose, onSave, alert }: AlertConfigDialogProps) {
  const [formData, setFormData] = useState<Partial<Alert>>(
    alert || {
      name: '',
      type: 'telegram',
      condition: 'moisture_low',
      threshold: 30,
      enabled: true,
      cooldownMinutes: 60,
    }
  );

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{alert ? 'Alert bearbeiten' : 'Neuer Alert'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            fullWidth
            required
          />

          <TextField
            select
            label="Typ"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            fullWidth
          >
            <MenuItem value="telegram">Telegram</MenuItem>
            <MenuItem value="discord">Discord</MenuItem>
            <MenuItem value="email">E-Mail</MenuItem>
            <MenuItem value="webhook">Webhook</MenuItem>
          </TextField>

          <TextField
            select
            label="Bedingung"
            value={formData.condition}
            onChange={(e) => setFormData({ ...formData, condition: e.target.value as any })}
            fullWidth
          >
            <MenuItem value="moisture_low">Bodenfeuchtigkeit niedrig</MenuItem>
            <MenuItem value="moisture_high">Bodenfeuchtigkeit hoch</MenuItem>
            <MenuItem value="temperature_low">Temperatur niedrig</MenuItem>
            <MenuItem value="temperature_high">Temperatur hoch</MenuItem>
            <MenuItem value="humidity_low">Luftfeuchtigkeit niedrig</MenuItem>
            <MenuItem value="humidity_high">Luftfeuchtigkeit hoch</MenuItem>
            <MenuItem value="tank_low">Wassertank niedrig</MenuItem>
            <MenuItem value="nutrient_low">Nährstoffe niedrig</MenuItem>
            <MenuItem value="nutrient_high">Nährstoffe hoch</MenuItem>
          </TextField>

          <TextField
            label="Schwellenwert"
            type="number"
            value={formData.threshold}
            onChange={(e) => setFormData({ ...formData, threshold: parseFloat(e.target.value) })}
            fullWidth
          />

          <TextField
            label="Cooldown (Minuten)"
            type="number"
            value={formData.cooldownMinutes}
            onChange={(e) => setFormData({ ...formData, cooldownMinutes: parseInt(e.target.value) })}
            fullWidth
          />

          {/* Type-specific fields */}
          {formData.type === 'telegram' && (
            <>
              <TextField
                label="Telegram Bot Token"
                value={formData.telegramBotToken || ''}
                onChange={(e) => setFormData({ ...formData, telegramBotToken: e.target.value })}
                fullWidth
                placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
              />
              <TextField
                label="Telegram Chat ID"
                value={formData.telegramChatId || ''}
                onChange={(e) => setFormData({ ...formData, telegramChatId: e.target.value })}
                fullWidth
                placeholder="123456789"
              />
              <Typography variant="caption" color="text.secondary">
                <a href="https://t.me/botfather" target="_blank" rel="noopener noreferrer">
                  Bot erstellen bei @BotFather
                </a>
              </Typography>
            </>
          )}

          {formData.type === 'discord' && (
            <>
              <TextField
                label="Discord Webhook URL"
                value={formData.discordWebhookUrl || ''}
                onChange={(e) => setFormData({ ...formData, discordWebhookUrl: e.target.value })}
                fullWidth
                placeholder="https://discord.com/api/webhooks/..."
              />
            </>
          )}

          {formData.type === 'email' && (
            <TextField
              label="E-Mail Adresse"
              value={formData.recipientEmail || ''}
              onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
              fullWidth
              type="email"
            />
          )}

          {formData.type === 'webhook' && (
            <TextField
              label="Webhook URL"
              value={formData.webhookUrl || ''}
              onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
              fullWidth
              placeholder="https://..."
            />
          )}

          <FormControlLabel
            control={<Switch checked={formData.enabled} onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })} />}
            label="Aktiviert"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Abbrechen</Button>
        <Button onClick={handleSubmit} variant="contained">
          Speichern
        </Button>
      </DialogActions>
    </Dialog>
  );
}
