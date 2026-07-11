import { useEffect, useState } from "react";
import { Plus, Telescope } from "lucide-react";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";
import { hodService } from "../../services/HodService";
import { ResearchCategory, ResearchTopic } from "../../types/Hod";

export default function HodResearchTopics() {
  const [categories, setCategories] = useState<ResearchCategory[]>([]);
  const [topics, setTopics] = useState<ResearchTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState<string | undefined>(undefined);
  const [showCatForm, setShowCatForm] = useState(false);
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [catForm, setCatForm] = useState({ name: "", description: "" });
  const [topicForm, setTopicForm] = useState({ title: "", description: "", categoryId: "" });

  const fetchData = async () => {
    try {
      const [cats, tops] = await Promise.all([
        hodService.getCategories(),
        hodService.getTopics(selectedCat),
      ]);
      setCategories(cats);
      setTopics(tops);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [selectedCat]);

  const handleCreateCat = async () => {
    try {
      await hodService.createCategory(catForm);
      setShowCatForm(false);
      setCatForm({ name: "", description: "" });
      fetchData();
    } catch {}
  };

  const handleCreateTopic = async () => {
    try {
      await hodService.createTopic(topicForm);
      setShowTopicForm(false);
      setTopicForm({ title: "", description: "", categoryId: "" });
      fetchData();
    } catch {}
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Research Topics</h2>
        <div className="flex gap-2">
          <button onClick={() => setShowCatForm(!showCatForm)}
            className="flex items-center gap-2 bg-indigo-600 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-indigo-700">
            <Plus className="w-4 h-4" /> Category
          </button>
          <button onClick={() => setShowTopicForm(!showTopicForm)}
            className="flex items-center gap-2 bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-blue-700">
            <Plus className="w-4 h-4" /> Topic
          </button>
        </div>
      </div>

      {showCatForm && (
        <Card>
          <SectionHead title="New Category" />
          <div className="flex flex-col gap-3 mt-3">
            <input value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})} placeholder="Category name"
              className="bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary" />
            <input value={catForm.description} onChange={e => setCatForm({...catForm, description: e.target.value})} placeholder="Description"
              className="bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary" />
            <button onClick={handleCreateCat} className="bg-indigo-600 text-white text-sm font-bold px-4 py-2 rounded-xl w-fit hover:bg-indigo-700">Create</button>
          </div>
        </Card>
      )}

      {showTopicForm && (
        <Card>
          <SectionHead title="New Topic" />
          <div className="flex flex-col gap-3 mt-3">
            <select value={topicForm.categoryId} onChange={e => setTopicForm({...topicForm, categoryId: e.target.value})}
              className="bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary">
              <option value="">Select category</option>
              {categories.filter(c => c.isActive).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input value={topicForm.title} onChange={e => setTopicForm({...topicForm, title: e.target.value})} placeholder="Topic title"
              className="bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary" />
            <input value={topicForm.description} onChange={e => setTopicForm({...topicForm, description: e.target.value})} placeholder="Description"
              className="bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary" />
            <button onClick={handleCreateTopic} className="bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-xl w-fit hover:bg-blue-700">Create</button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <SectionHead title="Categories" />
          <div className="flex flex-col gap-2 mt-3">
            <button onClick={() => setSelectedCat(undefined)}
              className={`text-left px-3 py-2 rounded-lg text-sm ${!selectedCat ? "bg-blue-100 dark:bg-blue-900/30 font-bold" : "hover:bg-muted"}`}>
              All Categories
            </button>
            {categories.map(c => (
              <button key={c.id} onClick={() => setSelectedCat(c.id)}
                className={`text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between ${selectedCat === c.id ? "bg-blue-100 dark:bg-blue-900/30 font-bold" : "hover:bg-muted"}`}>
                <span>{c.name}</span>
                <span className="text-xs text-muted-foreground">({c.researchTopicCount})</span>
              </button>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <SectionHead title={selectedCat ? categories.find(c => c.id === selectedCat)?.name || "Topics" : "All Topics"} />
          <div className="flex flex-col gap-3 mt-3">
            {topics.map(t => (
              <div key={t.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-foreground">{t.title}</p>
                    <Badge variant={t.isActive ? "success" : "outline"}>{t.isActive ? "Active" : "Archived"}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.categoryName} · by {t.createdByName}</p>
                </div>
                <Telescope className="w-4 h-4 text-muted-foreground" />
              </div>
            ))}
            {!topics.length && <p className="text-sm text-muted-foreground text-center py-4">No topics found</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}
