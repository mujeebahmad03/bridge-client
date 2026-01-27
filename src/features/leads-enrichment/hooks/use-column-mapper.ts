"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";

import type { MappableField } from "@/leads/components/field-selector";
import { systemFields } from "@/leads/constants";
import { useCreateCustomField, useCustomFields } from "@/leads/hooks";
import { useFileUploadStore, useUsedTargetFieldIds } from "@/leads/stores";
import {
  autoMapFields,
  getSampleValuesForField,
  inferValidatorType,
  mapCustomFieldIdToName,
} from "@/leads/utils";

export function useColumnMapper() {
  const { validation, mappings, updateMapping, setMappings } =
    useFileUploadStore();

  const usedTargetFieldIds = useUsedTargetFieldIds();
  const hasAutoMapped = useRef(false);

  const { data: customFieldsData, isLoading: isLoadingCustomFields } =
    useCustomFields();
  const createCustomFieldMutation = useCreateCustomField();

  // Derived data
  const sourceFields = useMemo(
    () => validation?.headers ?? [],
    [validation?.headers]
  );

  const preview = useMemo(
    () => validation?.preview ?? [],
    [validation?.preview]
  );

  const customFields = useMemo(
    () => customFieldsData?.results ?? [],
    [customFieldsData?.results]
  );

  const allTargetFields = useMemo<MappableField[]>(() => {
    const sysFields: MappableField[] = systemFields.map((f) => ({
      id: f.id,
      name: f.name,
      isCustom: false,
      required: f.required,
    }));

    const custom: MappableField[] = customFields.map((f) => ({
      id: f.id,
      name: f.name,
      isCustom: true,
    }));

    return [...sysFields, ...custom];
  }, [customFields]);

  // Auto-map on mount when data is ready
  useEffect(() => {
    const shouldAutoMap =
      !hasAutoMapped.current &&
      !isLoadingCustomFields &&
      sourceFields.length > 0 &&
      allTargetFields.length > 0 &&
      mappings.length === 0;

    if (!shouldAutoMap) {
      return;
    }

    const { mappings: autoMappings } = autoMapFields(
      sourceFields,
      allTargetFields
    );

    if (autoMappings.length > 0) {
      setMappings(autoMappings);
    }
    hasAutoMapped.current = true;
  }, [
    sourceFields,
    allTargetFields,
    isLoadingCustomFields,
    mappings.length,
    setMappings,
  ]);

  // Get mapping for a specific source field
  const getMapping = useCallback(
    (sourceField: string) =>
      mappings.find((m) => m.sourceField === sourceField),
    [mappings]
  );

  // Get display value for a mapping
  const getDisplayValue = useCallback(
    (sourceField: string) => {
      const mapping = getMapping(sourceField);
      if (!mapping?.targetFieldId) {
        return "";
      }
      return (
        mapping.targetFieldName ||
        mapCustomFieldIdToName(mapping.targetFieldId, customFields)
      );
    },
    [getMapping, customFields]
  );

  // Get sample value for a source field
  const getSampleValue = useCallback(
    (sourceField: string) => preview[0]?.[sourceField] ?? "-",
    [preview]
  );

  // Check if a field was auto-mapped
  const isAutoMapped = useCallback(
    (sourceField: string) => {
      const mapping = getMapping(sourceField);
      return hasAutoMapped.current && !!mapping?.targetFieldId;
    },
    [getMapping]
  );

  // Handle field selection
  const handleFieldSelect = useCallback(
    (sourceField: string, id: string, name: string, isCustom: boolean) => {
      updateMapping(sourceField, id, name, isCustom);
    },
    [updateMapping]
  );

  // Handle custom field creation
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

  return {
    // Data
    sourceFields,
    preview,
    allTargetFields,
    usedTargetFieldIds,

    // State
    isLoadingCustomFields,
    isCreatingCustomField: createCustomFieldMutation.isPending,

    // Getters
    getMapping,
    getDisplayValue,
    getSampleValue,
    isAutoMapped,

    // Actions
    handleFieldSelect,
    handleCreateCustomField,
  };
}
