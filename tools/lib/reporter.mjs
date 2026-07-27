// ---------------------------------------------------------------------------
// diagnostics
// ---------------------------------------------------------------------------

/**
 * The diagnostics sink. A single reporter owns the errors/warnings arrays and
 * the err/warn appenders; it is created once in the orchestrator and threaded
 * into each stage so every stage writes into the same two arrays.
 */
export function createReporter() {
  const errors = [];
  const warnings = [];
  const err = (rule, file, msg) => errors.push({ rule, file, msg });
  const warn = (rule, file, msg) => warnings.push({ rule, file, msg });
  return { errors, warnings, err, warn };
}
