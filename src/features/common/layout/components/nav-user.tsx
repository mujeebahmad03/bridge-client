"use client";

import {
  IconCreditCard,
  IconDotsVertical,
  IconLogout,
  IconNotification,
  IconUserCircle,
} from "@tabler/icons-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

import { useAuth } from "@/hooks/use-auth";

import { type User } from "@/auth/types";
import { getFullName, getInitials } from "@/shared/utils";

function UserAvatar({
  user,
  className = "h-8 w-8 rounded-lg",
}: {
  user?: User | null;
  className?: string;
}) {
  return (
    <Avatar className={className}>
      <AvatarImage src={user?.avatar} alt={getFullName(user)} />
      <AvatarFallback className="rounded-lg">
        {getInitials(user)}
      </AvatarFallback>
    </Avatar>
  );
}

function UserInfo({ user }: { user?: User | null }) {
  return (
    <div className="grid flex-1 text-left text-sm leading-tight">
      <span className="truncate font-medium">{getFullName(user)}</span>
      <span className="text-muted-foreground truncate text-xs">
        {user?.email_address}
      </span>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex items-center gap-3 px-2 py-1.5">
      <div className="h-8 w-8 rounded-lg bg-linear-to-r from-muted via-muted-foreground/30 to-muted animate-[shimmer_2s_ease-in-out_infinite] bg-size-[200%_100%]" />
      <div className="grid flex-1 gap-2">
        <div className="h-4 w-24 rounded bg-linear-to-r from-muted via-muted-foreground/30 to-muted animate-[shimmer_2s_ease-in-out_infinite] bg-size-[200%_100%]" />
        <div className="h-3 w-32 rounded bg-linear-to-r from-muted via-muted-foreground/30 to-muted animate-[shimmer_2s_ease-in-out_infinite] bg-size-[200%_100%]" />
      </div>
    </div>
  );
}

export function NavUser() {
  const { isMobile } = useSidebar();
  const { signOut, user, isLoadingUser } = useAuth();

  if (isLoadingUser) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <LoadingSkeleton />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <UserAvatar
                user={user}
                className="h-8 w-8 rounded-lg grayscale"
              />
              <UserInfo user={user} />
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <UserAvatar user={user} />
                <UserInfo user={user} />
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <IconUserCircle />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconCreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconNotification />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()}>
              <IconLogout />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
