import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Edit2,
  Eye,
  X
} from "lucide-react";
import StatCard from "../../components/cards/StatCard";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";
import { guideService } from "../../services/GuideService";
import { Review } from "../../types/Guide";

export default function GuidePendingApprovals() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      const r = await guideService.getMyReviews();
      setReviews(r);
    } catch (e) {
      console.error("Failed to load reviews", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleAction = async (projectId: string, status: string) => {
    setActionLoading(projectId);
    try {
      await guideService.createReview(projectId, { status, notes: "" });
      await fetchReviews();
    } catch (e) {
      console.error("Failed to update review", e);
    } finally {
      setActionLoading(null);
    }
  };

  const pending = reviews.filter(r => r.status === "pending");
  const approved = reviews.filter(r => r.status === "approved");

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Pending" value={pending.length.toString()} icon={Clock} color="bg-amber-500"/>
        <StatCard label="Approved Today" value={approved.length.toString()} icon={CheckCircle} color="bg-green-500"/>
        <StatCard label="Overdue" value="0" icon={AlertTriangle} color="bg-red-500"/>
        <StatCard label="Total Reviews" value={reviews.length.toString()} icon={Activity} color="bg-blue-500"/>
      </div>
      <Card>
        <SectionHead title="Approval Queue"/>
        <div className="flex flex-col gap-3">
          {pending.length === 0 && <p className="text-xs text-muted-foreground text-center py-6">No pending reviews</p>}
          {pending.map((item,i)=>(
            <div key={item.id} className="border border-border rounded-xl p-4 hover:bg-muted/20 transition-colors">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center text-xs font-bold text-red-600">REV</div>
                  <div><p className="font-bold text-sm text-foreground">{item.projectTitle}</p><p className="text-xs text-muted-foreground">Submitted {item.createdAt?new Date(item.createdAt).toLocaleDateString():""}</p></div>
                </div>
                <Badge variant="warning">Pending</Badge>
              </div>
              <div className="flex gap-2">
                <button disabled={actionLoading===item.projectId} onClick={()=>handleAction(item.projectId,"approved")} className="bg-green-600 text-white text-xs font-bold px-3.5 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5"/>{actionLoading===item.projectId?"...":"Approve"}</button>
                <button disabled={actionLoading===item.projectId} onClick={()=>handleAction(item.projectId,"revision_required")} className="bg-amber-500 text-white text-xs font-bold px-3.5 py-2 rounded-lg hover:bg-amber-600 disabled:opacity-50 flex items-center gap-1.5"><Edit2 className="w-3.5 h-3.5"/>Request Revision</button>
                <button disabled={actionLoading===item.projectId} onClick={()=>handleAction(item.projectId,"rejected")} className="bg-red-600 text-white text-xs font-bold px-3.5 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-1.5"><X className="w-3.5 h-3.5"/>Reject</button>
                <button className="border border-border text-xs font-medium text-muted-foreground px-3.5 py-2 rounded-lg hover:bg-muted flex items-center gap-1.5"><Eye className="w-3.5 h-3.5"/>Preview</button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
