"use client";

import { Check, ChevronsUpDown, Loader2, Plus, X } from "lucide-react";
import { useState } from "react";

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

export interface MappableField {
  id: string;
  name: string;
  isCustom: boolean;
  required?: boolean;
}

interface FieldSelectorProps {
  value: string;
  displayValue: string;
  onValueChange: (id: string, name: string, isCustom: boolean) => void;
  onCreateNew: (name: string) => void;
  fields: MappableField[];
  usedFieldIds: Set<string>;
  currentMappingId?: string;
  isCreating?: boolean;
  isLoading?: boolean;
}

export function FieldSelector({
  value,
  displayValue,
  onValueChange,
  onCreateNew,
  fields,
  usedFieldIds,
  currentMappingId,
  isCreating,
  isLoading,
}: FieldSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const availableFields = fields.filter(
    (field) => !usedFieldIds.has(field.id) || field.id === currentMappingId
  );

  const showCreateOption =
    searchValue.trim() &&
    !fields.some(
      (f) => f.name.toLowerCase() === searchValue.trim().toLowerCase()
    );

  const handleSelect = (field: MappableField) => {
    onValueChange(field.id, field.name, field.isCustom);
    setOpen(false);
    setSearchValue("");
  };

  const handleCreate = () => {
    onCreateNew(searchValue.trim());
    setOpen(false);
    setSearchValue("");
  };

  const handleClear = () => {
    onValueChange("", "", false);
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={isCreating}
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
              displayValue || "Select field..."
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search or create field..."
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
                    No matching field found
                  </CommandEmpty>

                  {showCreateOption && (
                    <>
                      <CommandGroup heading="Create New">
                        <CommandItem onSelect={handleCreate} className="gap-2">
                          <Plus className="h-4 w-4" />
                          Create &quot;{searchValue.trim()}&quot;
                        </CommandItem>
                      </CommandGroup>
                      <CommandSeparator />
                    </>
                  )}

                  <CommandGroup heading="System Fields">
                    {availableFields
                      .filter((f) => !f.isCustom)
                      .filter(
                        (f) =>
                          !searchValue ||
                          f.name
                            .toLowerCase()
                            .includes(searchValue.toLowerCase())
                      )
                      .map((field) => (
                        <CommandItem
                          key={field.id}
                          value={field.id}
                          onSelect={() => handleSelect(field)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              value === field.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {field.name}
                          {field.required && (
                            <span className="ml-auto text-xs text-destructive">
                              *
                            </span>
                          )}
                        </CommandItem>
                      ))}
                  </CommandGroup>

                  {availableFields.some((f) => f.isCustom) && (
                    <CommandGroup heading="Custom Fields">
                      {availableFields
                        .filter((f) => f.isCustom)
                        .filter(
                          (f) =>
                            !searchValue ||
                            f.name
                              .toLowerCase()
                              .includes(searchValue.toLowerCase())
                        )
                        .map((field) => (
                          <CommandItem
                            key={field.id}
                            value={field.id}
                            onSelect={() => handleSelect(field)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                value === field.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {field.name}
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
          onClick={handleClear}
          disabled={isCreating}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Clear mapping</span>
        </Button>
      )}
    </div>
  );
}
