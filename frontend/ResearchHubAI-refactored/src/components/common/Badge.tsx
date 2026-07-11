export default function Badge({ children, variant = "default", className = "" }: { children: React.ReactNode; variant?: "default"|"success"|"warning"|"danger"|"info"|"outline"|"purple"; className?: string }) {
  const s: Record<string,string> = {
    default: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    success: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    danger:  "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    info:    "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
    outline: "border border-border text-muted-foreground",
    purple:  "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  };
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${s[variant]} ${className}`}>{children}</span>;
}
