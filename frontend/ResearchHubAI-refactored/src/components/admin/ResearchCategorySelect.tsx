import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Loader2, Search, X } from "lucide-react";
import { adminService } from "../../services/AdminService";
import type { ResearchCategory } from "../../types/Hod";

interface ResearchCategorySelectProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  allowClear?: boolean;
  placeholder?: string;
}

export default function ResearchCategorySelect({
  value,
  onChange,
  label = "Category",
  required,
  error,
  disabled,
  allowClear = false,
  placeholder = "Search or select category...",
}: ResearchCategorySelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<ResearchCategory[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (disabled) return;
    setLoading(true);
    adminService.getResearchCategories()
      .then((data) => {
        const active = (data || []).filter((c) => c.isActive);
        setCategories(active.length > 0 ? active : data || []);
      })
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, [disabled]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = categories.find((c) => c.id === value);

  const grouped = useMemo(() => {
    const term = search.trim().toLowerCase();
    const filtered = term
      ? categories.filter((c) =>
          c.name.toLowerCase().includes(term) ||
          (c.disciplineGroup || "").toLowerCase().includes(term) ||
          (c.code || "").toLowerCase().includes(term))
      : categories;

    const groups = new Map<string, ResearchCategory[]>();
    for (const c of filtered) {
      const key = c.disciplineGroup || "Other";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(c);
    }
    return Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [categories, search]);

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
            {selected ? selected.name : placeholder}
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
              placeholder="Search categories..."
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {allowClear && (
              <button
                type="button"
                onClick={() => { onChange(""); setOpen(false); setSearch(""); }}
                className="w-full text-left px-3 py-2.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-500 dark:text-slate-400 flex items-center gap-2"
              >
                <X className="w-3.5 h-3.5" /> All
              </button>
            )}
            {grouped.length === 0 ? (
              <p className="px-3 py-3 text-xs text-slate-400 text-center">No categories found</p>
            ) : (
              grouped.map(([group, items]) => (
                <div key={group}>
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-700/50 sticky top-0">
                    {group}
                  </div>
                  {items.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => { onChange(c.id); setOpen(false); setSearch(""); }}
                      className={`w-full text-left px-3 py-2.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${c.id === value ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium" : "text-slate-700 dark:text-slate-300"}`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
