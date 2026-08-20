export interface PagedRequest {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  roleFilter?: string;
  departmentFilter?: string;
  collegeFilter?: string;
  guideFilter?: string;
  academicYearFilter?: string;
  semesterFilter?: string;
  researchStageFilter?: string;
  phdModeFilter?: string;
  courseworkStatusFilter?: string;
  statusFilter?: string;
  sortField?: string;
  sortDirection?: string;
}

export interface PagedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
