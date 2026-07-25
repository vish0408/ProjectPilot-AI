import { apiClient } from "../api/client";
import type {
  UploadDocumentRequest, AnalyzeDocumentRequest, SummarizeRequest,
  CompareRequest, ResearchGapsRequest, ExtractKeywordsRequest,
  GenerateRelatedWorkRequest, UploadedDocumentResponse, LiteratureReviewResponse,
} from "../types/Literature";

const BASE = "/literature";

export class LiteratureService {
  async upload(request: UploadDocumentRequest): Promise<UploadedDocumentResponse> {
    const res = await apiClient.post<UploadedDocumentResponse>(`${BASE}/upload`, request);
    if (!res.success || !res.data) throw new Error(res.message || "Upload failed");
    return res.data;
  }

  async analyze(request: AnalyzeDocumentRequest): Promise<UploadedDocumentResponse> {
    const res = await apiClient.post<UploadedDocumentResponse>(`${BASE}/analyze`, request);
    if (!res.success || !res.data) throw new Error(res.message || "Analysis failed");
    return res.data;
  }

  async summarize(request: SummarizeRequest): Promise<UploadedDocumentResponse> {
    const res = await apiClient.post<UploadedDocumentResponse>(`${BASE}/summarize`, request);
    if (!res.success || !res.data) throw new Error(res.message || "Summarization failed");
    return res.data;
  }

  async compare(request: CompareRequest): Promise<LiteratureReviewResponse> {
    const res = await apiClient.post<LiteratureReviewResponse>(`${BASE}/compare`, request);
    if (!res.success || !res.data) throw new Error(res.message || "Comparison failed");
    return res.data;
  }

  async findResearchGaps(request: ResearchGapsRequest): Promise<LiteratureReviewResponse> {
    const res = await apiClient.post<LiteratureReviewResponse>(`${BASE}/research-gaps`, request);
    if (!res.success || !res.data) throw new Error(res.message || "Research gaps analysis failed");
    return res.data;
  }

  async extractKeywords(request: ExtractKeywordsRequest): Promise<UploadedDocumentResponse> {
    const res = await apiClient.post<UploadedDocumentResponse>(`${BASE}/extract-keywords`, request);
    if (!res.success || !res.data) throw new Error(res.message || "Keyword extraction failed");
    return res.data;
  }

  async generateRelatedWork(request: GenerateRelatedWorkRequest): Promise<LiteratureReviewResponse> {
    const res = await apiClient.post<LiteratureReviewResponse>(`${BASE}/generate-related-work`, request);
    if (!res.success || !res.data) throw new Error(res.message || "Generation failed");
    return res.data;
  }

  async getHistory(): Promise<LiteratureReviewResponse[]> {
    const res = await apiClient.get<LiteratureReviewResponse[]>(`${BASE}/history`);
    if (!res.success || !res.data) throw new Error(res.message || "Failed to get history");
    return res.data;
  }

  async getById(id: string): Promise<LiteratureReviewResponse> {
    const res = await apiClient.get<LiteratureReviewResponse>(`${BASE}/${id}`);
    if (!res.success || !res.data) throw new Error(res.message || "Literature review not found");
    return res.data;
  }

  async delete(id: string): Promise<void> {
    const res = await apiClient.delete<void>(`${BASE}/${id}`);
    if (!res.success) throw new Error(res.message || "Delete failed");
  }
}

export const literatureService = new LiteratureService();
