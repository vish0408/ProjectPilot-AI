import { useState, useEffect, useCallback } from "react";
import {
  Brain, Send, Loader2, FileDown, Save, Trash2, RefreshCw,
  WandSparkles, Shrink, Expand, SpellCheck, Quote, Pencil,
  Check, X, ChevronLeft, ChevronRight, BookOpen, Sparkles,
  ClipboardList, RotateCcw, FileText,
} from "lucide-react";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";
import { proposalService } from "../../services/ProposalService";
import type {
  ProposalResponse, SaveProposalRequest, ProposalTemplate,
} from "../../types/Proposal";
import {
  DEPARTMENTS, DIFFICULTIES, DURATIONS, PROPOSAL_SECTIONS,
} from "../../types/Proposal";

type WizardStep = "configure" | "generating" | "result";

export default function ProposalGenerator() {
  const [step, setStep] = useState<WizardStep>("configure");
  const [templates, setTemplates] = useState<ProposalTemplate[]>([]);
  const [researchArea, setResearchArea] = useState("Computer Science");
  const [keywords, setKeywords] = useState("");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [duration, setDuration] = useState("6 Months");
  const [additionalContext, setAdditionalContext] = useState("");
  const [proposal, setProposal] = useState<ProposalResponse | null>(null);
  const [savedProposals, setSavedProposals] = useState<ProposalResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState<string>("title");
  const [improvingSection, setImprovingSection] = useState<string | null>(null);
  const [improvementType, setImprovementType] = useState("Improve");
  const [viewMode, setViewMode] = useState<"saved" | "new">("new");
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);

  const IMPROVEMENT_OPTIONS = [
    { value: "Improve", label: "Improve", icon: WandSparkles },
    { value: "Shorten", label: "Shorten", icon: Shrink },
    { value: "Expand", label: "Expand", icon: Expand },
    { value: "RewriteAcademically", label: "Rewrite Academically", icon: Pencil },
    { value: "Grammar", label: "Grammar Correction", icon: SpellCheck },
    { value: "Citation", label: "Citation Suggestion", icon: Quote },
  ];

  useEffect(() => {
    proposalService.getTemplates().then(setTemplates).catch(() => {});
    proposalService.getMyProposals().then(setSavedProposals).catch(() => {});
  }, []);

  const applyTemplate = (t: ProposalTemplate) => {
    setResearchArea(t.researchArea);
    setKeywords(t.keywords);
    setDifficulty(t.difficulty);
    setDuration(t.duration);
  };

  const getSectionContent = (sectionKey: string): string => {
    if (!proposal) return "";
    const map: Record<string, string> = {
      title: proposal.title, abstract: proposal.abstract,
      objectives: proposal.objectives, problemStatement: proposal.problemStatement,
      scope: proposal.scope, literatureReview: proposal.literatureReview,
      methodology: proposal.methodology, expectedOutcome: proposal.expectedOutcome,
      timeline: proposal.timeline, requiredTools: proposal.requiredTools,
      expectedResult: proposal.expectedResult, futureScope: proposal.futureScope,
      references: proposal.references,
    };
    return map[sectionKey] ?? "";
  };

  const updateSectionContent = (sectionKey: string, value: string) => {
    if (!proposal) return;
    setProposal(prev => {
      if (!prev) return prev;
      const map: Record<string, keyof ProposalResponse> = {
        title: "title", abstract: "abstract",
        objectives: "objectives", problemStatement: "problemStatement",
        scope: "scope", literatureReview: "literatureReview",
        methodology: "methodology", expectedOutcome: "expectedOutcome",
        timeline: "timeline", requiredTools: "requiredTools",
        expectedResult: "expectedResult", futureScope: "futureScope",
        references: "references",
      };
      return { ...prev, [map[sectionKey]]: value };
    });
  };

  const handleGenerate = useCallback(async () => {
    setError("");
    setLoading(true);
    setStep("generating");
    try {
      const result = await proposalService.generate({
        researchArea, keywords, difficulty, duration, additionalContext: additionalContext || undefined,
      });
      setProposal(result);
      setStep("result");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Generation failed");
      setStep("configure");
    } finally {
      setLoading(false);
    }
  }, [researchArea, keywords, difficulty, duration, additionalContext]);

  const handleImprove = async (sectionKey: string) => {
    setImprovingSection(sectionKey);
    try {
      const result = await proposalService.improve({
        sectionName: PROPOSAL_SECTIONS.find(s => s.key === sectionKey)?.label ?? sectionKey,
        sectionContent: getSectionContent(sectionKey),
        improvementType,
        researchArea,
      });
      updateSectionContent(sectionKey, result.abstract);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Improvement failed");
    } finally {
      setImprovingSection(null);
    }
  };

  const handleRegenerate = async (sectionKey: string) => {
    if (!proposal) return;
    setImprovingSection(sectionKey);
    try {
      const result = await proposalService.regenerateSection({
        proposalId: proposal.id,
        sectionName: PROPOSAL_SECTIONS.find(s => s.key === sectionKey)?.label ?? sectionKey,
        researchArea,
        keywords,
      });
      updateSectionContent(sectionKey, result.abstract);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Regeneration failed");
    } finally {
      setImprovingSection(null);
    }
  };

  const handleSave = async () => {
    if (!proposal) return;
    setSaving(true);
    try {
      const req: SaveProposalRequest = {
        title: proposal.title, researchArea: proposal.researchArea, keywords: proposal.keywords,
        difficulty: proposal.difficulty, duration: proposal.duration,
        abstract: proposal.abstract, objectives: proposal.objectives,
        problemStatement: proposal.problemStatement, scope: proposal.scope,
        literatureReview: proposal.literatureReview, methodology: proposal.methodology,
        expectedOutcome: proposal.expectedOutcome, timeline: proposal.timeline,
        requiredTools: proposal.requiredTools, expectedResult: proposal.expectedResult,
        futureScope: proposal.futureScope, references: proposal.references,
      };
      if (proposal.id && proposal.status !== "Draft") {
        const updated = await proposalService.update(proposal.id, req);
        setProposal(updated);
      } else {
        const saved = await proposalService.save(req);
        setProposal(saved);
      }
      const list = await proposalService.getMyProposals();
      setSavedProposals(list);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleExportMarkdown = () => {
    if (!proposal) return;
    const sections = PROPOSAL_SECTIONS.map(s => {
      const content = getSectionContent(s.key);
      return content ? `## ${s.label}\n\n${content}\n\n` : "";
    }).join("");
    const md = `# ${proposal.title}\n\n**Area:** ${proposal.researchArea} | **Difficulty:** ${proposal.difficulty} | **Duration:** ${proposal.duration}\n\n${sections}`;
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${proposal.title.replace(/\s+/g, "_")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = () => {
    window.print();
  };

  const loadProposal = async (id: string) => {
    try {
      const p = await proposalService.getById(id);
      setProposal(p);
      setSelectedProposalId(id);
      setResearchArea(p.researchArea);
      setKeywords(p.keywords);
      setDifficulty(p.difficulty);
      setDuration(p.duration);
      setStep("result");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load proposal");
    }
  };

  const handleDeleteProposal = async (id: string) => {
    try {
      await proposalService.delete(id);
      setSavedProposals(prev => prev.filter(p => p.id !== id));
    } catch {}
  };

  const renderStep1 = () => (
    <div className="flex flex-col gap-5">
      {templates.length > 0 && (
        <Card>
          <SectionHead title="Quick Start Templates" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {templates.map(t => (
              <div
                key={t.name}
                onClick={() => applyTemplate(t)}
                className="p-3 rounded-xl border border-border hover:border-blue-300 cursor-pointer transition-all hover:bg-blue-50 dark:hover:bg-blue-950/20"
              >
                <p className="text-sm font-bold">{t.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                <div className="flex gap-1.5 mt-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{t.researchArea}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{t.difficulty}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <SectionHead title="Configure Your Proposal" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Department / Research Area</label>
            <select value={researchArea} onChange={e => setResearchArea(e.target.value)}
              className="w-full bg-input-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary">
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Keywords</label>
            <input type="text" value={keywords} onChange={e => setKeywords(e.target.value)}
              placeholder="e.g., machine learning, healthcare, IoT"
              className="w-full bg-input-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary" />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Difficulty</label>
            <select value={difficulty} onChange={e => setDifficulty(e.target.value)}
              className="w-full bg-input-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary">
              {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Duration</label>
            <select value={duration} onChange={e => setDuration(e.target.value)}
              className="w-full bg-input-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary">
              {DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Additional Context (optional)</label>
          <textarea value={additionalContext} onChange={e => setAdditionalContext(e.target.value)}
            placeholder="Any specific requirements or context for the proposal..."
            rows={2}
            className="w-full bg-input-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary resize-none" />
        </div>
        <div className="flex justify-end mt-5">
          <button onClick={handleGenerate} disabled={!keywords.trim()}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl transition-colors disabled:cursor-not-allowed">
            <Brain className="w-4 h-4" />
            Generate Proposal
          </button>
        </div>
      </Card>
    </div>
  );

  const renderStep2 = () => (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center animate-pulse">
        <Brain className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-lg font-bold">Generating Your Research Proposal</h3>
      <p className="text-sm text-muted-foreground">AI is crafting a comprehensive proposal for {researchArea}...</p>
      <div className="flex gap-1.5 mt-2">
        <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: "0ms" }} />
        <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: "150ms" }} />
        <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
    </div>
  );

  const renderStep3 = () => {
    if (!proposal) return null;
    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{proposal.title || "Research Proposal"}</h2>
              <p className="text-xs text-muted-foreground">{researchArea} · {difficulty} · {duration}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex gap-1">
              {IMPROVEMENT_OPTIONS.map(opt => (
                <button key={opt.value}
                  onClick={() => setImprovementType(opt.value)}
                  className={`p-2 rounded-lg border transition-colors ${improvementType === opt.value ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20 text-blue-600" : "border-border text-muted-foreground hover:text-foreground"}`}
                  title={opt.label}>
                  <opt.icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-xl transition-colors">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </button>
            <div className="relative group">
              <button className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors">
                <FileDown className="w-4 h-4" />
                Export
              </button>
              <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden hidden group-hover:block z-10">
                <button onClick={handleExportMarkdown} className="block w-full text-left px-4 py-2 text-sm hover:bg-muted/50 transition-colors">Markdown</button>
                <button onClick={handleExportPdf} className="block w-full text-left px-4 py-2 text-sm hover:bg-muted/50 transition-colors">PDF (Print)</button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          <div className="hidden lg:flex flex-col gap-1 w-48 flex-shrink-0">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5">Sections</p>
            {PROPOSAL_SECTIONS.map(s => {
              const content = getSectionContent(s.key);
              return (
                <button key={s.key}
                  onClick={() => setActiveSection(s.key)}
                  className={`text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${activeSection === s.key ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"} ${!content ? "opacity-50" : ""}`}>
                  {s.label}
                </button>
              );
            })}
          </div>

          <div className="flex-1 min-w-0">
            {PROPOSAL_SECTIONS.map(s => {
              const content = getSectionContent(s.key);
              if (s.key !== activeSection) return null;

              return (
                <Card key={s.key}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold">{s.label}</h3>
                    <div className="flex gap-1.5">
                      <button onClick={() => handleImprove(s.key)} disabled={improvingSection === s.key || !content}
                        className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors disabled:opacity-50">
                        {improvingSection === s.key ? <Loader2 className="w-3 h-3 animate-spin" /> : <WandSparkles className="w-3 h-3" />}
                        {improvementType.toLowerCase()}
                      </button>
                      {proposal.id && (
                        <button onClick={() => handleRegenerate(s.key)} disabled={improvingSection === s.key}
                          className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors disabled:opacity-50">
                          <RefreshCw className="w-3 h-3" />
                          Regenerate
                        </button>
                      )}
                    </div>
                  </div>
                  <textarea
                    value={content}
                    onChange={e => updateSectionContent(s.key, e.target.value)}
                    rows={s.key === "abstract" || s.key === "objectives" ? 6 : 8}
                    className="w-full bg-input-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary resize-y font-sans leading-relaxed"
                  />
                  {!content && (
                    <p className="text-xs text-muted-foreground mt-2 italic">This section was not generated. Click "Improve" or "Regenerate" to create content.</p>
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        <div className="flex justify-between">
          <button onClick={() => setStep("configure")}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="w-4 h-4" />
            New Proposal
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl transition-colors">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {proposal.status === "Draft" ? "Save as Draft" : "Update Proposal"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold">AI Proposal Generator</h2>
            <p className="text-xs text-muted-foreground">Create comprehensive research proposals with AI</p>
          </div>
        </div>
        <div className="flex gap-1 bg-muted/50 rounded-xl p-1">
          <button onClick={() => { setViewMode("new"); setStep("configure"); }}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${viewMode === "new" ? "bg-card shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"}`}>
            <Sparkles className="w-4 h-4 inline mr-1" />
            New
          </button>
          <button onClick={() => setViewMode("saved")}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${viewMode === "saved" ? "bg-card shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"}`}>
            <ClipboardList className="w-4 h-4 inline mr-1" />
            Saved ({savedProposals.length})
          </button>
        </div>
      </div>

      {viewMode === "saved" && (
        <Card>
          <SectionHead title="Saved Proposals" />
          {savedProposals.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No saved proposals yet</p>
          ) : (
            <div className="flex flex-col gap-2">
              {savedProposals.map(p => (
                <div key={p.id} className="flex items-center gap-4 p-3 rounded-xl border border-border hover:border-blue-300 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => loadProposal(p.id)}>
                    <p className="text-sm font-bold">{p.title || "Untitled Proposal"}</p>
                    <p className="text-xs text-muted-foreground">{p.researchArea} · {p.difficulty} · {new Date(p.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${p.status === "Completed" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"}`}>
                    {p.status}
                  </span>
                  <button onClick={() => handleDeleteProposal(p.id)}
                    className="p-2 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {viewMode === "new" && (
        <>
          {step === "configure" && renderStep1()}
          {step === "generating" && renderStep2()}
          {step === "result" && renderStep3()}
        </>
      )}

      {error && step !== "generating" && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}
    </div>
  );
}
