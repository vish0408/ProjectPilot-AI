interface PaginationProps {
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPageChange: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
}

export default function Pagination({
  pageNumber,
  totalPages,
  totalCount,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
  pageSize,
  onPageSizeChange,
}: PaginationProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 sm:px-5 py-4 border-t border-border">
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {totalCount} total
        </span>
        {onPageSizeChange && (
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="bg-muted border border-border rounded-lg px-2 py-1.5 text-xs outline-none text-foreground"
          >
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
          </select>
        )}
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          Page {pageNumber} of {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            disabled={!hasPreviousPage}
            onClick={() => onPageChange(pageNumber - 1)}
            className="text-xs border border-border rounded-lg px-3 py-1.5 text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <button
            disabled={!hasNextPage}
            onClick={() => onPageChange(pageNumber + 1)}
            className="text-xs border border-border rounded-lg px-3 py-1.5 text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
