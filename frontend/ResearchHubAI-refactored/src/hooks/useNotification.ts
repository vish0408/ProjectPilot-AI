import { useState } from "react";
import { NotifItem } from "../types/Notification";

/**
 * Minimal local-state hook for notification lists. Currently operates on
 * whatever list is passed in (matching existing NotificationsScreen
 * behavior); swap the internals for NotificationService once a backend
 * exists.
 */
export function useNotification(initial: NotifItem[]) {
  const [items, setItems] = useState<NotifItem[]>(initial);

  const markAllRead = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  const unreadCount = items.filter((n) => !n.read).length;

  return { items, unreadCount, markAllRead };
}
