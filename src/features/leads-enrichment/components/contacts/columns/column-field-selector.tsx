import { CreateableCombobox } from "@/components/common";

export interface ColumnOption {
  id: string;
  label: string;
  isCustom: boolean;
  rightSlot?: React.ReactNode;
}

interface ColumnFieldSelectorProps {
  value: string;
  displayValue: string;
  onValueChange: (id: string, label: string, isCustom: boolean) => void;
  onCreateNew: (name: string) => void;
  columns: ColumnOption[];
  isCreating?: boolean;
  isLoading?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  systemHeading?: string;
  customHeading?: string;
  createHeading?: string;
  popoverWidthClassName?: string;
  disabled?: boolean;
}

export function ColumnFieldSelector({
  value,
  displayValue,
  onValueChange,
  onCreateNew,
  columns,
  isCreating,
  isLoading,
  placeholder = "Select or create column...",
  searchPlaceholder = "Search or create column...",
  systemHeading = "System Columns",
  customHeading = "Custom Columns",
  createHeading = "Create New",
  popoverWidthClassName = "w-[300px]",
  disabled,
}: ColumnFieldSelectorProps) {
  return (
    <CreateableCombobox
      value={value}
      displayValue={displayValue}
      items={columns.map((c) => ({
        id: c.id,
        label: c.label,
        isCustom: c.isCustom,
        rightSlot: c.rightSlot,
      }))}
      onSelect={(item) => onValueChange(item.id, item.label, !!item.isCustom)}
      onCreate={(name) => onCreateNew(name)}
      onClear={() => onValueChange("", "", false)}
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      systemHeading={systemHeading}
      customHeading={customHeading}
      createHeading={createHeading}
      popoverWidthClassName={popoverWidthClassName}
      isCreating={isCreating}
      isLoading={isLoading}
      disabled={disabled}
    />
  );
}
