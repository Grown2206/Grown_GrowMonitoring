import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Note as NoteIcon,
  Event as EventIcon,
  EmojiEvents as MilestoneIcon,
  LocalFlorist as HarvestIcon,
  CheckCircle,
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

const getColor = (type: string, importance?: number): any => {
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
      return 'default';
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
          Noch keine Timeline-Einträge. Erstelle Notizen, Meilensteine oder Events!
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Timeline line */}
      <Box
        sx={{
          position: 'absolute',
          left: 60,
          top: 0,
          bottom: 0,
          width: 2,
          bgcolor: 'divider',
          display: { xs: 'none', sm: 'block' },
        }}
      />

      {items.map((item, index) => (
        <Box
          key={item.id}
          sx={{
            display: 'flex',
            mb: 3,
            position: 'relative',
          }}
        >
          {/* Date on the left */}
          <Box
            sx={{
              width: 120,
              flexShrink: 0,
              textAlign: 'right',
              pr: 2,
              display: { xs: 'none', sm: 'block' },
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {format(new Date(item.date), 'dd.MM.yyyy')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {format(new Date(item.date), 'HH:mm')}
            </Typography>
          </Box>

          {/* Icon */}
          <Box
            sx={{
              width: 48,
              height: 48,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1,
            }}
          >
            <Avatar
              sx={{
                bgcolor: `${getColor(item.type, item.importance)}.main`,
                width: 40,
                height: 40,
              }}
            >
              {getIcon(item.type)}
            </Avatar>
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, ml: 2 }}>
            <Card variant="outlined">
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                  <Typography variant="h6" component="div">
                    {item.title}
                  </Typography>
                  <Chip
                    label={item.type.toUpperCase()}
                    size="small"
                    color={getColor(item.type, item.importance)}
                  />
                </Box>

                {/* Mobile: Show date */}
                <Box sx={{ display: { xs: 'block', sm: 'none' }, mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {format(new Date(item.date), 'dd.MM.yyyy HH:mm')}
                  </Typography>
                </Box>

                {item.content && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    dangerouslySetInnerHTML={{ __html: item.content }}
                    sx={{
                      mb: 1,
                      '& p': { margin: 0, marginBottom: 1 },
                      '& img': { maxWidth: '100%', height: 'auto' },
                      '& ul, & ol': { marginLeft: 2 },
                    }}
                  />
                )}

                {/* Type-specific info */}
                <Box mt={1} display="flex" gap={1} flexWrap="wrap">
                  {item.type === 'milestone' && item.importance && (
                    <Chip
                      label={`Wichtigkeit: ${item.importance}/5`}
                      size="small"
                      variant="outlined"
                    />
                  )}

                  {item.type === 'harvest' && (
                    <>
                      {item.wetWeight && (
                        <Chip label={`Nass: ${item.wetWeight}g`} size="small" />
                      )}
                      {item.dryWeight && (
                        <Chip label={`Trocken: ${item.dryWeight}g`} size="small" />
                      )}
                      {item.quality && (
                        <Chip label={item.quality} size="small" color="success" />
                      )}
                    </>
                  )}

                  {item.type === 'event' && item.eventType && (
                    <>
                      <Chip label={item.eventType} size="small" variant="outlined" />
                      {item.completed && (
                        <Chip
                          icon={<CheckCircle />}
                          label="Erledigt"
                          size="small"
                          color="success"
                        />
                      )}
                    </>
                  )}

                  {item.category && (
                    <Chip label={item.category} size="small" variant="outlined" />
                  )}
                </Box>

                {/* Images */}
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
          </Box>
        </Box>
      ))}
    </Box>
  );
};
