import { useState } from "react";
import {
  Download,
  Edit2,
  Eye,
  Upload
} from "lucide-react";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import { CHAPTERS } from "../../utils/mockData";

export default function StudentThesisUpload() {
  const [dragging, setDragging] = useState(false);
  const [pct, setPct] = useState(0);
  const [uploading, setUploading] = useState(false);
  const startUpload = () => {
    setUploading(true); setPct(0);
    const iv = setInterval(()=>setPct(p=>{if(p>=100){clearInterval(iv);setUploading(false);return 100;}return p+10;}),200);
  };
  return (
    <div className="flex flex-col gap-6">
      <div onDragOver={e=>{e.preventDefault();setDragging(true);}} onDragLeave={()=>setDragging(false)} onDrop={e=>{e.preventDefault();setDragging(false);startUpload();}} onClick={startUpload}
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${dragging?"border-blue-500 bg-blue-50 dark:bg-blue-950/20":"border-border hover:border-blue-400 hover:bg-muted/30"}`}>
        {uploading?(
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-950/40 rounded-2xl flex items-center justify-center"><Upload className="w-7 h-7 text-blue-600 animate-bounce"/></div>
            <p className="font-bold text-foreground">Uploading...</p>
            <div className="w-52 bg-muted rounded-full h-2.5"><div className="bg-blue-600 h-2.5 rounded-full transition-all" style={{width:`${pct}%`}}/></div>
            <p className="text-sm text-muted-foreground">{pct}%</p>
          </div>
        ):(
          <><div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4 ${dragging?"bg-blue-100":"bg-muted"}`}><Upload className={`w-7 h-7 ${dragging?"text-blue-600":"text-muted-foreground"}`}/></div>
          <p className="font-bold text-foreground mb-1">Upload Thesis Chapter</p>
          <p className="text-sm text-muted-foreground">Drag & drop PDF or DOCX · Max 100 MB</p></>
        )}
      </div>
      <Card p={false}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border"><h3 className="font-bold text-foreground">Uploaded Files</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40"><tr>{["Chapter","Version","Size","Date","Status","Actions"].map(h=><th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">{h}</th>)}</tr></thead>
            <tbody>
              {CHAPTERS.filter(c=>c.date!=="—").map((c,i)=>(
                <tr key={i} className="border-t border-border hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3.5"><div className="flex items-center gap-3"><div className="w-8 h-8 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center text-xs font-bold text-red-600">PDF</div><span className="text-xs font-semibold text-foreground">{c.ch}</span></div></td>
                  <td className="px-5 py-3.5"><Badge variant="outline">{c.version}</Badge></td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground">{c.size}</td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground">{c.date}</td>
                  <td className="px-5 py-3.5"><Badge variant={c.status==="approved"?"success":c.status==="review"?"warning":"default"}>{c.status}</Badge></td>
                  <td className="px-5 py-3.5"><div className="flex gap-1">{[Eye,Download,Edit2].map((Icon,j)=><button key={j} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center"><Icon className="w-3.5 h-3.5 text-muted-foreground"/></button>)}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
