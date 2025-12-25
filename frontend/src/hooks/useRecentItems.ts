import { useEffect } from 'react';
import api from '../services/api';

type ItemType = 'plant' | 'sensor' | 'device' | 'harvest' | 'automation' | 'recipe' | 'report';

export function useRecentItems() {
  const trackItem = async (
    itemType: ItemType,
    itemId: number,
    itemName: string,
    metadata?: Record<string, any>
  ) => {
    try {
      await api.post('/recent-items/track', {
        itemType,
        itemId,
        itemName,
        metadata,
      });
    } catch (error) {
      // Silently fail - tracking is not critical
      console.error('Failed to track recent item:', error);
    }
  };

  return { trackItem };
}

// Hook to automatically track when viewing a specific item
export function useTrackItemView(
  itemType: ItemType,
  itemId: number | undefined,
  itemName: string | undefined,
  metadata?: Record<string, any>
) {
  const { trackItem } = useRecentItems();

  useEffect(() => {
    if (itemId !== undefined && itemName) {
      trackItem(itemType, itemId, itemName, metadata);
    }
  }, [itemId, itemType]); // Only track when id changes
}
