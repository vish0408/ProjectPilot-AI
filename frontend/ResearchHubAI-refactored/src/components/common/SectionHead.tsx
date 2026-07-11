export default function SectionHead({ title, desc, action }: { title:string; desc?:string; action?:React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-4">
      <div><h3 className="font-bold text-foreground text-base">{title}</h3>{desc&&<p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}</div>
      {action}
    </div>
  );
}
