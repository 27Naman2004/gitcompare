'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { GitBranch, ShieldCheck, Zap, History, ChevronRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl pointer-events-none"
        />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="container px-4 text-center relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6">
            <Zap className="w-3 h-3 fill-primary" />
            Production Ready v1.0
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-b from-foreground to-foreground/50 bg-clip-text text-transparent">
            The Better Way to <br /> <span className="text-primary">Compare Git Repos</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Beautiful, fast, and secure. Compare branches, commits, and file changes with visual precision using our production-grade Git toolkit.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/register" 
              className="px-8 py-3.5 bg-primary text-primary-foreground font-bold rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center gap-2 group"
            >
              Get Started for Free
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/login" 
              className="px-8 py-3.5 bg-secondary text-secondary-foreground font-bold rounded-2xl hover:bg-secondary/80 transition-all border"
            >
              Log In
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-secondary/30 relative border-y">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-card border rounded-3xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <GitBranch className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold tracking-tight">Branch Comparison</h3>
              <p className="text-muted-foreground text-sm">Compare any two branches across any public repository with unified diff views.</p>
            </div>
            <div className="p-8 bg-card border rounded-3xl space-y-4 shadow-xl shadow-black/5">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <History className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold tracking-tight">Full History</h3>
              <p className="text-muted-foreground text-sm">Save your comparison reports and access them anytime from your private dashboard.</p>
            </div>
            <div className="p-8 bg-card border rounded-3xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold tracking-tight">Secure & Scalable</h3>
              <p className="text-muted-foreground text-sm">Next-gen security with JWT tokens and MongoDB as the reliable backend engine.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
