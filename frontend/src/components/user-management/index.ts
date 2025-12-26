/**
 * User Management & Permissions System
 *
 * Features:
 * - User management (create, edit, delete, activate/deactivate)
 * - Role-based access control (RBAC)
 * - Permission management with granular controls
 * - User profile view and editor
 * - Activity logging and audit trails
 * - Session management across devices
 * - Password management and security settings
 * - Two-factor authentication
 * - Account verification (email, phone)
 */

// User Management
export { UserManagement } from './UserManagement';
export type {
  UserManagementProps,
  User,
  UserRole,
  UserStatus,
} from './UserManagement';

// Role & Permissions
export { RolePermissions } from './RolePermissions';
export type {
  RolePermissionsProps,
  Role,
  Permission,
  PermissionAction,
} from './RolePermissions';

// User Profile
export { UserProfile } from './UserProfile';
export type {
  UserProfileProps,
  UserProfileData,
  ActivityLog,
  ActiveSession,
} from './UserProfile';
