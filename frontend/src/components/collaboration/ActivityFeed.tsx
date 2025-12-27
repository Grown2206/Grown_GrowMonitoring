import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Collapse,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  Avatar,
  AvatarGroup,
  Tooltip,
} from '@mui/material';
import {
  ThumbUp as LikeIcon,
  Comment as CommentIcon,
  Share as ShareIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  Person as UserIcon,
  LocalFlorist as PlantIcon,
  Sensors as SensorIcon,
  Notifications as AlertIcon,
  Settings as SettingsIcon,
  FileUpload as UploadIcon,
  CheckCircle as CompletedIcon,
  TrendingUp as MetricIcon,
  People as TeamIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';

export type ActivityType =
  | 'user'
  | 'plant'
  | 'sensor'
  | 'alert'
  | 'setting'
  | 'upload'
  | 'completion'
  | 'metric'
  | 'team'
  | 'schedule';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  userId: string;
  userName: string;
  userAvatar?: string;
  action: string;
  description: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  likes: string[];
  comments: ActivityComment[];
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
}

export interface ActivityComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: Date;
}

export interface ActivityFeedProps {
  activities?: ActivityItem[];
  currentUserId?: string;
  onLike?: (activityId: string) => void;
  onComment?: (activityId: string, content: string) => void;
  onShare?: (activityId: string) => void;
  showFilters?: boolean;
}

/**
 * Real-time activity feed component
 */
