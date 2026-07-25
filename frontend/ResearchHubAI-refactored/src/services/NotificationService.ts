import { apiClient } from "../api/client";
import type { PagedRequest, PagedResponse } from "../types/Pagination";

export interface NotificationResponse {
  id: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export class NotificationService {
  async getMyNotifications(request?: PagedRequest): Promise<PagedResponse<NotificationResponse>> {
    const qp = new URLSearchParams();
    if (request?.pageNumber) qp.set("pageNumber", String(request.pageNumber));
    if (request?.pageSize) qp.set("pageSize", String(request.pageSize));
    const qs = qp.toString();
    const res = await apiClient.get<PagedResponse<NotificationResponse>>(`/notifications${qs ? `?${qs}` : ""}`);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to get notifications");
    return res.data;
  }

  async getUnreadCount(): Promise<number> {
    const res = await apiClient.get<{ count: number }>("/notifications/unread-count");
    if (!res.success || !res.data) throw new Error(res.message || "Failed");
    return res.data.count;
  }

  async markAsRead(notificationIds: string[]): Promise<void> {
    await apiClient.put("/notifications/mark-read", { notificationIds });
  }

  async markAllAsRead(): Promise<void> {
    await apiClient.put("/notifications/mark-all-read");
  }

  async deleteNotification(id: string): Promise<void> {
    await apiClient.delete(`/notifications/${id}`);
  }
}

export const notificationService = new NotificationService();
