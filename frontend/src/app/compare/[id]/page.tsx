'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { compareService } from '@/services/compareService';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, FileCode, CheckCircle2, Sparkles, ChevronLeft, LayoutGrid, Clock, GitBranch, Layers, ChevronRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

export default function CompareDetailsPage() {
  const { id } = useParams() as { id: string };
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'diff' | 'ai'>('ai');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await compareService.getById(id);
        setResult(data);
        if (data.fileDiffs && data.fileDiffs.length > 0) {
          setSelectedFile(data.fileDiffs[0]);
        }
        setActiveTab(data.aiAnalysis ? 'ai' : 'diff');
      } catch (err) {
        console.error('Failed to fetch details', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground font-bold animate-pulse uppercase tracking-widest text-xs">Retrieving Analysis...</p>
        </div>
      </div>
    );
  }

  if (!result) return <div className="container mx-auto py-20 text-center text-destructive">Comparison not found.</div>;

  // Support both old and new data shapes
  const baseRepo = result.baseRepoUrl || result.repoA || '';
  const baseBranch = result.baseBranch || result.branchA || '';
  const sources: any[] = result.sources || (result.repoB ? [{ url: result.repoB, branch: result.branchB }] : []);
  const isMultiRepo = sources.length > 0 && sources[0]?.url !== baseRepo;
  const firstSource = sources[0] || {};

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <Link 
        href="/dashboard" 
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-10 font-bold text-sm group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </Link>

      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className={cn(
              "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
              isMultiRepo ? "bg-orange-500/10 text-orange-500 border-orange-500/20" : "bg-primary/10 text-primary border-primary/20"
            )}>
              {isMultiRepo ? `${sources.length + 1}-Repository Analysis` : "Branch / Commit Delta"}
            </span>
            <span className="text-muted-foreground text-xs font-medium flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {new Date(result.createdAt).toLocaleString()}
            </span>
          </div>
          <h1 className="text-4xl font-black tracking-tight flex items-center flex-wrap gap-x-4 gap-y-2">
            <span className="text-foreground">{baseRepo.split('/').pop() || 'Base Repo'}</span>
            {isMultiRepo && <span className="text-muted-foreground/30 font-light italic">vs</span>}
            {isMultiRepo && <span className="text-foreground">{(firstSource.url || '').split('/').pop()}</span>}
            {isMultiRepo && sources.length > 1 && <span className="text-muted-foreground text-lg font-normal">+{sources.length - 1} more</span>}
          </h1>
          <div className="mt-4 flex items-center gap-3 text-sm font-mono opacity-60 flex-wrap">
            <div className="flex items-center gap-1.5 bg-secondary/50 px-3 py-1 rounded-full">
              <GitBranch className="w-3.5 h-3.5 text-orange-500" />
              {baseBranch || 'main'}
            </div>
            {isMultiRepo && (
              <>
                <ChevronRight className="w-4 h-4" />
                <div className="flex items-center gap-1.5 bg-secondary/50 px-3 py-1 rounded-full">
                  <GitBranch className="w-3.5 h-3.5 text-blue-500" />
                  {firstSource.branch || 'main'}
                </div>
                {sources.length > 1 && (
                  <span className="text-muted-foreground text-xs font-bold">+{sources.length - 1} source(s)</span>
                )}
              </>
            )}
          </div>
        </div>

        <div className="flex gap-4 p-1 bg-secondary/30 rounded-2xl border backdrop-blur-sm">
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
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[
          { icon: FileText, label: "Files Impacted", val: result.filesChanged, color: "blue" },
          { icon: Plus, label: "Additions Made", val: `+${result.additions}`, color: "emerald" },
          { icon: LayoutGrid, label: "Deletions / Reshapes", val: result.deletions > 0 ? `-${result.deletions}` : "New", color: "rose" },
          { icon: CheckCircle2, label: "Analysis Status", val: "Archived", color: "primary" }
        ].map((stat, i) => (
          <div key={i} className="glass-card p-6 flex flex-col items-center text-center gap-2">
            <div className={cn("p-3 rounded-2xl bg-opacity-10", `bg-${stat.color}-500`, `text-${stat.color}-500`)}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="text-2xl font-black">{stat.val}</div>
            <div className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-[500px]">
          {activeTab === 'ai' ? (
            <div className="glass-card p-10 prose prose-invert max-w-none border-t-4 border-t-primary">
              <h2 className="flex items-center gap-3 text-3xl font-black mb-6">
                <Sparkles className="w-8 h-8 text-primary" />
                Deep Technical Report
              </h2>
              <div className="text-muted-foreground leading-relaxed text-lg">
                <ReactMarkdown>{result.aiAnalysis || "This historical record does not have an AI analysis associated with it."}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
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
                    </button>
                  )) : (
                    <div className="p-10 text-center text-muted-foreground text-sm italic bg-secondary/10 rounded-3xl border-2 border-dashed">
                      No direct code diffs found.
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
                    <div className="p-6 bg-secondary/5 rounded-2xl border font-mono text-xs overflow-x-auto whitespace-pre leading-relaxed">
                      {selectedFile.diffContent}
                    </div>
                  </div>
                ) : (
                  <div className="h-[600px] flex flex-col items-center justify-center border-2 border-dashed rounded-[3rem] bg-secondary/10 text-center space-y-4">
                    <div className="p-5 bg-card rounded-3xl shadow-xl"><LayoutGrid className="w-12 h-12 text-muted-foreground/30" /></div>
                    <p className="text-muted-foreground font-bold tracking-tight">Select a file to explore the delta</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