export function ActivityFeed({
  activities: initialActivities = [],
  currentUserId = '1',
  onLike,
  onComment,
  onShare,
  showFilters = true,
}: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>(
    initialActivities.length > 0 ? initialActivities : getSampleActivities()
  );
  const [typeFilter, setTypeFilter] = useState<ActivityType | 'all'>('all');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState<Record<string, string>>({});

  const handleLike = (activityId: string) => {
    setActivities(
      activities.map((activity) => {
        if (activity.id !== activityId) return activity;
        const likes = activity.likes.includes(currentUserId)
          ? activity.likes.filter((id) => id !== currentUserId)
          : [...activity.likes, currentUserId];
        return { ...activity, likes };
      })
    );
    onLike?.(activityId);
  };

  const handleComment = (activityId: string) => {
    const content = commentInput[activityId];
    if (!content || !content.trim()) return;

    const newComment: ActivityComment = {
      id: Date.now().toString(),
      userId: currentUserId,
      userName: 'You',
      content: content.trim(),
      timestamp: new Date(),
    };

    setActivities(
      activities.map((activity) => {
        if (activity.id !== activityId) return activity;
        return {
          ...activity,
          comments: [...activity.comments, newComment],
        };
      })
    );

    setCommentInput({ ...commentInput, [activityId]: '' });
    onComment?.(activityId, content.trim());
  };

  const handleToggleExpand = (activityId: string) => {
    setExpandedActivity(expandedActivity === activityId ? null : activityId);
  };

  const getFilteredActivities = () => {
    return activities.filter((activity) => {
      const matchesType = typeFilter === 'all' || activity.type === typeFilter;
      const matchesUser = userFilter === 'all' || activity.userId === userFilter;
      return matchesType && matchesUser;
    });
  };

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'user':
        return <UserIcon />;
      case 'plant':
        return <PlantIcon />;
      case 'sensor':
        return <SensorIcon />;
      case 'alert':
        return <AlertIcon />;
      case 'setting':
        return <SettingsIcon />;
      case 'upload':
        return <UploadIcon />;
      case 'completion':
        return <CompletedIcon />;
      case 'metric':
        return <MetricIcon />;
      case 'team':
        return <TeamIcon />;
      case 'schedule':
        return <ScheduleIcon />;
    }
  };

  const getActivityColor = (type: ActivityType) => {
    switch (type) {
      case 'user':
        return 'primary';
      case 'plant':
        return 'success';
      case 'sensor':
        return 'info';
      case 'alert':
        return 'error';
      case 'setting':
        return 'default';
      case 'upload':
        return 'secondary';
      case 'completion':
        return 'success';
      case 'metric':
        return 'warning';
      case 'team':
        return 'primary';
      case 'schedule':
        return 'info';
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const groupActivitiesByDate = (activities: ActivityItem[]) => {
    const grouped: Record<string, ActivityItem[]> = {};
    activities.forEach((activity) => {
      const dateKey = activity.timestamp.toLocaleDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(activity);
    });
    return grouped;
  };

  const filteredActivities = getFilteredActivities();
  const groupedActivities = groupActivitiesByDate(filteredActivities);
  const uniqueUsers = Array.from(new Set(activities.map((a) => ({ id: a.userId, name: a.userName }))));

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5">Activity Feed</Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time updates from your team and system
          </Typography>
        </Box>
      </Stack>

      {showFilters && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Activity Type</InputLabel>
                  <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as ActivityType | 'all')}>
                    <MenuItem value="all">All Types</MenuItem>
                    <MenuItem value="user">User</MenuItem>
                    <MenuItem value="plant">Plant</MenuItem>
                    <MenuItem value="sensor">Sensor</MenuItem>
                    <MenuItem value="alert">Alert</MenuItem>
                    <MenuItem value="setting">Setting</MenuItem>
                    <MenuItem value="upload">Upload</MenuItem>
                    <MenuItem value="completion">Completion</MenuItem>
                    <MenuItem value="metric">Metric</MenuItem>
                    <MenuItem value="team">Team</MenuItem>
                    <MenuItem value="schedule">Schedule</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>User</InputLabel>
                  <Select value={userFilter} onChange={(e) => setUserFilter(e.target.value)}>
                    <MenuItem value="all">All Users</MenuItem>
                    {uniqueUsers.map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary">
                  {filteredActivities.length} activit{filteredActivities.length !== 1 ? 'ies' : 'y'}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {Object.entries(groupedActivities).length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ScheduleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No activities
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Activity will appear here as your team works
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={3}>
          {Object.entries(groupedActivities).map(([date, dateActivities]) => (
            <Box key={date}>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ display: 'block', mb: 2 }}
              >
                {date}
              </Typography>
              <Stack spacing={2}>
                {dateActivities.map((activity) => {
                  const isExpanded = expandedActivity === activity.id;
                  const hasLiked = activity.likes.includes(currentUserId);

                  return (
                    <Card key={activity.id}>
                      <CardContent>
                        <Stack spacing={2}>
                          {/* Activity Header */}
                          <Stack direction="row" spacing={2} alignItems="flex-start">
                            <Avatar
                              src={activity.userAvatar}
                              sx={{
                                bgcolor: `${getActivityColor(activity.type)}.main`,
                              }}
                            >
                              {activity.userName[0]}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                                <Typography variant="subtitle2">{activity.userName}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {activity.action}
                                </Typography>
                                <Chip
                                  icon={getActivityIcon(activity.type)}
                                  label={activity.type}
                                  size="small"
                                  color={getActivityColor(activity.type) as any}
                                  variant="outlined"
                                />
                              </Stack>
                              <Typography variant="caption" color="text.secondary">
                                {formatTimestamp(activity.timestamp)}
                              </Typography>
                            </Box>
                            {activity.comments.length > 0 && (
                              <IconButton size="small" onClick={() => handleToggleExpand(activity.id)}>
                                {isExpanded ? <CollapseIcon /> : <ExpandIcon />}
                              </IconButton>
                            )}
                          </Stack>

                          {/* Activity Description */}
                          <Typography variant="body2">{activity.description}</Typography>

                          {/* Metadata */}
                          {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                            <Stack direction="row" spacing={1} flexWrap="wrap">
                              {Object.entries(activity.metadata).map(([key, value]) => (
                                <Chip key={key} label={`${key}: ${value}`} size="small" variant="outlined" />
                              ))}
                            </Stack>
                          )}

                          {/* Attachments */}
                          {activity.attachments && activity.attachments.length > 0 && (
                            <Stack direction="row" spacing={1}>
                              {activity.attachments.map((attachment, idx) => (
                                <Chip
                                  key={idx}
                                  icon={<UploadIcon />}
                                  label={attachment.name}
                                  size="small"
                                  onClick={() => window.open(attachment.url)}
                                  clickable
                                />
                              ))}
                            </Stack>
                          )}

                          <Divider />

                          {/* Actions */}
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Button
                              size="small"
                              startIcon={<LikeIcon />}
                              color={hasLiked ? 'primary' : 'inherit'}
                              onClick={() => handleLike(activity.id)}
                            >
                              {activity.likes.length > 0 ? activity.likes.length : ''} Like
                            </Button>
                            <Button
                              size="small"
                              startIcon={<CommentIcon />}
                              onClick={() => handleToggleExpand(activity.id)}
                            >
                              {activity.comments.length > 0 ? activity.comments.length : ''} Comment
                            </Button>
                            <Button
                              size="small"
                              startIcon={<ShareIcon />}
                              onClick={() => onShare?.(activity.id)}
                            >
                              Share
                            </Button>

                            {activity.likes.length > 0 && (
                              <AvatarGroup max={3} sx={{ ml: 'auto' }}>
                                {activity.likes.map((userId) => (
                                  <Tooltip key={userId} title={`User ${userId}`}>
                                    <Avatar sx={{ width: 24, height: 24 }}>
                                      {userId}
                                    </Avatar>
                                  </Tooltip>
                                ))}
                              </AvatarGroup>
                            )}
                          </Stack>

                          {/* Comments Section */}
                          <Collapse in={isExpanded}>
                            <Stack spacing={2} sx={{ mt: 2 }}>
                              <Divider />
                              <Typography variant="subtitle2">
                                Comments ({activity.comments.length})
                              </Typography>

                              {activity.comments.map((comment) => (
                                <Stack key={comment.id} direction="row" spacing={2}>
                                  <Avatar src={comment.userAvatar} sx={{ width: 32, height: 32 }}>
                                    {comment.userName[0]}
                                  </Avatar>
                                  <Box sx={{ flex: 1 }}>
                                    <Paper sx={{ p: 1.5, bgcolor: 'action.hover' }}>
                                      <Stack direction="row" spacing={1} alignItems="baseline" sx={{ mb: 0.5 }}>
                                        <Typography variant="subtitle2">{comment.userName}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          {formatTimestamp(comment.timestamp)}
                                        </Typography>
                                      </Stack>
                                      <Typography variant="body2">{comment.content}</Typography>
                                    </Paper>
                                  </Box>
                                </Stack>
                              ))}

                              {/* Add Comment */}
                              <Stack direction="row" spacing={2}>
                                <Avatar sx={{ width: 32, height: 32 }}>Y</Avatar>
                                <TextField
                                  fullWidth
                                  size="small"
                                  placeholder="Write a comment..."
                                  value={commentInput[activity.id] || ''}
                                  onChange={(e) =>
                                    setCommentInput({
                                      ...commentInput,
                                      [activity.id]: e.target.value,
                                    })
                                  }
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      handleComment(activity.id);
                                    }
                                  }}
                                />
                                <Button
                                  variant="contained"
                                  size="small"
                                  onClick={() => handleComment(activity.id)}
                                  disabled={!commentInput[activity.id]?.trim()}
                                >
                                  Post
                                </Button>
                              </Stack>
                            </Stack>
                          </Collapse>
                        </Stack>
                      </CardContent>
                    </Card>
                  );
                })}
              </Stack>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}

