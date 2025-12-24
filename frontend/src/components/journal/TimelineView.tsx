import React from 'react';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
} from '@mui/material';
import {
  Note as NoteIcon,
  Event as EventIcon,
  EmojiEvents as MilestoneIcon,
  LocalFlorist as HarvestIcon,
} from '@mui/icons-material';
import { TimelineItem as TimelineItemType } from '../../types';
import { format } from 'date-fns';

interface TimelineViewProps {
  items: TimelineItemType[];
}

const getIcon = (type: string) => {
  switch (type) {
    case 'note':
      return <NoteIcon />;
    case 'event':
      return <EventIcon />;
    case 'milestone':
      return <MilestoneIcon />;
    case 'harvest':
      return <HarvestIcon />;
    default:
      return <NoteIcon />;
  }
};

const getColor = (type: string, importance?: number) => {
  if (type === 'milestone' && importance) {
    if (importance >= 4) return 'error';
    if (importance >= 3) return 'warning';
    return 'info';
  }

  switch (type) {
    case 'note':
      return 'primary';
    case 'event':
      return 'secondary';
    case 'milestone':
      return 'warning';
    case 'harvest':
      return 'success';
    default:
      return 'grey';
  }
};

export const TimelineView: React.FC<TimelineViewProps> = ({ items }) => {
  if (items.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={400}
      >
        <Typography variant="body1" color="text.secondary">
          No timeline entries yet. Start adding notes, milestones, or events!
        </Typography>
      </Box>
    );
  }

  return (
    <Timeline>
      {items.map((item, index) => (
        <TimelineItem key={item.id}>
          <TimelineOppositeContent color="text.secondary" sx={{ flex: 0.2 }}>
            <Typography variant="caption">
              {format(new Date(item.date), 'MMM dd, yyyy')}
            </Typography>
            <Typography variant="caption" display="block">
              {format(new Date(item.date), 'HH:mm')}
            </Typography>
          </TimelineOppositeContent>

          <TimelineSeparator>
            <TimelineDot color={getColor(item.type, item.importance)}>
              {getIcon(item.type)}
            </TimelineDot>
            {index < items.length - 1 && <TimelineConnector />}
          </TimelineSeparator>

          <TimelineContent sx={{ flex: 0.8 }}>
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="h6" component="div">
                    {item.title}
                  </Typography>
                  <Chip
                    label={item.type.toUpperCase()}
                    size="small"
                    color={getColor(item.type, item.importance)}
                  />
                </Box>

                {item.content && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    dangerouslySetInnerHTML={{ __html: item.content }}
                    sx={{
                      mb: 1,
                      '& p': { margin: 0 },
                      '& img': { maxWidth: '100%', height: 'auto' },
                    }}
                  />
                )}

                {item.type === 'milestone' && item.importance && (
                  <Box mt={1}>
                    <Chip
                      label={`Importance: ${item.importance}/5`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                )}

                {item.type === 'harvest' && (
                  <Box mt={1}>
                    {item.wetWeight && (
                      <Chip
                        label={`Wet: ${item.wetWeight}g`}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                    )}
                    {item.dryWeight && (
                      <Chip
                        label={`Dry: ${item.dryWeight}g`}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                    )}
                    {item.quality && (
                      <Chip
                        label={item.quality}
                        size="small"
                        color="success"
                      />
                    )}
                  </Box>
                )}

                {item.type === 'event' && item.eventType && (
                  <Box mt={1}>
                    <Chip
                      label={item.eventType}
                      size="small"
                      variant="outlined"
                    />
                    {item.completed && (
                      <Chip
                        label="Completed"
                        size="small"
                        color="success"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Box>
                )}

                {item.images && item.images.length > 0 && (
                  <Box mt={2} display="flex" gap={1} flexWrap="wrap">
                    {item.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`${item.title} ${idx + 1}`}
                        style={{
                          width: 100,
                          height: 100,
                          objectFit: 'cover',
                          borderRadius: 4,
                        }}
                      />
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
};
