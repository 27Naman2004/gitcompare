'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { compareService } from '@/services/compareService';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  History, 
  GitBranch, 
  ArrowRight, 
  Clock, 
  Plus, 
  Search, 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  Activity,
  Zap,
  Sparkles,
  Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Interface for summary stats returned from backend
 */
interface DashboardStats {
  totalComparisons: number;
  totalAdditions: number;
  totalDeletions: number;
  totalFilesChanged: number;
  topRepo: string;
}

/**
 * Dashboard Component
 * 
 * Provides a premium overview of the user's comparison history and activity.
 */
export default function Dashboard() {
  const [history, setHistory] = useState<any[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [historyData, statsData] = await Promise.all([
          compareService.getHistory(),
          compareService.getStats()
        ]);
        setHistory(historyData);
        setStats(statsData);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredHistory = useMemo(() => {
    if (!searchTerm) return history;
    const term = searchTerm.toLowerCase();
    return history.filter(item => {
      // Support new multi-repo structure (baseRepoUrl + sources[])
      const baseUrl = item.baseRepoUrl || item.repoA || '';
      const sourceUrls = item.sources?.map((s: any) => s.url || '').join(' ') || item.repoB || '';
      return baseUrl.toLowerCase().includes(term) || sourceUrls.toLowerCase().includes(term);
    });
  }, [history, searchTerm]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 py-12 relative z-10">
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">AI Analytics Dashboard</span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-foreground">
              Hello, <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">Developer</span>
            </h1>
            <p className="text-muted-foreground mt-3 text-lg font-medium max-w-xl">
              Track your repository growth, branch deltas, and cross-project architectural insights in one place.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex gap-4"
          >
             <Link 
              href="/compare" 
              data-tour="new-comparison"
              className="bg-primary text-primary-foreground px-8 py-4 rounded-[2rem] font-black hover:bg-primary/90 transition-all flex items-center gap-3 shadow-[0_20px_50px_-12px_rgba(var(--primary-rgb),0.3)] group"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              Analyze New Comparison
            </Link>
          </motion.div>
        </header>

        {/* Stats Grid */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          data-tour="stats"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <StatCard title="Total Analysed" value={stats?.totalComparisons ?? 0} icon={<Activity />} color="blue" delay={0.1} />
          <StatCard title="Lines Added" value={stats?.totalAdditions ?? 0} icon={<TrendingUp />} color="emerald" delay={0.2} />
          <StatCard title="Lines Removed" value={stats?.totalDeletions ?? 0} icon={<TrendingDown />} color="rose" delay={0.3} />
          <StatCard title="Files Parsed" value={stats?.totalFilesChanged ?? 0} icon={<FileText />} color="violet" delay={0.4} />
        </motion.div>

        {/* Search & Tabs */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-6" data-tour="history">
            <h2 className="text-3xl font-black flex items-center gap-3 tracking-tight">
              <History className="w-8 h-8 text-primary" />
              Comparison Feed
            </h2>
          </div>
          
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="text"
              placeholder="Search by repo name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 rounded-[2rem] border bg-card/30 backdrop-blur-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all shadow-inner text-sm font-bold"
            />
          </div>
        </div>

        {/* History Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 rounded-[3rem] bg-card/50 animate-pulse border-2 border-white/5" />
            ))}
          </div>
        ) : filteredHistory.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            <AnimatePresence mode="popLayout">
              {filteredHistory.map((item) => (
                <HistoryCard key={item.id} item={item} variants={itemVariants} />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 border-4 border-dashed rounded-[4rem] bg-card/20 backdrop-blur-xl border-white/5 text-center">
            <div className="w-24 h-24 rounded-[2.5rem] bg-secondary/50 flex items-center justify-center mb-8 shadow-2xl">
              <Zap className="w-12 h-12 text-muted-foreground/30" />
            </div>
            <h3 className="text-3xl font-black tracking-tight">No comparisons yet</h3>
            <p className="text-muted-foreground mt-4 max-w-sm text-lg font-medium">
              {searchTerm ? "Couldn't find any results matching your search query." : "Dive into your first repository analysis to see your statistics here."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, delay }: { title: string, value: number, icon: any, color: string, delay: number }) {
  return (
    <motion.div 
      variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
      className="glass-card p-8 group hover:translate-y-[-8px] transition-all duration-500"
    >
      <div className={cn("inline-flex p-4 rounded-[1.5rem] mb-6 shadow-sm bg-opacity-10", `bg-${color}-500`, `text-${color}-500 group-hover:scale-110 transition-transform`)}>
        {React.cloneElement(icon, { className: "w-6 h-6" })}
      </div>
      <div className="text-[11px] font-black uppercase tracking-[0.25em] text-muted-foreground mb-1">{title}</div>
      <div className="text-4xl font-black tracking-tighter">{value.toLocaleString()}</div>
    </motion.div>
  );
}

function HistoryCard({ item, variants }: { item: any, variants: any }) {
  // Support both old (repoA/repoB) and new (baseRepoUrl/sources) data shapes
  const baseRepo = item.baseRepoUrl || item.repoA || '';
  const baseBranch = item.baseBranch || item.branchA || 'main';
  const sources: any[] = item.sources || (item.repoB ? [{ url: item.repoB, branch: item.branchB }] : []);
  const isMultiRepo = sources.length > 1 || (sources.length === 1 && sources[0]?.url !== baseRepo);
  const firstSourceUrl = sources[0]?.url || '';
  const firstSourceBranch = sources[0]?.branch || '';

  return (
    <motion.div
      layout
      variants={variants}
      whileHover={{ y: -6, scale: 1.01 }}
      className="group glass-card p-1 relative flex flex-col h-full bg-card/40 hover:bg-card/60 transition-all duration-500"
    >
      <div className="p-7 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-14 h-14 rounded-3xl flex items-center justify-center transition-all duration-500 ring-8",
              isMultiRepo ? "bg-orange-500/10 text-orange-500 ring-orange-500/5" : "bg-primary/10 text-primary ring-primary/5"
            )}>
              {isMultiRepo ? <Layers className="w-7 h-7" /> : <GitBranch className="w-7 h-7" />}
            </div>
            <div className="min-w-0">
               <div className="flex items-center gap-2 mb-1">
                 <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border">
                   {isMultiRepo ? `${sources.length + 1}-Repo Analysis` : 'Branch Analysis'}
                 </span>
                 {item.aiAnalysis && (
                   <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                     <Sparkles className="w-2.5 h-2.5" /> AI
                   </span>
                 )}
               </div>
               <h3 className="text-xl font-bold truncate tracking-tight group-hover:text-primary transition-colors">
                 {(baseRepo.split('/').pop()) || 'Base Repo'}
                 {isMultiRepo && <span className="text-muted-foreground mx-2 font-light">vs</span>}
                 {isMultiRepo && (firstSourceUrl.split('/').pop() || '')}
                 {isMultiRepo && sources.length > 1 && <span className="text-muted-foreground text-sm ml-1">+{sources.length - 1} more</span>}
               </h3>
               <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold mt-1">
                 <Clock className="w-3 h-3" />
                 {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
               </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-8 bg-secondary/20 p-4 rounded-2xl border border-dashed">
          <div className="flex-1 min-w-0">
            <div className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground mb-1">Base Repo</div>
            <div className="text-xs font-mono font-bold truncate opacity-80">{baseBranch}</div>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground/30 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground mb-1">
              {isMultiRepo ? `${sources.length} Source(s)` : 'Target'}
            </div>
            <div className="text-xs font-mono font-bold truncate opacity-80">{firstSourceBranch || 'N/A'}</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 py-4 mb-6 border-y border-white/5">
          <div className="text-center">
            <div className="text-[9px] font-black text-muted-foreground uppercase mb-1">Files</div>
            <div className="text-xl font-black">{item.filesChanged}</div>
          </div>
          <div className="text-center border-x border-white/5 px-2">
            <div className="text-[9px] font-black text-emerald-500 uppercase mb-1">Plus</div>
            <div className="text-xl font-black text-emerald-500">+{item.additions}</div>
          </div>
          <div className="text-center">
            <div className="text-[9px] font-black text-rose-500 uppercase mb-1">Minus</div>
            <div className="text-xl font-black text-rose-500">-{item.deletions}</div>
          </div>
        </div>

        <Link 
          href={`/compare/${item.id}`}
          className="mt-auto w-full group/btn flex items-center justify-center gap-3 py-4 rounded-[1.5rem] bg-secondary/50 text-foreground font-black hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-sm"
        >
          View Full Insights
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
}
