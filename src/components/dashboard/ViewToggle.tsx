
import React from 'react';
import { LayoutGrid, LayoutList } from "lucide-react";

interface ViewToggleProps {
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ viewMode, setViewMode }) => {
  return (
    <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
      <button
        onClick={() => setViewMode('grid')}
        className={`p-2 rounded-md transition-colors ${
          viewMode === 'grid' ? 'bg-background text-foreground' : 'text-muted-foreground'
        }`}
      >
        <LayoutGrid className="h-5 w-5" />
      </button>
      <button
        onClick={() => setViewMode('list')}
        className={`p-2 rounded-md transition-colors ${
          viewMode === 'list' ? 'bg-background text-foreground' : 'text-muted-foreground'
        }`}
      >
        <LayoutList className="h-5 w-5" />
      </button>
    </div>
  );
};
