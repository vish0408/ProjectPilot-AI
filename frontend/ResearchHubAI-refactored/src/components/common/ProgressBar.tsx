export default function ProgressBar({ value, color = "bg-primary", h = "h-2" }: { value:number; color?:string; h?:string }) {
  return <div className={`w-full bg-muted rounded-full ${h}`}><div className={`${h} rounded-full transition-all duration-500 ${color}`} style={{width:`${Math.min(100,value)}%`}}/></div>;
}
