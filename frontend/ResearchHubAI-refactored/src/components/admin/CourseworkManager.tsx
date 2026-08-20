import { useState, useEffect, useCallback } from "react";
import { Plus, Loader2, Pencil, Trash2, X, AlertCircle, GraduationCap } from "lucide-react";
import { adminService } from "../../services/AdminService";
import { useApp } from "../../context/AppContext";
import type { CourseworkResponse, CourseworkSummaryResponse, CreateCourseworkRequest, UpdateCourseworkRequest } from "../../types/Admin";

export const PHD_EXAM_TYPES = ["Written", "Practical", "Viva", "Assignment", "Other"];
export const PHD_EXAM_STATUSES = ["Not Scheduled", "Scheduled", "Appeared", "Result Pending", "Passed", "Failed"];

interface CourseworkManagerProps {
  studentUserId: string;
  readOnly?: boolean;
}

interface CourseworkForm {
  id: string;
  paperCode: string;
  paperName: string;
  credits: string;
  examType: string;
  examStatus: string;
  result: string;
  marks: string;
  grade: string;
  attemptDate: string;
  completedDate: string;
}

const emptyForm: CourseworkForm = {
  id: "",
  paperCode: "",
  paperName: "",
  credits: "",
  examType: "",
  examStatus: "",
  result: "",
  marks: "",
  grade: "",
  attemptDate: "",
  completedDate: "",
};

