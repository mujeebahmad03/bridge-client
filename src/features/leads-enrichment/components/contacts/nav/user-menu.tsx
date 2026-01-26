"use client";

import { LogOut, Settings, User } from "lucide-react";
import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/ui/skeleton";

import { DASHBOARD_ROUTES } from "@/config/app-route";
import { useAuth } from "@/hooks/use-auth";

import { getFullName, getInitials } from "@/shared/utils";

export function UserMenu() {
  const { signOut, user, isLoadingUser } = useAuth();
  const router = useRouter();

  if (isLoadingUser) {
    return (
      <Button variant="ghost" className="relative h-9 w-9 rounded-full">
        <Skeleton className="h-9 w-9 rounded-full" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.avatar ?? ""} alt={getFullName(user)} />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {getInitials(user)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {getFullName(user)}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email_address}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push(DASHBOARD_ROUTES.PROFILE)}>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.push(DASHBOARD_ROUTES.SETTINGS)}
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => signOut()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
