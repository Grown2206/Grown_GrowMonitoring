import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

type ItemType = 'plant' | 'sensor' | 'device' | 'harvest' | 'automation' | 'recipe' | 'report' | 'strain' | 'alert' | 'note';

interface Bookmark {
  id: number;
  itemType: ItemType;
  itemId: number;
  itemName: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export function useBookmarks(itemType?: ItemType) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBookmarks = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (itemType) {
        params.itemType = itemType;
      }
      const response = await api.get('/bookmarks', { params });
      setBookmarks(response.data);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    } finally {
      setLoading(false);
    }
  }, [itemType]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const addBookmark = async (
    itemType: ItemType,
    itemId: number,
    itemName: string,
    metadata?: Record<string, any>
  ) => {
    try {
      await api.post('/bookmarks', {
        itemType,
        itemId,
        itemName,
        metadata,
      });
      fetchBookmarks();
    } catch (error) {
      console.error('Error adding bookmark:', error);
      throw error;
    }
  };

  const removeBookmark = async (itemType: ItemType, itemId: number) => {
    try {
      await api.delete(`/bookmarks/${itemType}/${itemId}`);
      fetchBookmarks();
    } catch (error) {
      console.error('Error removing bookmark:', error);
      throw error;
    }
  };

  const toggleBookmark = async (
    itemType: ItemType,
    itemId: number,
    itemName: string,
    metadata?: Record<string, any>
  ) => {
    try {
      const response = await api.post('/bookmarks/toggle', {
        itemType,
        itemId,
        itemName,
        metadata,
      });
      fetchBookmarks();
      return response.data.bookmarked;
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      throw error;
    }
  };

  return {
    bookmarks,
    loading,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    refetch: fetchBookmarks,
  };
}

/**
 * Hook to check if a specific item is bookmarked
 */
export function useIsBookmarked(itemType: ItemType, itemId: number) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkBookmark = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/bookmarks/check/${itemType}/${itemId}`);
        setIsBookmarked(response.data.bookmarked);
      } catch (error) {
        console.error('Error checking bookmark:', error);
      } finally {
        setLoading(false);
      }
    };

    if (itemId) {
      checkBookmark();
    }
  }, [itemType, itemId]);

  const toggle = async (itemName: string, metadata?: Record<string, any>) => {
    try {
      const response = await api.post('/bookmarks/toggle', {
        itemType,
        itemId,
        itemName,
        metadata,
      });
      setIsBookmarked(response.data.bookmarked);
      return response.data.bookmarked;
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      throw error;
    }
  };

  return {
    isBookmarked,
    loading,
    toggle,
  };
}
