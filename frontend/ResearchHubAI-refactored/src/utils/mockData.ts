import { CurrentUser } from "../types/User";

export const DEMO_USERS: Record<string, CurrentUser> = {
  "student@iitb.ac.in": {
    name: "Priya Sharma", email: "p.sharma@iitb.ac.in", role: "student",
    dept: "Computer Science & Engineering", institution: "IIT Bombay",
    avatar: "PS", enrollment: "22PhD0042"
  },
  "guide@iitb.ac.in": {
    name: "Dr. Rajesh Mehta", email: "r.mehta@iitb.ac.in", role: "guide",
    dept: "Computer Science & Engineering", institution: "IIT Bombay",
    avatar: "RM", designation: "Associate Professor"
  },
  "admin@iitb.ac.in": {
    name: "Mr. Arun Kumar", email: "a.kumar@iitb.ac.in", role: "admin",
    dept: "Administration", institution: "IIT Bombay",
    avatar: "AK", designation: "System Administrator"
  },
};

export const MONTHLY_DATA = [
  { month: "Jan", submissions: 12, approvals: 8,  meetings: 24, students: 42 },
  { month: "Feb", submissions: 18, approvals: 14, meetings: 31, students: 45 },
  { month: "Mar", submissions: 22, approvals: 19, meetings: 28, students: 48 },
  { month: "Apr", submissions: 16, approvals: 12, meetings: 35, students: 51 },
  { month: "May", submissions: 28, approvals: 24, meetings: 42, students: 54 },
  { month: "Jun", submissions: 34, approvals: 29, meetings: 38, students: 58 },
  { month: "Jul", submissions: 29, approvals: 25, meetings: 45, students: 61 },
];

export const PIE_DATA = [
  { name: "Completed",    value: 38, color: "#22C55E" },
  { name: "In Progress",  value: 45, color: "#2563EB" },
  { name: "Under Review", value: 12, color: "#F59E0B" },
  { name: "Not Started",  value: 5,  color: "#EF4444" },
];

export const DEPT_DATA = [
  { name: "CS", students: 42, completed: 28 },
  { name: "EC", students: 31, completed: 19 },
  { name: "ME", students: 27, completed: 15 },
  { name: "CE", students: 18, completed: 12 },
  { name: "CH", students: 14, completed: 8  },
];

export const STUDENT_LIST = [
  { name: "Priya Sharma",   topic: "Deep Learning in Medical Imaging",  guide: "Dr. Mehta",  progress: 78, status: "active",  dept: "CS", yr: "3rd" },
  { name: "Rahul Verma",    topic: "Blockchain for Supply Chain",       guide: "Dr. Singh",  progress: 55, status: "review",  dept: "CS", yr: "2nd" },
  { name: "Ananya Patel",   topic: "NLP for Regional Languages",        guide: "Dr. Rao",    progress: 91, status: "active",  dept: "CS", yr: "4th" },
  { name: "Kiran Nair",     topic: "IoT Smart Agriculture Systems",     guide: "Dr. Mehta",  progress: 32, status: "pending", dept: "EC", yr: "1st" },
  { name: "Deepa Krishnan", topic: "Quantum Computing Algorithms",      guide: "Dr. Kumar",  progress: 67, status: "active",  dept: "CS", yr: "2nd" },
  { name: "Amit Joshi",     topic: "Autonomous Vehicle Perception",     guide: "Dr. Mehta",  progress: 44, status: "active",  dept: "ME", yr: "3rd" },
  { name: "Sneha Iyer",     topic: "Graph Neural Networks for Chem",    guide: "Dr. Rao",    progress: 60, status: "review",  dept: "CH", yr: "2nd" },
];

