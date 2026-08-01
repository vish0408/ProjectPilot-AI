import { useState, useEffect, useRef } from "react";
import { Activity, Download, Search, Server, ShieldCheck, Users, X, Copy, Check, Info } from "lucide-react";
import StatCard from "../../components/cards/StatCard";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import Pagination from "../../components/common/Pagination";
import UserAgentPopover from "../../components/admin/UserAgentPopover";
import { adminService } from "../../services/AdminService";
import type { AuditLogResponse } from "../../types/Admin";
import type { PagedRequest } from "../../types/Pagination";

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState<AuditLogResponse[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [uaPopoverOpen, setUaPopoverOpen] = useState(false);
  const [selectedUA, setSelectedUA] = useState("");
  const [copiedUA, setCopiedUA] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchLogs = (page: number, size: number, term: string, action: string) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const req: PagedRequest = {
      pageNumber: page,
      pageSize: size,
      searchTerm: term || undefined,
      statusFilter: action || undefined,
    };
    adminService.getAuditLogsPaged(req, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        setLogs(data.items);
        setTotalCount(data.totalCount);
        setTotalPages(data.totalPages);
        setHasNextPage(data.hasNextPage);
        setHasPreviousPage(data.hasPreviousPage);
      })
      .catch((e) => {
        if (controller.signal.aborted) return;
        if (e instanceof Error) setError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setInitialLoading(false);
        }
      });
  };

  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchLogs(pageNumber, pageSize, search, actionFilter);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [pageNumber, pageSize, search, actionFilter]);

  const handlePageChange = (page: number) => {
    setPageNumber(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPageNumber(1);
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const todayLogs = logs.filter(l => new Date(l.timestamp).toDateString() === new Date().toDateString());

  return (
    <div className="flex flex-col gap-5">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 mb-4">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Events" value={`${totalCount}`} icon={Activity} color="bg-blue-500"/>
        <StatCard label="Today" value={`${todayLogs.length}`} icon={ShieldCheck} color="bg-red-500"/>
        <StatCard label="Unique Users" value={`${new Set(logs.filter(l => l.userId).map(l => l.userId)).size}`} icon={Users} color="bg-green-500"/>
        <StatCard label="Entities" value={`${new Set(logs.map(l => l.entityName)).size}`} icon={Server} color="bg-indigo-500"/>
      </div>
      <Card p={false}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-5 py-4 border-b border-border gap-2">
          <h3 className="font-bold text-foreground text-sm">Audit Log</h3>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPageNumber(1); }}
                className="bg-muted border border-border rounded-lg pl-9 pr-3 py-2 text-xs outline-none focus:border-primary w-full"
                placeholder="Search action, user, entity, IP..."
              />
              {search && (
                <button onClick={() => { setSearch(""); setPageNumber(1); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <select
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setPageNumber(1); }}
              className="bg-muted border border-border rounded-lg px-3 py-2 text-xs outline-none text-foreground"
            >
              <option value="">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="Login">Login</option>
              <option value="Logout">Logout</option>
              <option value="LOGIN_FAIL">Login Fail</option>
              <option value="User Registered">User Registered</option>
            </select>
            <button className="text-xs border border-border rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" />Export
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>{["Timestamp", "User", "Action", "Resource", "IP", "User Agent"].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-5 py-3 text-xs font-semibold text-foreground">{log.userName}</td>
                  <td className="px-5 py-3">
                    <Badge variant={
                      log.action === "LOGIN_FAIL" ? "danger" :
                      log.action === "CREATE" ? "success" :
                      log.action === "DELETE" ? "danger" :
                      log.action === "UPDATE" ? "warning" : "outline"
                    }>{log.action}</Badge>
                  </td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{log.entityName}</td>
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground" title={log.ipAddress || ""}>{log.ipAddress || "Unknown"}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">
                    {log.userAgent ? (
                      <span className="inline-flex items-center gap-1.5 max-w-full">
                        <button
                          onClick={() => { setSelectedUA(log.userAgent); setUaPopoverOpen(true); }}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedUA(log.userAgent); setUaPopoverOpen(true); } }}
                          className="group inline-flex items-center gap-1.5 max-w-full cursor-pointer text-left"
                          title={log.userAgent}
                          aria-label="View full user agent details"
                        >
                          <span className="truncate max-w-[180px] sm:max-w-[220px] md:max-w-[260px] block">
                            {log.userAgent}
                          </span>
                          <Info className="w-3 h-3 shrink-0 text-muted-foreground/50 group-hover:text-blue-500 transition-colors" />
                        </button>
                        <button
                          onClick={async (e) => { e.stopPropagation(); try { await navigator.clipboard.writeText(log.userAgent); setCopiedUA(log.id); setTimeout(() => setCopiedUA(null), 2000); } catch {} }}
                          className="shrink-0 p-0.5 rounded hover:bg-muted transition-colors text-muted-foreground/50 hover:text-foreground"
                          aria-label="Copy user agent"
                          title="Copy user agent"
                        >
                          {copiedUA === log.id ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </span>
                    ) : <span className="text-muted-foreground/50">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!logs.length && <p className="text-sm text-muted-foreground text-center py-8">No audit logs found</p>}
        </div>
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
      </Card>
      <UserAgentPopover userAgent={selectedUA} open={uaPopoverOpen} onOpenChange={setUaPopoverOpen} />
    </div>
  );
}
