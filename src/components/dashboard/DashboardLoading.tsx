
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

export const DashboardLoading = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-4 w-[300px]" />
      </div>
      
      <div className="border rounded-lg p-6 space-y-4">
        <Skeleton className="h-6 w-[200px]" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-10 w-[100px]" />
        </div>
        
        <Skeleton className="h-4 w-full" />
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-6 w-[150px]" />
                <Skeleton className="h-6 w-[80px]" />
              </div>
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-24 w-full" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-[120px]" />
                <Skeleton className="h-8 w-[100px]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
