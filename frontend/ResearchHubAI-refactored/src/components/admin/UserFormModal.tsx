import { useState, useEffect, useRef, useCallback } from "react";
import { X, Loader2, AlertCircle, Check, ChevronDown, Search } from "lucide-react";
import { adminService } from "../../services/AdminService";
import type { UserResponse, CreateUserRequest, UpdateUserRequest, RoleResponse, CollegeResponse, DepartmentResponse } from "../../types/Admin";

interface UserFormModalProps {
  open: boolean;
  user: UserResponse | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function UserFormModal({ open, user, onClose, onSaved }: UserFormModalProps) {
  const isEdit = !!user;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [colleges, setColleges] = useState<CollegeResponse[]>([]);
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const overlayRef = useRef<HTMLDivElement>(null);

  const [collegeSearch, setCollegeSearch] = useState("");
  const [deptSearch, setDeptSearch] = useState("");
  const [collegeOpen, setCollegeOpen] = useState(false);
  const [deptOpen, setDeptOpen] = useState(false);
  const collegeRef = useRef<HTMLDivElement>(null);
  const deptRef = useRef<HTMLDivElement>(null);
  const collegeInputRef = useRef<HTMLInputElement>(null);
  const deptInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    employeeId: "",
    roleId: "",
    collegeId: "",
    departmentId: "",
    designation: "",
    isActive: true,
    sendWelcomeEmail: false,
  });

  useEffect(() => {
    if (!open) return;
    adminService.getRoles().then(setRoles).catch(() => {});
    adminService.getColleges().then(setColleges).catch(() => {});

    if (user) {
      setForm({
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber || "",
        employeeId: user.employeeId || "",
        roleId: user.roleId,
        collegeId: user.collegeId || "",
        departmentId: user.departmentId || "",
        designation: user.designation || "",
        isActive: user.isActive,
        sendWelcomeEmail: false,
      });
      if (user.collegeId) loadDepartments(user.collegeId);
    } else {
      setForm({
        fullName: "",
        email: "",
        phoneNumber: "",
        employeeId: "",
        roleId: "",
        collegeId: "",
        departmentId: "",
        designation: "",
        isActive: true,
        sendWelcomeEmail: false,
      });
      setDepartments([]);
    }
    setError(null);
    setSuccess(null);
    setFieldErrors({});
    setCollegeSearch("");
    setDeptSearch("");
  }, [open, user]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (collegeRef.current && !collegeRef.current.contains(e.target as Node)) setCollegeOpen(false);
      if (deptRef.current && !deptRef.current.contains(e.target as Node)) setDeptOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadDepartments = useCallback(async (collegeId: string) => {
    if (!collegeId) return;
    setDepartmentsLoading(true);
    try {
      const deps = await adminService.getAllDepartments(collegeId);
      setDepartments(deps);
    } catch {
      setDepartments([]);
    } finally {
      setDepartmentsLoading(false);
    }
  }, []);

  const update = (field: string, value: unknown) => setForm((prev) => ({ ...prev, [field]: value }));

  const selectedRole = roles.find((r) => r.id === form.roleId);
  const roleName = selectedRole?.name.toLowerCase() ?? "";
  const isSuperAdminRole = roleName === "superadmin";
  const isAdminRole = roleName === "collegeadmin";
  const isStudentRole = roleName === "student";
  const isGuideRole = roleName === "guide";
  const isHodRole = roleName === "hod";

  const showCollege = !isSuperAdminRole;
  const showDepartment = isStudentRole || isGuideRole || isHodRole;
  const requireCollege = isStudentRole || isGuideRole || isHodRole || isAdminRole;
  const requireDepartment = isStudentRole || isGuideRole || isHodRole;

  const selectedCollege = colleges.find((c) => c.id === form.collegeId);
  const selectedDepartment = departments.find((d) => d.id === form.departmentId);

  const filteredColleges = colleges.filter((c) =>
    c.name.toLowerCase().includes(collegeSearch.toLowerCase())
  );

  const filteredDepartments = departments.filter((d) =>
    d.departmentName.toLowerCase().includes(deptSearch.toLowerCase())
  );

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.fullName.trim()) errors.fullName = "Full name is required";
    if (!form.email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Invalid email format";
    if (form.phoneNumber && !/^\+?[\d\s\-()]{7,20}$/.test(form.phoneNumber)) errors.phoneNumber = "Invalid phone number";
    if (!form.roleId) errors.roleId = "Role is required";
    if (requireCollege && !form.collegeId) errors.collegeId = "Please select a college.";
    if (requireDepartment && !form.departmentId) errors.departmentId = "Please select a department.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setError(null);
    try {
      if (isEdit) {
        const data: UpdateUserRequest = {
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          isActive: form.isActive,
          roleId: form.roleId,
          collegeId: form.collegeId || undefined,
          departmentId: form.departmentId || undefined,
          phoneNumber: form.phoneNumber || undefined,
          employeeId: form.employeeId || undefined,
          designation: form.designation || undefined,
        };
        await adminService.updateUser(user!.id, data);
        setSuccess("User updated successfully");
        setTimeout(() => { onSaved(); onClose(); }, 800);
      } else {
        const data: CreateUserRequest = {
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          roleId: form.roleId,
          collegeId: form.collegeId || undefined,
          departmentId: form.departmentId || undefined,
          isActive: form.isActive,
          phoneNumber: form.phoneNumber || undefined,
          employeeId: form.employeeId || undefined,
          designation: form.designation || undefined,
        };
        const createdUser = await adminService.createUser(data);
        setSuccess(`User "${createdUser.fullName}" created successfully! An activation email has been sent to ${createdUser.email}.`);
        setTimeout(() => { onSaved(); onClose(); }, 1500);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Operation failed");
    } finally {
      setSaving(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  };

  const handleCollegeSelect = (collegeId: string) => {
    setForm((prev) => ({ ...prev, collegeId, departmentId: "" }));
    setCollegeOpen(false);
    setCollegeSearch("");
    setDeptSearch("");
    setDepartments([]);
    setFieldErrors((prev) => ({ ...prev, collegeId: "", departmentId: "" }));
    loadDepartments(collegeId);
  };

  const handleDepartmentSelect = (departmentId: string) => {
    setForm((prev) => ({ ...prev, departmentId }));
    setDeptOpen(false);
    setDeptSearch("");
    setFieldErrors((prev) => ({ ...prev, departmentId: "" }));
  };

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/10 animate-in zoom-in-95 duration-200">
        <div className="sticky top-0 bg-white dark:bg-slate-900 z-10 flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 rounded-t-2xl">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {isEdit ? "Edit User" : "Add User"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
              <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
              <p className="text-xs text-green-600 dark:text-green-400">{success}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Full Name <span className="text-red-500">*</span></label>
              <input
                value={form.fullName}
                onChange={(e) => update("fullName", e.target.value)}
                className={`w-full px-3 py-2.5 text-sm rounded-xl border ${fieldErrors.fullName ? "border-red-400" : "border-slate-300 dark:border-slate-600"} bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/40 transition-all`}
                placeholder="Enter full name"
              />
              {fieldErrors.fullName && <p className="text-xs text-red-500 mt-1">{fieldErrors.fullName}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email <span className="text-red-500">*</span></label>
              <input
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className={`w-full px-3 py-2.5 text-sm rounded-xl border ${fieldErrors.email ? "border-red-400" : "border-slate-300 dark:border-slate-600"} bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/40 transition-all`}
                placeholder="user@institution.edu"
              />
              {fieldErrors.email && <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Phone Number</label>
              <input
                value={form.phoneNumber}
                onChange={(e) => update("phoneNumber", e.target.value)}
                className={`w-full px-3 py-2.5 text-sm rounded-xl border ${fieldErrors.phoneNumber ? "border-red-400" : "border-slate-300 dark:border-slate-600"} bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/40 transition-all`}
                placeholder="+1 (555) 123-4567"
              />
              {fieldErrors.phoneNumber && <p className="text-xs text-red-500 mt-1">{fieldErrors.phoneNumber}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Employee / Student ID</label>
              <input
                value={form.employeeId}
                onChange={(e) => update("employeeId", e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                placeholder="EMP-001 or STU-2024-001"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Role <span className="text-red-500">*</span></label>
              <select
                value={form.roleId}
                onChange={(e) => update("roleId", e.target.value)}
                className={`w-full px-3 py-2.5 text-sm rounded-xl border ${fieldErrors.roleId ? "border-red-400" : "border-slate-300 dark:border-slate-600"} bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/40 transition-all`}
              >
                <option value="">Select role...</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
              {fieldErrors.roleId && <p className="text-xs text-red-500 mt-1">{fieldErrors.roleId}</p>}
            </div>

            {/* College - shown for all except SuperAdmin */}
            {showCollege && (
              <div ref={collegeRef} className="relative">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  College {requireCollege && <span className="text-red-500">*</span>}
                </label>
                <div
                  onClick={() => { setCollegeOpen((o) => !o); setTimeout(() => collegeInputRef.current?.focus(), 50); }}
                  className={`w-full px-3 py-2.5 text-sm rounded-xl border cursor-pointer flex items-center justify-between ${fieldErrors.collegeId ? "border-red-400" : "border-slate-300 dark:border-slate-600"} bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-all`}
                >
                  <span className={selectedCollege ? "" : "text-slate-400 dark:text-slate-500"}>
                    {selectedCollege ? selectedCollege.name : "Select a college..."}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                </div>
                {fieldErrors.collegeId && <p className="text-xs text-red-500 mt-1">{fieldErrors.collegeId}</p>}

                {collegeOpen && (
                  <div className="absolute z-20 mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-lg overflow-hidden">
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-200 dark:border-slate-700">
                      <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <input
                        ref={collegeInputRef}
                        value={collegeSearch}
                        onChange={(e) => setCollegeSearch(e.target.value)}
                        className="w-full bg-transparent text-sm text-slate-900 dark:text-white outline-none placeholder:text-slate-400"
                        placeholder="Search colleges..."
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {filteredColleges.length === 0 ? (
                        <p className="px-3 py-3 text-xs text-slate-400 text-center">No colleges found</p>
                      ) : (
                        filteredColleges.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => handleCollegeSelect(c.id)}
                            className={`w-full text-left px-3 py-2.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${c.id === form.collegeId ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium" : "text-slate-700 dark:text-slate-300"}`}
                          >
                            {c.name}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Department - shown for Student, Guide, HOD */}
            {showDepartment && (
              <div ref={deptRef} className="relative">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Department {requireDepartment && <span className="text-red-500">*</span>}
                </label>
                <div
                  onClick={() => {
                    if (!form.collegeId) return;
                    setDeptOpen((o) => !o);
                    setTimeout(() => deptInputRef.current?.focus(), 50);
                  }}
                  className={`w-full px-3 py-2.5 text-sm rounded-xl border cursor-pointer flex items-center justify-between ${!form.collegeId ? "bg-slate-100 dark:bg-slate-800/50 cursor-not-allowed" : ""} ${fieldErrors.departmentId ? "border-red-400" : "border-slate-300 dark:border-slate-600"} bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-all`}
                >
                  {departmentsLoading ? (
                    <span className="flex items-center gap-2 text-slate-400">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Loading departments...
                    </span>
                  ) : (
                    <span className={selectedDepartment ? "" : "text-slate-400 dark:text-slate-500"}>
                      {selectedDepartment
                        ? selectedDepartment.departmentName
                        : !form.collegeId
                          ? "Select a college first"
                          : "Select a department..."}
                    </span>
                  )}
                  <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                </div>
                {fieldErrors.departmentId && <p className="text-xs text-red-500 mt-1">{fieldErrors.departmentId}</p>}

                {deptOpen && form.collegeId && !departmentsLoading && (
                  <div className="absolute z-20 mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-lg overflow-hidden">
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-200 dark:border-slate-700">
                      <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <input
                        ref={deptInputRef}
                        value={deptSearch}
                        onChange={(e) => setDeptSearch(e.target.value)}
                        className="w-full bg-transparent text-sm text-slate-900 dark:text-white outline-none placeholder:text-slate-400"
                        placeholder="Search departments..."
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {filteredDepartments.length === 0 ? (
                        <p className="px-3 py-3 text-xs text-slate-400 text-center">No departments found</p>
                      ) : (
                        filteredDepartments.map((d) => (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => handleDepartmentSelect(d.id)}
                            className={`w-full text-left px-3 py-2.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${d.id === form.departmentId ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium" : "text-slate-700 dark:text-slate-300"}`}
                          >
                            {d.departmentName}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {isGuideRole && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Designation</label>
                <input
                  value={form.designation}
                  onChange={(e) => update("designation", e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                  placeholder="Professor / Associate Professor"
                />
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-200 dark:border-slate-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => update("isActive", e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Active</span>
            </label>
            <span className="text-xs text-slate-400 dark:text-slate-500">An activation email will be sent automatically upon creation.</span>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 text-sm font-bold rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? "Saving..." : isEdit ? "Update User" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}