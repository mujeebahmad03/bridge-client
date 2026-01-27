"use client";

import { useCallback, useMemo } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { FieldSelector, type MappableField } from "./field-selector";
import { MappingPreview } from "./mapping-preview";
import { systemFields } from "@/leads/constants";
import { useCreateCustomField, useCustomFields } from "@/leads/hooks";
import { useFileUploadStore, useUsedTargetFieldIds } from "@/leads/stores";
import {
  getSampleValuesForField,
  inferValidatorType,
  mapCustomFieldIdToName,
} from "@/leads/utils";

export function ColumnMapper() {
  const { validation, updateMapping } = useFileUploadStore();
  const usedTargetFieldIds = useUsedTargetFieldIds();

  const sourceFields = useMemo(
    () => validation?.headers ?? [],
    [validation?.headers]
  );
  const preview = useMemo(
    () => validation?.preview ?? [],
    [validation?.preview]
  );

  const { data: customFieldsData, isLoading: loadingCustomFields } =
    useCustomFields();
  const createCustomFieldMutation = useCreateCustomField();

  const allTargetFields = useMemo<MappableField[]>(() => {
    const sysFields: MappableField[] = systemFields.map((f) => ({
      id: f.id,
      name: f.name,
      isCustom: false,
      required: f.required,
    }));

    const customFields: MappableField[] = (customFieldsData?.results ?? []).map(
      (f) => ({
        id: f.id,
        name: f.name,
        isCustom: true,
      })
    );

    return [...sysFields, ...customFields];
  }, [customFieldsData]);

  const getMapping = useCallback((sourceField: string) => {
    const { mappings } = useFileUploadStore.getState();
    return mappings.find((m) => m.sourceField === sourceField);
  }, []);

  const handleCreateCustomField = useCallback(
    async (sourceField: string, fieldName: string) => {
      const sampleValues = getSampleValuesForField(preview, sourceField);
      const validatorType = inferValidatorType(fieldName, sampleValues);

      const newField = await createCustomFieldMutation.mutateAsync({
        name: fieldName,
        validator_type: validatorType,
        description: `Custom field created from column: ${sourceField}`,
      });

      updateMapping(sourceField, newField.id, newField.name, true);
    },
    [preview, createCustomFieldMutation, updateMapping]
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
                      value={mapping?.targetFieldId ?? ""}
                      displayValue={
                        mapping?.targetFieldName ??
                        (mapping?.targetFieldId
                          ? mapCustomFieldIdToName(
                              mapping.targetFieldId,
                              customFieldsData?.results ?? []
                            )
                          : "")
                      }
                      onValueChange={(id, name, isCustom) =>
                        updateMapping(sourceField, id, name, isCustom)
                      }
                      onCreateNew={(name) =>
                        handleCreateCustomField(sourceField, name)
                      }
                      fields={allTargetFields}
                      usedFieldIds={usedTargetFieldIds}
                      currentMappingId={mapping?.targetFieldId}
                      isCreating={createCustomFieldMutation.isPending}
                      isLoading={loadingCustomFields}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <MappingPreview sourceFields={sourceFields} preview={preview} />
    </div>
  );
}
