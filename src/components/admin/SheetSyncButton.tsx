
import { useState } from 'react';
import { useSheetSync } from '@/hooks/use-sheet-sync';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface SheetSyncButtonProps {
  onSyncComplete?: () => void;
}

export function SheetSyncButton({ onSyncComplete }: SheetSyncButtonProps) {
  const [localSyncing, setLocalSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('Sync to Sheets');
  const { syncMatchesToSheets, isSyncing } = useSheetSync();

  const handleSync = async () => {
    if (localSyncing || isSyncing) return;
    
    setLocalSyncing(true);
    setSyncMessage('Syncing data...');
    
    try {
      console.log("Starting sheet sync via button");
      const result = await syncMatchesToSheets();
      
      if (result.success) {
        console.log("Sync completed successfully");
        setSyncMessage('Sync complete');
        
        // Reset message after 2 seconds
        setTimeout(() => {
          setSyncMessage('Sync to Sheets');
        }, 2000);
        
        if (onSyncComplete) {
          onSyncComplete();
        }
      } else {
        console.error("Sync failed:", result.error);
        setSyncMessage('Sync failed');
        
        // Reset message after 2 seconds
        setTimeout(() => {
          setSyncMessage('Try again');
        }, 2000);
      }
    } finally {
      setLocalSyncing(false);
    }
  };

  // Use either the local or hook syncing state
  const isButtonSyncing = localSyncing || isSyncing;

  return (
    <Button 
      variant="outline"
      size="sm"
      onClick={handleSync}
      disabled={isButtonSyncing}
      className="ml-2"
    >
      <RefreshCw className={`h-4 w-4 mr-2 ${isButtonSyncing ? 'animate-spin' : ''}`} />
      {syncMessage}
    </Button>
  );
}
