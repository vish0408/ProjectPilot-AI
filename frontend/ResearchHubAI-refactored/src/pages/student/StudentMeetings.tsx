import { useState, useEffect } from "react";
import { Activity, Calendar, CheckCircle, Zap } from "lucide-react";
import StatCard from "../../components/cards/StatCard";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";
import { meetingService } from "../../services/MeetingService";
import type { MeetingResponse } from "../../services/MeetingService";

export default function StudentMeetings() {
  const [meetings, setMeetings] = useState<MeetingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [agenda, setAgenda] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    meetingService.getMyMeetings()
      .then(data => setMeetings(data.items))
      .catch((e) => { if (e instanceof Error) setError(e.message); })
      .finally(() => setLoading(false));
  }, []);

  const requestMeeting = async () => {
    if (!title.trim() || !date || !time) return;
    try {
      const result = await meetingService.createMeeting({
        title: title.trim(),
        agenda: agenda.trim(),
        scheduledAt: new Date(`${date}T${time}`).toISOString(),
        durationMinutes: 30,
        participantIds: [],
      });
      setMeetings(prev => [result, ...prev]);
      setTitle(""); setAgenda(""); setDate(""); setTime("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create meeting");
    }
  };

  const upcoming = meetings.filter(m => new Date(m.scheduledAt) > new Date());
  const completed = meetings.filter(m => new Date(m.scheduledAt) <= new Date());

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 mb-4">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Upcoming" value={`${upcoming.length}`} icon={Calendar} color="bg-blue-500"/>
        <StatCard label="Total" value={`${meetings.length}`} icon={Activity} color="bg-indigo-500"/>
        <StatCard label="Completed" value={`${completed.length}`} icon={CheckCircle} color="bg-green-500"/>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <SectionHead title="Request a Meeting"/>
          <div className="flex flex-col gap-3">
            <div><label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Subject</label>
              <input value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-input-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary" placeholder="Chapter 3 Discussion"/></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-input-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary"/></div>
              <div><label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Time</label>
                <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full bg-input-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary"/></div>
            </div>
            <div><label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Agenda</label>
              <textarea value={agenda} onChange={e => setAgenda(e.target.value)} className="w-full bg-input-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary resize-none" rows={3} placeholder="Brief agenda…"/></div>
            <button onClick={requestMeeting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl">Request Meeting</button>
          </div>
        </Card>
        <Card>
          <SectionHead title="Upcoming Meetings"/>
          {loading ? (
            <div className="flex items-center justify-center py-8"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
          ) : upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No upcoming meetings</p>
          ) : (
            upcoming.slice(0, 5).map((m, i) => (
              <div key={m.id} className={`border border-border rounded-xl p-4 ${i > 0 ? "mt-3" : ""}`}>
                <div className="flex items-start justify-between mb-2">
                  <div><p className="text-sm font-bold text-foreground">{m.title}</p><p className="text-xs text-muted-foreground">with Guide</p></div>
                  <Badge variant="info">{m.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{new Date(m.scheduledAt).toLocaleDateString()} · {new Date(m.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                <div className="flex gap-2">
                  {m.meetingLink && <button className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-blue-700 flex items-center gap-1"><Zap className="w-3 h-3"/>Join</button>}
                </div>
              </div>
            ))
          )}
        </Card>
      </div>
    </div>
  );
}
