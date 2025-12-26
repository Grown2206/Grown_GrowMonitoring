import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
  Avatar,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  Campaign as AnnouncementIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PushPin as PinIcon,
  MoreVert as MoreIcon,
  Visibility as ViewIcon,
  VisibilityOff as UnreadIcon,
  Schedule as ScheduleIcon,
  People as AudienceIcon,
  CheckCircle as ReadIcon,
  Archive as ArchiveIcon,
  Warning as UrgentIcon,
  Info as InfoIcon,
  Announcement as ImportantIcon,
} from '@mui/icons-material';

export type AnnouncementPriority = 'urgent' | 'important' | 'info';
export type AnnouncementAudience = 'all' | 'admins' | 'managers' | 'operators' | 'custom';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: AnnouncementPriority;
  audience: AnnouncementAudience;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: Date;
  updatedAt?: Date;
  publishAt?: Date;
  expiresAt?: Date;
  isPinned: boolean;
  isArchived: boolean;
  readBy: string[];
  viewCount: number;
}

export interface AnnouncementsProps {
  announcements?: Announcement[];
  currentUserId?: string;
  onCreateAnnouncement?: (announcement: Omit<Announcement, 'id' | 'createdAt' | 'readBy' | 'viewCount'>) => void;
  onUpdateAnnouncement?: (announcementId: string, updates: Partial<Announcement>) => void;
  onDeleteAnnouncement?: (announcementId: string) => void;
  onMarkAsRead?: (announcementId: string) => void;
  onTogglePin?: (announcementId: string) => void;
  onArchive?: (announcementId: string) => void;
}

/**
 * Team announcements and communications
 */
