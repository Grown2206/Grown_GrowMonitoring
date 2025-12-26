import React, { useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  Collapse,
} from '@mui/material';
import {
  Send as SendIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Reply as ReplyIcon,
  ThumbUp as LikeIcon,
  ThumbUpOutlined as LikeOutlinedIcon,
  Attachment as AttachIcon,
  EmojiEmotions as EmojiIcon,
} from '@mui/icons-material';

export interface Comment {
  id: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  timestamp: Date;
  edited?: boolean;
  likes?: string[]; // User IDs who liked
  replies?: Comment[];
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
  }>;
}

export interface CommentThreadProps {
  comments?: Comment[];
  currentUserId?: string;
  onAddComment?: (content: string, parentId?: string) => Promise<void>;
  onEditComment?: (commentId: string, content: string) => Promise<void>;
  onDeleteComment?: (commentId: string) => Promise<void>;
  onLikeComment?: (commentId: string) => void;
  placeholder?: string;
  maxNestLevel?: number;
}

/**
 * Threaded comment system with replies and reactions
 */
export function CommentThread({
  comments: initialComments = [],
  currentUserId = '1',
  onAddComment,
  onEditComment,
  onDeleteComment,
  onLikeComment,
  placeholder = 'Add a comment...',
  maxNestLevel = 3,
}: CommentThreadProps) {
  const [comments, setComments] = useState<Comment[]>(
    initialComments.length > 0 ? initialComments : getSampleComments()
  );
  const [newComment, setNewComment] = useState('');
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: `comment-${Date.now()}`,
      author: {
        id: currentUserId,
        name: 'You',
      },
      content: newComment,
      timestamp: new Date(),
      likes: [],
      replies: [],
    };

    if (replyToId) {
      // Add as reply
      const addReply = (comments: Comment[]): Comment[] => {
        return comments.map((c) => {
          if (c.id === replyToId) {
            return { ...c, replies: [...(c.replies || []), comment] };
          }
          if (c.replies) {
            return { ...c, replies: addReply(c.replies) };
          }
          return c;
        });
      };
      setComments(addReply(comments));
      setExpandedReplies((prev) => new Set(prev).add(replyToId));
    } else {
      // Add as top-level comment
      setComments([comment, ...comments]);
    }

    if (onAddComment) {
      await onAddComment(newComment, replyToId || undefined);
    }

    setNewComment('');
    setReplyToId(null);
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    const updateComment = (comments: Comment[]): Comment[] => {
      return comments.map((c) => {
        if (c.id === commentId) {
          return { ...c, content: editContent, edited: true };
        }
        if (c.replies) {
          return { ...c, replies: updateComment(c.replies) };
        }
        return c;
      });
    };

    setComments(updateComment(comments));

    if (onEditComment) {
      await onEditComment(commentId, editContent);
    }

    setEditingId(null);
    setEditContent('');
  };

  const handleDeleteComment = async (commentId: string) => {
    const deleteComment = (comments: Comment[]): Comment[] => {
      return comments
        .filter((c) => c.id !== commentId)
        .map((c) => {
          if (c.replies) {
            return { ...c, replies: deleteComment(c.replies) };
          }
          return c;
        });
    };

    setComments(deleteComment(comments));

    if (onDeleteComment) {
      await onDeleteComment(commentId);
    }

    setAnchorEl(null);
  };

  const handleLikeComment = (commentId: string) => {
    const toggleLike = (comments: Comment[]): Comment[] => {
      return comments.map((c) => {
        if (c.id === commentId) {
          const likes = c.likes || [];
          const newLikes = likes.includes(currentUserId)
            ? likes.filter((id) => id !== currentUserId)
            : [...likes, currentUserId];
          return { ...c, likes: newLikes };
        }
        if (c.replies) {
          return { ...c, replies: toggleLike(c.replies) };
        }
        return c;
      });
    };

    setComments(toggleLike(comments));

    if (onLikeComment) {
      onLikeComment(commentId);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, commentId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedCommentId(commentId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCommentId(null);
  };

  const toggleReplies = (commentId: string) => {
    setExpandedReplies((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
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

  const renderComment = (comment: Comment, level: number = 0) => {
    const isLiked = comment.likes?.includes(currentUserId);
    const likeCount = comment.likes?.length || 0;
    const hasReplies = comment.replies && comment.replies.length > 0;
    const isExpanded = expandedReplies.has(comment.id);
    const isAuthor = comment.author.id === currentUserId;
    const canReply = level < maxNestLevel;

    return (
      <Box key={comment.id}>
        <ListItem
          alignItems="flex-start"
          sx={{
            pl: level * 4,
            bgcolor: level % 2 === 0 ? 'background.paper' : 'background.default',
          }}
        >
          <ListItemAvatar>
            <Avatar src={comment.author.avatar}>
              {comment.author.name.charAt(0)}
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="subtitle2">{comment.author.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatTimestamp(comment.timestamp)}
                  </Typography>
                  {comment.edited && (
                    <Chip label="edited" size="small" variant="outlined" />
                  )}
                </Stack>
                {isAuthor && (
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, comment.id)}
                  >
                    <MoreIcon />
                  </IconButton>
                )}
              </Stack>
            }
            secondary={
              <Stack spacing={1} sx={{ mt: 1 }}>
                {editingId === comment.id ? (
                  <Stack spacing={1}>
                    <TextField
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      multiline
                      rows={2}
                      fullWidth
                      size="small"
                      autoFocus
                    />
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleEditComment(comment.id)}
                      >
                        Save
                      </Button>
                      <Button
                        size="small"
                        onClick={() => {
                          setEditingId(null);
                          setEditContent('');
                        }}
                      >
                        Cancel
                      </Button>
                    </Stack>
                  </Stack>
                ) : (
                  <>
                    <Typography variant="body2" color="text.primary">
                      {comment.content}
                    </Typography>

                    {/* Actions */}
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Button
                        size="small"
                        startIcon={isLiked ? <LikeIcon /> : <LikeOutlinedIcon />}
                        onClick={() => handleLikeComment(comment.id)}
                        color={isLiked ? 'primary' : 'inherit'}
                      >
                        {likeCount > 0 ? likeCount : 'Like'}
                      </Button>
                      {canReply && (
                        <Button
                          size="small"
                          startIcon={<ReplyIcon />}
                          onClick={() => setReplyToId(comment.id)}
                        >
                          Reply
                        </Button>
                      )}
                      {hasReplies && (
                        <Button
                          size="small"
                          onClick={() => toggleReplies(comment.id)}
                        >
                          {isExpanded ? 'Hide' : 'Show'} {comment.replies!.length}{' '}
                          {comment.replies!.length === 1 ? 'reply' : 'replies'}
                        </Button>
                      )}
                    </Stack>
                  </>
                )}

                {/* Reply Input */}
                {replyToId === comment.id && (
                  <Card variant="outlined" sx={{ mt: 1 }}>
                    <CardContent>
                      <TextField
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={`Reply to ${comment.author.name}...`}
                        multiline
                        rows={2}
                        fullWidth
                        size="small"
                        autoFocus
                      />
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<SendIcon />}
                          onClick={handleAddComment}
                          disabled={!newComment.trim()}
                        >
                          Reply
                        </Button>
                        <Button size="small" onClick={() => setReplyToId(null)}>
                          Cancel
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                )}
              </Stack>
            }
          />
        </ListItem>

        {/* Nested Replies */}
        {hasReplies && (
          <Collapse in={isExpanded}>
            {comment.replies!.map((reply) => renderComment(reply, level + 1))}
          </Collapse>
        )}
      </Box>
    );
  };

  return (
    <Box>
      <Stack spacing={2}>
        {/* New Comment Input */}
        <Paper sx={{ p: 2 }}>
          <TextField
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={placeholder}
            multiline
            rows={3}
            fullWidth
            variant="outlined"
          />
          <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
            <Stack direction="row" spacing={1}>
              <IconButton size="small">
                <AttachIcon />
              </IconButton>
              <IconButton size="small">
                <EmojiIcon />
              </IconButton>
            </Stack>
            <Button
              variant="contained"
              startIcon={<SendIcon />}
              onClick={handleAddComment}
              disabled={!newComment.trim()}
            >
              Comment
            </Button>
          </Stack>
        </Paper>

        {/* Comments List */}
        <Typography variant="subtitle2">
          {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
        </Typography>

        {comments.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No comments yet. Be the first to comment!
            </Typography>
          </Paper>
        ) : (
          <List sx={{ p: 0 }}>
            {comments.map((comment) => renderComment(comment))}
          </List>
        )}
      </Stack>

      {/* Comment Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            const comment = findCommentById(comments, selectedCommentId!);
            if (comment) {
              setEditingId(comment.id);
              setEditContent(comment.content);
            }
            handleMenuClose();
          }}
        >
          <ListItemAvatar>
            <EditIcon fontSize="small" />
          </ListItemAvatar>
          <Typography>Edit</Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedCommentId) {
              handleDeleteComment(selectedCommentId);
            }
          }}
        >
          <ListItemAvatar>
            <DeleteIcon fontSize="small" />
          </ListItemAvatar>
          <Typography>Delete</Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
}

/**
 * Helper to find comment by ID recursively
 */
function findCommentById(comments: Comment[], id: string): Comment | null {
  for (const comment of comments) {
    if (comment.id === id) return comment;
    if (comment.replies) {
      const found = findCommentById(comment.replies, id);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Generate sample comments for demo
 */
function getSampleComments(): Comment[] {
  return [
    {
      id: '1',
      author: { id: '2', name: 'Sarah Johnson' },
      content: 'Great progress on the tomato plants! The humidity levels look optimal.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      likes: ['1', '3'],
      replies: [
        {
          id: '2',
          author: { id: '1', name: 'You' },
          content: 'Thanks! I adjusted the settings yesterday and it made a big difference.',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
          likes: ['2'],
          replies: [],
        },
      ],
    },
    {
      id: '3',
      author: { id: '3', name: 'Mike Davis' },
      content: 'Should we increase the light intensity for the seedlings? They seem a bit pale.',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      likes: ['1'],
      replies: [],
    },
  ];
}
