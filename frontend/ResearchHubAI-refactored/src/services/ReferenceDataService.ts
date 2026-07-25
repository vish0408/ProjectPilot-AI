import { apiClient } from "../api/client";
import type { CollegeResponse, DepartmentResponse } from "../types/Admin";
import type { ResearchCategory } from "../types/Hod";

export class ReferenceDataService {
  async getColleges(): Promise<CollegeResponse[]> {
    const res = await apiClient.get<CollegeResponse[]>("/public/colleges");
    if (!res.success || !res.data) throw new Error(res.message || "Failed");
    return res.data;
  }

  async getDepartments(collegeId?: string): Promise<DepartmentResponse[]> {
    const path = collegeId ? `/public/departments/by-college/${collegeId}` : "/public/departments";
    const res = await apiClient.get<DepartmentResponse[]>(path);
    if (!res.success || !res.data) throw new Error(res.message || "Failed");
    return res.data;
  }

  async getCategories(): Promise<ResearchCategory[]> {
    const res = await apiClient.get<ResearchCategory[]>("/hod/research-categories");
    if (!res.success || !res.data) throw new Error(res.message || "Failed");
    return res.data;
  }
}

export const referenceDataService = new ReferenceDataService();