export function Announcements({
  announcements: initialAnnouncements = [],
  currentUserId = '1',
  onCreateAnnouncement,
  onUpdateAnnouncement,
  onDeleteAnnouncement,
  onMarkAsRead,
  onTogglePin,
  onArchive,
}: AnnouncementsProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>(
    initialAnnouncements.length > 0 ? initialAnnouncements : getSampleAnnouncements()
  );
  const [activeTab, setActiveTab] = useState(0);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formPriority, setFormPriority] = useState<AnnouncementPriority>('info');
  const [formAudience, setFormAudience] = useState<AnnouncementAudience>('all');
  const [formPinned, setFormPinned] = useState(false);
  const [formScheduled, setFormScheduled] = useState(false);
  const [formPublishAt, setFormPublishAt] = useState('');
  const [formExpiresAt, setFormExpiresAt] = useState('');

  const handleCreateAnnouncement = () => {
    const newAnnouncement: Announcement = {
      id: (announcements.length + 1).toString(),
      title: formTitle,
      content: formContent,
      priority: formPriority,
      audience: formAudience,
      authorId: currentUserId,
      authorName: 'You',
      createdAt: new Date(),
      publishAt: formScheduled && formPublishAt ? new Date(formPublishAt) : undefined,
      expiresAt: formExpiresAt ? new Date(formExpiresAt) : undefined,
      isPinned: formPinned,
      isArchived: false,
      readBy: [],
      viewCount: 0,
    };

    setAnnouncements([newAnnouncement, ...announcements]);
    onCreateAnnouncement?.(newAnnouncement);
    showSuccessNotification('Announcement created successfully');
    resetForm();
    setCreateDialogOpen(false);
  };

  const handleUpdateAnnouncement = () => {
    if (selectedAnnouncement) {
      const updates: Partial<Announcement> = {
        title: formTitle,
        content: formContent,
        priority: formPriority,
        audience: formAudience,
        isPinned: formPinned,
        publishAt: formScheduled && formPublishAt ? new Date(formPublishAt) : undefined,
        expiresAt: formExpiresAt ? new Date(formExpiresAt) : undefined,
        updatedAt: new Date(),
      };

      setAnnouncements(
        announcements.map((a) =>
          a.id === selectedAnnouncement.id ? { ...a, ...updates } : a
        )
      );
      onUpdateAnnouncement?.(selectedAnnouncement.id, updates);
      showSuccessNotification('Announcement updated successfully');
      resetForm();
      setEditDialogOpen(false);
    }
  };

  const handleDeleteAnnouncement = (announcementId: string) => {
    setAnnouncements(announcements.filter((a) => a.id !== announcementId));
    onDeleteAnnouncement?.(announcementId);
    showSuccessNotification('Announcement deleted successfully');
  };

  const handleTogglePin = (announcementId: string) => {
    setAnnouncements(
      announcements.map((a) =>
        a.id === announcementId ? { ...a, isPinned: !a.isPinned } : a
      )
    );
    onTogglePin?.(announcementId);
  };

  const handleMarkAsRead = (announcementId: string) => {
    setAnnouncements(
      announcements.map((a) => {
        if (a.id !== announcementId) return a;
        const readBy = a.readBy.includes(currentUserId)
          ? a.readBy
          : [...a.readBy, currentUserId];
        return { ...a, readBy, viewCount: a.viewCount + 1 };
      })
    );
    onMarkAsRead?.(announcementId);
  };

  const handleArchive = (announcementId: string) => {
    setAnnouncements(
      announcements.map((a) =>
        a.id === announcementId ? { ...a, isArchived: true } : a
      )
    );
    onArchive?.(announcementId);
    showSuccessNotification('Announcement archived');
  };

  const handleEdit = (announcement: Announcement) => {
    setFormTitle(announcement.title);
    setFormContent(announcement.content);
    setFormPriority(announcement.priority);
    setFormAudience(announcement.audience);
    setFormPinned(announcement.isPinned);
    setFormScheduled(!!announcement.publishAt);
    setFormPublishAt(announcement.publishAt?.toISOString().slice(0, 16) || '');
    setFormExpiresAt(announcement.expiresAt?.toISOString().slice(0, 16) || '');
    setSelectedAnnouncement(announcement);
    setEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormTitle('');
    setFormContent('');
    setFormPriority('info');
    setFormAudience('all');
    setFormPinned(false);
    setFormScheduled(false);
    setFormPublishAt('');
    setFormExpiresAt('');
    setSelectedAnnouncement(null);
  };

  const showSuccessNotification = (message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const getFilteredAnnouncements = () => {
    let filtered = announcements;

    switch (activeTab) {
      case 0: // All
        filtered = announcements.filter((a) => !a.isArchived);
        break;
      case 1: // Unread
        filtered = announcements.filter((a) => !a.isArchived && !a.readBy.includes(currentUserId));
        break;
      case 2: // Archived
        filtered = announcements.filter((a) => a.isArchived);
        break;
    }

    // Sort: pinned first, then by date
    return filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  };

  const getPriorityIcon = (priority: AnnouncementPriority) => {
    switch (priority) {
      case 'urgent':
        return <UrgentIcon />;
      case 'important':
        return <ImportantIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const getPriorityColor = (priority: AnnouncementPriority) => {
    switch (priority) {
      case 'urgent':
        return 'error';
      case 'important':
        return 'warning';
      default:
        return 'info';
    }
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString();
  };

  const isExpired = (announcement: Announcement) => {
    return announcement.expiresAt && announcement.expiresAt < new Date();
  };

  const isScheduled = (announcement: Announcement) => {
    return announcement.publishAt && announcement.publishAt > new Date();
  };

  const filteredAnnouncements = getFilteredAnnouncements();
  const unreadCount = announcements.filter(
    (a) => !a.isArchived && !a.readBy.includes(currentUserId)
  ).length;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5">Announcements</Typography>
          <Typography variant="body2" color="text.secondary">
            Important updates and communications
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          New Announcement
        </Button>
      </Stack>

      {showSuccess && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setShowSuccess(false)}>
          {successMessage}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="primary">
                {announcements.filter((a) => !a.isArchived).length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Active Announcements
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="warning.main">
                {unreadCount}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Unread
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="error.main">
                {announcements.filter((a) => !a.isArchived && a.isPinned).length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Pinned
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
          <Tab label={`All (${announcements.filter((a) => !a.isArchived).length})`} />
          <Tab label={`Unread (${unreadCount})`} />
          <Tab label={`Archived (${announcements.filter((a) => a.isArchived).length})`} />
        </Tabs>
      </Box>

      {/* Announcements List */}
      <Stack spacing={2}>
        {filteredAnnouncements.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <AnnouncementIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No announcements
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {activeTab === 1 && 'All caught up! No unread announcements.'}
              {activeTab === 2 && 'No archived announcements.'}
              {activeTab === 0 && 'No active announcements at this time.'}
            </Typography>
          </Paper>
        ) : (
          filteredAnnouncements.map((announcement) => {
            const isRead = announcement.readBy.includes(currentUserId);
            const expired = isExpired(announcement);
            const scheduled = isScheduled(announcement);

            return (
              <Card
                key={announcement.id}
                sx={{
                  border: announcement.isPinned ? 2 : 0,
                  borderColor: 'primary.main',
                  bgcolor: !isRead ? 'action.hover' : 'background.paper',
                }}
              >
                <CardContent>
                  <Stack spacing={2}>
                    {/* Header */}
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Avatar src={announcement.authorAvatar}>
                        {announcement.authorName[0]}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mb: 0.5 }}>
                          {announcement.isPinned && (
                            <PinIcon fontSize="small" color="primary" />
                          )}
                          <Typography variant="h6">{announcement.title}</Typography>
                          <Chip
                            icon={getPriorityIcon(announcement.priority)}
                            label={announcement.priority}
                            size="small"
                            color={getPriorityColor(announcement.priority) as any}
                          />
                          {!isRead && (
                            <Chip label="Unread" size="small" color="warning" />
                          )}
                          {scheduled && (
                            <Chip
                              icon={<ScheduleIcon />}
                              label="Scheduled"
                              size="small"
                              variant="outlined"
                            />
                          )}
                          {expired && (
                            <Chip label="Expired" size="small" variant="outlined" />
                          )}
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="caption" color="text.secondary">
                            By {announcement.authorName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            •
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDateTime(announcement.createdAt)}
                          </Typography>
                          {announcement.updatedAt && (
                            <>
                              <Typography variant="caption" color="text.secondary">
                                •
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Updated {formatDateTime(announcement.updatedAt)}
                              </Typography>
                            </>
                          )}
                          <Typography variant="caption" color="text.secondary">
                            •
                          </Typography>
                          <Chip
                            icon={<AudienceIcon />}
                            label={announcement.audience}
                            size="small"
                            variant="outlined"
                          />
                        </Stack>
                      </Box>
                      <Stack direction="row" spacing={0.5}>
                        <IconButton
                          size="small"
                          color={announcement.isPinned ? 'primary' : 'default'}
                          onClick={() => handleTogglePin(announcement.id)}
                        >
                          <PinIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(announcement)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleArchive(announcement.id)}
                          disabled={announcement.isArchived}
                        >
                          <ArchiveIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteAnnouncement(announcement.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </Stack>

                    <Divider />

                    {/* Content */}
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {announcement.content}
                    </Typography>

                    {/* Metadata */}
                    {(announcement.publishAt || announcement.expiresAt || announcement.viewCount > 0) && (
                      <>
                        <Divider />
                        <Grid container spacing={2}>
                          {announcement.publishAt && (
                            <Grid item xs={12} sm={4}>
                              <Typography variant="caption" color="text.secondary">
                                Publish Date
                              </Typography>
                              <Typography variant="body2">
                                {formatDateTime(announcement.publishAt)}
                              </Typography>
                            </Grid>
                          )}
                          {announcement.expiresAt && (
                            <Grid item xs={12} sm={4}>
                              <Typography variant="caption" color="text.secondary">
                                Expires
                              </Typography>
                              <Typography variant="body2" color={expired ? 'error' : 'inherit'}>
                                {formatDateTime(announcement.expiresAt)}
                              </Typography>
                            </Grid>
                          )}
                          <Grid item xs={12} sm={4}>
                            <Typography variant="caption" color="text.secondary">
                              Views
                            </Typography>
                            <Typography variant="body2">
                              {announcement.viewCount} • {announcement.readBy.length} read
                            </Typography>
                          </Grid>
                        </Grid>
                      </>
                    )}

                    {/* Actions */}
                    {!isRead && (
                      <>
                        <Divider />
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<ReadIcon />}
                          onClick={() => handleMarkAsRead(announcement.id)}
                        >
                          Mark as Read
                        </Button>
                      </>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            );
          })
        )}
      </Stack>

      {/* Create Announcement Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Announcement</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Title"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Content"
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              fullWidth
              multiline
              rows={4}
              required
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Priority</InputLabel>
                  <Select value={formPriority} onChange={(e) => setFormPriority(e.target.value as AnnouncementPriority)}>
                    <MenuItem value="info">Info</MenuItem>
                    <MenuItem value="important">Important</MenuItem>
                    <MenuItem value="urgent">Urgent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Audience</InputLabel>
                  <Select value={formAudience} onChange={(e) => setFormAudience(e.target.value as AnnouncementAudience)}>
                    <MenuItem value="all">Everyone</MenuItem>
                    <MenuItem value="admins">Admins Only</MenuItem>
                    <MenuItem value="managers">Managers</MenuItem>
                    <MenuItem value="operators">Operators</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <FormControlLabel
              control={<Switch checked={formPinned} onChange={(e) => setFormPinned(e.target.checked)} />}
              label="Pin this announcement"
            />
            <FormControlLabel
              control={<Switch checked={formScheduled} onChange={(e) => setFormScheduled(e.target.checked)} />}
              label="Schedule for later"
            />
            {formScheduled && (
              <TextField
                label="Publish Date & Time"
                type="datetime-local"
                value={formPublishAt}
                onChange={(e) => setFormPublishAt(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            )}
            <TextField
              label="Expiration Date & Time (Optional)"
              type="datetime-local"
              value={formExpiresAt}
              onChange={(e) => setFormExpiresAt(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateAnnouncement}
            disabled={!formTitle || !formContent}
          >
            Create Announcement
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Announcement Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Announcement</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Title"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Content"
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              fullWidth
              multiline
              rows={4}
              required
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Priority</InputLabel>
                  <Select value={formPriority} onChange={(e) => setFormPriority(e.target.value as AnnouncementPriority)}>
                    <MenuItem value="info">Info</MenuItem>
                    <MenuItem value="important">Important</MenuItem>
                    <MenuItem value="urgent">Urgent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Audience</InputLabel>
                  <Select value={formAudience} onChange={(e) => setFormAudience(e.target.value as AnnouncementAudience)}>
                    <MenuItem value="all">Everyone</MenuItem>
                    <MenuItem value="admins">Admins Only</MenuItem>
                    <MenuItem value="managers">Managers</MenuItem>
                    <MenuItem value="operators">Operators</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <FormControlLabel
              control={<Switch checked={formPinned} onChange={(e) => setFormPinned(e.target.checked)} />}
              label="Pin this announcement"
            />
            <FormControlLabel
              control={<Switch checked={formScheduled} onChange={(e) => setFormScheduled(e.target.checked)} />}
              label="Schedule for later"
            />
            {formScheduled && (
              <TextField
                label="Publish Date & Time"
                type="datetime-local"
                value={formPublishAt}
                onChange={(e) => setFormPublishAt(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            )}
            <TextField
              label="Expiration Date & Time (Optional)"
              type="datetime-local"
              value={formExpiresAt}
              onChange={(e) => setFormExpiresAt(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUpdateAnnouncement}
            disabled={!formTitle || !formContent}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

/**
 * Generate sample announcements
 */
function getSampleAnnouncements(): Announcement[] {
  return [
    {
      id: '1',
      title: 'System Maintenance Scheduled',
      content: 'The grow monitoring system will undergo scheduled maintenance this Saturday from 2 AM to 6 AM. During this time, some features may be temporarily unavailable. Please plan accordingly.',
      priority: 'important',
      audience: 'all',
      authorId: '1',
      authorName: 'System Admin',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isPinned: true,
      isArchived: false,
      readBy: ['1', '3'],
      viewCount: 15,
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
    {
      id: '2',
      title: 'New Temperature Thresholds',
      content: 'We have updated the temperature thresholds for all greenhouses based on recent analysis. Please review the new settings in the Sensors section. Contact operations if you have any concerns.',
      priority: 'urgent',
      audience: 'operators',
      authorId: '2',
      authorName: 'Jane Smith',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      isPinned: true,
      isArchived: false,
      readBy: ['1'],
      viewCount: 22,
    },
    {
      id: '3',
      title: 'Weekly Team Meeting',
      content: 'Reminder: Our weekly team meeting is scheduled for Friday at 10 AM in Conference Room B. We will discuss Q1 growth results and upcoming initiatives.',
      priority: 'info',
      audience: 'all',
      authorId: '1',
      authorName: 'You',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      isPinned: false,
      isArchived: false,
      readBy: ['1', '2', '3', '4'],
      viewCount: 35,
    },
  ];
}
