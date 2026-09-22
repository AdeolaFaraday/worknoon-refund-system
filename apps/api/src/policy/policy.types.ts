import type { RuleName } from './policy.constants';

/**
 * A single order item, loaded from trusted database state.
 * Never constructed from raw client input.
 */
export interface RefundPolicyItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  isFinalSale: boolean;
}

/**
 * All trusted facts the policy engine needs to reach a decision.
 * Constructed by RefundsService from PostgreSQL data — NOT from DTO fields.
 */
export interface RefundPolicyInput {
  /** The date the original order was placed (from DB). */
  orderDate: Date;

  /** The order status from the database (e.g. COMPLETED, CANCELLED). */
  orderStatus: string;

  /** Amount the customer is requesting to be refunded. */
  requestedAmount: number;

  /**
   * Structured refund reason from the DTO.
   * Used to identify qualifying reason categories (damaged, incorrect, etc).
   */
  reason: string;

  /**
   * Free-text description from the customer.
   * Used only for suspicious-request detection, NOT to override hard rules.
   */
  description: string;

  /** All items in the order, loaded from the database. */
  items: RefundPolicyItem[];
}

/** The three possible deterministic policy outcomes. */
export type PolicyDecision = 'APPROVED' | 'DENIED' | 'ESCALATED';

/**
 * The structured result returned by PolicyService.evaluateRefund().
 * Contains enough information for the API response, database persistence,
 * and audit logging.
 */
export interface PolicyResult {
  /** The deterministic decision made by the policy engine. */
  decision: PolicyDecision;

  /**
   * Human-readable reasons for the decision.
   * Deterministically generated — no AI or probabilistic output here.
   */
  reasons: string[];

  /** Identifiers for the rules that were matched during evaluation. */
  matchedRules: RuleName[];
}
