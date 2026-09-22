/**
 * Centralised policy constants — single source of truth.
 * Change these values here to update the policy across the entire system.
 */

export const POLICY_CONSTANTS = {
  /**
   * Orders older than this many days are outside the refund window
   * and will receive a hard DENIED decision.
   * Assumption: 30 days (not specified by the assessment; adjust as needed).
   */
  REFUND_WINDOW_DAYS: 30,

  /**
   * Refund requests for amounts strictly greater than this value
   * require human review and receive an ESCALATED decision.
   */
  HIGH_VALUE_THRESHOLD: 500,
} as const;

/**
 * Human-readable rule identifiers used in PolicyResult.matchedRules.
 * These are intentionally stable strings so downstream systems
 * (audit logs, future AI layer) can rely on them.
 */
export const RULE_NAMES = {
  /** The requested item is marked as final sale in the database. */
  FINAL_SALE: 'FINAL_SALE',

  /** The order date is outside the configured refund window. */
  OUTSIDE_WINDOW: 'OUTSIDE_WINDOW',

  /** The requested amount exceeds the high-value threshold. */
  HIGH_VALUE: 'HIGH_VALUE',

  /** The request contains suspicious or conflicting information. */
  SUSPICIOUS: 'SUSPICIOUS',

  /** The refund reason indicates a damaged item. */
  DAMAGED_ITEM: 'DAMAGED_ITEM',

  /** The refund reason indicates an incorrect item was delivered. */
  INCORRECT_ITEM: 'INCORRECT_ITEM',

  /** Insufficient or ambiguous information to safely evaluate the request. */
  INSUFFICIENT_INFO: 'INSUFFICIENT_INFO',
} as const;

export type RuleName = (typeof RULE_NAMES)[keyof typeof RULE_NAMES];
