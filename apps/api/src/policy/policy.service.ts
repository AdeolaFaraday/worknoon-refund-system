import { Injectable } from '@nestjs/common';
import { POLICY_CONSTANTS, RULE_NAMES, RuleName } from './policy.constants';
import type { RefundPolicyInput, PolicyResult, PolicyDecision } from './policy.types';

/**
 * PolicyService — Deterministic Refund Policy Engine
 *
 * This service is the single authoritative source for refund decisions.
 * It is a pure function in spirit: given the same trusted facts, it will
 * always produce the same decision.
 *
 * It does NOT:
 *   - call OpenAI or any external service
 *   - query the database
 *   - trust user-supplied text to override hard rules
 *
 * PRECEDENCE ORDER (explicit, evaluated top-to-bottom; first match wins):
 *   A. Hard DENY rules (immovable blocks)
 *      1. Any item in the order is marked final sale
 *      2. Order is outside the refund window
 *   B. Mandatory ESCALATE rules
 *      3. Requested amount exceeds the high-value threshold
 *      4. Request is suspicious or contains conflicting information
 *   C. Approval rules (both must hold)
 *      5. Reason is a known qualifying category (damaged, incorrect)
 *   D. Default
 *      6. ESCALATED — insufficient information to safely approve
 */
@Injectable()
export class PolicyService {
  private readonly REFUND_WINDOW_MS =
    POLICY_CONSTANTS.REFUND_WINDOW_DAYS * 24 * 60 * 60 * 1000;

  /**
   * Evaluate a refund request against the deterministic policy rules.
   * @param input Trusted facts loaded from PostgreSQL — never raw DTO data.
   */
  evaluateRefund(input: RefundPolicyInput): PolicyResult {
    const matchedRules: RuleName[] = [];
    const reasons: string[] = [];

    // ── A. Hard DENY rules ─────────────────────────────────────────────────

    // Rule 1: Final-sale items are never eligible for a refund.
    // The customer's description cannot override the DB flag.
    const finalSaleItems = input.items.filter((i) => i.isFinalSale);
    if (finalSaleItems.length > 0) {
      matchedRules.push(RULE_NAMES.FINAL_SALE);
      reasons.push(
        `The following item(s) are marked as final sale and are not eligible for a refund: ` +
          finalSaleItems.map((i) => i.productName).join(', ') +
          '.',
      );
      return this.buildResult('DENIED', reasons, matchedRules);
    }

    // Rule 2: Orders outside the refund window cannot be refunded.
    const orderAgeMs = Date.now() - new Date(input.orderDate).getTime();
    if (orderAgeMs > this.REFUND_WINDOW_MS) {
      matchedRules.push(RULE_NAMES.OUTSIDE_WINDOW);
      reasons.push(
        `This order was placed more than ${POLICY_CONSTANTS.REFUND_WINDOW_DAYS} days ago ` +
          `and is outside the refund window.`,
      );
      return this.buildResult('DENIED', reasons, matchedRules);
    }

    // ── B. Mandatory ESCALATE rules ────────────────────────────────────────

    // Rule 3: High-value refunds require human review.
    if (input.requestedAmount > POLICY_CONSTANTS.HIGH_VALUE_THRESHOLD) {
      matchedRules.push(RULE_NAMES.HIGH_VALUE);
      reasons.push(
        `Refund requests exceeding $${POLICY_CONSTANTS.HIGH_VALUE_THRESHOLD} require human review.`,
      );
      return this.buildResult('ESCALATED', reasons, matchedRules);
    }

    // Rule 4: Suspicious or conflicting requests must be escalated.
    const suspicion = this.detectSuspicion(input);
    if (suspicion.isSuspicious) {
      matchedRules.push(RULE_NAMES.SUSPICIOUS);
      reasons.push(...suspicion.reasons);
      return this.buildResult('ESCALATED', reasons, matchedRules);
    }

    // ── C. Approval rules ──────────────────────────────────────────────────

    // Rule 5: Insufficient order items — cannot safely evaluate.
    if (input.items.length === 0) {
      matchedRules.push(RULE_NAMES.INSUFFICIENT_INFO);
      reasons.push('No order items found; cannot evaluate the refund request.');
      return this.buildResult('ESCALATED', reasons, matchedRules);
    }

    // Rule 6: Qualifying reason categories for approval.
    const normalisedReason = input.reason.trim().toLowerCase();
    if (normalisedReason.includes('damaged') || normalisedReason.includes('defect')) {
      matchedRules.push(RULE_NAMES.DAMAGED_ITEM);
      reasons.push('The item was reported as damaged or defective.');
      return this.buildResult('APPROVED', reasons, matchedRules);
    }

    if (normalisedReason.includes('incorrect') || normalisedReason.includes('wrong item')) {
      matchedRules.push(RULE_NAMES.INCORRECT_ITEM);
      reasons.push('An incorrect item was delivered.');
      return this.buildResult('APPROVED', reasons, matchedRules);
    }

    // ── D. Default — insufficient information ──────────────────────────────
    matchedRules.push(RULE_NAMES.INSUFFICIENT_INFO);
    reasons.push(
      'The provided reason does not match a qualifying refund category. ' +
        'This request requires human review.',
    );
    return this.buildResult('ESCALATED', reasons, matchedRules);
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private buildResult(
    decision: PolicyDecision,
    reasons: string[],
    matchedRules: RuleName[],
  ): PolicyResult {
    return { decision, reasons, matchedRules };
  }

  /**
   * Detect obviously suspicious or contradictory requests.
   *
   * Intentionally minimal and explainable — no NLP, no large keyword lists.
   * The goal is to surface clear contradictions, not to build a fraud system.
   */
  private detectSuspicion(input: RefundPolicyInput): {
    isSuspicious: boolean;
    reasons: string[];
  } {
    const desc = input.description.trim().toLowerCase();
    const suspiciousReasons: string[] = [];

    // Missing or too-short description
    if (desc.length < 10) {
      suspiciousReasons.push(
        'The refund description is too short or missing. Please provide more information.',
      );
    }

    // "Never received" contradicts a COMPLETED order status
    const neverReceivedKeywords = ['never received', 'not received', 'did not receive', "didn't receive"];
    const claimsNeverReceived = neverReceivedKeywords.some((kw) => desc.includes(kw));
    if (claimsNeverReceived && input.orderStatus === 'COMPLETED') {
      suspiciousReasons.push(
        'The description states the item was never received, but the order is marked as completed. ' +
          'This requires human review.',
      );
    }

    // Self-contradictory phrases within the description
    const contradictions: Array<[string, string]> = [
      ['damaged', 'never opened'],
      ['incorrect item', 'perfect condition'],
    ];
    for (const [termA, termB] of contradictions) {
      if (desc.includes(termA) && desc.includes(termB)) {
        suspiciousReasons.push(
          `The description contains contradictory statements ("${termA}" and "${termB}").`,
        );
      }
    }

    return {
      isSuspicious: suspiciousReasons.length > 0,
      reasons: suspiciousReasons,
    };
  }
}
