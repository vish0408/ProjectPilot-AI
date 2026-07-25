import { useEffect, useState } from "react";
import { CheckCheck, Trash2 } from "lucide-react";
import { notificationService } from "../../services/NotificationService";
import Pagination from "../../components/common/Pagination";
import { AppNotification } from "../../types/Student";
import { NotifItem } from "../../types/Notification";
import Badge from "../../components/common/Badge";

interface Props {
  items?: NotifItem[];
}

export default function NotificationsScreen({ items: propItems }: Props) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(!propItems);
  const [error, setError] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [pageSize, setPageSize] = useState(20);

  const fetchNotifications = (page: number, size: number) => {
    notificationService.getMyNotifications({ pageNumber: page, pageSize: size })
      .then((data) => {
        setNotifications(data.items);
        setPageNumber(data.pageNumber);
        setTotalPages(data.totalPages);
        setTotalCount(data.totalCount);
        setHasNextPage(data.hasNextPage);
        setHasPreviousPage(data.hasPreviousPage);
      })
      .catch((e) => { if (e instanceof Error) setError(e.message); })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (propItems) return;
    fetchNotifications(pageNumber, pageSize);
  }, [propItems]);

  const handlePageChange = (page: number) => {
    fetchNotifications(page, pageSize);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    fetchNotifications(1, size);
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      if (e instanceof Error) setError(e.message);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await notificationService.markAsRead([id]);
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch (e) {
      if (e instanceof Error) setError(e.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(notifications.filter((n) => n.id !== id));
    } catch (e) {
      if (e instanceof Error) setError(e.message);
    }
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

      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">No notifications yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((n: any) => (
            <div key={n.id}
              className={`p-4 rounded-xl border transition-all ${n.isRead ? "border-border bg-card" : "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0" onClick={() => !n.isRead && !propItems && handleMarkRead(n.id)}>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-bold text-foreground">{n.title}</p>
                    {!n.isRead && <Badge variant="warning">new</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">{n.message}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-muted-foreground">{n.createdAt}</span>
                  {!propItems && (
                    <button onClick={() => handleDelete(n.id)}
                      className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-muted-foreground hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!propItems && (
        <Pagination
          pageNumber={pageNumber}
          totalPages={totalPages}
          totalCount={totalCount}
          hasNextPage={hasNextPage}
          hasPreviousPage={hasPreviousPage}
          onPageChange={handlePageChange}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  );
}