export default function CourseworkManager({ studentUserId, readOnly }: CourseworkManagerProps) {
  const { user } = useApp();
  const [coursework, setCoursework] = useState<CourseworkResponse[]>([]);
  const [summary, setSummary] = useState<CourseworkSummaryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<CourseworkForm>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<CourseworkResponse | null>(null);
  const [deleting, setDeleting] = useState(false);

  const isReadOnly = readOnly ?? user?.role === "student";

  const load = useCallback(async () => {
    if (!studentUserId) return;
    setLoading(true);
    setError(null);
    try {
      const [items, sum] = await Promise.all([
        adminService.getCoursework(studentUserId),
        adminService.getCourseworkSummary(studentUserId),
      ]);
      setCoursework(items || []);
      setSummary(sum);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load coursework");
    } finally {
      setLoading(false);
    }
  }, [studentUserId]);

  useEffect(() => {
    if (modalOpen) load();
  }, [modalOpen, load]);

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const openCreate = () => {
    setForm(emptyForm);
    setFieldErrors({});
    setModalOpen(true);
  };

  const openEdit = (c: CourseworkResponse) => {
    setForm({
      id: c.id,
      paperCode: c.paperCode,
      paperName: c.paperName,
      credits: String(c.credits ?? ""),
      examType: c.examType || "",
      examStatus: c.examStatus || "",
      result: c.result || "",
      marks: c.marks != null ? String(c.marks) : "",
      grade: c.grade || "",
      attemptDate: c.attemptDate ? c.attemptDate.slice(0, 10) : "",
      completedDate: c.completedDate ? c.completedDate.slice(0, 10) : "",
    });
    setFieldErrors({});
    setModalOpen(true);
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.paperCode.trim()) errors.paperCode = "Paper code is required";
    if (!form.paperName.trim()) errors.paperName = "Paper name is required";
    const credits = Number(form.credits);
    if (!form.credits || Number.isNaN(credits) || credits <= 0) errors.credits = "Enter a positive credit value";
    if (!form.examType) errors.examType = "Exam type is required";
    if (!form.examStatus) errors.examStatus = "Exam status is required";
    if (form.completedDate && form.attemptDate && form.completedDate < form.attemptDate) {
      errors.completedDate = "Completed date cannot be before attempt date";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        paperCode: form.paperCode.trim(),
        paperName: form.paperName.trim(),
        credits: Number(form.credits),
        examType: form.examType,
        examStatus: form.examStatus,
        result: form.result || undefined,
        marks: form.marks !== "" ? Number(form.marks) : undefined,
        grade: form.grade || undefined,
        attemptDate: form.attemptDate || undefined,
        completedDate: form.completedDate || undefined,
      };
      if (form.id) {
        await adminService.updateCoursework(studentUserId, form.id, payload as UpdateCourseworkRequest);
      } else {
        await adminService.createCoursework(studentUserId, payload as CreateCourseworkRequest);
      }
      setModalOpen(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Operation failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setError(null);
    try {
      await adminService.deleteCoursework(studentUserId, deleteTarget.id);
      setDeleteTarget(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const statusBadgeCls = (status: string) => {
    switch (status) {
      case "Passed": return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300";
      case "Failed": return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300";
      case "Result Pending": return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300";
      default: return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300";
    }
  };

  const inputCls = (hasError?: string) =>
    `w-full px-3 py-2.5 text-sm rounded-xl border ${hasError ? "border-red-400" : "border-slate-300 dark:border-slate-600"} bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/40 transition-all`;

  const progress = summary?.completionPercentage ?? 0;

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Earned Credits</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            {summary?.earnedCredits ?? 0}
            {summary?.requiredCredits != null && <span className="text-xs font-medium text-slate-400"> / {summary.requiredCredits}</span>}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Papers Passed</p>
          <p className="text-lg font-bold text-green-600 dark:text-green-400">{summary?.passedPapers ?? 0} / {summary?.totalPapers ?? 0}</p>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Pending</p>
          <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{summary?.pendingPapers ?? 0}</p>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Status</p>
          <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-1 leading-snug">{summary?.courseworkStatus ?? "—"}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
          <span className="font-medium">Coursework Completion</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500" style={{ width: `${Math.min(100, progress)}%` }} />
        </div>
      </div>

      {/* Header + Add button */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-blue-500" />
          Coursework Papers
        </h3>
        {!isReadOnly && (
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-lg shadow-blue-600/20 touch-target"
          >
            <Plus className="w-3.5 h-3.5" /> Add Paper
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-8 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : coursework.length === 0 ? (
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-8">No coursework papers recorded yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2.5 font-semibold">Code</th>
                <th className="px-3 py-2.5 font-semibold">Paper</th>
                <th className="px-3 py-2.5 font-semibold">Credits</th>
                <th className="px-3 py-2.5 font-semibold">Type</th>
                <th className="px-3 py-2.5 font-semibold">Status</th>
                <th className="px-3 py-2.5 font-semibold">Marks / Grade</th>
                <th className="px-3 py-2.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {coursework.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-3 py-2.5 font-mono text-[11px] text-slate-600 dark:text-slate-300">{c.paperCode}</td>
                  <td className="px-3 py-2.5 font-medium text-slate-800 dark:text-slate-200">{c.paperName}</td>
                  <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300">{c.credits}</td>
                  <td className="px-3 py-2.5 text-slate-500 dark:text-slate-400">{c.examType}</td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusBadgeCls(c.examStatus)}`}>{c.examStatus}</span>
                  </td>
                  <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300">
                    {c.marks != null ? c.marks : "—"}
                    {c.grade ? ` (${c.grade})` : ""}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    {!isReadOnly && (
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 transition-colors" title="Edit">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setDeleteTarget(c)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors" title="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-[95%] sm:w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/10 animate-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-white dark:bg-slate-900 z-10 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-slate-700 rounded-t-2xl">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {form.id ? "Edit Coursework Paper" : "Add Coursework Paper"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Paper Code <span className="text-red-500">*</span></label>
                  <input value={form.paperCode} onChange={(e) => update("paperCode", e.target.value)} className={inputCls(fieldErrors.paperCode)} placeholder="e.g. PHY-101" />
                  {fieldErrors.paperCode && <p className="text-xs text-red-500 mt-1">{fieldErrors.paperCode}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Paper Name <span className="text-red-500">*</span></label>
                  <input value={form.paperName} onChange={(e) => update("paperName", e.target.value)} className={inputCls(fieldErrors.paperName)} placeholder="e.g. Research Methodology" />
                  {fieldErrors.paperName && <p className="text-xs text-red-500 mt-1">{fieldErrors.paperName}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Credits <span className="text-red-500">*</span></label>
                  <input type="number" min={1} value={form.credits} onChange={(e) => update("credits", e.target.value)} className={inputCls(fieldErrors.credits)} placeholder="e.g. 4" />
                  {fieldErrors.credits && <p className="text-xs text-red-500 mt-1">{fieldErrors.credits}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Exam Type <span className="text-red-500">*</span></label>
                  <select value={form.examType} onChange={(e) => update("examType", e.target.value)} className={inputCls(fieldErrors.examType)}>
                    <option value="">Select type...</option>
                    {PHD_EXAM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {fieldErrors.examType && <p className="text-xs text-red-500 mt-1">{fieldErrors.examType}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Exam Status <span className="text-red-500">*</span></label>
                  <select value={form.examStatus} onChange={(e) => update("examStatus", e.target.value)} className={inputCls(fieldErrors.examStatus)}>
                    <option value="">Select status...</option>
                    {PHD_EXAM_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {fieldErrors.examStatus && <p className="text-xs text-red-500 mt-1">{fieldErrors.examStatus}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Result</label>
                  <select value={form.result} onChange={(e) => update("result", e.target.value)} className={inputCls()}>
                    <option value="">Not set</option>
                    <option value="Passed">Passed</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Marks</label>
                  <input type="number" min={0} step="0.01" value={form.marks} onChange={(e) => update("marks", e.target.value)} className={inputCls()} placeholder="e.g. 85" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Grade</label>
                  <input value={form.grade} onChange={(e) => update("grade", e.target.value)} className={inputCls()} placeholder="e.g. A+" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Attempt Date</label>
                  <input type="date" value={form.attemptDate} onChange={(e) => update("attemptDate", e.target.value)} className={inputCls()} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Completed Date</label>
                  <input type="date" value={form.completedDate} onChange={(e) => update("completedDate", e.target.value)} className={inputCls(fieldErrors.completedDate)} />
                  {fieldErrors.completedDate && <p className="text-xs text-red-500 mt-1">{fieldErrors.completedDate}</p>}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2.5 text-sm font-medium rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="px-6 py-2.5 text-sm font-bold rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? "Saving..." : form.id ? "Update Paper" : "Add Paper"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-[95%] sm:w-full max-w-md border border-white/10 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Delete Paper</h2>
              <button onClick={() => setDeleteTarget(null)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 sm:p-6">
              <p className="text-xs text-slate-500 mb-5">
                Are you sure you want to delete <span className="font-bold text-slate-700 dark:text-slate-300">{deleteTarget.paperName} ({deleteTarget.paperCode})</span>? This action cannot be undone.
              </p>
              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 justify-end">
                <button onClick={() => setDeleteTarget(null)} className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  Cancel
                </button>
                <button onClick={handleDelete} disabled={deleting} className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-600/20">
                  {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
