import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  Language as LanguageIcon,
  CheckCircle as VerifiedIcon,
} from '@mui/icons-material';

export interface UserProfile {
  // Basic Information
  firstName: string;
  lastName: string;
  displayName?: string;
  email: string;
  phone?: string;
  avatar?: string;

  // Professional
  title?: string;
  organization?: string;
  department?: string;

  // Location
  country?: string;
  city?: string;
  timezone?: string;

  // About
  bio?: string;
  website?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };

  // Verification
  emailVerified?: boolean;
  phoneVerified?: boolean;
}

export interface ProfileEditorProps {
  profile?: UserProfile;
  onSave?: (profile: UserProfile) => void;
  onCancel?: () => void;
  readonly?: boolean;
}

const countries = [
  'United States',
  'United Kingdom',
  'Germany',
  'France',
  'Spain',
  'Italy',
  'Canada',
  'Australia',
  'Japan',
  'China',
  'Brazil',
  'India',
];

/**
 * Comprehensive profile editing component
 */
export function ProfileEditor({
  profile: initialProfile,
  onSave,
  onCancel,
  readonly = false,
}: ProfileEditorProps) {
  const [editing, setEditing] = useState(!readonly);
  const [profile, setProfile] = useState<UserProfile>(
    initialProfile || {
      firstName: '',
      lastName: '',
      email: '',
      emailVerified: false,
      phoneVerified: false,
    }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
    // Clear error for this field
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!profile.firstName?.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!profile.lastName?.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!profile.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (profile.phone && !/^[\d\s\-\+\(\)]+$/.test(profile.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }

    if (profile.website && !/^https?:\/\/.+/.test(profile.website)) {
      newErrors.website = 'Website must start with http:// or https://';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      if (onSave) {
        onSave(profile);
      }
      setEditing(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    setEditing(false);
    // Reset to initial profile
    if (initialProfile) {
      setProfile(initialProfile);
    }
    setErrors({});
  };

  if (!editing && readonly) {
    // Read-only view
    return (
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h5">Profile</Typography>
          <Button startIcon={<EditIcon />} onClick={() => setEditing(true)}>
            Edit Profile
          </Button>
        </Stack>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Avatar
                  src={profile.avatar}
                  sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
                >
                  {profile.firstName?.[0]}
                  {profile.lastName?.[0]}
                </Avatar>
                <Typography variant="h5" gutterBottom>
                  {profile.firstName} {profile.lastName}
                </Typography>
                {profile.displayName && (
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    @{profile.displayName}
                  </Typography>
                )}
                {profile.title && (
                  <Typography variant="body2" color="text.secondary">
                    {profile.title}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Stack spacing={2}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Contact Information
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <EmailIcon />
                      </ListItemIcon>
                      <ListItemText primary={profile.email} secondary="Email" />
                      {profile.emailVerified && (
                        <Chip
                          icon={<VerifiedIcon />}
                          label="Verified"
                          size="small"
                          color="success"
                        />
                      )}
                    </ListItem>
                    {profile.phone && (
                      <ListItem>
                        <ListItemIcon>
                          <PhoneIcon />
                        </ListItemIcon>
                        <ListItemText primary={profile.phone} secondary="Phone" />
                        {profile.phoneVerified && (
                          <Chip
                            icon={<VerifiedIcon />}
                            label="Verified"
                            size="small"
                            color="success"
                          />
                        )}
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </Card>

              {profile.bio && (
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      About
                    </Typography>
                    <Typography variant="body1">{profile.bio}</Typography>
                  </CardContent>
                </Card>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Box>
    );
  }

  // Edit mode
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5">Edit Profile</Typography>
      </Stack>

      <Stack spacing={3}>
        {/* Basic Information */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="First Name"
                  value={profile.firstName || ''}
                  onChange={(e) => updateField('firstName', e.target.value)}
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                  required
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Last Name"
                  value={profile.lastName || ''}
                  onChange={(e) => updateField('lastName', e.target.value)}
                  error={!!errors.lastName}
                  helperText={errors.lastName}
                  required
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Display Name"
                  value={profile.displayName || ''}
                  onChange={(e) => updateField('displayName', e.target.value)}
                  helperText="Public username (optional)"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email"
                  type="email"
                  value={profile.email || ''}
                  onChange={(e) => updateField('email', e.target.value)}
                  error={!!errors.email}
                  helperText={errors.email}
                  required
                  fullWidth
                  InputProps={{
                    endAdornment: profile.emailVerified ? (
                      <Chip icon={<VerifiedIcon />} label="Verified" size="small" color="success" />
                    ) : null,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Phone"
                  type="tel"
                  value={profile.phone || ''}
                  onChange={(e) => updateField('phone', e.target.value)}
                  error={!!errors.phone}
                  helperText={errors.phone}
                  fullWidth
                  InputProps={{
                    endAdornment: profile.phoneVerified ? (
                      <Chip icon={<VerifiedIcon />} label="Verified" size="small" color="success" />
                    ) : null,
                  }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Professional Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Job Title"
                  value={profile.title || ''}
                  onChange={(e) => updateField('title', e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Organization"
                  value={profile.organization || ''}
                  onChange={(e) => updateField('organization', e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Department"
                  value={profile.department || ''}
                  onChange={(e) => updateField('department', e.target.value)}
                  fullWidth
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Location
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Country</InputLabel>
                  <Select
                    value={profile.country || ''}
                    onChange={(e) => updateField('country', e.target.value)}
                    label="Country"
                  >
                    {countries.map((country) => (
                      <MenuItem key={country} value={country}>
                        {country}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="City"
                  value={profile.city || ''}
                  onChange={(e) => updateField('city', e.target.value)}
                  fullWidth
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              About
            </Typography>
            <TextField
              label="Bio"
              value={profile.bio || ''}
              onChange={(e) => updateField('bio', e.target.value)}
              multiline
              rows={4}
              fullWidth
              helperText="Tell us about yourself"
            />
            <Box sx={{ mt: 2 }}>
              <TextField
                label="Website"
                type="url"
                value={profile.website || ''}
                onChange={(e) => updateField('website', e.target.value)}
                error={!!errors.website}
                helperText={errors.website || 'https://example.com'}
                fullWidth
              />
            </Box>
          </CardContent>
        </Card>

        {/* Actions */}
        <Paper sx={{ p: 2, position: 'sticky', bottom: 0 }}>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="outlined" startIcon={<CancelIcon />} onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>
              Save Changes
            </Button>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}
