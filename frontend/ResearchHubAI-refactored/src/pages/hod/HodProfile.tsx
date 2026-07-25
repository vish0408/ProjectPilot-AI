import { useEffect, useState } from "react";
import { Edit2, Save } from "lucide-react";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";
import { hodService } from "../../services/HodService";
import { HodProfileDto } from "../../types/Hod";

export default function HodProfile() {
  const [profile, setProfile] = useState<HodProfileDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<HodProfileDto>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    hodService.getProfile()
      .then(p => { setProfile(p); setForm(p); })
      .catch((e) => { if (e instanceof Error) setError(e.message); })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const updated = await hodService.updateProfile(form);
      setProfile(updated);
      setForm(updated);
      setEditing(false);
    } catch (e) { if (e instanceof Error) setError(e.message); }
    finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 mb-4">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-700 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-2xl font-bold">
            {profile?.fullName?.charAt(0) || "?"}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{profile?.fullName}</h2>
            <p className="text-cyan-100">Head of Department · {profile?.departmentName}</p>
            <p className="text-cyan-100 mt-0.5">{profile?.institution}</p>
            <div className="flex gap-2 mt-3">
              <Badge className="bg-white/20 text-white border-0">HOD</Badge>
            </div>
          </div>
          <button onClick={() => setEditing(!editing)}
            className="bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2 rounded-xl flex items-center gap-2">
            <Edit2 className="w-4 h-4" />{editing ? "Cancel" : "Edit"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <SectionHead title="Department Information" />
          {editing ? (
            <div className="flex flex-col gap-3 mt-3">
              {[{l:"Description",k:"description"},{l:"Contact Email",k:"contactEmail"},{l:"Location",k:"location"}].map(f => (
                <div key={f.k}>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{f.l}</label>
                  <input value={(form as any)[f.k] || ""} onChange={e => setForm({...form, [f.k]: e.target.value})}
                    className="w-full bg-input-background border border-border rounded-xl px-3 py-2 text-sm mt-1 outline-none focus:border-primary" />
                </div>
              ))}
              <button onClick={handleSave} disabled={saving}
                className="bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 w-fit disabled:opacity-50">
                <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              {[{l:"Name",v:profile?.fullName},{l:"Email",v:profile?.email},{l:"Department",v:profile?.departmentName},{l:"Institution",v:profile?.institution},{l:"Contact Email",v:profile?.contactEmail},{l:"Location",v:profile?.location}].map(f => (
                <div key={f.l}>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{f.l}</label>
                  <p className="text-sm font-medium text-foreground mt-1">{f.v || "—"}</p>
                </div>
              ))}
              {profile?.description && (
                <div className="col-span-full">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Description</label>
                  <p className="text-sm text-foreground mt-1">{profile.description}</p>
                </div>
              )}
            </div>
          )}
        </Card>
        <Card>
          <SectionHead title="Quick Info" />
          <div className="flex flex-col gap-3 mt-3">
            <div className="bg-muted/60 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-cyan-600">{profile?.departmentName || "—"}</p>
              <p className="text-xs text-muted-foreground">Department</p>
            </div>
            <div className="bg-muted/60 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-cyan-600">{profile?.institution || "—"}</p>
              <p className="text-xs text-muted-foreground">Institution</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
