// @/leads/utils/auto-mapper.ts

import type { MappableField } from "@/leads/components/field-selector";
import type { FieldMapping, SystemFieldKey } from "@/leads/types";

interface AutoMapResult {
  mappings: FieldMapping[];
  unmappedFields: string[];
}

// Aliases mapped to actual system field IDs
const FIELD_ALIASES: Record<SystemFieldKey, string[]> = {
  FIRST_NAME: [
    "first_name",
    "firstname",
    "first",
    "fname",
    "given_name",
    "givenname",
  ],
  LAST_NAME: [
    "last_name",
    "lastname",
    "last",
    "lname",
    "surname",
    "family_name",
    "familyname",
  ],
  OTHER_NAMES: [
    "other_names",
    "othernames",
    "middle_name",
    "middlename",
    "middle",
    "other",
  ],
  EMAIL_ADDRESS: [
    "email_address",
    "emailaddress",
    "email",
    "e_mail",
    "mail",
    "contact_email",
    "primary_email",
    "work_email",
  ],
  PRIMARY_PHONE_NUMBER: [
    "primary_phone_number",
    "primaryphonenumber",
    "phone",
    "phone_number",
    "phonenumber",
    "telephone",
    "tel",
    "mobile",
    "cell",
    "contact_phone",
    "primary_phone",
    "work_phone",
  ],
  LINKEDIN_PROFILE: [
    "linkedin_profile",
    "linkedinprofile",
    "linkedin",
    "linkedin_url",
    "linkedinurl",
    "li_profile",
  ],
  ADDRESS_LINE_1: [
    "address_line_1",
    "addressline1",
    "address_1",
    "address1",
    "address",
    "street_address",
    "streetaddress",
    "primary_address",
  ],
  ADDRESS_LINE_2: [
    "address_line_2",
    "addressline2",
    "address_2",
    "address2",
    "apt",
    "apartment",
    "suite",
    "unit",
  ],
  STREET: ["street", "street_name", "streetname", "road"],
  CITY: ["city", "town", "locality", "municipality"],
  STATE: [
    "state",
    "province",
    "region",
    "state_province",
    "stateprovince",
    "county",
  ],
  COUNTRY: ["country", "nation", "country_code", "countrycode", "country_name"],
  ZIP_CODE: [
    "zip_code",
    "zipcode",
    "zip",
    "postal_code",
    "postalcode",
    "postcode",
    "postal",
  ],
  PROFILE_IMAGE: [
    "profile_image",
    "profileimage",
    "avatar",
    "photo",
    "picture",
    "image",
    "profile_photo",
    "profile_picture",
    "headshot",
  ],
  COMPANY_NAME: [
    "company_name",
    "companyname",
    "company",
    "organization",
    "org",
    "business",
    "employer",
    "firm",
  ],
  COMPANY_WEBSITE: [
    "company_website",
    "companywebsite",
    "website",
    "url",
    "company_domain",
    "companydomain",
    "domain",
    "web",
    "site",
    "homepage",
    "company_url",
  ],
  COMPANY_SOCIAL_PROFILE: [
    "company_social_profile",
    "companysocialprofile",
    "company_linkedin",
    "company_social",
    "company_twitter",
    "social_profile",
  ],
  ACQUISITION_SOURCE: [
    "acquisition_source",
    "acquisitionsource",
    "source",
    "lead_source",
    "leadsource",
    "origin",
    "channel",
    "referral_source",
    "how_heard",
  ],
  DESCRIPTION: [
    "description",
    "desc",
    "bio",
    "about",
    "profile_description",
    "notes",
  ],
  SUMMARY: [
    "summary",
    "profile_summary",
    "overview",
    "brief",
    "executive_summary",
  ],
  SKILLS: [
    "skills",
    "skill",
    "expertise",
    "competencies",
    "abilities",
    "capabilities",
  ],
  INTERESTS: [
    "interests",
    "interest",
    "hobbies",
    "passions",
    "topics",
    "areas_of_interest",
  ],
};

// Pre-compute reverse lookup map for O(1) alias matching
const ALIAS_TO_FIELD_ID = new Map<string, SystemFieldKey>();
for (const [fieldId, aliases] of Object.entries(FIELD_ALIASES)) {
  for (const alias of aliases) {
    ALIAS_TO_FIELD_ID.set(alias, fieldId as SystemFieldKey);
  }
}

/**
 * Normalizes a field name for comparison
 */
function normalizeFieldName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

/**
 * Fast exact/alias match - O(1) lookup
 */
