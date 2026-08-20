import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  MessageSquare, Plus, Trash2, Copy, Download, Search,
  PanelLeftClose, PanelLeft, Send, Loader2, Sparkles,
  BookOpen, FileCode2, Pencil,
  ChevronDown, ChevronRight,
} from "lucide-react";
import { chatService } from "../../services/ChatService";
import type {
  ChatSessionResponse, ChatSessionDetailResponse,
  ChatMessageResponse, CitationResponse,
} from "../../types/Chat";

function classNames(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactElement[] = [];
  let inCodeBlock = false;
  let codeContent = "";
  let codeLang = "";
  let inTable = false;
  let tableRows: string[][] = [];

  const flushCode = () => {
    if (codeContent) {
      elements.push(
        <div key={`code-${elements.length}`} className="relative group">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-700 text-gray-300 text-xs rounded-t-lg">
            <span>{codeLang || "plaintext"}</span>
            <button onClick={() => navigator.clipboard.writeText(codeContent)}
              className="hover:text-white transition-colors">
              <Copy size={14} />
            </button>
          </div>
          <pre className="bg-gray-900 text-gray-100 p-4 overflow-x-auto rounded-b-lg text-sm leading-relaxed">
            <code>{codeContent}</code>
          </pre>
        </div>
      );
      codeContent = "";
      codeLang = "";
    }
  };

  const flushTable = () => {
    if (tableRows.length > 0) {
      const header = tableRows[0];
      const body = tableRows.slice(2).filter((_, i) => i % 2 !== 0 || tableRows[i + 1] === undefined);
      elements.push(
        <div key={`table-${elements.length}`} className="overflow-x-auto my-3">
          <table className="min-w-full divide-y divide-gray-300 border border-gray-300 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                {header.map((h, i) => (
                  <th key={i} className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {body.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-3 py-2 text-sm text-gray-700">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("```")) {
      if (inCodeBlock) {
        flushCode();
        inCodeBlock = false;
      } else {
        flushTable();
        inCodeBlock = true;
        codeLang = line.slice(3).trim();
        codeContent = "";
      }
      continue;
    }

    if (inCodeBlock) {
      codeContent += (codeContent ? "\n" : "") + line;
      continue;
    }

    if (line.startsWith("|") && line.endsWith("|")) {
      inTable = true;
      const cells = line.split("|").slice(1, -1).map(c => c.trim());
      tableRows.push(cells);
      continue;
    }

    if (inTable && line.trim() === "") {
      flushTable();
      inTable = false;
      continue;
    }
    if (inTable && !line.startsWith("|")) {
      flushTable();
      inTable = false;
    }
    if (inTable) continue;

    if (line.trim() === "") {
      elements.push(<div key={`sp-${i}`} className="h-2" />);
      continue;
    }

    let processed = line;

    if (processed.startsWith("### ")) {
      elements.push(<h3 key={i} className="text-lg font-semibold text-gray-800 mt-4 mb-2">{processed.slice(4)}</h3>);
      continue;
    }
    if (processed.startsWith("## ")) {
      elements.push(<h2 key={i} className="text-xl font-bold text-gray-900 mt-5 mb-2">{processed.slice(3)}</h2>);
      continue;
    }
    if (processed.startsWith("# ")) {
      elements.push(<h1 key={i} className="text-2xl font-bold text-gray-900 mt-5 mb-3">{processed.slice(2)}</h1>);
      continue;
    }

    if (processed.startsWith("- ") || processed.startsWith("* ")) {
      const isSubItem = processed.startsWith("  - ") || processed.startsWith("  * ");
      const content = processed.replace(/^[\s]*[-*]\s/, "");
      elements.push(
        <div key={i} className={classNames("flex gap-2", isSubItem ? "ml-6" : "")}>
          <span className="text-gray-400 mt-1.5 flex-shrink-0">•</span>
          <span className="text-gray-700">{renderInline(content)}</span>
        </div>
      );
      continue;
    }

    if (/^\d+[.)]/.test(processed)) {
      const match = processed.match(/^(\d+)[.)]\s*(.*)/);
      if (match) {
        elements.push(
          <div key={i} className="flex gap-2 ml-4">
            <span className="text-gray-500 flex-shrink-0 font-medium">{match[1]}.</span>
            <span className="text-gray-700">{renderInline(match[2])}</span>
          </div>
        );
        continue;
      }
    }

    if (processed.startsWith("> ")) {
      elements.push(
        <blockquote key={i} className="border-l-4 border-indigo-300 bg-indigo-50 pl-4 py-2 my-2 text-gray-700 italic rounded-r">
          {renderInline(processed.slice(2))}
        </blockquote>
      );
      continue;
    }

    if (processed.startsWith("---") || processed.startsWith("***")) {
      elements.push(<hr key={i} className="my-4 border-gray-300" />);
      continue;
    }

    if (processed.startsWith("**Confidence:")) {
      elements.push(
        <div key={i} className="mt-4 pt-3 border-t border-gray-200">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
            <Sparkles size={14} />
            {processed.replace(/\*\*/g, "")}
          </span>
        </div>
      );
      continue;
    }

    elements.push(
      <p key={i} className="text-gray-700 leading-relaxed">{renderInline(processed)}</p>
    );
  }

  flushCode();
  flushTable();

  return <div className="space-y-0.5">{elements}</div>;
}

function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;

  const patterns: { regex: RegExp; render: (match: string, content: string, url?: string) => React.ReactNode }[] = [
    { regex: /`([^`]+)`/, render: (_m, c) => <code key={parts.length} className="bg-gray-100 text-red-600 px-1.5 py-0.5 rounded text-sm font-mono">{c}</code> },
    { regex: /\*\*([^*]+)\*\*/, render: (_m, c) => <strong key={parts.length} className="font-semibold text-gray-900">{c}</strong> },
    { regex: /\*([^*]+)\*/, render: (_m, c) => <em key={parts.length} className="italic text-gray-700">{c}</em> },
    { regex: /\[([^\]]+)\]\(([^)]+)\)/, render: (_m, c, url) => <a key={parts.length} href={url} className="text-indigo-600 hover:text-indigo-800 underline">{c}</a> },
    { regex: /\$\$([^$]+)\$\$/, render: (_m, c) => <span key={parts.length} className="block text-center my-2 px-3 py-2 bg-gray-50 rounded text-sm font-mono text-gray-700 border border-gray-200">$${c}$$</span> },
  ];

  while (remaining.length > 0) {
    let match: RegExpExecArray | null = null;
    let matchedPattern: typeof patterns[0] | null = null;

    for (const pattern of patterns) {
      const m = pattern.regex.exec(remaining);
      if (m && (!match || m.index < match.index)) {
        match = m;
        matchedPattern = pattern;
      }
    }

    if (match && matchedPattern) {
      if (match.index > 0) {
        parts.push(remaining.slice(0, match.index));
      }
      parts.push(matchedPattern.render(match[0], match[1], match[2]));
      remaining = remaining.slice(match.index + match[0].length);
    } else {
      parts.push(remaining);
      break;
    }
  }

  return parts.length === 1 && typeof parts[0] === "string" ? parts[0] : <>{parts}</>;
}

function CitationCard({ citation, index }: { citation: CitationResponse; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg bg-white hover:shadow-sm transition-shadow">
      <button onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-3 p-3 text-left">
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{citation.sourceTitle}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            {citation.authors && <span className="truncate">{citation.authors}</span>}
            {citation.year && <span>{citation.year}</span>}
            {citation.sourceType && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full">
                {citation.sourceType}
              </span>
            )}
          </div>
          {citation.relevanceScore !== null && (
            <div className="mt-1 flex items-center gap-1">
              <div className="flex-1 max-w-[100px] h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${(citation.relevanceScore || 0) * 100}%` }} />
              </div>
              <span className="text-[10px] text-gray-400">{Math.round((citation.relevanceScore || 0) * 100)}%</span>
            </div>
          )}
        </div>
        {expanded ? <ChevronDown size={14} className="text-gray-400 flex-shrink-0 mt-1" /> : <ChevronRight size={14} className="text-gray-400 flex-shrink-0 mt-1" />}
      </button>
      {expanded && citation.excerpt && (
        <div className="px-3 pb-3 pt-0">
          <p className="text-xs text-gray-600 bg-gray-50 rounded p-2 leading-relaxed">"{citation.excerpt}"</p>
          {citation.sectionName && (
            <p className="text-xs text-indigo-600 mt-1">
              <FileCode2 size={12} className="inline mr-1" />
              {citation.sectionName}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessageResponse }) {
  const isUser = message.role === "user";

  return (
    <div className={classNames("flex gap-3", isUser ? "flex-row-reverse" : "")}>
      <div className={classNames(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
        isUser ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-600"
      )}>
        {isUser ? "U" : "AI"}
      </div>
      <div className={classNames("flex-1 max-w-[80%]", isUser ? "text-right" : "")}>
        <div className={classNames(
          "rounded-2xl px-4 py-3",
          isUser ? "bg-indigo-600 text-white" : "bg-white border border-gray-200"
        )}>
          {isUser ? (
            <p className="text-sm leading-relaxed">{message.content}</p>
          ) : (
            <MarkdownRenderer content={message.content} />
          )}
        </div>

        {!isUser && message.citations.length > 0 && (
          <div className="mt-3 space-y-1.5">
            <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5 px-1">
              <BookOpen size={12} />
              Sources ({message.citations.length})
            </p>
            <div className="space-y-1.5">
              {message.citations.map((c, i) => (
                <CitationCard key={c.id} citation={c} index={i} />
              ))}
            </div>
          </div>
        )}

        {!isUser && message.confidence && (
          <div className="mt-1.5 px-1">
            <span className="text-[10px] text-gray-400">
              <Sparkles size={10} className="inline mr-0.5" />
              {message.confidence}
            </span>
          </div>
        )}

        <p className={classNames("text-[10px] text-gray-400 mt-1", isUser ? "mr-1" : "ml-1")}>
          {formatDate(message.createdAt)}
        </p>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-medium">
        AI
      </div>
      <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}

export default function ResearchChatPage() {
  const [sessions, setSessions] = useState<ChatSessionResponse[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<ChatSessionDetailResponse | null>(null);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [editTitleValue, setEditTitleValue] = useState("");
  const [showNewSessionForm, setShowNewSessionForm] = useState(false);
  const [newSessionTitle, setNewSessionTitle] = useState("");
  const [newSessionResearchArea, setNewSessionResearchArea] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [activeSession?.messages.length, streamingContent, scrollToBottom]);

  const loadSessions = async () => {
    try {
      const result = await chatService.getHistory();
      setSessions(result);
    } catch (err) {
      console.error("Failed to load sessions:", err);
    }
  };

  const loadSession = async (id: string) => {
    try {
      setIsLoading(true);
      const result = await chatService.getSession(id);
      setActiveSession(result);
      setActiveSessionId(id);
      setShowNewSessionForm(false);
    } catch (err) {
      console.error("Failed to load session:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const createSession = async () => {
    const title = newSessionTitle.trim() || `Chat ${sessions.length + 1}`;
    try {
      const result = await chatService.createSession({
        title,
        researchArea: newSessionResearchArea.trim() || undefined,
      });
      setSessions(prev => [result, ...prev]);
      setActiveSessionId(result.id);
      setActiveSession({
        id: result.id,
        title: result.title,
        researchArea: result.researchArea,
        contextSummary: null,
        messageCount: 0,
        createdAt: result.createdAt,
        lastActivityAt: result.lastActivityAt,
        messages: [],
        documentReferences: [],
      });
      setShowNewSessionForm(false);
      setNewSessionTitle("");
      setNewSessionResearchArea("");
    } catch (err) {
      console.error("Failed to create session:", err);
    }
  };

  const deleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await chatService.deleteSession(id);
      setSessions(prev => prev.filter(s => s.id !== id));
      if (activeSessionId === id) {
        setActiveSession(null);
        setActiveSessionId(null);
      }
    } catch (err) {
      console.error("Failed to delete session:", err);
    }
  };

  const renameSession = async (id: string) => {
    if (!editTitleValue.trim()) {
      setEditingTitle(null);
      return;
    }
    try {
      await chatService.createSession({ title: editTitleValue.trim() });
      setSessions(prev => prev.map(s => s.id === id ? { ...s, title: editTitleValue.trim() } : s));
      if (activeSessionId === id && activeSession) {
        setActiveSession({ ...activeSession, title: editTitleValue.trim() });
      }
    } catch (err) {
      console.error("Failed to rename session:", err);
    }
    setEditingTitle(null);
  };

  const sendMessage = async () => {
    const message = input.trim();
    if (!message || !activeSessionId || isStreaming) return;

    setInput("");
    setIsStreaming(true);
    setStreamingContent("");

    const userMessage: ChatMessageResponse = {
      id: `user-${Date.now()}`,
      role: "user",
      content: message,
      confidence: null,
      orderIndex: activeSession?.messages.length ?? 0,
      createdAt: new Date().toISOString(),
      citations: [],
    };

    setActiveSession(prev => prev ? {
      ...prev,
      messages: [...prev.messages, userMessage],
    } : prev);

    abortRef.current = new AbortController();

    try {
      const stream = chatService.streamMessage(
        { sessionId: activeSessionId, message },
        abortRef.current.signal,
      );

      let fullContent = "";

      for await (const chunk of stream) {
        if (chunk.error) {
          setStreamingContent(prev => prev + `\n\nError: ${chunk.error}`);
          break;
        }
        if (chunk.isComplete) {
          break;
        }
        fullContent += chunk.content;
        setStreamingContent(fullContent);
      }

      const assistantMessage: ChatMessageResponse = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: fullContent,
        confidence: null,
        orderIndex: (activeSession?.messages.length ?? 0) + 1,
        createdAt: new Date().toISOString(),
        citations: [],
      };

      setActiveSession(prev => prev ? {
        ...prev,
        messages: [...prev.messages, assistantMessage],
        messageCount: prev.messageCount + 2,
      } : prev);

      setStreamingContent("");
      loadSessions();
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      console.error("Stream error:", err);
      setStreamingContent(`\n\nError: ${err instanceof Error ? err.message : "Failed to get response"}`);
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  };

  const stopStreaming = () => {
    abortRef.current?.abort();
    setIsStreaming(false);
  };

  const exportConversation = () => {
    if (!activeSession) return;
    const text = activeSession.messages.map(m =>
      `${m.role.toUpperCase()}: ${m.content}`
    ).join("\n\n---\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeSession.title.replace(/[^a-zA-Z0-9]/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearConversation = () => {
    setActiveSession(prev => prev ? {
      ...prev,
      messages: [],
      messageCount: 0,
    } : prev);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const filteredSessions = useMemo(() => sessions.filter(s =>
    s.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
  ), [sessions, debouncedSearchQuery]);

  const allMessages = activeSession?.messages ?? [];

  return (
    <div className="flex h-[calc(100vh-7rem)] bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
      {/* Sidebar */}
      <div className={classNames(
        "flex-shrink-0 bg-white border-r border-gray-200 flex flex-col transition-all duration-300",
        sidebarOpen ? "w-72" : "w-0 overflow-hidden"
      )}>
        <div className="p-3 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-gray-700">Conversations</h2>
            <button onClick={() => setShowNewSessionForm(true)}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <Plus size={16} className="text-gray-500" />
            </button>
          </div>

          {showNewSessionForm && (
            <div className="space-y-2 mb-2 p-2 bg-gray-50 rounded-lg">
              <input type="text" value={newSessionTitle} onChange={e => setNewSessionTitle(e.target.value)}
                placeholder="Session title..."
                className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-400" />
              <input type="text" value={newSessionResearchArea} onChange={e => setNewSessionResearchArea(e.target.value)}
                placeholder="Research area (optional)"
                className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-400" />
              <div className="flex gap-1">
                <button onClick={createSession}
                  className="flex-1 px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700">
                  Create
                </button>
                <button onClick={() => setShowNewSessionForm(false)}
                  className="px-2 py-1 text-xs text-gray-500 hover:bg-gray-200 rounded">
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-400" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredSessions.length === 0 ? (
            <div className="p-4 text-center text-gray-400 text-xs">
              {searchQuery ? "No matching conversations" : "No conversations yet"}
            </div>
          ) : (
            filteredSessions.map(session => (
              <div
                key={session.id}
                onClick={() => loadSession(session.id)}
                className={classNames(
                  "group flex items-center gap-2 px-3 py-2.5 cursor-pointer border-b border-gray-50 transition-colors",
                  activeSessionId === session.id ? "bg-indigo-50 border-l-2 border-l-indigo-500" : "hover:bg-gray-50"
                )}
              >
                <MessageSquare size={14} className="text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  {editingTitle === session.id ? (
                    <div className="flex gap-1">
                      <input type="text" value={editTitleValue} onChange={e => setEditTitleValue(e.target.value)}
                        className="flex-1 px-1.5 py-0.5 text-xs border border-gray-300 rounded focus:outline-none"
                        autoFocus onBlur={() => renameSession(session.id)}
                        onKeyDown={e => { if (e.key === "Enter") renameSession(session.id); if (e.key === "Escape") setEditingTitle(null); }} />
                    </div>
                  ) : (
                    <>
                      <p className="text-xs font-medium text-gray-700 truncate">{session.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-gray-400">{session.messageCount} msgs</span>
                        <span className="text-[10px] text-gray-400">{formatDate(session.lastActivityAt)}</span>
                      </div>
                    </>
                  )}
                </div>
                <div className="hidden group-hover:flex items-center gap-0.5">
                  <button onClick={(e) => { e.stopPropagation(); setEditingTitle(session.id); setEditTitleValue(session.title); }}
                    className="p-1 hover:bg-gray-200 rounded transition-colors">
                    <Pencil size={12} className="text-gray-400" />
                  </button>
                  <button onClick={(e) => deleteSession(session.id, e)}
                    className="p-1 hover:bg-red-100 rounded transition-colors">
                    <Trash2 size={12} className="text-red-400" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              {sidebarOpen ? <PanelLeftClose size={18} className="text-gray-500" /> : <PanelLeft size={18} className="text-gray-500" />}
            </button>
            <div>
              <h1 className="text-sm font-semibold text-gray-800">
                {activeSession?.title || "Research Chat"}
              </h1>
              {activeSession?.researchArea && (
                <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  {activeSession.researchArea}
                </span>
              )}
            </div>
          </div>

          {activeSession && (
            <div className="flex items-center gap-1">
              <button onClick={() => navigator.clipboard.writeText(activeSession.messages.map(m => m.content).join("\n\n"))}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="Copy all">
                <Copy size={15} className="text-gray-400" />
              </button>
              <button onClick={exportConversation}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="Export">
                <Download size={15} className="text-gray-400" />
              </button>
              <button onClick={clearConversation}
                className="p-1.5 hover:bg-red-50 rounded-lg transition-colors" title="Clear">
                <Trash2 size={15} className="text-red-400" />
              </button>
            </div>
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {!activeSession ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-sm">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Sparkles size={28} className="text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">AI Research Assistant</h2>
                <p className="text-sm text-gray-500 mb-6">
                  Ask questions about your uploaded research papers, proposals, and documents.
                  Get answers with citations and source references.
                </p>
                <div className="grid grid-cols-1 gap-2 text-left">
                  {[
                    "Summarize this paper",
                    "Compare these papers",
                    "Explain this algorithm",
                    "Find research gaps",
                    "Generate IEEE citation",
                    "What are the limitations?",
                  ].map((suggestion, i) => (
                    <button key={i}
                      onClick={async () => {
                        if (!activeSessionId) {
                          const result = await chatService.createSession({ title: suggestion });
                          setSessions(prev => [result, ...prev]);
                          setActiveSessionId(result.id);
                          setActiveSession({
                            id: result.id, title: result.title, researchArea: null,
                            contextSummary: null, messageCount: 0, createdAt: result.createdAt,
                            lastActivityAt: result.lastActivityAt, messages: [], documentReferences: [],
                          });
                        }
                        setInput(suggestion);
                        setTimeout(() => inputRef.current?.focus(), 100);
                      }}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-600 transition-colors">
                      <Sparkles size={14} className="text-indigo-500" />
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 size={24} className="text-indigo-500 animate-spin" />
            </div>
          ) : allMessages.length === 0 && !isStreaming ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <MessageSquare size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-400">Start a conversation</p>
              </div>
            </div>
          ) : (
            <>
              {allMessages.map(message => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {isStreaming && streamingContent && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-medium">AI</div>
                  <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 max-w-[80%]">
                    <MarkdownRenderer content={streamingContent} />
                  </div>
                </div>
              )}
              {isStreaming && !streamingContent && <TypingIndicator />}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white px-4 py-3">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={activeSessionId ? "Ask about your research papers..." : "Create or select a conversation to start chatting..."}
              rows={2}
              disabled={!activeSessionId}
              className="flex-1 resize-none px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-gray-50 disabled:text-gray-400"
              style={{ minHeight: "40px", maxHeight: "120px" }}
            />
            {isStreaming ? (
              <button onClick={stopStreaming}
                className="px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors flex items-center gap-1.5">
                <div className="w-3 h-3 bg-white rounded-sm" />
                <span className="text-sm font-medium">Stop</span>
              </button>
            ) : (
              <button onClick={sendMessage} disabled={!input.trim() || !activeSessionId}
                className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:bg-gray-300 transition-colors flex items-center gap-1.5">
                <Send size={16} />
                <span className="text-sm font-medium">Send</span>
              </button>
            )}
          </div>
          {activeSession && (
            <p className="text-[10px] text-gray-400 mt-1.5 text-center">
              Answers include citations from your uploaded research. Press Enter to send, Shift+Enter for new line.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
