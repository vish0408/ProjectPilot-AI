import { useEffect, useRef, useState } from "react";
import { ChevronDown, Loader2, Search, X } from "lucide-react";
import { adminService } from "../../services/AdminService";
import type { AcademicYearResponse } from "../../types/Admin";

interface AcademicYearSelectProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  allowClear?: boolean;
  autoSelectCurrent?: boolean;
  placeholder?: string;
}

export default function AcademicYearSelect({
  value,
  onChange,
  label = "Academic Year",
  required,
  error,
  disabled,
  allowClear = false,
  autoSelectCurrent = true,
  placeholder = "Select academic year...",
}: AcademicYearSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [years, setYears] = useState<AcademicYearResponse[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (disabled) return;
    setLoading(true);
    adminService.getAcademicYears()
      .then((data) => {
        setYears(data || []);
        if (autoSelectCurrent && !value) {
          const current = (data || []).find((y) => y.isCurrent) || (data || [])[0];
          if (current) onChange(current.id);
        }
      })
      .catch(() => setYears([]))
      .finally(() => setLoading(false));
  }, [disabled]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = years.find((y) => y.id === value);
  const filtered = years.filter((y) => y.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div
        onClick={() => { if (!disabled) { setOpen((o) => !o); setTimeout(() => inputRef.current?.focus(), 50); } }}
        className={`w-full px-3 py-2.5 text-sm rounded-xl border cursor-pointer flex items-center justify-between transition-all ${error ? "border-red-400" : "border-slate-300 dark:border-slate-600"} bg-white dark:bg-slate-800 text-slate-900 dark:text-white ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        {loading ? (
          <span className="flex items-center gap-2 text-slate-400">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Loading...
          </span>
        ) : (
          <span className={selected ? "" : "text-slate-400 dark:text-slate-500"}>
            {selected ? `${selected.name}${selected.isCurrent ? " (Current)" : ""}` : placeholder}
          </span>
        )}
        <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

      {open && !disabled && (
        <div className="absolute z-20 mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-lg overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-200 dark:border-slate-700">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm text-slate-900 dark:text-white outline-none placeholder:text-slate-400"
              placeholder="Search years..."
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {allowClear && (
              <button
                type="button"
                onClick={() => { onChange(""); setOpen(false); setSearch(""); }}
                className="w-full text-left px-3 py-2.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-500 dark:text-slate-400 flex items-center gap-2"
              >
                <X className="w-3.5 h-3.5" /> All
              </button>
            )}
            {filtered.length === 0 ? (
              <p className="px-3 py-3 text-xs text-slate-400 text-center">No academic years found</p>
            ) : (
              filtered.map((y) => (
                <button
                  key={y.id}
                  type="button"
                  onClick={() => { onChange(y.id); setOpen(false); setSearch(""); }}
                  className={`w-full text-left px-3 py-2.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${y.id === value ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium" : "text-slate-700 dark:text-slate-300"}`}
                >
                  {y.name}{y.isCurrent ? " (Current)" : ""}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
