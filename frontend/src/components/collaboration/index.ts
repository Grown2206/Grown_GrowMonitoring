/**
 * Collaboration & Team Management Components
 *
 * Features:
 * - Team member management with role-based access
 * - Resource sharing with granular permissions
 * - Comprehensive permissions editor
 * - Threaded comment system with reactions
 * - Real-time collaboration features
 */

// Team Manager
export { TeamManager } from './TeamManager';
export type { TeamManagerProps, TeamMember, TeamRole } from './TeamManager';

// Share Dialog
export { ShareDialog } from './ShareDialog';
export type { ShareDialogProps, SharedUser, AccessLevel, ShareMethod } from './ShareDialog';

// Permissions Editor
export { PermissionsEditor } from './PermissionsEditor';
export type { PermissionsEditorProps, Permission, RolePermissions } from './PermissionsEditor';

// Comment Thread
export { CommentThread } from './CommentThread';
export type { CommentThreadProps, Comment } from './CommentThread';
