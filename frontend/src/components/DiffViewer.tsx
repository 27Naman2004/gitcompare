'use client';

import React from 'react';
import { DiffEditor } from '@monaco-editor/react';

interface DiffViewerProps {
  original: string;
  modified: string;
  language?: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ original, modified, language = 'javascript' }) => {
  return (
    <div className="h-[600px] border rounded-xl overflow-hidden bg-card shadow-sm">
      <DiffEditor
        height="100%"
        language={language}
        original={original}
        modified={modified}
        theme="vs-dark"
        options={{
          renderSideBySide: true,
          readOnly: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </div>
  );
};
