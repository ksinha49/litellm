export const GUARDRAIL_TYPE_ALIASES: Record<string, string> = {
  bedrock: "bedrock",
  "aws_bedrock_guardrails": "bedrock",
  "aws_bedrock": "bedrock",
  "amazon_bedrock": "bedrock",
  "amazon_bedrock_guardrails": "bedrock",
  "bedrock_guardrails": "bedrock",
  "bedrock_guardrail": "bedrock",
  "presidio_guardrails": "presidio",
  "azure_presidio": "presidio",
  "microsoft_presidio": "presidio",
  presidio: "presidio",
  "lakera_guardrails": "lakera",
  "lakera_guardrail": "lakera",
  lakera: "lakera",
  "lakera_v2": "lakera",
  "lakera-v2": "lakera",
};

export const SUPPORTED_GUARDRAIL_TYPES = ["bedrock", "presidio", "lakera"] as const;

const GUARDRAIL_SUFFIX_REGEX = /[-_\s]?guardrails?$/;

/**
 * Normalize guardrail type strings coming from provider-specific identifiers.
 *
 * @param guardrailType - Raw guardrail type value (e.g. `aws_bedrock_guardrails`)
 * @returns Canonical guardrail type understood by the backend, or undefined when input is empty
 */
export const normalizeGuardrailType = (guardrailType?: string | null): string | undefined => {
  if (!guardrailType) {
    return undefined;
  }

  const trimmed = guardrailType.trim();
  if (!trimmed) {
    return undefined;
  }

  const lower = trimmed.toLowerCase();
  if (GUARDRAIL_TYPE_ALIASES[lower]) {
    return GUARDRAIL_TYPE_ALIASES[lower];
  }

  const withoutSuffix = lower.replace(GUARDRAIL_SUFFIX_REGEX, "");
  if (withoutSuffix && GUARDRAIL_TYPE_ALIASES[withoutSuffix]) {
    return GUARDRAIL_TYPE_ALIASES[withoutSuffix];
  }

  if (withoutSuffix.includes("bedrock")) {
    return "bedrock";
  }
  if (withoutSuffix.includes("presidio")) {
    return "presidio";
  }
  if (withoutSuffix.includes("lakera")) {
    return "lakera";
  }

  return withoutSuffix || lower;
};
