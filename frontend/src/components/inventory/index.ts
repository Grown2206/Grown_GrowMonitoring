/**
 * Inventory & Resource Management (Sprint 73)
 *
 * Features:
 * - Comprehensive inventory tracking with stock levels
 * - Resource allocation and scheduling
 * - Purchase order management and procurement
 * - Low stock alerts and reordering
 * - Multi-category inventory organization
 * - Resource availability management
 * - Order approval workflows
 */

// Inventory Tracker
export { InventoryTracker } from './InventoryTracker';
export type {
  InventoryTrackerProps,
  InventoryItem,
  ItemCategory,
  StockStatus,
} from './InventoryTracker';

// Resource Scheduler
export { ResourceScheduler } from './ResourceScheduler';
export type {
  ResourceSchedulerProps,
  ResourceAllocation,
  Resource,
  ResourceType,
  AllocationStatus,
  Priority,
} from './ResourceScheduler';

// Purchase Orders
export { PurchaseOrders } from './PurchaseOrders';
export type {
  PurchaseOrdersProps,
  PurchaseOrder,
  PurchaseOrderItem,
  OrderStatus,
} from './PurchaseOrders';
