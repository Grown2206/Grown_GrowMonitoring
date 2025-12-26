import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  Grid,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  Avatar,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachIcon,
  EmojiEmotions as EmojiIcon,
  MoreVert as MoreIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Tag as ChannelIcon,
  Person as DirectMessageIcon,
  StarBorder as StarIcon,
  Star as StarFilledIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Reply as ReplyIcon,
  Check as CheckIcon,
  DoneAll as ReadIcon,
} from '@mui/icons-material';

export type MessageType = 'text' | 'file' | 'system';
export type ChannelType = 'public' | 'private' | 'direct';

export interface Message {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  type: MessageType;
  content: string;
  timestamp: Date;
  edited?: boolean;
  reactions?: Record<string, string[]>;
  replyTo?: string;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  readBy?: string[];
}

export interface Channel {
  id: string;
  name: string;
  type: ChannelType;
  description?: string;
  members: string[];
  unreadCount: number;
  lastMessage?: Message;
  isFavorite: boolean;
  createdAt: Date;
}

export interface User {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'away' | 'offline';
  isTyping?: boolean;
}

export interface TeamChatProps {
  channels?: Channel[];
  messages?: Message[];
  users?: User[];
  currentUserId?: string;
  onSendMessage?: (channelId: string, content: string, replyTo?: string) => void;
  onCreateChannel?: (name: string, type: ChannelType, members: string[]) => void;
  onAddReaction?: (messageId: string, emoji: string) => void;
  onEditMessage?: (messageId: string, newContent: string) => void;
  onDeleteMessage?: (messageId: string) => void;
}

/**
 * Team chat and messaging component
 */
