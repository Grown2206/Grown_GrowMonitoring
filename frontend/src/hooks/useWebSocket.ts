import { useEffect, useCallback } from 'react';
import { wsService } from '../services/websocket';

export function useWebSocket(type: string, handler: (data: any) => void) {
  useEffect(() => {
    wsService.on(type, handler);

    return () => {
      wsService.off(type, handler);
    };
  }, [type, handler]);
}

export function useWebSocketConnection() {
  useEffect(() => {
    wsService.connect();

    return () => {
      wsService.disconnect();
    };
  }, []);

  const send = useCallback((type: string, data?: any) => {
    wsService.send(type, data);
  }, []);

  return { send };
}
