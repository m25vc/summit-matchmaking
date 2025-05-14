
import { toast as sonnerToast } from "sonner";
import type { ReactNode } from "react";

type ToastProps = {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  cancel?: ReactNode;
  onDismiss?: () => void;
};

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

  // Success toast
  success: (message: string, description?: string) => {
    sonnerToast.success(message, { description });
  },

  // Error toast
  error: (message: string, description?: string) => {
    sonnerToast.error(message, { description });
  },

  // Info toast
  info: (message: string, description?: string) => {
    sonnerToast.info(message, { description });
  },

  // Warning toast
  warning: (message: string, description?: string) => {
    sonnerToast.warning(message, { description });
  }
};

// Also export the hook for compatibility with existing code
export const useToast = () => {
  return { toast };
};
