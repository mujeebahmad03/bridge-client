"use client";

import { Check, ChevronsUpDown, Loader2, Plus, X } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { cn } from "@/lib/utils";

export interface CreateableComboboxItem {
  id: string;
  label: string;
  isCustom?: boolean;
  rightSlot?: React.ReactNode;
  disabled?: boolean;
}

interface CreateableComboboxProps {
  value: string;
  displayValue: string;
  items: CreateableComboboxItem[];

  onSelect: (item: CreateableComboboxItem) => void;
  onCreate: (name: string) => void;
  onClear: () => void;

  placeholder?: string;
  searchPlaceholder?: string;
  systemHeading?: string;
  customHeading?: string;
  createHeading?: string;
  popoverWidthClassName?: string;

  isCreating?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
}

export function CreateableCombobox({
  value,
  displayValue,
  items,
  onSelect,
  onCreate,
  onClear,
  placeholder = "Select...",
  searchPlaceholder = "Search or create...",
  systemHeading = "System",
  customHeading = "Custom",
  createHeading = "Create New",
  popoverWidthClassName = "w-[300px]",
  isCreating,
  isLoading,
  disabled,
}: CreateableComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const normalized = searchValue.trim().toLowerCase();
  const showCreateOption =
    normalized.length > 0 &&
    !items.some((i) => i.label.toLowerCase() === normalized);

  const filtered = useMemo(() => {
    if (!normalized) {
      return items;
    }
    return items.filter((i) => i.label.toLowerCase().includes(normalized));
  }, [items, normalized]);

  const systemItems = filtered.filter((i) => !i.isCustom);
  const customItems = filtered.filter((i) => i.isCustom);

  const handleSelect = (item: CreateableComboboxItem) => {
    onSelect(item);
    setOpen(false);
    setSearchValue("");
  };

  const handleCreate = () => {
    const name = searchValue.trim();
    if (!name) {
      return;
    }
    onCreate(name);
    setOpen(false);
    setSearchValue("");
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={isCreating ?? disabled}
            className={cn(
              "w-full justify-between font-normal",
              !displayValue && "text-muted-foreground"
            )}
          >
            {isCreating ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </span>
            ) : (
              displayValue || placeholder
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className={cn(popoverWidthClassName, "p-0")}
          align="start"
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={searchPlaceholder}
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              {isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <CommandEmpty className="py-2 px-4 text-sm text-muted-foreground">
                    No matching results
                  </CommandEmpty>

                  {showCreateOption && (
                    <>
                      <CommandGroup heading={createHeading}>
                        <CommandItem onSelect={handleCreate} className="gap-2">
                          <Plus className="h-4 w-4" />
                          Create &quot;{searchValue.trim()}&quot;
                        </CommandItem>
                      </CommandGroup>
                      <CommandSeparator />
                    </>
                  )}

                  {systemItems.length > 0 && (
                    <CommandGroup heading={systemHeading}>
                      {systemItems.map((item) => (
                        <CommandItem
                          key={item.id}
                          value={item.id}
                          disabled={item.disabled}
                          onSelect={() => handleSelect(item)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              value === item.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {item.label}
                          {item.rightSlot}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}

                  {customItems.length > 0 && (
                    <CommandGroup heading={customHeading}>
                      {customItems.map((item) => (
                        <CommandItem
                          key={item.id}
                          value={item.id}
                          disabled={item.disabled}
                          onSelect={() => handleSelect(item)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              value === item.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {item.label}
                          {item.rightSlot}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {displayValue && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={onClear}
          disabled={isCreating ?? disabled}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Clear selection</span>
        </Button>
      )}
    </div>
  );
}
