import Bookmark, { BookmarkItemType } from '../models/Bookmark';
import { Op } from 'sequelize';

class BookmarkService {
  /**
   * Add a bookmark for a user
   */
  async addBookmark(
    userId: number,
    itemType: BookmarkItemType,
    itemId: number,
    itemName: string,
    metadata?: Record<string, any>
  ): Promise<Bookmark> {
    // Check if bookmark already exists
    const existing = await Bookmark.findOne({
      where: { userId, itemType, itemId },
    });

    if (existing) {
      // Update existing bookmark (e.g., name might have changed)
      await existing.update({ itemName, metadata });
      return existing;
    }

    // Create new bookmark
    const bookmark = await Bookmark.create({
      userId,
      itemType,
      itemId,
      itemName,
      metadata,
    });

    return bookmark;
  }

  /**
   * Remove a bookmark
   */
  async removeBookmark(
    userId: number,
    itemType: BookmarkItemType,
    itemId: number
  ): Promise<boolean> {
    const result = await Bookmark.destroy({
      where: { userId, itemType, itemId },
    });

    return result > 0;
  }

  /**
   * Get all bookmarks for a user
   */
  async getBookmarks(
    userId: number,
    itemType?: BookmarkItemType,
    limit?: number
  ): Promise<Bookmark[]> {
    const where: any = { userId };
    if (itemType) {
      where.itemType = itemType;
    }

    const bookmarks = await Bookmark.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: limit || 100,
    });

    return bookmarks;
  }

  /**
   * Check if an item is bookmarked
   */
  async isBookmarked(
    userId: number,
    itemType: BookmarkItemType,
    itemId: number
  ): Promise<boolean> {
    const bookmark = await Bookmark.findOne({
      where: { userId, itemType, itemId },
    });

    return !!bookmark;
  }

  /**
   * Toggle bookmark (add if not exists, remove if exists)
   */
  async toggleBookmark(
    userId: number,
    itemType: BookmarkItemType,
    itemId: number,
    itemName: string,
    metadata?: Record<string, any>
  ): Promise<{ bookmarked: boolean; bookmark?: Bookmark }> {
    const existing = await Bookmark.findOne({
      where: { userId, itemType, itemId },
    });

    if (existing) {
      // Remove bookmark
      await existing.destroy();
      return { bookmarked: false };
    } else {
      // Add bookmark
      const bookmark = await this.addBookmark(userId, itemType, itemId, itemName, metadata);
      return { bookmarked: true, bookmark };
    }
  }

  /**
   * Get bookmark statistics
   */
  async getStatistics(userId: number): Promise<{
    total: number;
    byType: Record<string, number>;
  }> {
    const bookmarks = await Bookmark.findAll({
      where: { userId },
    });

    const total = bookmarks.length;
    const byType: Record<string, number> = {};

    bookmarks.forEach((bookmark) => {
      const type = bookmark.itemType;
      byType[type] = (byType[type] || 0) + 1;
    });

    return { total, byType };
  }

  /**
   * Remove bookmarks for deleted items
   */
  async removeDeletedItemBookmarks(
    itemType: BookmarkItemType,
    itemId: number
  ): Promise<number> {
    const result = await Bookmark.destroy({
      where: { itemType, itemId },
    });

    return result;
  }
}

export const bookmarkService = new BookmarkService();
