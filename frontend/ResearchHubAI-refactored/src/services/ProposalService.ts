import { apiClient } from "../api/client";
import type {
  GenerateProposalRequest, ImproveProposalRequest, RegenerateSectionRequest,
  SaveProposalRequest, ProposalResponse, ProposalTemplate,
} from "../types/Proposal";

const BASE = "/proposal";

export class ProposalService {
  async generate(request: GenerateProposalRequest): Promise<ProposalResponse> {
    const res = await apiClient.post<ProposalResponse>(`${BASE}/generate`, request);
    if (!res.success || !res.data) throw new Error(res.message || "Generation failed");
    return res.data;
  }

  async improve(request: ImproveProposalRequest): Promise<ProposalResponse> {
    const res = await apiClient.post<ProposalResponse>(`${BASE}/improve`, request);
    if (!res.success || !res.data) throw new Error(res.message || "Improvement failed");
    return res.data;
  }

  async regenerateSection(request: RegenerateSectionRequest): Promise<ProposalResponse> {
    const res = await apiClient.post<ProposalResponse>(`${BASE}/regenerate-section`, request);
    if (!res.success || !res.data) throw new Error(res.message || "Regeneration failed");
    return res.data;
  }

  async getTemplates(): Promise<ProposalTemplate[]> {
    const res = await apiClient.get<ProposalTemplate[]>(`${BASE}/templates`);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to get templates");
    return res.data;
  }

  async save(request: SaveProposalRequest): Promise<ProposalResponse> {
    const res = await apiClient.post<ProposalResponse>(`${BASE}/save`, request);
    if (!res.success || !res.data) throw new Error(res.message || "Save failed");
    return res.data;
  }

  async getMyProposals(): Promise<ProposalResponse[]> {
    const res = await apiClient.get<ProposalResponse[]>(`${BASE}/my`);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to get proposals");
    return res.data;
  }

  async getById(id: string): Promise<ProposalResponse> {
    const res = await apiClient.get<ProposalResponse>(`${BASE}/${id}`);
    if (!res.success || !res.data) throw new Error(res.message || "Proposal not found");
    return res.data;
  }

  async update(id: string, request: SaveProposalRequest): Promise<ProposalResponse> {
    const res = await apiClient.put<ProposalResponse>(`${BASE}/${id}`, request);
    if (!res.success || !res.data) throw new Error(res.message || "Update failed");
    return res.data;
  }

  async delete(id: string): Promise<void> {
    const res = await apiClient.delete<void>(`${BASE}/${id}`);
    if (!res.success) throw new Error(res.message || "Delete failed");
  }
}

export const proposalService = new ProposalService();
