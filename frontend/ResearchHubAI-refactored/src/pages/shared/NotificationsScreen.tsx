import { useEffect, useState } from "react";
import { CheckCheck } from "lucide-react";
import { studentService } from "../../services/StudentService";
import { AppNotification } from "../../types/Student";
import { NotifItem } from "../../types/Notification";
import Badge from "../../components/common/Badge";

interface Props {
  items?: NotifItem[];
}

export default function NotificationsScreen({ items: propItems }: Props) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(!propItems);

  useEffect(() => {
    if (propItems) return;
    studentService.getNotifications()
      .then(setNotifications)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [propItems]);

  const handleMarkAllRead = async () => {
    try {
      await studentService.markAllNotificationsRead();
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    } catch { }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await studentService.markNotificationsRead([id]);
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch { }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const items = propItems
    ? propItems.map((n) => ({
        id: String(n.id),
        title: n.text,
        message: n.text,
        type: n.type,
        isRead: n.read,
        createdAt: n.time,
      }))
    : notifications;

  const unread = items.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground">{unread} unread</p>
        </div>
        {unread > 0 && !propItems && (
          <button onClick={handleMarkAllRead} className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700">
            <CheckCheck className="w-4 h-4" /> Mark All Read
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">No notifications yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((n: any) => (
            <div key={n.id} onClick={() => !n.isRead && !propItems && handleMarkRead(n.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${n.isRead ? "border-border bg-card" : "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-bold text-foreground">{n.title}</p>
                    {!n.isRead && <Badge variant="warning">new</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">{n.message}</p>
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0">{n.createdAt}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
