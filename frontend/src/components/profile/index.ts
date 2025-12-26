/**
 * User Profile & Account Management Components
 *
 * Features:
 * - Comprehensive profile editing with validation
 * - Avatar upload with zoom and rotation
 * - Account security and privacy settings
 * - Activity feed with filtering and search
 * - Password management
 * - Two-factor authentication
 * - Session management
 * - Data export and account deletion
 */

// Profile Editor
export { ProfileEditor } from './ProfileEditor';
export type { ProfileEditorProps, UserProfile } from './ProfileEditor';

// Avatar Uploader
export { AvatarUploader } from './AvatarUploader';
export type { AvatarUploaderProps } from './AvatarUploader';

// Account Settings
export { AccountSettings } from './AccountSettings';
export type { AccountSettingsProps } from './AccountSettings';

// Activity Feed
export { ActivityFeed } from './ActivityFeed';
export type { ActivityFeedProps, Activity } from './ActivityFeed';
