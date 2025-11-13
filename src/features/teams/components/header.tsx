import { UserPlus, Users } from "lucide-react";

import { Button } from "@/ui/button";

interface TeamHeaderProps {
  onInviteClick: () => void;
}

export const TeamHeader = ({ onInviteClick }: TeamHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Users className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Team Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your team members and invitations
          </p>
        </div>
      </div>
      <Button onClick={onInviteClick}>
        <UserPlus className="h-4 w-4 mr-2" />
        Invite User
      </Button>
    </div>
  );
};
