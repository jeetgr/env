import { formatEnvIssues } from "./format-issues.js";
import type { StandardSchemaV1 } from "./standard-schema-spec.js";

/**
 * Thrown when env validation fails against the provided Standard Schema.
 */
class EnvValidationError extends Error {
  readonly issues: readonly StandardSchemaV1.Issue[];

  constructor(issues: readonly StandardSchemaV1.Issue[]) {
    super(`Invalid environment variables:\n${formatEnvIssues(issues)}`);
    this.name = "EnvValidationError";
    this.issues = issues;
  }
}

export { EnvValidationError };
