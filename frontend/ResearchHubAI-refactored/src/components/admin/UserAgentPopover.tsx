import { useState } from "react";
import { Copy, Check, Globe, Smartphone, Monitor, Tablet, X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";

interface UserAgentPopoverProps {
  userAgent: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function parseUA(ua: string) {
  const isMobile = /Mobile|Android\s/.test(ua) && !/Tablet|iPad/.test(ua);
  const isTablet = /Tablet|iPad|Android\s.*(?=.*Mobile)/.test(ua);
  const deviceType = isTablet ? "Tablet" : isMobile ? "Mobile" : "Desktop";

  let browser = "Unknown";
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/OPR|Opera/i.test(ua)) browser = "Opera";
  else if (/Chrome\//i.test(ua)) browser = "Chrome";
  else if (/Firefox\//i.test(ua)) browser = "Firefox";
  else if (/Safari\//i.test(ua)) browser = "Safari";

  let os = "Unknown";
  if (/Windows NT/i.test(ua)) os = "Windows";
  else if (/Mac OS X/i.test(ua)) os = "macOS";
  else if (/Linux/i.test(ua) && !/Android/i.test(ua)) os = "Linux";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/iOS|iPhone|iPad|iPod/i.test(ua)) os = "iOS";

  return { browser, os, deviceType };
}

export default function UserAgentPopover({ userAgent, open, onOpenChange }: UserAgentPopoverProps) {
  const [copied, setCopied] = useState(false);
  const { browser, os, deviceType } = parseUA(userAgent);

  const deviceIcon = deviceType === "Mobile" ? Smartphone : deviceType === "Tablet" ? Tablet : Monitor;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(userAgent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in duration-200" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[95vw] sm:w-full max-w-lg data-[state=open]:animate-in data-[state=open]:zoom-in-95 data-[state=open]:fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
              <Dialog.Title className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-500" />
                User Agent Details
              </Dialog.Title>
              <Dialog.Close className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
                <X className="w-4 h-4" />
              </Dialog.Close>
            </div>

            <div className="p-5 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Monitor className="w-3.5 h-3.5" />
                  <span className="font-medium">Browser</span>
                  <span className="text-slate-800 dark:text-slate-200 ml-auto">{browser}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Monitor className="w-3.5 h-3.5" />
                  <span className="font-medium">Operating System</span>
                  <span className="text-slate-800 dark:text-slate-200 ml-auto">{os}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <deviceIcon className="w-3.5 h-3.5" />
                  <span className="font-medium">Device Type</span>
                  <span className="text-slate-800 dark:text-slate-200 ml-auto">{deviceType}</span>
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Full User Agent</p>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-700 dark:text-slate-300 break-words whitespace-pre-wrap leading-relaxed select-all">
                    {userAgent}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end px-5 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 gap-2">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                {copied ? (
                  <><Check className="w-3.5 h-3.5" /> Copied</>
                ) : (
                  <><Copy className="w-3.5 h-3.5" /> Copy User Agent</>
                )}
              </button>
              <Dialog.Close className="px-4 py-2 text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                Close
              </Dialog.Close>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
