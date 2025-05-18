
import { useState } from 'react';
import { useSheetSync } from '@/hooks/use-sheet-sync';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface SheetSyncButtonProps {
  onSyncComplete?: () => void;
}

export function SheetSyncButton({ onSyncComplete }: SheetSyncButtonProps) {
  const [syncing, setSyncing] = useState(false);
  const { syncMatchesToSheets } = useSheetSync();

  const handleSync = async () => {
    if (syncing) return;
    
    setSyncing(true);
    try {
      const result = await syncMatchesToSheets();
      if (result.success && onSyncComplete) {
        onSyncComplete();
      }
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Button 
      variant="outline"
      size="sm"
      onClick={handleSync}
      disabled={syncing}
      className="ml-2"
    >
      <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
      {syncing ? 'Syncing...' : 'Sync to Sheets'}
    </Button>
  );
}