export const MILESTONES = [
  { title: "Topic Finalization",  date: "Jan 15, 2024", status: "completed",   desc: "Research topic approved" },
  { title: "Literature Survey",   date: "Mar 20, 2024", status: "completed",   desc: "50 papers reviewed" },
  { title: "Synopsis Submission", date: "May 10, 2024", status: "completed",   desc: "Synopsis approved" },
  { title: "Data Collection",     date: "Aug 30, 2024", status: "in-progress", desc: "Dataset preparation ongoing" },
  { title: "Experimentation",     date: "Nov 15, 2024", status: "pending",     desc: "Model training & eval" },
  { title: "Thesis Writing",      date: "Feb 28, 2025", status: "pending",     desc: "Full thesis draft" },
  { title: "Thesis Submission",   date: "Apr 30, 2025", status: "pending",     desc: "Final submission" },
  { title: "Viva Voce",           date: "Jun 20, 2025", status: "pending",     desc: "Final defense" },
];

export const CHAPTERS = [
  { ch: "Chapter 1 — Introduction",      p: 100, status: "approved",  version: "v3.0", size: "1.4 MB", date: "Jun 10" },
  { ch: "Chapter 2 — Literature Review", p: 100, status: "approved",  version: "v2.5", size: "4.1 MB", date: "Jun 20" },
  { ch: "Chapter 3 — Methodology",       p: 85,  status: "review",    version: "v2.1", size: "3.2 MB", date: "Jul 5"  },
  { ch: "Chapter 4 — Implementation",    p: 60,  status: "draft",     version: "v1.0", size: "5.8 MB", date: "Jul 3"  },
  { ch: "Chapter 5 — Results",           p: 20,  status: "draft",     version: "v0.2", size: "0.8 MB", date: "Jul 7"  },
  { ch: "Chapter 6 — Conclusion",        p: 0,   status: "pending",   version: "—",    size: "—",      date: "—"      },
];

export const NOTIFS_STUDENT = [
  { id: 1, type: "approval", text: "Dr. Mehta approved Chapter 2 submission",       time: "2 min ago",  read: false, icon: "approval" },
  { id: 2, type: "meeting",  text: "Meeting scheduled for July 9 at 10:00 AM",       time: "1 hr ago",   read: false, icon: "meeting"  },
  { id: 3, type: "ai",       text: "AI found 5 papers matching your research topic", time: "3 hrs ago",  read: true,  icon: "ai"       },
  { id: 4, type: "deadline", text: "Chapter 3 review deadline in 3 days",            time: "5 hrs ago",  read: true,  icon: "deadline" },
];

export const NOTIFS_GUIDE = [
  { id: 1, type: "upload",   text: "Priya Sharma submitted Chapter 3 for review",   time: "30 min ago", read: false, icon: "upload"   },
  { id: 2, type: "meeting",  text: "Rahul Verma requested a meeting for July 10",   time: "2 hrs ago",  read: false, icon: "meeting"  },
  { id: 3, type: "deadline", text: "3 students have pending reviews due today",      time: "4 hrs ago",  read: true,  icon: "deadline" },
  { id: 4, type: "ai",       text: "AI flagged possible plagiarism in Kiran's draft",time: "6 hrs ago",  read: true,  icon: "ai"       },
];

export const NOTIFS_ADMIN = [
  { id: 1, type: "system",   text: "Email service degraded — investigating",         time: "10 min ago", read: false, icon: "system"   },
  { id: 2, type: "user",     text: "5 new student registrations pending approval",   time: "1 hr ago",   read: false, icon: "user"     },
  { id: 3, type: "backup",   text: "Scheduled backup completed successfully",        time: "3 hrs ago",  read: true,  icon: "backup"   },
  { id: 4, type: "security", text: "Failed login attempts from IP 10.0.4.12",        time: "5 hrs ago",  read: true,  icon: "security" },
  { id: 5, type: "report",   text: "Monthly analytics report ready to download",     time: "1 day ago",  read: true,  icon: "report"   },
];

export const AI_PROMPTS = [
  "Generate research abstract","Find research gaps","Suggest objectives",
  "Write methodology section","Fix grammar & style","Generate IEEE citations",
  "Summarize a paper","Research ideas",
];
