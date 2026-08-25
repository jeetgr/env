import type { StandardSchemaV1 } from "./standard-schema-spec.js";

const toDotPath = (
  path: StandardSchemaV1.Issue["path"]
): string | undefined => {
  if (!path?.length) {
    return undefined;
  }

  return path
    .map((segment) =>
      typeof segment === "object" && segment !== null && "key" in segment
        ? String(segment.key)
        : String(segment)
    )
    .join(".");
};

/**
 * Formats Standard Schema issues as the plain-text list
 * `EnvValidationError.message` uses: `✖ message` per issue, plus a
 * `→ at path` line for any issue with a path.
 */
const formatEnvIssues = (issues: readonly StandardSchemaV1.Issue[]): string =>
  issues
    .map((issue) => {
      const path = toDotPath(issue.path);
      return path ? `✖ ${issue.message}\n  → at ${path}` : `✖ ${issue.message}`;
    })
    .join("\n");

export { formatEnvIssues };
