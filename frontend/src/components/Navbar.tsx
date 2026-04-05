'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { GitBranch, History, LogOut, User, HelpCircle } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <GitBranch className="w-6 h-6 text-primary" />
          <span>GitCompare</span>
        </Link>

        <div className="flex items-center gap-6">
          {user ? (
            <>
              <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-2">
                <History className="w-4 h-4" />
                History
              </Link>
              <Link href="/compare" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-2">
                <GitBranch className="w-4 h-4" />
                Compare
              </Link>
              <button 
                onClick={() => { localStorage.removeItem('hasSeenTour'); window.location.reload(); }}
                className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-2"
              >
                <HelpCircle className="w-4 h-4" />
                Tour
              </button>
              <div className="flex items-center gap-4 pl-4 border-l">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <User className="w-4 h-4" />
                  {user.username}
                </div>
                <button
                  onClick={logout}
                  className="text-sm font-medium text-destructive hover:text-destructive/80 transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
                Login
              </Link>
              <Link
                href="/register"
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
