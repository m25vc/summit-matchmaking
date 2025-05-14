
import React from 'react';
import { UserCard } from './UserCard';
import type { UserWithDetails } from '@/types/dashboard';

interface UserGridProps {
  users: UserWithDetails[];
  currentUser: UserWithDetails;
  onPriorityChange: (
    userId: string, 
    priority: 'high' | 'medium' | 'low' | null, 
    notInterested?: boolean
  ) => Promise<void>;
}

export function UserGrid({ users, currentUser, onPriorityChange }: UserGridProps) {
  if (users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-lg text-muted-foreground">No users found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {users.map(user => (
        <UserCard
          key={user.id}
          user={user}
          currentUser={currentUser}
          onPriorityChange={onPriorityChange}
        />
      ))}
    </div>
  );
}
