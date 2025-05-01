import React from 'react';
import { UserCard } from './UserCard';
import { UserListView } from './UserListView';
import type { UserWithDetails } from '@/types/dashboard';

interface UserGridProps {
  users: UserWithDetails[];
  onPriorityChange: (userId: string, priority: 'high' | 'medium' | 'low' | null, notInterested?: boolean) => Promise<void>;
  viewMode: 'grid' | 'list';
  emptyMessage?: string;
}

export const UserGrid: React.FC<UserGridProps> = ({ 
  users, 
  onPriorityChange, 
  viewMode,
  emptyMessage = "No matches found with the selected filters"
}) => {
  if (users.length === 0) {
    return (
      <p className="col-span-full text-center text-gray-500 py-8">
        {emptyMessage}
      </p>
    );
  }

  return viewMode === 'grid' ? (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {users.map((user) => (
        <UserCard 
          key={user.id} 
          user={user} 
          onPriorityChange={onPriorityChange}
        />
      ))}
    </div>
  ) : (
    <div className="space-y-4">
      {users.map((user) => (
        <UserListView
          key={user.id} 
          user={user} 
          onPriorityChange={onPriorityChange}
        />
      ))}
    </div>
  );
};
