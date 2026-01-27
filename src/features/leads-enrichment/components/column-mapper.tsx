"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { FieldSelector } from "./field-selector";
import { MappingPreview } from "./mapping-preview";
import { useColumnMapper } from "@/leads/hooks/use-column-mapper";

export function ColumnMapper() {
  const {
    sourceFields,
    preview,
    allTargetFields,
    usedTargetFieldIds,
    isLoadingCustomFields,
    isCreatingCustomField,
    getMapping,
    getDisplayValue,
    getSampleValue,
    isAutoMapped,
    handleFieldSelect,
    handleCreateCustomField,
  } = useColumnMapper();

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
            {sourceFields.map((sourceField) => (
              <ColumnMapperRow
                key={sourceField}
                sourceField={sourceField}
                sampleValue={getSampleValue(sourceField)}
                mapping={getMapping(sourceField)}
                displayValue={getDisplayValue(sourceField)}
                isAutoMapped={isAutoMapped(sourceField)}
                allTargetFields={allTargetFields}
                usedTargetFieldIds={usedTargetFieldIds}
                isLoadingCustomFields={isLoadingCustomFields}
                isCreatingCustomField={isCreatingCustomField}
                onFieldSelect={handleFieldSelect}
                onCreateCustomField={handleCreateCustomField}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <MappingPreview sourceFields={sourceFields} preview={preview} />
    </div>
  );
}

// Extracted row component for better performance with React.memo potential
interface ColumnMapperRowProps {
  sourceField: string;
  sampleValue: string;
  mapping: ReturnType<ReturnType<typeof useColumnMapper>["getMapping"]>;
  displayValue: string;
  isAutoMapped: boolean;
  allTargetFields: ReturnType<typeof useColumnMapper>["allTargetFields"];
  usedTargetFieldIds: ReturnType<typeof useColumnMapper>["usedTargetFieldIds"];
  isLoadingCustomFields: boolean;
  isCreatingCustomField: boolean;
  onFieldSelect: (
    sourceField: string,
    id: string,
    name: string,
    isCustom: boolean
  ) => void;
  onCreateCustomField: (sourceField: string, fieldName: string) => void;
}

function ColumnMapperRow({
  sourceField,
  sampleValue,
  mapping,
  displayValue,
  isAutoMapped,
  allTargetFields,
  usedTargetFieldIds,
  isLoadingCustomFields,
  isCreatingCustomField,
  onFieldSelect,
  onCreateCustomField,
}: ColumnMapperRowProps) {
  return (
    <TableRow>
      <TableCell className="font-medium text-foreground">
        <div className="flex items-center gap-2">
          {sourceField}
          {isAutoMapped && (
            <Badge variant="secondary" className="text-xs font-normal">
              Auto
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground truncate max-w-[200px]">
        {sampleValue}
      </TableCell>
      <TableCell>
        <FieldSelector
          value={mapping?.targetFieldId ?? ""}
          displayValue={displayValue}
          onValueChange={(id, name, isCustom) =>
            onFieldSelect(sourceField, id, name, isCustom)
          }
          onCreateNew={(name) => onCreateCustomField(sourceField, name)}
          fields={allTargetFields}
          usedFieldIds={usedTargetFieldIds}
          currentMappingId={mapping?.targetFieldId}
          isCreating={isCreatingCustomField}
          isLoading={isLoadingCustomFields}
        />
      </TableCell>
    </TableRow>
  );
}