export function TeamChat({
  channels: initialChannels = [],
  messages: initialMessages = [],
  users: initialUsers = [],
  currentUserId = '1',
  onSendMessage,
  onCreateChannel,
  onAddReaction,
  onEditMessage,
  onDeleteMessage,
}: TeamChatProps) {
  const [channels, setChannels] = useState<Channel[]>(
    initialChannels.length > 0 ? initialChannels : getSampleChannels()
  );
  const [messages, setMessages] = useState<Message[]>(
    initialMessages.length > 0 ? initialMessages : getSampleMessages()
  );
  const [users] = useState<User[]>(
    initialUsers.length > 0 ? initialUsers : getSampleUsers()
  );
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(channels[0] || null);
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [createChannelOpen, setCreateChannelOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Create channel form
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelType, setNewChannelType] = useState<ChannelType>('public');

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedChannel]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedChannel) return;

    const newMessage: Message = {
      id: (messages.length + 1).toString(),
      channelId: selectedChannel.id,
      senderId: currentUserId,
      senderName: users.find((u) => u.id === currentUserId)?.name || 'You',
      type: 'text',
      content: messageInput.trim(),
      timestamp: new Date(),
      replyTo: replyToMessage?.id,
      readBy: [currentUserId],
    };

    setMessages([...messages, newMessage]);
    onSendMessage?.(selectedChannel.id, messageInput.trim(), replyToMessage?.id);
    setMessageInput('');
    setReplyToMessage(null);
  };

  const handleCreateChannel = () => {
    const newChannel: Channel = {
      id: (channels.length + 1).toString(),
      name: newChannelName,
      type: newChannelType,
      members: [currentUserId],
      unreadCount: 0,
      isFavorite: false,
      createdAt: new Date(),
    };

    setChannels([...channels, newChannel]);
    onCreateChannel?.(newChannelName, newChannelType, [currentUserId]);
    setNewChannelName('');
    setNewChannelType('public');
    setCreateChannelOpen(false);
    setSelectedChannel(newChannel);
  };

  const handleToggleFavorite = (channelId: string) => {
    setChannels(
      channels.map((c) =>
        c.id === channelId ? { ...c, isFavorite: !c.isFavorite } : c
      )
    );
  };

  const handleAddReaction = (messageId: string, emoji: string) => {
    setMessages(
      messages.map((m) => {
        if (m.id !== messageId) return m;
        const reactions = { ...m.reactions };
        if (!reactions[emoji]) {
          reactions[emoji] = [];
        }
        if (reactions[emoji].includes(currentUserId)) {
          reactions[emoji] = reactions[emoji].filter((id) => id !== currentUserId);
          if (reactions[emoji].length === 0) {
            delete reactions[emoji];
          }
        } else {
          reactions[emoji].push(currentUserId);
        }
        return { ...m, reactions };
      })
    );
    onAddReaction?.(messageId, emoji);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, message: Message) => {
    setAnchorEl(event.currentTarget);
    setSelectedMessage(message);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMessage(null);
  };

  const handleReply = () => {
    if (selectedMessage) {
      setReplyToMessage(selectedMessage);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedMessage) {
      setMessages(messages.filter((m) => m.id !== selectedMessage.id));
      onDeleteMessage?.(selectedMessage.id);
    }
    handleMenuClose();
  };

  const getChannelMessages = () => {
    if (!selectedChannel) return [];
    return messages.filter((m) => m.channelId === selectedChannel.id);
  };

  const getFilteredChannels = () => {
    return channels.filter(
      (c) =>
        searchTerm === '' ||
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString();
  };

  const getUserStatus = (userId: string) => {
    return users.find((u) => u.id === userId)?.status || 'offline';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'success';
      case 'away':
        return 'warning';
      default:
        return 'default';
    }
  };

  const channelMessages = getChannelMessages();
  const filteredChannels = getFilteredChannels();
  const typingUsers = users.filter(
    (u) => u.isTyping && u.id !== currentUserId && selectedChannel?.members.includes(u.id)
  );

  return (
    <Box sx={{ height: '80vh', display: 'flex' }}>
      {/* Channels Sidebar */}
      <Paper
        sx={{
          width: 300,
          borderRight: 1,
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ p: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">Channels</Typography>
            <IconButton size="small" onClick={() => setCreateChannelOpen(true)}>
              <AddIcon />
            </IconButton>
          </Stack>
          <TextField
            size="small"
            placeholder="Search channels..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <Divider />
        <List sx={{ flex: 1, overflow: 'auto' }}>
          {filteredChannels.map((channel) => (
            <ListItemButton
              key={channel.id}
              selected={selectedChannel?.id === channel.id}
              onClick={() => setSelectedChannel(channel)}
            >
              <ListItemAvatar>
                {channel.type === 'direct' ? <DirectMessageIcon /> : <ChannelIcon />}
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="subtitle2" sx={{ flex: 1 }}>
                      {channel.name}
                    </Typography>
                    {channel.unreadCount > 0 && (
                      <Badge badgeContent={channel.unreadCount} color="primary" />
                    )}
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(channel.id);
                      }}
                    >
                      {channel.isFavorite ? (
                        <StarFilledIcon fontSize="small" color="warning" />
                      ) : (
                        <StarIcon fontSize="small" />
                      )}
                    </IconButton>
                  </Stack>
                }
                secondary={
                  channel.lastMessage && (
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {channel.lastMessage.senderName}: {channel.lastMessage.content}
                    </Typography>
                  )
                }
              />
            </ListItemButton>
          ))}
        </List>
      </Paper>

      {/* Chat Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedChannel ? (
          <>
            {/* Chat Header */}
            <Paper sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h6">{selectedChannel.name}</Typography>
                  {selectedChannel.description && (
                    <Typography variant="caption" color="text.secondary">
                      {selectedChannel.description}
                    </Typography>
                  )}
                </Box>
                <Chip label={`${selectedChannel.members.length} members`} size="small" />
              </Stack>
            </Paper>

            {/* Messages */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              <Stack spacing={2}>
                {channelMessages.map((message) => {
                  const isOwn = message.senderId === currentUserId;
                  const replyToMsg = message.replyTo
                    ? messages.find((m) => m.id === message.replyTo)
                    : null;

                  return (
                    <Stack
                      key={message.id}
                      direction="row"
                      spacing={2}
                      sx={{ alignItems: 'flex-start' }}
                    >
                      {!isOwn && (
                        <Badge
                          overlap="circular"
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          badgeContent={
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                bgcolor: `${getStatusColor(getUserStatus(message.senderId))}.main`,
                                border: 2,
                                borderColor: 'background.paper',
                              }}
                            />
                          }
                        >
                          <Avatar src={message.senderAvatar}>
                            {message.senderName[0]}
                          </Avatar>
                        </Badge>
                      )}
                      <Box sx={{ flex: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="baseline" sx={{ mb: 0.5 }}>
                          <Typography variant="subtitle2">{message.senderName}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatTimestamp(message.timestamp)}
                          </Typography>
                          {message.edited && (
                            <Typography variant="caption" color="text.secondary">
                              (edited)
                            </Typography>
                          )}
                        </Stack>

                        {replyToMsg && (
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 1,
                              mb: 1,
                              bgcolor: 'action.hover',
                              borderLeft: 3,
                              borderColor: 'primary.main',
                            }}
                          >
                            <Typography variant="caption" color="text.secondary">
                              Replying to {replyToMsg.senderName}
                            </Typography>
                            <Typography variant="body2" noWrap>
                              {replyToMsg.content}
                            </Typography>
                          </Paper>
                        )}

                        <Paper
                          sx={{
                            p: 1.5,
                            bgcolor: isOwn ? 'primary.main' : 'background.paper',
                            color: isOwn ? 'primary.contrastText' : 'text.primary',
                            maxWidth: '70%',
                          }}
                        >
                          <Typography variant="body2">{message.content}</Typography>
                        </Paper>

                        {message.reactions && Object.keys(message.reactions).length > 0 && (
                          <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                            {Object.entries(message.reactions).map(([emoji, userIds]) => (
                              <Chip
                                key={emoji}
                                label={`${emoji} ${userIds.length}`}
                                size="small"
                                onClick={() => handleAddReaction(message.id, emoji)}
                                variant={userIds.includes(currentUserId) ? 'filled' : 'outlined'}
                                sx={{ cursor: 'pointer' }}
                              />
                            ))}
                          </Stack>
                        )}

                        <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, message)}
                          >
                            <MoreIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </Box>
                    </Stack>
                  );
                })}
                <div ref={messagesEndRef} />
              </Stack>

              {typingUsers.length > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {typingUsers.map((u) => u.name).join(', ')} {typingUsers.length > 1 ? 'are' : 'is'} typing...
                </Typography>
              )}
            </Box>

            {/* Message Input */}
            <Paper sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
              {replyToMessage && (
                <Paper variant="outlined" sx={{ p: 1, mb: 1, bgcolor: 'action.hover' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Replying to {replyToMessage.senderName}
                      </Typography>
                      <Typography variant="body2" noWrap>
                        {replyToMessage.content}
                      </Typography>
                    </Box>
                    <IconButton size="small" onClick={() => setReplyToMessage(null)}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Paper>
              )}
              <Stack direction="row" spacing={1} alignItems="flex-end">
                <IconButton size="small">
                  <AttachIcon />
                </IconButton>
                <TextField
                  fullWidth
                  multiline
                  maxRows={4}
                  placeholder={`Message ${selectedChannel.name}`}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <IconButton size="small">
                  <EmojiIcon />
                </IconButton>
                <IconButton
                  color="primary"
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                >
                  <SendIcon />
                </IconButton>
              </Stack>
            </Paper>
          </>
        ) : (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            <Box>
              <ChannelIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No channel selected
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Select a channel to start messaging
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      {/* Message Context Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleReply}>
          <ReplyIcon fontSize="small" sx={{ mr: 1 }} />
          Reply
        </MenuItem>
        <MenuItem onClick={() => handleAddReaction(selectedMessage?.id || '', '👍')}>
          <EmojiIcon fontSize="small" sx={{ mr: 1 }} />
          React
        </MenuItem>
        {selectedMessage?.senderId === currentUserId && (
          <>
            <Divider />
            <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
              <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
              Delete
            </MenuItem>
          </>
        )}
      </Menu>

      {/* Create Channel Dialog */}
      <Dialog open={createChannelOpen} onClose={() => setCreateChannelOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Channel</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Channel Name"
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
              fullWidth
              required
              placeholder="e.g., greenhouse-team"
            />
            <TextField
              select
              label="Channel Type"
              value={newChannelType}
              onChange={(e) => setNewChannelType(e.target.value as ChannelType)}
              fullWidth
              required
            >
              <MenuItem value="public">Public - Anyone can join</MenuItem>
              <MenuItem value="private">Private - Invite only</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateChannelOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateChannel} disabled={!newChannelName.trim()}>
            Create Channel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

/**
 * Generate sample channels
 */
function getSampleChannels(): Channel[] {
  return [
    {
      id: '1',
      name: 'general',
      type: 'public',
      description: 'General discussions',
      members: ['1', '2', '3', '4'],
      unreadCount: 3,
      isFavorite: true,
      createdAt: new Date('2024-01-01'),
    },
    {
      id: '2',
      name: 'greenhouse-ops',
      type: 'public',
      description: 'Greenhouse operations team',
      members: ['1', '2', '3'],
      unreadCount: 0,
      isFavorite: false,
      createdAt: new Date('2024-01-05'),
    },
    {
      id: '3',
      name: 'alerts',
      type: 'public',
      description: 'System alerts and notifications',
      members: ['1', '2', '3', '4'],
      unreadCount: 1,
      isFavorite: true,
      createdAt: new Date('2024-01-10'),
    },
  ];
}

/**
 * Generate sample messages
 */
function getSampleMessages(): Message[] {
  return [
    {
      id: '1',
      channelId: '1',
      senderId: '2',
      senderName: 'Jane Smith',
      type: 'text',
      content: 'Good morning team! How are the plants looking today?',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      readBy: ['1', '2', '3'],
    },
    {
      id: '2',
      channelId: '1',
      senderId: '3',
      senderName: 'Mike Johnson',
      type: 'text',
      content: 'Looking good! Temperature is optimal and moisture levels are stable.',
      timestamp: new Date(Date.now() - 55 * 60 * 1000),
      readBy: ['1', '2', '3'],
      reactions: { '👍': ['1', '2'], '✅': ['4'] },
    },
    {
      id: '3',
      channelId: '1',
      senderId: '1',
      senderName: 'You',
      type: 'text',
      content: 'Great to hear! Keep up the good work.',
      timestamp: new Date(Date.now() - 50 * 60 * 1000),
      readBy: ['1'],
    },
  ];
}

/**
 * Generate sample users
 */
function getSampleUsers(): User[] {
  return [
    {
      id: '1',
      name: 'You',
      status: 'online',
    },
    {
      id: '2',
      name: 'Jane Smith',
      status: 'online',
    },
    {
      id: '3',
      name: 'Mike Johnson',
      status: 'away',
    },
    {
      id: '4',
      name: 'Sarah Williams',
      status: 'offline',
    },
  ];
}
