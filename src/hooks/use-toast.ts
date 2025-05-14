
import { toast as sonnerToast } from "sonner";
import type { ReactNode } from "react";

type ToastProps = {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  cancel?: ReactNode;
  onDismiss?: () => void;
  id?: string;
};

const TOAST_LIMIT = 1;
export const TOAST_REMOVE_DELAY = 1000000;

export type ToasterToast = ToastProps & {
  id: string;
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
};

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const;

let count = 0;

function generateId() {
  return `${Date.now()}-${++count}`;
}

// This is a simplified implementation that mimics the behavior of the toast store
// without using a full state management solution
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

// Export the hook for compatibility with existing code
export const useToast = () => {
  return { 
    toast,
    toasts: [] // Return an empty array for compatibility with the Toaster component
  };
};
