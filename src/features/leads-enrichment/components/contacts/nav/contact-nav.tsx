"use client";

import { usePathname } from "next/navigation";

import { ThemeModeToggle } from "@/ui/theme-mode-toggle";

import { MobileNav } from "./mobile-nav";
import { UserMenu } from "./user-menu";

export function ContactNavbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-14 items-center px-4">
        {/* Mobile menu */}
        <MobileNav pathname={pathname} />

        {/* Logo */}

        {/* Right side actions */}
        <div className="ml-auto flex items-center gap-1">
          <ThemeModeToggle />
          <div className="ml-2">
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
