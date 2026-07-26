export default function Card({ children, className="", p=true }: { children:React.ReactNode; className?:string; p?:boolean }) {
  return <div className={`bg-card border border-border rounded-xl ${p?"p-4 sm:p-5":""} ${className}`}>{children}</div>;
}
