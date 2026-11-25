export interface Freeze {
  at: string;
  why: string;
  note: string;
}

export interface Heart {
  what: string;
  why: string;
  whom: string;
  frozen_at: string;
  freezes: Freeze[];
}

const ISO_8601 =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSingleLine(value: string): boolean {
  return !/[\n\r]/.test(value);
}

function isIso8601(value: string): boolean {
  if (!ISO_8601.test(value)) return false;
  return !Number.isNaN(Date.parse(value));
}

function validateRequiredString(
  obj: Record<string, unknown>,
  field: string,
  problems: string[],
): string | undefined {
  if (!(field in obj)) {
    problems.push(`missing required field: ${field}`);
    return undefined;
  }
  const value = obj[field];
  if (typeof value !== "string") {
    problems.push(`${field} must be a string`);
    return undefined;
  }
  if (value.length === 0) {
    problems.push(`${field} must be non-empty`);
    return value;
  }
  if (!isSingleLine(value)) {
    problems.push(`${field} must be a single line`);
    return value;
  }
  return value;
}

export function validate(value: unknown): string[] {
  const problems: string[] = [];

  if (!isRecord(value)) {
    return ["heart.json must be an object"];
  }

  const what = validateRequiredString(value, "what", problems);
  const why = validateRequiredString(value, "why", problems);
  validateRequiredString(value, "whom", problems);

  let frozenAt: string | undefined;
  if (!("frozen_at" in value)) {
    problems.push("missing required field: frozen_at");
  } else if (typeof value.frozen_at !== "string") {
    problems.push("frozen_at must be a string");
  } else if (value.frozen_at.length === 0) {
    problems.push("frozen_at must be non-empty");
  } else if (!isIso8601(value.frozen_at)) {
    problems.push("frozen_at must be an ISO 8601 timestamp");
  } else {
    frozenAt = value.frozen_at;
  }

  if (!("freezes" in value)) {
    problems.push("missing required field: freezes");
    return problems;
  }

  const freezesValue = value.freezes;
  if (!Array.isArray(freezesValue)) {
    problems.push("freezes must be an array");
    return problems;
  }

  if (freezesValue.length === 0) {
    problems.push("freezes must contain at least one entry");
    return problems;
  }

  const freezes: Freeze[] = [];
  for (let i = 0; i < freezesValue.length; i += 1) {
    const entry = freezesValue[i];
    const prefix = `freezes[${i}]`;
    if (!isRecord(entry)) {
      problems.push(`${prefix} must be an object`);
      continue;
    }

    const at = entry.at;
    const entryWhy = entry.why;
    const note = entry.note;

    if (!("at" in entry)) {
      problems.push(`${prefix} missing required field: at`);
    } else if (typeof at !== "string") {
      problems.push(`${prefix}.at must be a string`);
    } else if (at.length === 0) {
      problems.push(`${prefix}.at must be non-empty`);
    } else if (!isIso8601(at)) {
      problems.push(`${prefix}.at must be an ISO 8601 timestamp`);
    }

    if (!("why" in entry)) {
      problems.push(`${prefix} missing required field: why`);
    } else if (typeof entryWhy !== "string") {
      problems.push(`${prefix}.why must be a string`);
    } else if (entryWhy.length === 0) {
      problems.push(`${prefix}.why must be non-empty`);
    } else if (!isSingleLine(entryWhy)) {
      problems.push(`${prefix}.why must be a single line`);
    }

    if (!("note" in entry)) {
      problems.push(`${prefix} missing required field: note`);
    } else if (typeof note !== "string") {
      problems.push(`${prefix}.note must be a string`);
    } else if (note.length === 0) {
      problems.push(`${prefix}.note must be non-empty`);
    } else if (!isSingleLine(note)) {
      problems.push(`${prefix}.note must be a single line`);
    }

    if (
      typeof at === "string" &&
      typeof entryWhy === "string" &&
      typeof note === "string"
    ) {
      freezes.push({ at, why: entryWhy, note });
    }
  }

  const last = freezesValue[freezesValue.length - 1];
  if (isRecord(last) && typeof last.why === "string") {
    if (typeof why === "string" && why !== last.why) {
      problems.push("why must equal the last freeze's why");
    }
    if (typeof frozenAt === "string" && typeof last.at === "string" && frozenAt !== last.at) {
      problems.push("frozen_at must equal the last freeze's at");
    }
  }

  // Silence unused variable lint in case of future extension; freezes collected for completeness.
  void freezes;
  void what;

  return problems;
}