/**
 * Generate sample activities
 */
function getSampleActivities(): ActivityItem[] {
  return [
    {
      id: '1',
      type: 'plant',
      userId: '2',
      userName: 'Jane Smith',
      action: 'added a new plant',
      description: 'Added 15 tomato seedlings to Greenhouse A, Zone 2',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      metadata: {
        'Plant Type': 'Tomato',
        Quantity: 15,
        Location: 'Greenhouse A - Zone 2',
      },
      likes: ['1', '3'],
      comments: [
        {
          id: 'c1',
          userId: '1',
          userName: 'You',
          content: 'Great work! Make sure to monitor moisture levels closely.',
          timestamp: new Date(Date.now() - 10 * 60 * 1000),
        },
      ],
    },
    {
      id: '2',
      type: 'alert',
      userId: 'system',
      userName: 'System',
      action: 'triggered a critical alert',
      description: 'Temperature in Greenhouse B exceeded safe threshold (38°C)',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      metadata: {
        'Current Temperature': '38°C',
        Threshold: '35°C',
        Location: 'Greenhouse B',
      },
      likes: [],
      comments: [],
    },
    {
      id: '3',
      type: 'sensor',
      userId: '3',
      userName: 'Mike Johnson',
      action: 'installed a new sensor',
      description: 'Installed pH sensor #23 in Greenhouse C, Zone 1',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      metadata: {
        'Sensor Type': 'pH Monitor',
        'Sensor ID': '#23',
        Location: 'Greenhouse C - Zone 1',
      },
      likes: ['1', '2', '4'],
      comments: [],
    },
    {
      id: '4',
      type: 'completion',
      userId: '4',
      userName: 'Sarah Williams',
      action: 'completed a task',
      description: 'Finished weekly soil analysis for all greenhouse zones',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      metadata: {
        'Task Type': 'Soil Analysis',
        Duration: '4 hours',
        Zones: '12',
      },
      likes: ['1', '2', '3'],
      comments: [
        {
          id: 'c2',
          userId: '2',
          userName: 'Jane Smith',
          content: 'Thanks for completing this on time!',
          timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000),
        },
      ],
    },
    {
      id: '5',
      type: 'metric',
      userId: 'system',
      userName: 'System',
      action: 'reported improved metrics',
      description: 'Average plant growth rate increased by 12% this week',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      metadata: {
        Metric: 'Growth Rate',
        Change: '+12%',
        Period: 'This Week',
      },
      likes: ['1', '2', '3', '4'],
      comments: [],
    },
    {
      id: '6',
      type: 'team',
      userId: '1',
      userName: 'You',
      action: 'added a new team member',
      description: 'Welcomed Robert Brown to the Greenhouse Operations team',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      metadata: {
        'New Member': 'Robert Brown',
        Role: 'Operator',
        Department: 'Greenhouse Operations',
      },
      likes: ['2', '3'],
      comments: [],
    },
  ];
}
