'use client';

import React, { useState } from 'react';
import { compareService, RepoSource } from '@/services/compareService';
import { DiffViewer } from '@/components/DiffViewer';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, Search, AlertCircle, FileText, ChevronRight, FileCode, CheckCircle2, Plus, Sparkles, LayoutGrid, Layers, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

export default function ComparePage() {
  const [baseRepoUrl, setBaseRepoUrl] = useState('');
  const [baseBranch, setBaseBranch] = useState('main');
  const [sources, setSources] = useState<RepoSource[]>([{ url: '', branch: 'main', nickname: 'Target 1' }]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'diff' | 'ai'>('ai');

  const addSource = () => {
    setSources([...sources, { url: '', branch: 'main', nickname: `Target ${sources.length + 1}` }]);
  };

  const removeSource = (index: number) => {
    if (sources.length > 1) {
      setSources(sources.filter((_, i) => i !== index));
    }
  };

  const updateSource = (index: number, field: keyof RepoSource, value: string) => {
    const newSources = [...sources];
    newSources[index] = { ...newSources[index], [field]: value };
    setSources(newSources);
  };

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setResult(null);
    setSelectedFile(null);
    try {
      const payload = {
        sources,
        baseRepoUrl,
        baseBranch
      };
      const data = await compareService.compare(payload);
      setResult(data);
      if (data.fileDiffs && data.fileDiffs.length > 0) {
        setSelectedFile(data.fileDiffs[0]);
      }
      setActiveTab(data.aiAnalysis ? 'ai' : 'diff');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to perform comparison. Ensure repositories are public and branches exist.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="max-w-4xl mx-auto mb-10 text-center">
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6"
        >
          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Advanced Scalability Mode</span>
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-black tracking-tighter mb-4 bg-gradient-to-r from-primary via-blue-500 to-violet-500 bg-clip-text text-transparent"
        >
          Multi-Repo Intelligence
        </motion.h1>
        <p className="text-muted-foreground text-lg font-medium max-w-2xl mx-auto">Compare a base repository against $N$ other codebases to identify architectural drift, feature gaps, and library consistency.</p>

        <form onSubmit={handleCompare} className="mt-12 space-y-8 text-left">
          {/* Base Repo Section */}
          <div className="glass-card p-8 border-primary/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
               <LayoutGrid className="w-40 h-40" />
            </div>
            <h3 className="text-lg font-black uppercase tracking-widest text-primary mb-6 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-xs">P</span>
              Primary / Base Repository
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">GitHub Repository URL</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="https://github.com/facebook/react"
                    className="w-full pl-12 pr-4 py-4 bg-secondary/50 border rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium"
                    value={baseRepoUrl}
                    onChange={(e) => setBaseRepoUrl(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Branch/Tag</label>
                <div className="relative">
                  <GitBranch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="main"
                    className="w-full pl-12 pr-4 py-4 bg-secondary/50 border rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none transition-all font-mono"
                    value={baseBranch}
                    onChange={(e) => setBaseBranch(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Comparison Sources Section */}
          <div className="space-y-4">
             <div className="flex items-center justify-between px-2">
                <h3 className="text-lg font-black uppercase tracking-widest text-muted-foreground flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-foreground text-xs">S</span>
                  Comparison Sources
                </h3>
                <button 
                  type="button"
                  onClick={addSource}
                  className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-xs font-black hover:bg-primary/20 transition-all flex items-center gap-2 border border-primary/20"
                >
                  <Plus className="w-4 h-4" /> ADD SOURCE
                </button>
             </div>

             <div className="grid grid-cols-1 gap-4">
                <AnimatePresence initial={false}>
                  {sources.map((source, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="glass-card p-6 border-white/5 flex flex-col md:flex-row items-end gap-4 relative group"
                    >
                      <div className="flex-1 space-y-2 w-full">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Source {index + 1} Repository URL</label>
                        <div className="relative">
                           <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                           <input
                            type="text"
                            placeholder="https://github.com/vuejs/core"
                            className="w-full pl-12 pr-4 py-3 bg-secondary/30 border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                            value={source.url}
                            onChange={(e) => updateSource(index, 'url', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="w-full md:w-48 space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Branch</label>
                        <input
                          type="text"
                          placeholder="main"
                          className="w-full px-4 py-3 bg-secondary/30 border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none transition-all font-mono text-sm"
                          value={source.branch}
                          onChange={(e) => updateSource(index, 'branch', e.target.value)}
                          required
                        />
                      </div>
                      <button 
                        type="button"
                        onClick={() => removeSource(index)}
                        disabled={sources.length === 1}
                        className="p-3 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all disabled:opacity-0"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
             </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !baseRepoUrl}
            className="w-full py-6 bg-primary text-primary-foreground font-black rounded-[2rem] hover:bg-primary/90 transition-all shadow-[0_20px_50px_-12px_rgba(var(--primary-rgb),0.5)] disabled:opacity-50 flex items-center justify-center gap-4 text-xl group"
          >
            {isLoading ? (
              <>
                <div className="w-6 h-6 border-3 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ORCHESTRATING AI ENGINE...
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                INITIATE PROJECT INTELLIGENCE
              </>
            )}
          </button>
        </form>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center justify-center gap-3 text-sm font-medium"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </motion.div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-8"
          >
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { icon: FileText, label: "Files Changed", val: result.filesChanged, color: "blue" },
                { icon: Plus, label: "Additions", val: `+${result.additions}`, color: "emerald" },
                { icon: LayoutGrid, label: "Structure Delta", val: result.deletions > 0 ? `-${result.deletions}` : "New", color: "rose" },
                { icon: CheckCircle2, label: "Status", val: "Success", color: "primary" }
              ].map((stat, i) => (
                <div key={i} className="glass-card p-6 flex flex-col items-center text-center gap-2 hover:translate-y-[-4px] transition-all">
                  <div className={cn("p-3 rounded-2xl bg-opacity-10", `bg-${stat.color}-500`, `text-${stat.color}-500`)}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div className="text-2xl font-black">{stat.val}</div>
                  <div className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Content Tabs */}
            <div className="flex gap-4 p-1 bg-secondary/30 rounded-2xl w-fit mx-auto border backdrop-blur-sm">
                <button 
                  onClick={() => setActiveTab('ai')}
                  className={cn(
                    "flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all",
                    activeTab === 'ai' ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Sparkles className="w-4 h-4" /> AI Report
                </button>
                <button 
                  onClick={() => setActiveTab('diff')}
                  className={cn(
                    "flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all",
                    activeTab === 'diff' ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <FileCode className="w-4 h-4" /> Code Diffs
                </button>
            </div>

            <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-[600px]">
              {activeTab === 'ai' ? (
                <div className="glass-card p-10 prose prose-invert max-w-none border-t-4 border-t-primary">
                  <h2 className="flex items-center gap-3 text-3xl font-black mb-6">
                    <Sparkles className="w-8 h-8 text-primary" />
                    Deep Technical Analysis
                  </h2>
                  <div className="text-muted-foreground leading-relaxed text-lg">
                    <ReactMarkdown>{result.aiAnalysis || "Aggregating AI insights..."}</ReactMarkdown>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* ... Existing Diff UI ... */}
                  <div className="lg:col-span-3 space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground px-2">Changed Files</h3>
                    <div className="space-y-1 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                      {result.fileDiffs && result.fileDiffs.length > 0 ? result.fileDiffs.map((file: any, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedFile(file)}
                          className={cn(
                            "w-full text-left px-4 py-3 rounded-2xl text-sm flex items-center justify-between group transition-all",
                            selectedFile === file ? "bg-primary text-primary-foreground shadow-lg" : "bg-card/50 hover:bg-secondary border shadow-sm"
                          )}
                        >
                          <div className="flex items-center gap-3 truncate">
                            <FileCode className={cn("w-4 h-4 shrink-0", selectedFile === file ? "text-primary-foreground" : "text-muted-foreground")} />
                            <span className="truncate font-semibold">{file.fileName}</span>
                          </div>
                          <ChevronRight className={cn("w-4 h-4 opacity-0 transition-all", selectedFile === file ? "opacity-100" : "group-hover:opacity-100")} />
                        </button>
                      )) : (
                        <div className="p-10 text-center text-muted-foreground text-sm italic bg-secondary/10 rounded-3xl border-2 border-dashed">
                          No direct code diffs found for cross-repo summary. Check AI Report.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="lg:col-span-9">
                    {selectedFile ? (
                      <div className="space-y-6 glass-card p-1">
                        <div className="p-4 flex items-center justify-between border-b mx-2">
                           <div className="flex items-center gap-3">
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                              selectedFile.changeType === 'ADD' ? 'bg-emerald-500/20 text-emerald-500' :
                                selectedFile.changeType === 'DELETE' ? 'bg-rose-500/20 text-rose-500' : 'bg-primary/20 text-primary'
                            )}>
                              {selectedFile.changeType}
                            </span>
                            <h2 className="font-mono text-sm font-bold truncate">{selectedFile.fileName}</h2>
                          </div>
                        </div>
                        <div className="p-6 bg-secondary/5 blur-sm-0 rounded-2xl border font-mono text-xs overflow-x-auto whitespace-pre leading-relaxed">
                          {selectedFile.diffContent}
                        </div>
                      </div>
                    ) : (
                      <div className="h-[600px] flex flex-col items-center justify-center border-2 border-dashed rounded-[3rem] bg-secondary/10 text-center space-y-4">
                        <div className="p-5 bg-card rounded-3xl shadow-xl"><LayoutGrid className="w-12 h-12 text-muted-foreground/30" /></div>
                        <p className="text-muted-foreground font-bold tracking-tight">Select a file from the list to explore changes</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
