import { useEffect, useState } from "react";
import { Edit2, Save } from "lucide-react";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";
import { guideService } from "../../services/GuideService";
import { GuideProfileDto } from "../../types/Guide";

export default function GuideProfile() {
  const [profile, setProfile] = useState<GuideProfileDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<GuideProfileDto>>({});

  useEffect(() => {
    guideService.getProfile()
      .then(p => { setProfile(p); setForm(p); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const updated = await guideService.updateProfile(form);
      setProfile(updated);
      setForm(updated);
      setEditing(false);
    } catch {}
    finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-gradient-to-r from-indigo-600 to-violet-700 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-2xl font-bold">
            {profile?.fullName?.charAt(0) || "?"}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{profile?.fullName}</h2>
            <p className="text-indigo-100">{profile?.designation} · {profile?.department}</p>
            <p className="text-indigo-100 mt-0.5">{profile?.institution}</p>
            <div className="flex gap-2 mt-3">
              <Badge className="bg-white/20 text-white border-0">Research Guide</Badge>
              {profile?.isAvailable && <Badge className="bg-green-400/30 text-white border-0">Available</Badge>}
            </div>
          </div>
          <button onClick={() => setEditing(!editing)}
            className="bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2 rounded-xl flex items-center gap-2">
            <Edit2 className="w-4 h-4"/>{editing ? "Cancel" : "Edit"}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <SectionHead title="Professional Information"/>
          {editing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              {[
                {l:"Bio",k:"bio",w:"full"},
                {l:"Department",k:"department"},
                {l:"Institution",k:"institution"},
                {l:"Specialization",k:"specialization"},
                {l:"Designation",k:"designation"},
              ].map(f => (
                <div key={f.k} className={f.w === "full" ? "col-span-full" : ""}>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{f.l}</label>
                  {f.w === "full" ? (
                    <textarea value={(form as any)[f.k] || ""} onChange={e => setForm({...form, [f.k]: e.target.value})}
                      className="w-full bg-input-background border border-border rounded-xl px-3 py-2 text-sm mt-1 outline-none focus:border-primary min-h-[80px]" />
                  ) : (
                    <input value={(form as any)[f.k] || ""} onChange={e => setForm({...form, [f.k]: e.target.value})}
                      className="w-full bg-input-background border border-border rounded-xl px-3 py-2 text-sm mt-1 outline-none focus:border-primary" />
                  )}
                </div>
              ))}
              <div className="col-span-full flex items-center gap-2">
                <input type="checkbox" checked={form.isAvailable ?? true} onChange={e => setForm({...form, isAvailable: e.target.checked})} id="avail" />
                <label htmlFor="avail" className="text-sm text-foreground">Available for new students</label>
              </div>
              <div className="col-span-full">
                <button onClick={handleSave} disabled={saving}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 disabled:opacity-50">
                  <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              {[
                {l:"Name",v:profile?.fullName},
                {l:"Email",v:profile?.email},
                {l:"Department",v:profile?.department},
                {l:"Institution",v:profile?.institution},
                {l:"Designation",v:profile?.designation},
                {l:"Specialization",v:profile?.specialization},
              ].map(f => (
                <div key={f.l}>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{f.l}</label>
                  <p className="text-sm font-medium text-foreground mt-1">{f.v || "—"}</p>
                </div>
              ))}
              {profile?.bio && (
                <div className="col-span-full">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Bio</label>
                  <p className="text-sm text-foreground mt-1">{profile.bio}</p>
                </div>
              )}
            </div>
          )}
        </Card>
        <Card>
          <SectionHead title="Supervision Stats"/>
          <div className="grid grid-cols-2 gap-3">
            {[
              {v:"Active",l:"Status"},
              {v:profile?.isAvailable ? "Available" : "Unavailable",l:"Availability"},
            ].map(s => (
              <div key={s.l} className="bg-muted/60 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-indigo-600">{s.v}</p>
                <p className="text-xs text-muted-foreground">{s.l}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
