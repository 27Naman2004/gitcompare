'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Send, CheckCircle2, Sparkles, Zap, GitMerge, Shield, BarChart3, Puzzle, ArrowRight } from 'lucide-react';

const CATEGORIES = [
  { id: 'feature', label: 'New Feature', icon: Sparkles, color: 'primary' },
  { id: 'integration', label: 'Integration', icon: Puzzle, color: 'blue' },
  { id: 'performance', label: 'Performance', icon: Zap, color: 'yellow' },
  { id: 'security', label: 'Security', icon: Shield, color: 'emerald' },
  { id: 'ai', label: 'AI Enhancement', icon: BarChart3, color: 'violet' },
  { id: 'workflow', label: 'Workflow', icon: GitMerge, color: 'orange' },
];

// Static roadmap items (for project vision)
const STATIC_ROADMAP = [
  { title: 'GitHub Actions Integration', description: 'Trigger comparisons directly from CI/CD pipelines.', status: 'planned', icon: GitMerge },
  { title: 'AI Refactor Suggestions', description: 'Get AI-driven code refactoring recommendations per diff.', status: 'in-progress', icon: Sparkles },
  { title: 'Team Workspaces', description: 'Share comparison reports with your entire engineering team.', status: 'planned', icon: Shield },
  { title: 'Real-time Diff WebSocket', description: 'Live updates as repository changes happen.', status: 'research', icon: Zap },
];

const API_BASE_URL = 'https://gitcompare.onrender.com';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  'planned': { label: 'Planned', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  'PLANNED': { label: 'Planned', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  'in-progress': { label: 'In Progress', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  'IN_PROGRESS': { label: 'In Progress', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  'research': { label: 'Research', color: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
  'RESEARCH': { label: 'Research', color: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
  'SHIPPED': { label: 'Shipped', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
};

export default function SuggestionsPage() {
  const [category, setCategory] = useState('feature');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dynamicRoadmap, setDynamicRoadmap] = useState<any[]>([]);

  React.useEffect(() => {
    fetch(`${API_BASE_URL}/api/public/roadmap`)
      .then(res => res.json())
      .then(data => {
        // Flatten the grouped map into an array
        const items = Object.values(data).flat();
        setDynamicRoadmap(items as any[]);
      })
      .catch(err => console.error('Failed to fetch roadmap:', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/public/suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, title, description, email }),
      });
      if (!res.ok) throw new Error('Server error');
      setSubmitted(true);
    } catch (err) {
      console.error('Submission failed:', err);
      alert('Could not submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/4 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-violet-500/4 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 py-16 relative z-10 max-w-6xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Lightbulb className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Community Voice</span>
          </div>
          <h1 className="text-6xl font-black tracking-tighter mb-6">
            Shape the <span className="bg-gradient-to-r from-primary via-blue-400 to-violet-400 bg-clip-text text-transparent">Future</span>
          </h1>
          <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
            GitCompare is built for developers, by developers. Tell us what you want to see next — 
            every suggestion is read and considered for the roadmap.
          </p>
          <p className="text-sm text-muted-foreground mt-3">
            Platform by <span className="font-black text-primary">Naman Katre</span>
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Suggestion Form */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <div className="glass-card p-10 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-blue-500 to-violet-500" />
              
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                    </div>
                    <h3 className="text-2xl font-black mb-3 tracking-tight">Suggestion Received!</h3>
                    <p className="text-muted-foreground font-medium mb-8">
                      Thank you for making GitCompare better. Your idea has been logged and will be reviewed for the next release cycle.
                    </p>
                    <button
                      onClick={() => { setSubmitted(false); setTitle(''); setDescription(''); setEmail(''); }}
                      className="px-8 py-3 rounded-[1.5rem] bg-primary text-primary-foreground font-black text-sm hover:bg-primary/90 transition-all"
                    >
                      Submit Another
                    </button>
                  </motion.div>
                ) : (
                  <motion.form key="form" onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-black tracking-tight mb-1">Submit a Suggestion</h2>
                      <p className="text-sm text-muted-foreground font-medium">Your ideas drive the roadmap.</p>
                    </div>

                    {/* Category */}
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-3 block">Category</label>
                      <div className="grid grid-cols-3 gap-2">
                        {CATEGORIES.map(cat => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setCategory(cat.id)}
                            className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-xs font-bold transition-all ${
                              category === cat.id
                                ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
                                : 'bg-card/50 border-border hover:border-primary/40 text-muted-foreground'
                            }`}
                          >
                            <cat.icon className="w-4 h-4" />
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2 block">Title *</label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="e.g. Add GitHub Actions webhook support"
                        className="w-full px-5 py-4 rounded-2xl border bg-secondary/20 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all text-sm font-semibold placeholder:text-muted-foreground/50"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2 block">Description *</label>
                      <textarea
                        required
                        rows={4}
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Describe the feature or enhancement in detail. What problem does it solve? How should it work?"
                        className="w-full px-5 py-4 rounded-2xl border bg-secondary/20 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all text-sm font-semibold placeholder:text-muted-foreground/50 resize-none"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2 block">Your Email <span className="normal-case font-normal">(optional, for updates)</span></label>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-5 py-4 rounded-2xl border bg-secondary/20 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all text-sm font-semibold placeholder:text-muted-foreground/50"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !title || !description}
                      className="w-full py-5 rounded-[2rem] bg-primary text-primary-foreground font-black text-sm flex items-center justify-center gap-3 hover:bg-primary/90 transition-all shadow-[0_20px_50px_-12px_rgba(var(--primary-rgb),0.4)] disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          SUBMIT SUGGESTION
                        </>
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Roadmap */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-6">
            <div>
              <h2 className="text-2xl font-black tracking-tight mb-1 flex items-center gap-3">
                <ArrowRight className="w-6 h-6 text-primary" />
                Current Roadmap
              </h2>
              <p className="text-sm text-muted-foreground font-medium">Planned features for upcoming releases.</p>
            </div>
            
            <div className="space-y-4">
              {[...STATIC_ROADMAP, ...dynamicRoadmap.map(item => ({
                title: item.title,
                description: item.description,
                status: item.status,
                icon: Lightbulb
              }))].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i + 0.2 }}
                  className="glass-card p-6 flex items-start gap-5 group hover:translate-x-2 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h3 className="font-black text-sm tracking-tight">{item.title}</h3>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${STATUS_CONFIG[item.status]?.color || 'border-border'}`}>
                        {STATUS_CONFIG[item.status]?.label || item.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium leading-relaxed">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="glass-card p-6 text-center bg-gradient-to-br from-primary/5 to-violet-500/5 border-primary/20">
              <Lightbulb className="w-8 h-8 text-primary mx-auto mb-3" />
              <p className="text-sm font-black text-foreground mb-1">Have a bold idea?</p>
              <p className="text-xs text-muted-foreground font-medium">
                The best features on this roadmap came from users like you. Submit your suggestion and see it become reality.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
