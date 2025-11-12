"use client";

import { ChevronsUpDown, Plus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/ui/button";

import { useTeamSwitcher } from "@/layout/hooks";
import { CreateTeamModal } from "@/teams/components";
import { getTeamLogo } from "@/teams/utils";

export function TeamSwitcher() {
  const { isOpen, setIsOpen, isMobile, currentTeam, teams, setCurrentTeamId } =
    useTeamSwitcher();

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem className="h-12">
          {!currentTeam ? (
            <div className="flex items-center gap-2 mb-4 h-full">
              <Button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 w-full"
                size="sm"
              >
                <Plus className="size-4" />
                Create a Team
              </Button>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    {currentTeam &&
                      (() => {
                        const LogoIcon = getTeamLogo(currentTeam.id);
                        return <LogoIcon className="size-4" />;
                      })()}
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      {currentTeam?.name}
                    </span>
                    <span className="truncate text-xs">
                      {currentTeam?.name.toLowerCase()}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                align="start"
                side={isMobile ? "bottom" : "right"}
                sideOffset={4}
              >
                <DropdownMenuLabel className="text-muted-foreground text-xs">
                  Teams
                </DropdownMenuLabel>
                {teams.map((team, index) => {
                  const LogoIcon = getTeamLogo(team.id);
                  return (
                    <DropdownMenuItem
                      key={team.id} // Use team.id instead of team.name for key
                      onClick={() => setCurrentTeamId(team.id)} // Fixed: was setCurrentTeam(team)
                      className="gap-2 p-2"
                    >
                      <div className="flex size-6 items-center justify-center rounded-md border">
                        <LogoIcon className="size-3.5 shrink-0" />
                      </div>
                      {team.name}
                      <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                    </DropdownMenuItem>
                  );
                })}

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="gap-2 p-2"
                  onClick={() => setIsOpen(true)}
                >
                  <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                    <Plus className="size-4" />
                  </div>
                  <div className="text-muted-foreground font-medium">
                    Add team
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </SidebarMenuItem>
      </SidebarMenu>

      <CreateTeamModal open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
