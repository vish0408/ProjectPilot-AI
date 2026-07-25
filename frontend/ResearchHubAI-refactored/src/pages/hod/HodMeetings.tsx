import { useEffect, useState } from "react";
import { Calendar, Clock, Plus, Eye, Edit2, Trash2, X, MapPin, Users, FileText } from "lucide-react";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";
import Pagination from "../../components/common/Pagination";
import { hodService } from "../../services/HodService";
import { HodMeeting, MeetingParticipant } from "../../types/Hod";
import type { PagedResponse } from "../../types/Pagination";

const statusVariant: Record<string, "info" | "success" | "danger"> = {
  Scheduled: "info",
  Completed: "success",
  Cancelled: "danger",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit",
  });
}

function emptyForm() {
  return {
    title: "",
    description: "",
    scheduledAt: "",
    durationMinutes: 30,
    agenda: "",
    meetingLink: "",
    participantIds: "",
  };
}

type ModalMode = "create" | "edit" | "view" | null;

export default function HodMeetings() {
  const [response, setResponse] = useState<PagedResponse<HodMeeting> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<HodMeeting | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const fetch = async (page?: number, size?: number) => {
    try {
      setLoading(true);
      const data = await hodService.getMeetings(page ?? pageNumber, size ?? pageSize);
      setResponse(data);
      setError(null);
    } catch (e) {
      if (e instanceof Error) setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const openCreate = () => {
    setForm(emptyForm());
    setSelectedMeeting(null);
    setModalMode("create");
  };

  const openEdit = (m: HodMeeting) => {
    setSelectedMeeting(m);
    setForm({
      title: m.title,
      description: m.description,
      scheduledAt: m.scheduledAt.slice(0, 16),
      durationMinutes: m.durationMinutes,
      agenda: m.agenda,
      meetingLink: m.meetingLink ?? "",
      participantIds: m.participants.map((p) => p.userId).join(", "),
    });
    setModalMode("edit");
  };

  const openView = async (m: HodMeeting) => {
    setSelectedMeeting(m);
    setModalMode("view");
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedMeeting(null);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const participantIds = form.participantIds
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      if (modalMode === "create") {
        await hodService.createMeeting({
          title: form.title,
          description: form.description || undefined,
          scheduledAt: new Date(form.scheduledAt).toISOString(),
          durationMinutes: form.durationMinutes,
          agenda: form.agenda || undefined,
          meetingLink: form.meetingLink || undefined,
          participantIds,
        });
      } else if (modalMode === "edit" && selectedMeeting) {
        await hodService.updateMeeting(selectedMeeting.id, {
          title: form.title,
          description: form.description,
          scheduledAt: new Date(form.scheduledAt).toISOString(),
          durationMinutes: form.durationMinutes,
          agenda: form.agenda,
          meetingLink: form.meetingLink || null,
        });
      }
      closeModal();
      fetch();
    } catch (e) {
      if (e instanceof Error) setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await hodService.deleteMeeting(id);
      fetch();
    } catch (e) {
      if (e instanceof Error) setError(e.message);
    }
  };

  const handlePageChange = (page: number) => {
    setPageNumber(page);
    fetch(page, pageSize);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPageNumber(1);
    fetch(1, size);
  };

  if (loading && !response) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const meetings = response?.items ?? [];

  return (
    <div className="flex flex-col gap-5">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Meetings</h2>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Schedule Meeting
        </button>
      </div>

      <Card p={false}>
        <div className="flex flex-col">
          {meetings.map((m) => (
            <div key={m.id} className="flex items-center gap-4 px-5 py-4 border-b border-border last:border-0 hover:bg-muted/40">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-6 gap-3">
                <div className="sm:col-span-2">
                  <p className="text-xs text-muted-foreground">Title</p>
                  <p className="text-sm font-medium text-foreground truncate">{m.title}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Guide</p>
                  <p className="text-sm font-medium text-foreground">{m.guideName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Date / Time</p>
                  <p className="text-sm text-foreground">{formatDate(m.scheduledAt)} {formatTime(m.scheduledAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="text-sm text-foreground">{m.durationMinutes} min</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge variant={statusVariant[m.status] ?? "default"}>{m.status}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => openView(m)}
                  className="p-1.5 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
                  title="View">
                  <Eye className="w-4 h-4" />
                </button>
                {m.status === "Scheduled" && (
                  <>
                    <button onClick={() => openEdit(m)}
                      className="p-1.5 text-muted-foreground hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-lg transition-colors"
                      title="Edit">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(m.id)}
                      className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                      title="Cancel / Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
          {!meetings.length && (
            <p className="text-sm text-muted-foreground text-center py-8">No meetings scheduled</p>
          )}
        </div>
        {response && response.totalPages > 1 && (
          <Pagination
            pageNumber={response.pageNumber}
            totalPages={response.totalPages}
            totalCount={response.totalCount}
            hasNextPage={response.hasNextPage}
            hasPreviousPage={response.hasPreviousPage}
            onPageChange={handlePageChange}
            pageSize={pageSize}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </Card>

      {/* Create / Edit Modal */}
      {(modalMode === "create" || modalMode === "edit") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <SectionHead title={modalMode === "create" ? "Schedule Meeting" : "Edit Meeting"} />
              <button onClick={closeModal} className="p-1 text-muted-foreground hover:text-foreground rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Meeting Title"
                className="bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary" />
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Description" rows={3}
                className="bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary resize-none" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Scheduled Date & Time</label>
                  <input type="datetime-local" value={form.scheduledAt}
                    onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                    className="w-full bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Duration (minutes)</label>
                  <input type="number" value={form.durationMinutes}
                    onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })} min={1}
                    className="w-full bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary" />
                </div>
              </div>
              <textarea value={form.agenda} onChange={(e) => setForm({ ...form, agenda: e.target.value })}
                placeholder="Agenda" rows={3}
                className="bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary resize-none" />
              <input value={form.meetingLink} onChange={(e) => setForm({ ...form, meetingLink: e.target.value })}
                placeholder="Meeting Link (optional)"
                className="bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary" />
              <input value={form.participantIds} onChange={(e) => setForm({ ...form, participantIds: e.target.value })}
                placeholder="Participant User IDs (comma separated)"
                className="bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary" />
              {form.participantIds && (
                <div className="flex flex-wrap gap-1">
                  {form.participantIds.split(",").map((s, i) => {
                    const id = s.trim();
                    return id ? <Badge key={i} variant="outline">{id}</Badge> : null;
                  })}
                </div>
              )}
              <div className="flex gap-2 mt-2">
                <button onClick={handleSave} disabled={saving || !form.title || !form.scheduledAt}
                  className="bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                  {saving ? "Saving..." : modalMode === "create" ? "Schedule" : "Save Changes"}
                </button>
                <button onClick={closeModal}
                  className="border border-border text-sm px-4 py-2 rounded-xl hover:bg-muted">Cancel</button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* View Detail Modal */}
      {modalMode === "view" && selectedMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <SectionHead title="Meeting Details" />
              <button onClick={closeModal} className="p-1 text-muted-foreground hover:text-foreground rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">{selectedMeeting.title}</h3>
                <Badge variant={statusVariant[selectedMeeting.status] ?? "default"} className="mt-1">
                  {selectedMeeting.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span>{formatDate(selectedMeeting.scheduledAt)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>{formatTime(selectedMeeting.scheduledAt)} &middot; {selectedMeeting.durationMinutes} min</span>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Guide</p>
                <p className="text-sm font-medium text-foreground">{selectedMeeting.guideName}</p>
              </div>

              {selectedMeeting.agenda && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> Agenda</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{selectedMeeting.agenda}</p>
                </div>
              )}

              {selectedMeeting.description && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Description</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{selectedMeeting.description}</p>
                </div>
              )}

              {selectedMeeting.meetingLink && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Meeting Link</p>
                  <a href={selectedMeeting.meetingLink} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline">{selectedMeeting.meetingLink}</a>
                </div>
              )}

              <div>
                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> Participants ({selectedMeeting.participants.length})
                </p>
                {selectedMeeting.participants.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedMeeting.participants.map((p) => (
                      <Badge key={p.id} variant="outline">{p.userName}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No participants</p>
                )}
              </div>

              <div className="text-xs text-muted-foreground">
                Created: {formatDate(selectedMeeting.createdAt)} {formatTime(selectedMeeting.createdAt)}
              </div>

              <div className="flex gap-2 pt-2 border-t border-border">
                {selectedMeeting.status === "Scheduled" && (
                  <>
                    <button onClick={() => { openEdit(selectedMeeting); }}
                      className="border border-border text-sm px-4 py-2 rounded-xl hover:bg-muted flex items-center gap-1.5">
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button onClick={() => { handleDelete(selectedMeeting.id); closeModal(); }}
                      className="bg-red-600 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-red-700 flex items-center gap-1.5">
                      <Trash2 className="w-3.5 h-3.5" /> Cancel Meeting
                    </button>
                  </>
                )}
                <button onClick={closeModal}
                  className="border border-border text-sm px-4 py-2 rounded-xl hover:bg-muted ml-auto">Close</button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
