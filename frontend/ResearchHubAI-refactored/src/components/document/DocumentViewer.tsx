import { useEffect, useState, useRef, useCallback } from "react";
import {
  X,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize,
  Minimize,
  ChevronLeft,
  ChevronRight,
  Search,
  FileText,
  Loader2,
  AlertTriangle,
} from "lucide-react";

type FileCategory = "pdf" | "image" | "docx" | "text" | "office-unsupported" | "unknown";

interface Props {
  blobUrl: string | null;
  fileName: string;
  fileType: string;
  onClose: () => void;
  onDownload?: () => void;
}

function getFileCategory(type: string): FileCategory {
  const t = type?.toLowerCase() || "";
  if (t === "pdf") return "pdf";
  if (["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"].includes(t)) return "image";
  if (["doc", "docx"].includes(t)) return "docx";
  if (["txt", "csv", "json", "xml", "yaml", "yml", "md", "log", "sh", "bat", "ps1", "py", "js", "ts", "tsx", "jsx", "css", "html"].includes(t)) return "text";
  if (["ppt", "pptx", "xls", "xlsx"].includes(t)) return "office-unsupported";
  return "unknown";
}

export default function DocumentViewer({ blobUrl, fileName, fileType, onClose, onDownload }: Props) {
  const category = getFileCategory(fileType);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [docxHtml, setDocxHtml] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMatches, setSearchMatches] = useState(0);
  const [currentMatch, setCurrentMatch] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const revokeAll = useCallback(() => {
    if (blobUrl && blobUrl.startsWith("blob:")) URL.revokeObjectURL(blobUrl);
  }, [blobUrl]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setZoom(100);
    setRotation(0);
    setDocxHtml(null);
    setTextContent(null);

    if (!blobUrl) {
      setError("No document URL provided");
      setLoading(false);
      return;
    }

    if (category === "docx") {
      import("mammoth").then((mammoth) => {
        fetch(blobUrl)
          .then((r) => r.arrayBuffer())
          .then((buf) =>
            mammoth.convertToHtml({ arrayBuffer: buf }, {
              styleMap: [
                "p[style-name='Heading 1'] => h1:fresh",
                "p[style-name='Heading 2'] => h2:fresh",
                "p[style-name='Heading 3'] => h3:fresh",
                "r[style-name='Strong'] => strong",
                "r[style-name='Emphasis'] => em",
              ],
            })
          )
          .then((result) => {
            setDocxHtml(result.value);
            if (result.messages.length > 0) console.warn("DOCX warnings:", result.messages);
            setLoading(false);
          })
          .catch((e) => {
            setError("Failed to render DOCX: " + e.message);
            setLoading(false);
          });
      }).catch(() => {
        setError("mammoth.js library failed to load");
        setLoading(false);
      });
    } else if (category === "text") {
      fetch(blobUrl)
        .then((r) => r.text())
        .then((text) => {
          setTextContent(text);
          setLoading(false);
        })
        .catch((e) => {
          setError("Failed to read text file: " + e.message);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }

    return () => { revokeAll(); };
  }, [blobUrl, category, revokeAll]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "f" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); setShowSearch((s) => !s); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentMatch(0);
    if (!query || !iframeRef.current?.contentWindow) { setSearchMatches(0); return; }
    try {
      (iframeRef.current.contentWindow as any).find(query);
    } catch {}
  }, []);

  const handleRotate = () => setRotation((r) => (r + 90) % 360);
  const handleZoomIn = () => setZoom((z) => Math.min(z + 25, 300));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 25, 25));

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const renderToolbar = () => (
    <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card rounded-t-2xl flex-shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <span className="text-sm font-bold text-foreground truncate max-w-[200px] sm:max-w-[400px]">{fileName}</span>
        <span className="text-[10px] uppercase text-muted-foreground px-1.5 py-0.5 rounded bg-muted">{fileType}</span>
      </div>
      <div className="flex items-center gap-1">
        {category === "pdf" && (
          <button onClick={() => setShowSearch((s) => !s)} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center" title="Search (Ctrl+F)">
            <Search className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        )}
        <button onClick={handleZoomOut} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center" title="Zoom out">
          <ZoomOut className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
        <span className="text-xs font-bold text-foreground w-10 text-center">{zoom}%</span>
        <button onClick={handleZoomIn} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center" title="Zoom in">
          <ZoomIn className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
        <button onClick={handleRotate} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center" title="Rotate">
          <RotateCw className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
        <button onClick={toggleFullscreen} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center" title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}>
          {isFullscreen ? <Minimize className="w-3.5 h-3.5 text-muted-foreground" /> : <Maximize className="w-3.5 h-3.5 text-muted-foreground" />}
        </button>
        {onDownload && (
          <button onClick={onDownload} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center" title="Download">
            <Download className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        )}
        <div className="w-px h-5 bg-border mx-1" />
        <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center justify-center" title="Close (Esc)">
          <X className="w-4 h-4 text-muted-foreground hover:text-red-600" />
        </button>
      </div>
    </div>
  );

  const renderSearch = () => {
    if (!showSearch || category !== "pdf") return null;
    return (
      <div className="flex items-center gap-2 px-4 py-1.5 border-b border-border bg-muted/30">
        <Search className="w-3 h-3 text-muted-foreground" />
        <input
          className="flex-1 bg-transparent border-none outline-none text-xs text-foreground"
          placeholder="Search in document..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          autoFocus
        />
        {searchMatches > 0 && (
          <div className="flex items-center gap-1">
            <button className="w-5 h-5 rounded hover:bg-muted flex items-center justify-center"><ChevronLeft className="w-3 h-3" /></button>
            <span className="text-xs text-muted-foreground">{currentMatch + 1}/{searchMatches}</span>
            <button className="w-5 h-5 rounded hover:bg-muted flex items-center justify-center"><ChevronRight className="w-3 h-3" /></button>
          </div>
        )}
      </div>
    );
  };

  const loadingOverlay = loading && (
    <div className="absolute inset-0 flex items-center justify-center bg-card/80 z-10">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-xs text-muted-foreground">Loading document...</p>
      </div>
    </div>
  );

  const errorOverlay = error && (
    <div className="absolute inset-0 flex items-center justify-center bg-card/80 z-10">
      <div className="flex flex-col items-center gap-2 p-6 text-center">
        <AlertTriangle className="w-10 h-10 text-amber-500" />
        <p className="text-sm font-bold text-foreground">Preview Error</p>
        <p className="text-xs text-muted-foreground max-w-sm">{error}</p>
        <button onClick={onDownload || onClose} className="mt-2 bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-indigo-700">
          {onDownload ? "Download File" : "Close"}
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    if (!blobUrl) return null;

    switch (category) {
      case "pdf":
        return (
          <iframe
            ref={iframeRef}
            src={blobUrl}
            className="w-full h-full border-0"
            title={fileName}
            style={{ transform: `scale(${zoom / 100}) rotate(${rotation}deg)`, transformOrigin: "center center" }}
            onLoad={() => setLoading(false)}
          />
        );

      case "image":
        return (
          <div className="flex items-center justify-center w-full h-full p-4" style={{ transform: `scale(${zoom / 100}) rotate(${rotation}deg)` }}>
            <img src={blobUrl} alt={fileName} className="max-w-full max-h-full object-contain" onLoad={() => setLoading(false)} onError={() => { setError("Failed to load image"); setLoading(false); }} />
          </div>
        );

      case "docx":
        if (docxHtml) {
          return (
            <div
              className="w-full h-full overflow-auto p-6"
              dangerouslySetInnerHTML={{ __html: docxHtml }}
              style={{ fontSize: `${zoom / 100}rem` }}
            />
          );
        }
        return null;

      case "text":
        if (textContent !== null) {
          return (
            <pre
              className="w-full h-full overflow-auto p-4 text-xs font-mono leading-relaxed text-foreground bg-muted/20 m-0"
              style={{ fontSize: `${0.75 * (zoom / 100)}rem` }}
            >{textContent}</pre>
          );
        }
        return null;

      default:
        return (
          <div className="flex flex-col items-center justify-center w-full h-full p-8 text-center gap-3">
            <FileText className="w-16 h-16 text-muted-foreground opacity-30" />
            <p className="text-sm text-muted-foreground">Preview not available for {fileType.toUpperCase()} files</p>
            <p className="text-xs text-muted-foreground">Click Download to view the file</p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={containerRef} className="flex flex-col bg-card border border-border rounded-2xl shadow-2xl w-[95vw] h-[90vh] max-w-[1400px] overflow-hidden relative">
        {renderToolbar()}
        {renderSearch()}
        <div className="flex-1 relative overflow-hidden">
          {loadingOverlay}
          {errorOverlay}
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
