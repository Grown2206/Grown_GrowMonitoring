/**
 * Team Collaboration & Communication System
 *
 * Features:
 * - Real-time team chat with channels and direct messages
 * - Activity feed with social interactions
 * - Announcements and important communications
 * - Team member management with role-based access
 * - Resource sharing with granular permissions
 * - Comprehensive permissions editor
 * - Threaded comment system with reactions
 * - Message threading and reactions
 * - File attachments and sharing
 * - Typing indicators and online status
 * - Read receipts and notifications
 * - Channel management and favorites
 * - Activity filtering and grouping
 * - Like, comment, and share functionality
 * - Announcement scheduling and expiration
 * - Priority levels and targeted audiences
 */

// Team Chat (Sprint 68)
export { TeamChat } from './TeamChat';
export type {
  TeamChatProps,
  Message,
  Channel,
  User,
  MessageType,
  ChannelType,
} from './TeamChat';

// Activity Feed (Sprint 68)
export { ActivityFeed } from './ActivityFeed';
export type {
  ActivityFeedProps,
  ActivityItem,
  ActivityComment,
  ActivityType,
} from './ActivityFeed';

// Announcements (Sprint 68)
export { Announcements } from './Announcements';
export type {
  AnnouncementsProps,
  Announcement,
  AnnouncementPriority,
  AnnouncementAudience,
} from './Announcements';

// Team Manager (Earlier Sprint)
export { TeamManager } from './TeamManager';
export type { TeamManagerProps, TeamMember, TeamRole } from './TeamManager';

// Share Dialog (Earlier Sprint)
export { ShareDialog } from './ShareDialog';
export type { ShareDialogProps, SharedUser, AccessLevel, ShareMethod } from './ShareDialog';

// Permissions Editor (Earlier Sprint)
export { PermissionsEditor } from './PermissionsEditor';
export type { PermissionsEditorProps, Permission, RolePermissions } from './PermissionsEditor';

// Comment Thread (Earlier Sprint)
export { CommentThread } from './CommentThread';
export type { CommentThreadProps, Comment } from './CommentThread';
