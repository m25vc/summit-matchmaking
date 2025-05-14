
import { ReactNode } from "react";
import { toast as sonnerToast } from "sonner";

export type ToastProps = {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  cancel?: ReactNode;
  onDismiss?: () => void;
  id?: string;
};

export type ToasterToast = ToastProps & {
  id: string;
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
};

// Empty array for compatibility with the Toaster component
const toasts: ToasterToast[] = [];

export const toast = {
  // Base toast method
  toast: (props: ToastProps) => {
    sonnerToast(props.title as string, {
      description: props.description,
      action: props.action,
      cancel: props.cancel,
      onDismiss: props.onDismiss,
    });
  },
  
  // Success variant
  success: (message: string, description?: string) => {
    sonnerToast.success(message, {
      description,
    });
  },
  
  // Error variant
  error: (message: string, description?: string) => {
    sonnerToast.error(message, {
      description,
    });
  },
  
  // Info variant
  info: (message: string, description?: string) => {
    sonnerToast.info(message, {
      description,
    });
  },
  
  // Warning variant
  warning: (message: string, description?: string) => {
    sonnerToast.warning(message, {
      description,
    });
  }
};

// Export the hook for compatibility with existing code
export const useToast = () => {
  return { 
    toast,
    toasts // Return the empty array for compatibility with the Toaster component
  };
};
