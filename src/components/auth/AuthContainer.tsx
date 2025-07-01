import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface AuthContainerProps {
  isLoading: boolean;
  children: React.ReactNode;
}

const AuthContainer = ({ isLoading, children }: AuthContainerProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="p-8 rounded-xl bg-white shadow-xl w-full max-w-md border border-gray-200">
          <div className="mb-6 flex justify-center">
            <img 
              src="/lovable-uploads/ed6dc4fc-70bd-4ee0-aa8e-01c89f7c45f3.png" 
              alt="M25 Logo" 
              className="h-12 w-auto"
            />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="flex justify-center">
          <img 
            src="/lovable-uploads/ed6dc4fc-70bd-4ee0-aa8e-01c89f7c45f3.png" 
            alt="M25 Logo" 
            className="h-12 w-auto"
          />
        </div>
        <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-200">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthContainer;
