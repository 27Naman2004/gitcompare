'use client';

import React, { useState, useEffect } from 'react';
import { Joyride, Step, STATUS } from 'react-joyride';
import { usePathname } from 'next/navigation';

export const SiteTour: React.FC = () => {
  const [run, setRun] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    // Show tour if it's the first time on the dashboard
    const hasSeenTour = localStorage.getItem('hasSeenTour');
    if (!hasSeenTour && pathname === '/dashboard') {
      const timer = setTimeout(() => setRun(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  const steps: Step[] = [
    {
      target: 'body',
      placement: 'center',
      content: (
        <div className="text-left">
          <h3 className="text-lg font-black tracking-tight mb-2 text-primary">Welcome to GitCompare!</h3>
          <p className="text-sm text-muted-foreground font-medium">Let's take a quick tour of your new AI-powered multi-repository intelligence dashboard.</p>
        </div>
      ),
    },
    {
      target: '[data-tour="stats"]',
      content: 'Track aggregated metrics across all your repository analyses in real-time.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="new-comparison"]',
      content: 'Ready to analyze? Click here to start a new multi-repo comparison with up to $N$ targets.',
      placement: 'left',
    },
    {
      target: '[data-tour="history"]',
      content: 'Your entire comparison history and deep AI reports are stored here for easy access.',
      placement: 'top',
    },
  ];

  const handleJoyrideCallback = (data: any) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      setRun(false);
      localStorage.setItem('hasSeenTour', 'true');
    }
  };

  if (!mounted) return null;

  return (
    <Joyride
      {...({
        steps,
        run,
        continuous: true,
        showSkipButton: true,
        hideCloseButton: true,
        disableOverlayClose: true,
        callback: handleJoyrideCallback,
        styles: {
          tooltipContainer: {
            textAlign: 'left',
            borderRadius: '1.5rem',
            padding: '1.25rem',
            border: '1px solid hsl(var(--border))',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            background: 'hsl(var(--card))',
          },
          buttonNext: {
            borderRadius: '1rem',
            fontWeight: '900',
            fontSize: '0.7rem',
            letterSpacing: '0.1em',
            padding: '0.75rem 1.5rem',
            background: 'hsl(var(--primary))',
            color: 'hsl(var(--primary-foreground))',
            textTransform: 'uppercase',
          },
          buttonBack: {
            fontWeight: '900',
            fontSize: '0.7rem',
            marginRight: '1rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'hsl(var(--muted-foreground))',
          },
          buttonSkip: {
            fontWeight: '900',
            fontSize: '0.7rem',
            color: 'hsl(var(--muted-foreground))',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          },
        }
      } as any)}
    />
  );
};
