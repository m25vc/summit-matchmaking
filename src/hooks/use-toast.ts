import { toast } from "sonner";
import { useCallback, useState } from "react";

// Create our own useToast hook based on sonner's toast
export function useToast() {
  const [toasts, setToasts] = useState<any[]>([]);
  
  // Custom dismiss function
  const dismiss = useCallback((toastId?: string) => {
    if (toastId) {
      toast.dismiss(toastId);
      setToasts((currentToasts) => 
        currentToasts.filter((toast) => toast.id !== toastId)
      );
    } else {
      toast.dismiss();
      setToasts([]);
    }
  }, []);
  
  // Custom toast function that keeps track of toasts
  const customToast = useCallback((props: any) => {
    const id = toast(props);
    const newToast = { id, ...props };
    setToasts((currentToasts) => [...currentToasts, newToast]);
    return id;
  }, []);

  return {
    toast: customToast,
    dismiss,
    toasts,
  };
}

// Re-export the original toast function for direct use
export { toast };
