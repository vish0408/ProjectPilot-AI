import { useEffect, useState } from "react";
import { CheckCircle, UserCheck, Users, XCircle, Phone, Mail, Building2, GraduationCap, BookOpen, ClipboardCheck, X, ToggleLeft, ToggleRight } from "lucide-react";
import StatCard from "../../components/cards/StatCard";
import Avatar from "../../components/common/Avatar";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";
import ProgressBar from "../../components/common/ProgressBar";
import { hodService } from "../../services/HodService";
import { HodGuideSummary, GuideDetail } from "../../types/Hod";

export default function HodGuides() {
  const [guides, setGuides] = useState<HodGuideSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGuide, setSelectedGuide] = useState<GuideDetail | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerError, setDrawerError] = useState<string | null>(null);

  useEffect(() => {
    hodService.getGuides()
      .then(setGuides)
      .catch((e) => { if (e instanceof Error) setError(e.message); })
      .finally(() => setLoading(false));
  }, []);

  const openDrawer = async (guideUserId: string) => {
    setDrawerLoading(true);
    setDrawerError(null);
    try {
      const detail = await hodService.getGuideDetail(guideUserId);
      setSelectedGuide(detail);
    } catch (e) {
      if (e instanceof Error) setDrawerError(e.message);
    } finally {
      setDrawerLoading(false);
    }
  };

  const closeDrawer = () => {
    setSelectedGuide(null);
    setDrawerError(null);
  };

  const toggleAvailability = () => {
    if (!selectedGuide) return;
    setSelectedGuide({ ...selectedGuide, isAvailable: !selectedGuide.isAvailable });
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
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 mb-4">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Guides" value={`${guides.length}`} icon={Users} color="bg-blue-500" />
        <StatCard label="Available" value={`${guides.filter(g => g.isAvailable).length}`} icon={CheckCircle} color="bg-green-500" />
        <StatCard label="Unavailable" value={`${guides.filter(g => !g.isAvailable).length}`} icon={XCircle} color="bg-red-500" />
        <StatCard label="Total Students" value={`${guides.reduce((a, g) => a + g.assignedStudents, 0)}`} icon={UserCheck} color="bg-amber-500" />
      </div>
      <Card p={false}>
        <div className="px-5 py-4 border-b border-border">
          <SectionHead title="All Guides" desc="View and manage research guides" />
        </div>
        <div className="flex flex-col">
          {guides.map((g) => (
            <button key={g.userId} onClick={() => openDrawer(g.userId)}
              className="flex items-center gap-4 px-5 py-4 border-b border-border last:border-0 hover:bg-muted/40 transition-colors text-left w-full">
              <Avatar name={g.fullName} />
              <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-5 gap-2">
                <div className="sm:col-span-2">
                  <p className="text-sm font-bold text-foreground">{g.fullName}</p>
                  <p className="text-xs text-muted-foreground">{g.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Department</p>
                  <p className="text-xs font-medium text-foreground truncate">{g.department}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Specialization</p>
                  <p className="text-xs font-medium text-foreground truncate">{g.specialization || "-"}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center min-w-[48px]">
                    <p className="text-lg font-bold text-foreground">{g.assignedStudents}</p>
                    <p className="text-xs text-muted-foreground">Students</p>
                  </div>
                  <div className="text-center min-w-[48px]">
                    <p className="text-lg font-bold text-foreground">{g.completedProjects}</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                </div>
              </div>
              <Badge variant={g.isAvailable ? "success" : "danger"}>{g.isAvailable ? "Available" : "Busy"}</Badge>
            </button>
          ))}
          {!guides.length && <p className="text-sm text-muted-foreground text-center py-8">No guides found</p>}
        </div>
      </Card>

      {/* Drawer overlay */}
      {selectedGuide && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={closeDrawer} />
          <div className="relative w-full max-w-lg bg-background border-l border-border shadow-2xl animate-slide-in-right overflow-y-auto">
            <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-background border-b border-border">
              <h2 className="text-base font-bold text-foreground">Guide Detail</h2>
              <button onClick={closeDrawer} className="p-1 rounded-md hover:bg-muted transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {drawerLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : drawerError ? (
              <div className="p-5">
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                  <p className="text-xs text-red-600 dark:text-red-400">{drawerError}</p>
                </div>
              </div>
            ) : selectedGuide ? (
              <div className="flex flex-col gap-5 p-5">
                {/* Header */}
                <div className="flex items-center gap-4">
                  <Avatar name={selectedGuide.fullName} size="lg" />
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{selectedGuide.fullName}</h3>
                    <p className="text-sm text-muted-foreground">{selectedGuide.designation}</p>
                    <p className="text-xs text-muted-foreground">{selectedGuide.department}</p>
                  </div>
                </div>

                {/* Contact Info */}
                <Card>
                  <SectionHead title="Contact Information" />
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{selectedGuide.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{selectedGuide.phoneNumber || "-"}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{selectedGuide.college}</span>
                    </div>
                  </div>
                </Card>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <Card className="text-center !p-4">
                    <Users className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-foreground">{selectedGuide.assignedStudents}/{selectedGuide.maxCapacity}</p>
                    <p className="text-xs text-muted-foreground">Assigned Students</p>
                  </Card>
                  <Card className="text-center !p-4">
                    <BookOpen className="w-5 h-5 text-cyan-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-foreground">{selectedGuide.activeProjects}</p>
                    <p className="text-xs text-muted-foreground">Active Projects</p>
                  </Card>
                  <Card className="text-center !p-4">
                    <GraduationCap className="w-5 h-5 text-green-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-foreground">{selectedGuide.completedProjects}</p>
                    <p className="text-xs text-muted-foreground">Completed Projects</p>
                  </Card>
                  <Card className="text-center !p-4">
                    <ClipboardCheck className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-foreground">{selectedGuide.pendingReviews}</p>
                    <p className="text-xs text-muted-foreground">Pending Reviews</p>
                  </Card>
                </div>

                {/* Availability Toggle */}
                <Card>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-foreground">Availability</p>
                      <p className="text-xs text-muted-foreground">{selectedGuide.isAvailable ? "Available for new students" : "Currently busy"}</p>
                    </div>
                    <button onClick={toggleAvailability} className="text-muted-foreground hover:text-foreground transition-colors">
                      {selectedGuide.isAvailable ? <ToggleRight className="w-8 h-8 text-green-500" /> : <ToggleLeft className="w-8 h-8 text-muted-foreground" />}
                    </button>
                  </div>
                </Card>

                {/* Students List */}
                <Card p={false}>
                  <div className="px-5 py-4 border-b border-border">
                    <SectionHead title={`Students (${selectedGuide.students.length})`} />
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">Student</th>
                          <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">Research Topic</th>
                          <th className="text-center px-5 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                          <th className="text-center px-5 py-3 text-xs font-semibold text-muted-foreground">Progress</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedGuide.students.map((s) => (
                          <tr key={s.userId} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-3">
                                <Avatar name={s.fullName} size="sm" />
                                <div>
                                  <p className="text-sm font-medium text-foreground">{s.fullName}</p>
                                  <p className="text-xs text-muted-foreground">{s.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3 text-xs text-foreground max-w-[160px] truncate">{s.researchTopic}</td>
                            <td className="px-5 py-3 text-center">
                              <Badge variant={s.projectStatus === "Completed" ? "success" : s.projectStatus === "InProgress" ? "warning" : "outline"}>
                                {s.projectStatus || "Not Started"}
                              </Badge>
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2">
                                <div className="flex-1">
                                  <ProgressBar value={s.completionPercentage} />
                                </div>
                                <span className="text-xs font-bold text-foreground min-w-[36px] text-right">{s.completionPercentage}%</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {!selectedGuide.students.length && (
                          <tr>
                            <td colSpan={4} className="px-5 py-8 text-center text-sm text-muted-foreground">No students assigned</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            ) : null}
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.25s ease-out;
        }
      `}</style>
    </div>
  );
}
