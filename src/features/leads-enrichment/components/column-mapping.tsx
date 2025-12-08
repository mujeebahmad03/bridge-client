import { Check, ChevronsUpDown, Plus, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { cn } from "@/lib/utils";

import { systemFields } from "@/leads/data";
import type { FieldMapping, SystemField } from "@/leads/types";

interface ColumnMapperProps {
  sourceFields: string[];
  preview: Record<string, string>[];
  mappings: FieldMapping[];
  onMappingsChange: (mappings: FieldMapping[]) => void;
}

export function ColumnMapper({
  sourceFields,
  preview,
  mappings,
  onMappingsChange,
}: ColumnMapperProps) {
  const [customFields, setCustomFields] = useState<SystemField[]>([]);

  const allTargetFields = useMemo(() => {
    return [...systemFields, ...customFields];
  }, [customFields]);

  const usedTargetFields = useMemo(() => {
    return new Set(mappings.map((m) => m.targetField).filter(Boolean));
  }, [mappings]);

  const getMapping = useCallback(
    (sourceField: string): FieldMapping | undefined => {
      return mappings.find((m) => m.sourceField === sourceField);
    },
    [mappings]
  );

  const updateMapping = useCallback(
    (sourceField: string, targetField: string, isCustom = false) => {
      const existingIndex = mappings.findIndex(
        (m) => m.sourceField === sourceField
      );
      const newMappings = [...mappings];

      if (existingIndex >= 0) {
        if (targetField) {
          newMappings[existingIndex] = { sourceField, targetField, isCustom };
        } else {
          newMappings.splice(existingIndex, 1);
        }
      } else if (targetField) {
        newMappings.push({ sourceField, targetField, isCustom });
      }

      onMappingsChange(newMappings);
    },
    [mappings, onMappingsChange]
  );

  const createCustomField = useCallback(
    (sourceField: string, fieldName: string) => {
      const newField: SystemField = {
        id: `custom_${fieldName.toLowerCase().replace(/\s+/g, "_")}`,
        name: fieldName,
        type: "text",
        required: false,
      };

      setCustomFields((prev) => [...prev, newField]);
      updateMapping(sourceField, newField.name, true);
    },
    [updateMapping]
  );

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-1/3">Your Column</TableHead>
              <TableHead className="w-1/3">Sample Data</TableHead>
              <TableHead className="w-1/3">Map To</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sourceFields.map((sourceField) => {
              const mapping = getMapping(sourceField);
              const sampleValue = preview[0]?.[sourceField] ?? "-";

              return (
                <TableRow key={sourceField}>
                  <TableCell className="font-medium text-foreground">
                    {sourceField}
                  </TableCell>
                  <TableCell className="text-muted-foreground truncate max-w-[200px]">
                    {sampleValue}
                  </TableCell>
                  <TableCell>
                    <FieldSelector
                      value={mapping?.targetField ?? ""}
                      onValueChange={(value) =>
                        updateMapping(sourceField, value)
                      }
                      onCreateNew={(name) =>
                        createCustomField(sourceField, name)
                      }
                      fields={allTargetFields}
                      usedFields={usedTargetFields}
                      currentMapping={mapping?.targetField}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {preview.length > 1 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Data Preview</h4>
          <div className="rounded-lg border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  {sourceFields.slice(0, 5).map((field) => (
                    <TableHead key={field} className="min-w-[120px]">
                      {field}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.slice(0, 3).map((row, index) => (
                  <TableRow key={index}>
                    {sourceFields.slice(0, 5).map((field) => (
                      <TableCell
                        key={field}
                        className="text-muted-foreground truncate max-w-[150px]"
                      >
                        {row[field] || "-"}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}

interface FieldSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  onCreateNew: (name: string) => void;
  fields: SystemField[];
  usedFields: Set<string>;
  currentMapping?: string;
}

function FieldSelector({
  value,
  onValueChange,
  onCreateNew,
  fields,
  usedFields,
  currentMapping,
}: FieldSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const availableFields = fields.filter(
    (field) => !usedFields.has(field.name) || field.name === currentMapping
  );

  const showCreateOption =
    searchValue.trim() &&
    !fields.some(
      (f) => f.name.toLowerCase() === searchValue.trim().toLowerCase()
    );

  const handleSelect = (fieldName: string) => {
    onValueChange(fieldName);
    setOpen(false);
    setSearchValue("");
  };

  const handleCreate = () => {
    onCreateNew(searchValue.trim());
    setOpen(false);
    setSearchValue("");
  };

  const handleClear = () => {
    onValueChange("");
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between font-normal",
              !value && "text-muted-foreground"
            )}
          >
            {value || "Select field..."}
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
                  .filter(
                    (f) =>
                      !searchValue ||
                      f.name.toLowerCase().includes(searchValue.toLowerCase())
                  )
                  .map((field) => (
                    <CommandItem
                      key={field.id}
                      value={field.name}
                      onSelect={() => handleSelect(field.name)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === field.name ? "opacity-100" : "opacity-0"
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
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {value && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={handleClear}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Clear mapping</span>
        </Button>
      )}
    </div>
  );
}