function findExactMatch(
  normalizedSource: string,
  availableFields: MappableField[],
  usedFieldIds: Set<string>
): MappableField | null {
  // Check alias map first
  const matchedFieldId = ALIAS_TO_FIELD_ID.get(normalizedSource);
  if (matchedFieldId && !usedFieldIds.has(matchedFieldId)) {
    const field = availableFields.find((f) => f.id === matchedFieldId);
    if (field) {
      return field;
    }
  }

  // Direct ID match
  const upperSource = normalizedSource.toUpperCase().replace(/_/g, "_");
  const directMatch = availableFields.find(
    (f) =>
      !usedFieldIds.has(f.id) &&
      (f.id === upperSource || normalizeFieldName(f.name) === normalizedSource)
  );

  return directMatch ?? null;
}

/**
 * Fuzzy match using contains check and Levenshtein distance
 */
function findFuzzyMatch(
  normalizedSource: string,
  availableFields: MappableField[],
  usedFieldIds: Set<string>
): { field: MappableField; score: number } | null {
  let bestMatch: { field: MappableField; score: number } | null = null;

  for (const field of availableFields) {
    if (usedFieldIds.has(field.id)) {
      continue;
    }

    const normalizedTarget = normalizeFieldName(field.name);

    // Contains check (faster than Levenshtein)
    if (
      normalizedSource.includes(normalizedTarget) ||
      normalizedTarget.includes(normalizedSource)
    ) {
      const score = 0.8;
      if (!bestMatch || score > bestMatch.score) {
        bestMatch = { field, score };
      }
      continue;
    }

    // Check against aliases for partial matches
    const aliases = FIELD_ALIASES[field.id as SystemFieldKey] || [];
    for (const alias of aliases) {
      if (
        normalizedSource.includes(alias) ||
        alias.includes(normalizedSource)
      ) {
        const score = 0.75;
        if (!bestMatch || score > bestMatch.score) {
          bestMatch = { field, score };
        }
        break;
      }
    }

    // Levenshtein only for short strings (expensive for long strings)
    if (normalizedSource.length <= 20 && normalizedTarget.length <= 20) {
      const distance = levenshteinDistance(normalizedSource, normalizedTarget);
      const maxLen = Math.max(normalizedSource.length, normalizedTarget.length);
      const score = 1 - distance / maxLen;

      if (score > 0.65 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = { field, score };
      }
    }
  }

  return bestMatch;
}

/**
 * Levenshtein distance - optimized with early termination
 */
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;

  // Early termination for very different lengths
  if (Math.abs(m - n) > Math.max(m, n) * 0.4) {
    return Math.max(m, n);
  }

  // Use single array instead of matrix for space efficiency
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  let curr = new Array(n + 1);

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        curr[j] = prev[j - 1];
      } else {
        curr[j] = 1 + Math.min(prev[j], curr[j - 1], prev[j - 1]);
      }
    }
    [prev, curr] = [curr, prev];
  }

  return prev[n];
}

/**
 * Main auto-mapping function
 */
export function autoMapFields(
  sourceFields: string[],
  targetFields: MappableField[]
): AutoMapResult {
  const mappings: FieldMapping[] = [];
  const unmappedFields: string[] = [];
  const usedFieldIds = new Set<string>();

  // Separate required and optional fields
  const requiredFields = targetFields.filter((f) => f.required);
  const optionalFields = targetFields.filter((f) => !f.required);

  // Process each source field
  for (const sourceField of sourceFields) {
    const normalizedSource = normalizeFieldName(sourceField);

    // Try exact match first (O(1) for aliases)
    let matchedField = findExactMatch(
      normalizedSource,
      targetFields,
      usedFieldIds
    );

    // Try fuzzy match if no exact match
    if (!matchedField) {
      // Prioritize required fields for fuzzy matching
      const fuzzyMatch =
        findFuzzyMatch(normalizedSource, requiredFields, usedFieldIds) ??
        findFuzzyMatch(normalizedSource, optionalFields, usedFieldIds);

      if (fuzzyMatch && fuzzyMatch.score >= 0.65) {
        matchedField = fuzzyMatch.field;
      }
    }

    if (matchedField) {
      mappings.push({
        sourceField,
        targetFieldId: matchedField.id,
        targetFieldName: matchedField.name,
        isCustom: matchedField.isCustom,
      });
      usedFieldIds.add(matchedField.id);
    } else {
      unmappedFields.push(sourceField);
    }
  }

  return { mappings, unmappedFields };
}
