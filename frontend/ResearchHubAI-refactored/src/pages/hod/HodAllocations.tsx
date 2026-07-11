import { useEffect, useState } from "react";
import { ClipboardList, Plus, Trash2 } from "lucide-react";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";
import { hodService } from "../../services/HodService";
import { ProjectAllocation } from "../../types/Hod";

export default function HodAllocations() {
  const [allocations, setAllocations] = useState<ProjectAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ studentId: "", guideId: "", remarks: "" });

  const fetch = async () => {
    try {
      const data = await hodService.getAllocations();
      setAllocations(data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleCreate = async () => {
    try {
      await hodService.createAllocation(form);
      setShowForm(false);
      setForm({ studentId: "", guideId: "", remarks: "" });
      fetch();
    } catch {}
  };

  const handleRevoke = async (id: string) => {
    await hodService.revokeAllocation(id);
    fetch();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Project Allocations</h2>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-blue-700">
          <Plus className="w-4 h-4" /> New Allocation
        </button>
      </div>

      {showForm && (
        <Card>
          <SectionHead title="Create Allocation" />
          <div className="flex flex-col gap-3 mt-3">
            <input value={form.studentId} onChange={e => setForm({...form, studentId: e.target.value})} placeholder="Student User ID"
              className="bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary" />
            <input value={form.guideId} onChange={e => setForm({...form, guideId: e.target.value})} placeholder="Guide User ID"
              className="bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary" />
            <input value={form.remarks} onChange={e => setForm({...form, remarks: e.target.value})} placeholder="Remarks"
              className="bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary" />
            <div className="flex gap-2">
              <button onClick={handleCreate}
                className="bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-blue-700">Create</button>
              <button onClick={() => setShowForm(false)}
                className="border border-border text-sm px-4 py-2 rounded-xl hover:bg-muted">Cancel</button>
            </div>
          </div>
        </Card>
      )}

      <Card p={false}>
        <div className="flex flex-col">
          {allocations.map((a) => (
            <div key={a.id} className="flex items-center gap-4 px-5 py-4 border-b border-border last:border-0 hover:bg-muted/40">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-5 gap-2">
                <div><p className="text-xs text-muted-foreground">Student</p><p className="text-sm font-medium text-foreground">{a.studentName}</p></div>
                <div><p className="text-xs text-muted-foreground">Guide</p><p className="text-sm font-medium text-foreground">{a.guideName}</p></div>
                <div><p className="text-xs text-muted-foreground">Project</p><p className="text-sm font-medium text-foreground">{a.projectTitle || "-"}</p></div>
                <div><p className="text-xs text-muted-foreground">Status</p><Badge variant={a.status === "Active" ? "success" : "outline"}>{a.status}</Badge></div>
                <div><p className="text-xs text-muted-foreground">Allocated By</p><p className="text-sm font-medium text-foreground">{a.allocatedByName}</p></div>
              </div>
              {a.status === "Active" && (
                <button onClick={() => handleRevoke(a.id)} className="text-red-500 hover:text-red-700 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          {!allocations.length && <p className="text-sm text-muted-foreground text-center py-8">No allocations found</p>}
        </div>
      </Card>
    </div>
  );
}
