
import { toast } from "sonner";

export { toast };

export const useToast = () => {
  return {
    toast: (props: {
      title?: React.ReactNode;
      description?: React.ReactNode;
      action?: React.ReactNode;
      cancel?: React.ReactNode;
      onDismiss?: () => void;
    }) => {
      toast(props.title as string, {
        description: props.description,
        action: props.action,
        cancel: props.cancel,
        onDismiss: props.onDismiss,
      });
    }
  };
};
