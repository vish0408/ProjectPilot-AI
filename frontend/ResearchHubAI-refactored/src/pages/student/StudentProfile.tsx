import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";
import { studentService } from "../../services/StudentService";
import { referenceDataService } from "../../services/ReferenceDataService";
import { StudentProfileDto } from "../../types/Student";
import type { CollegeResponse, DepartmentResponse } from "../../types/Admin";

export default function StudentProfile() {
  const [profile, setProfile] = useState<StudentProfileDto | null>(null);
  const [colleges, setColleges] = useState<CollegeResponse[]>([]);
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCollegeId, setSelectedCollegeId] = useState("");

  useEffect(() => {
    Promise.all([
      studentService.getProfile(),
      referenceDataService.getColleges().catch(() => []),
    ]).then(([prof, colls]) => {
      setProfile(prof);
      setColleges(colls);
      const matchedCollege = colls.find(c => c.name === prof.institution);
      if (matchedCollege) {
        setSelectedCollegeId(matchedCollege.id);
        referenceDataService.getDepartments(matchedCollege.id)
          .then(setDepartments)
          .catch(() => {});
      }
    }).catch((e) => { if (e instanceof Error) setError(e.message); })
    .finally(() => setLoading(false));
  }, []);

  const handleCollegeChange = (collegeId: string) => {
    setSelectedCollegeId(collegeId);
    const college = colleges.find(c => c.id === collegeId);
    setProfile(profile ? { ...profile, institution: college?.name || "", department: "" } : null);
    setDepartments([]);
    if (collegeId) {
      referenceDataService.getDepartments(collegeId)
        .then(setDepartments)
        .catch(() => {});
    }
  };

  const handleDepartmentChange = (deptName: string) => {
    setProfile(profile ? { ...profile, department: deptName } : null);
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const updated = await studentService.updateProfile({
        enrollment: profile.enrollment,
        department: profile.department,
        institution: profile.institution,
        researchTopic: profile.researchTopic,
      });
      setProfile(updated);
    } catch (e) { if (e instanceof Error) setError(e.message); }
    finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 mb-4">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xl font-bold text-white">
          {profile?.fullName?.charAt(0) || "?"}
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">{profile?.fullName || "Student"}</h1>
          <p className="text-sm text-muted-foreground">{profile?.email}</p>
        </div>
      </div>

      <Card>
        <SectionHead title="Academic Information" />
        <div className="flex flex-col gap-4 mt-3">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Enrollment Number</label>
            <input value={profile?.enrollment || ""} onChange={(e) => setProfile(profile ? { ...profile, enrollment: e.target.value } : null)}
              className="w-full bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">College / University</label>
            <select value={selectedCollegeId} onChange={e => handleCollegeChange(e.target.value)}
              className="w-full bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary">
              <option value="">Select College</option>
              {colleges.filter(c => c.isActive).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Department</label>
            <select value={profile?.department || ""} onChange={e => handleDepartmentChange(e.target.value)}
              className="w-full bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary" disabled={!selectedCollegeId}>
              <option value="">{selectedCollegeId ? "Select Department" : "Select a college first"}</option>
              {departments.filter(d => d.isActive).map(d => <option key={d.id} value={d.departmentName}>{d.departmentName} ({d.departmentCode})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Research Topic</label>
            <input value={profile?.researchTopic || ""} onChange={(e) => setProfile(profile ? { ...profile, researchTopic: e.target.value } : null)}
              className="w-full bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Guide</label>
            <input value={profile?.guideName || "Not assigned"} disabled
              className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm text-muted-foreground outline-none" />
          </div>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all disabled:opacity-50">
            <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </Card>
    </div>
  );
}
