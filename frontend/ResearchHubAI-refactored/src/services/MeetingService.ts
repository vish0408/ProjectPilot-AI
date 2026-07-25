import { apiClient } from "../api/client";
import type { PagedRequest, PagedResponse } from "../types/Pagination";

export interface MeetingResponse {
  id: string;
  guideId: string;
  guideName: string;
  title: string;
  description: string;
  scheduledAt: string;
  durationMinutes: number;
  status: string;
  meetingLink: string;
  agenda: string;
}

export class MeetingService {
  async getMyMeetings(request?: PagedRequest): Promise<PagedResponse<MeetingResponse>> {
    const qp = new URLSearchParams();
    if (request?.pageNumber) qp.set("pageNumber", String(request.pageNumber));
    if (request?.pageSize) qp.set("pageSize", String(request.pageSize));
    const qs = qp.toString();
    const res = await apiClient.get<PagedResponse<MeetingResponse>>(`/meetings${qs ? `?${qs}` : ""}`);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to get meetings");
    return res.data;
  }

  async getMeeting(id: string): Promise<MeetingResponse> {
    const res = await apiClient.get<MeetingResponse>(`/meetings/${id}`);
    if (!res.success || !res.data) throw new Error(res.message || "Meeting not found");
    return res.data;
  }

  async createMeeting(data: { title: string; description?: string; scheduledAt: string; durationMinutes: number; agenda?: string; meetingLink?: string; participantIds: string[] }): Promise<MeetingResponse> {
    const res = await apiClient.post<MeetingResponse>("/meetings", data);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to create meeting");
    return res.data;
  }
}

export const meetingService = new MeetingService();
