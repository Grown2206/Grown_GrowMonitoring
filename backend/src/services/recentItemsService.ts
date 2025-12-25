import { RecentItem, RecentItemType } from '../models/RecentItem';
import { Op } from 'sequelize';

class RecentItemsService {
  /**
   * Track an item access
   */
  async trackAccess(
    userId: number,
    itemType: RecentItemType,
    itemId: number,
    itemName: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      // Try to find existing recent item
      const existing = await RecentItem.findOne({
        where: {
          userId,
          itemType,
          itemId,
        },
      });

      if (existing) {
        // Update existing item
        await existing.update({
          itemName,
          metadata: metadata || existing.metadata,
          lastAccessedAt: new Date(),
          accessCount: existing.accessCount + 1,
        });
      } else {
        // Create new recent item
        await RecentItem.create({
          userId,
          itemType,
          itemId,
          itemName,
          metadata,
          lastAccessedAt: new Date(),
          accessCount: 1,
        });
      }

      // Clean up old items (keep only last 50 per user)
      await this.cleanupOldItems(userId);
    } catch (error) {
      console.error('Error tracking recent item:', error);
      // Don't throw error - tracking is not critical
    }
  }

  /**
   * Get recent items for a user
   */
  async getRecentItems(
    userId: number,
    itemType?: RecentItemType,
    limit: number = 20
  ): Promise<RecentItem[]> {
    const where: any = { userId };
    if (itemType) {
      where.itemType = itemType;
    }

    return await RecentItem.findAll({
      where,
      order: [['lastAccessedAt', 'DESC']],
      limit,
    });
  }

  /**
   * Get most accessed items
   */
  async getMostAccessed(
    userId: number,
    itemType?: RecentItemType,
    limit: number = 10
  ): Promise<RecentItem[]> {
    const where: any = { userId };
    if (itemType) {
      where.itemType = itemType;
    }

    return await RecentItem.findAll({
      where,
      order: [
        ['accessCount', 'DESC'],
        ['lastAccessedAt', 'DESC'],
      ],
      limit,
    });
  }

  /**
   * Clear recent items for a user
   */
  async clearRecent(
    userId: number,
    itemType?: RecentItemType
  ): Promise<number> {
    const where: any = { userId };
    if (itemType) {
      where.itemType = itemType;
    }

    return await RecentItem.destroy({ where });
  }

  /**
   * Remove a specific recent item
   */
  async removeItem(
    userId: number,
    itemType: RecentItemType,
    itemId: number
  ): Promise<boolean> {
    const result = await RecentItem.destroy({
      where: {
        userId,
        itemType,
        itemId,
      },
    });

    return result > 0;
  }

  /**
   * Clean up old items (keep only last 50)
   */
  private async cleanupOldItems(userId: number): Promise<void> {
    const allItems = await RecentItem.findAll({
      where: { userId },
      order: [['lastAccessedAt', 'DESC']],
    });

    if (allItems.length > 50) {
      const itemsToDelete = allItems.slice(50);
      const idsToDelete = itemsToDelete.map((item) => item.id);

      await RecentItem.destroy({
        where: {
          id: {
            [Op.in]: idsToDelete,
          },
        },
      });
    }
  }

  /**
   * Get statistics about recent items
   */
  async getStatistics(userId: number): Promise<{
    totalItems: number;
    byType: Record<RecentItemType, number>;
    mostAccessed: RecentItem | null;
  }> {
    const items = await RecentItem.findAll({
      where: { userId },
    });

    const byType: any = {
      plant: 0,
      sensor: 0,
      device: 0,
      harvest: 0,
      automation: 0,
      recipe: 0,
      report: 0,
    };

    items.forEach((item) => {
      byType[item.itemType] = (byType[item.itemType] || 0) + 1;
    });

    const mostAccessed = items.length > 0
      ? items.reduce((max, item) => (item.accessCount > max.accessCount ? item : max))
      : null;

    return {
      totalItems: items.length,
      byType,
      mostAccessed,
    };
  }
}

export const recentItemsService = new RecentItemsService();
