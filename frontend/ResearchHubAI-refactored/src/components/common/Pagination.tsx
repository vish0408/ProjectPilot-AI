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
    <div className="flex items-center justify-between px-5 py-4 border-t border-border">
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground">
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
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">
          Page {pageNumber} of {totalPages}
        </span>
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
  );
}
