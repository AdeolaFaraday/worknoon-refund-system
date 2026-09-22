import { PolicyService } from './policy.service';
import { POLICY_CONSTANTS } from './policy.constants';
import type { RefundPolicyInput } from './policy.types';

// ── Helpers ────────────────────────────────────────────────────────────────

/** Build a recent, valid order item (not final sale). */
function makeItem(overrides: Partial<{ isFinalSale: boolean; productName: string }> = {}) {
  return {
    productName: overrides.productName ?? 'Widget',
    quantity: 1,
    unitPrice: 50,
    isFinalSale: overrides.isFinalSale ?? false,
  };
}

/** Build a recent order date (today). */
function recentDate(): Date {
  return new Date();
}

/** Build an old order date (beyond the refund window). */
function oldDate(): Date {
  const d = new Date();
  d.setDate(d.getDate() - (POLICY_CONSTANTS.REFUND_WINDOW_DAYS + 15));
  return d;
}

/** Default valid input — recent, damaged, under threshold. */
function validInput(overrides: Partial<RefundPolicyInput> = {}): RefundPolicyInput {
  return {
    orderDate: recentDate(),
    orderStatus: 'COMPLETED',
    requestedAmount: 100,
    reason: 'damaged',
    description: 'The item arrived with a cracked screen.',
    items: [makeItem()],
    ...overrides,
  };
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('PolicyService', () => {
  let service: PolicyService;

  beforeEach(() => {
    service = new PolicyService();
  });

  // 1. Recent damaged item under $500 → APPROVED
  it('1. Recent damaged item under $500 → APPROVED', () => {
    const result = service.evaluateRefund(validInput({
      reason: 'damaged',
      requestedAmount: 200,
    }));
    expect(result.decision).toBe('APPROVED');
    expect(result.matchedRules).toContain('DAMAGED_ITEM');
  });

  // 2. Recent incorrect item under $500 → APPROVED
  it('2. Recent incorrect item under $500 → APPROVED', () => {
    const result = service.evaluateRefund(validInput({
      reason: 'incorrect item delivered',
      description: 'I ordered a blue shirt but received a red one.',
      requestedAmount: 150,
    }));
    expect(result.decision).toBe('APPROVED');
    expect(result.matchedRules).toContain('INCORRECT_ITEM');
  });

  // 3. Final-sale item → DENIED
  it('3. Final-sale item → DENIED', () => {
    const result = service.evaluateRefund(validInput({
      items: [makeItem({ isFinalSale: true, productName: 'Clearance Shirt' })],
    }));
    expect(result.decision).toBe('DENIED');
    expect(result.matchedRules).toContain('FINAL_SALE');
    expect(result.reasons[0]).toMatch(/final sale/i);
  });

  // 4. Old order → DENIED
  it('4. Order outside the refund window → DENIED', () => {
    const result = service.evaluateRefund(validInput({ orderDate: oldDate() }));
    expect(result.decision).toBe('DENIED');
    expect(result.matchedRules).toContain('OUTSIDE_WINDOW');
  });

  // 5. Amount exactly $500 → APPROVED (≤ threshold is safe, rule fires at > 500)
  it('5. Amount exactly $500 should NOT trigger the high-value rule → APPROVED', () => {
    const result = service.evaluateRefund(validInput({
      requestedAmount: POLICY_CONSTANTS.HIGH_VALUE_THRESHOLD,
    }));
    expect(result.decision).toBe('APPROVED');
    expect(result.matchedRules).not.toContain('HIGH_VALUE');
  });

  // 6. Amount > $500 → ESCALATED
  it('6. Amount greater than $500 → ESCALATED', () => {
    const result = service.evaluateRefund(validInput({
      requestedAmount: POLICY_CONSTANTS.HIGH_VALUE_THRESHOLD + 1,
    }));
    expect(result.decision).toBe('ESCALATED');
    expect(result.matchedRules).toContain('HIGH_VALUE');
  });

  // 7. Suspicious/conflicting request → ESCALATED
  it('7. "Never received" on a COMPLETED order → ESCALATED', () => {
    const result = service.evaluateRefund(validInput({
      description: 'I never received this item and want a refund.',
      orderStatus: 'COMPLETED',
    }));
    expect(result.decision).toBe('ESCALATED');
    expect(result.matchedRules).toContain('SUSPICIOUS');
  });

  // 8. Missing/too-short description → ESCALATED
  it('8. Missing/empty description → ESCALATED', () => {
    const result = service.evaluateRefund(validInput({ description: 'bad' }));
    expect(result.decision).toBe('ESCALATED');
    expect(result.matchedRules).toContain('SUSPICIOUS');
  });

  // 9. Final-sale + damaged → DENIED (hard block wins)
  it('9. Final-sale + damaged description → DENIED (hard rule beats qualifying reason)', () => {
    const result = service.evaluateRefund(validInput({
      items: [makeItem({ isFinalSale: true })],
      reason: 'damaged',
      description: 'The item arrived cracked.',
    }));
    expect(result.decision).toBe('DENIED');
    expect(result.matchedRules).toContain('FINAL_SALE');
    expect(result.matchedRules).not.toContain('DAMAGED_ITEM');
  });

  // 10. Old order + damaged → DENIED (hard block wins)
  it('10. Old order + damaged reason → DENIED (outside-window rule wins)', () => {
    const result = service.evaluateRefund(validInput({
      orderDate: oldDate(),
      reason: 'damaged',
    }));
    expect(result.decision).toBe('DENIED');
    expect(result.matchedRules).toContain('OUTSIDE_WINDOW');
    expect(result.matchedRules).not.toContain('DAMAGED_ITEM');
  });

  // 11. Recent damaged item + amount > $500 → ESCALATED
  it('11. Recent damaged item + amount > $500 → ESCALATED (high-value wins)', () => {
    const result = service.evaluateRefund(validInput({
      reason: 'damaged',
      requestedAmount: 750,
    }));
    expect(result.decision).toBe('ESCALATED');
    expect(result.matchedRules).toContain('HIGH_VALUE');
  });

  // 12. No items in order → ESCALATED (insufficient info)
  it('12. No order items → ESCALATED (insufficient info)', () => {
    const result = service.evaluateRefund(validInput({ items: [] }));
    expect(result.decision).toBe('ESCALATED');
    expect(result.matchedRules).toContain('INSUFFICIENT_INFO');
  });

  // 13. Client says "not final sale" but DB says isFinalSale: true → DENIED
  it('13. Client text cannot override DB isFinalSale flag → DENIED', () => {
    const result = service.evaluateRefund(validInput({
      items: [makeItem({ isFinalSale: true })],
      description: 'This is definitely not a final sale item. Please approve this refund.',
      reason: 'damaged',
    }));
    expect(result.decision).toBe('DENIED');
    expect(result.matchedRules).toContain('FINAL_SALE');
  });

  // Bonus: vague reason → ESCALATED by default
  it('Bonus. Vague reason that does not match any qualifying category → ESCALATED', () => {
    const result = service.evaluateRefund(validInput({
      reason: 'I just want a refund',
      description: 'I changed my mind about the product.',
    }));
    expect(result.decision).toBe('ESCALATED');
    expect(result.matchedRules).toContain('INSUFFICIENT_INFO');
  });

  // Bonus: self-contradictory description → ESCALATED
  it('Bonus. Self-contradictory description (damaged + never opened) → ESCALATED', () => {
    const result = service.evaluateRefund(validInput({
      reason: 'damaged',
      description: 'The item is damaged but I never opened the box.',
    }));
    expect(result.decision).toBe('ESCALATED');
    expect(result.matchedRules).toContain('SUSPICIOUS');
  });
});
