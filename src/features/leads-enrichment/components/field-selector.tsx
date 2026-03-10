"use client";

import { ColumnFieldSelector } from "./contacts/columns/column-field-selector";

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
  const availableFields = fields.filter(
    (field) => !usedFieldIds.has(field.id) || field.id === currentMappingId
  );

  const columns = availableFields.map((field) => ({
    id: field.id,
    label: field.name,
    isCustom: field.isCustom,
    rightSlot: field.required ? (
      <span className="ml-auto text-xs text-destructive">*</span>
    ) : undefined,
  }));

  return (
    <ColumnFieldSelector
      value={value}
      displayValue={displayValue}
      onValueChange={onValueChange}
      onCreateNew={onCreateNew}
      columns={columns}
      isCreating={isCreating}
      isLoading={isLoading}
      placeholder="Select field..."
      searchPlaceholder="Search or create field..."
      systemHeading="System Fields"
      customHeading="Custom Fields"
      createHeading="Create New"
      popoverWidthClassName="w-[250px]"
    />
  );
}
