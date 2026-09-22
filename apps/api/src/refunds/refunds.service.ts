import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PolicyService } from '../policy/policy.service';
import { AiService } from '../ai/ai.service';
import { CreateRefundRequestDto } from './dto/create-refund-request.dto';
import { ActorType } from '@prisma/client';
import type { RefundPolicyInput } from '../policy/policy.types';
import type { PolicyDecision } from '../policy/policy.types';

@Injectable()
export class RefundsService {
  private readonly logger = new Logger(RefundsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly policy: PolicyService,
    private readonly ai: AiService,
  ) { }

  async createRefundRequest(dto: CreateRefundRequestDto) {
    const { customerId, orderNumber, requestedAmount, reason, description } = dto;

    // ── 1. Load trusted customer/order/item facts from PostgreSQL ───────────
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: { orderItems: true },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // ── 2. Verify order ownership — never trust customerId + orderNumber alone
    if (order.customerId !== customerId) {
      throw new BadRequestException('Order does not belong to the specified customer');
    }

    // ── 3. Basic amount sanity check ────────────────────────────────────────
    if (requestedAmount > Number(order.totalAmount)) {
      throw new BadRequestException('Requested amount cannot exceed order total');
    }

    // ── 4. Build trusted PolicyInput from DB data (NOT from DTO fields) ─────
    const policyInput: RefundPolicyInput = {
      orderDate: order.orderDate,
      orderStatus: order.status,
      requestedAmount,
      reason,
      description,
      items: order.orderItems.map((item) => ({
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        isFinalSale: item.isFinalSale,
      })),
    };

    // ── 5. Run the deterministic policy engine ──────────────────────────────
    const policyResult = this.policy.evaluateRefund(policyInput);

    // ── 6. Run AI decision support (non-blocking; errors fall back to policy)
    const aiResult = await this.ai.evaluateRefundSupport(policyInput, policyResult);

    if (aiResult) {
      this.logger.log(`AI classification: ${aiResult.classification} (Policy: ${policyResult.decision})`);
    } else {
      this.logger.log(`AI evaluation skipped or failed — using policy decision: ${policyResult.decision}`);
    }

    // ── 7. Determine the final decision ─────────────────────────────────────
    // The backend owns the final decision. The policy engine's hard rules are always authoritative.
    //   - Policy DENIED   → Final MUST be DENIED (no AI override)
    //   - Policy ESCALATED → Final MUST be ESCALATED (no AI override)
    //   - Policy APPROVED → AI may support approval. AI cannot introduce a new DENIAL.
    //                       If AI says ESCALATED, escalate (conservative). Else APPROVED.
    const finalDecision: PolicyDecision = this.resolveFinalDecision(
      policyResult.decision,
      aiResult?.classification ?? null,
    );

    // ── 8. Persist refund request + audit logs atomically ────────────────────
    const refundRequest = await this.prisma.$transaction(async (tx) => {
      const created = await tx.refundRequest.create({
        data: {
          customerId,
          orderId: order.id,
          reason,
          description,
          requestedAmount,
          status: finalDecision,
          policyReasons: JSON.stringify(policyResult.reasons),
          policyRules: JSON.stringify(policyResult.matchedRules),
          aiClassification: aiResult?.classification ?? null,
          aiReasoning: aiResult?.reasoning ?? null,
          finalDecision,
        },
      });

      // Audit log 1: request creation
      await tx.auditLog.create({
        data: {
          refundRequestId: created.id,
          event: 'REFUND_REQUEST_CREATED',
          actor: ActorType.CUSTOMER,
          metadata: { reason, requestedAmount },
        },
      });

      // Audit log 2: policy evaluation result
      await tx.auditLog.create({
        data: {
          refundRequestId: created.id,
          event: 'POLICY_EVALUATED',
          actor: ActorType.SYSTEM,
          metadata: {
            decision: policyResult.decision,
            matchedRules: policyResult.matchedRules,
            reasons: policyResult.reasons,
          },
        },
      });

      // Audit log 3: AI evaluation result (only if AI ran)
      if (aiResult) {
        await tx.auditLog.create({
          data: {
            refundRequestId: created.id,
            event: 'AI_EVALUATED',
            actor: ActorType.AI,
            metadata: {
              classification: aiResult.classification,
              reasoning: aiResult.reasoning,
            },
          },
        });
      }

      // Audit log 4: final decision
      await tx.auditLog.create({
        data: {
          refundRequestId: created.id,
          event: 'REFUND_DECIDED',
          actor: ActorType.SYSTEM,
          metadata: {
            policyDecision: policyResult.decision,
            aiClassification: aiResult?.classification ?? 'N/A',
            finalDecision,
          },
        },
      });

      return created;
    });

    // ── 9. Return clean, frontend-friendly response ──────────────────────────
    return {
      id: refundRequest.id,
      finalDecision,
      policyDecision: policyResult.decision,
      policyReasons: policyResult.reasons,
      aiClassification: aiResult?.classification ?? null,
      aiReasoning: aiResult?.reasoning ?? null,
      customerResponse: aiResult?.customerResponse ?? this.buildFallbackCustomerResponse(finalDecision, policyResult.reasons),
    };
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  /**
   * Enforces final decision logic. The policy engine's hard rules always win.
   * AI can only influence the outcome when policy says APPROVED.
   */
  private resolveFinalDecision(
    policyDecision: PolicyDecision,
    aiClassification: PolicyDecision | null,
  ): PolicyDecision {
    // Hard policy blocks are absolute — AI cannot override
    if (policyDecision === 'DENIED' || policyDecision === 'ESCALATED') {
      return policyDecision;
    }

    // Policy is APPROVED — use AI classification if valid, otherwise keep APPROVED
    if (policyDecision === 'APPROVED') {
      if (aiClassification === 'ESCALATED') {
        // AI found something concerning — be conservative and escalate
        return 'ESCALATED';
      }
      // AI agrees (APPROVED) or AI failed (null) — keep APPROVED
      return 'APPROVED';
    }

    // Should never reach here, but safe fallback
    return policyDecision;
  }

  /**
   * Generate a minimal customer-facing message when AI is unavailable.
   */
  private buildFallbackCustomerResponse(decision: PolicyDecision, reasons: string[]): string {
    const reasonText = reasons.join(' ');
    switch (decision) {
      case 'APPROVED':
        return `Your refund request has been approved. ${reasonText}`;
      case 'DENIED':
        return `We are unable to process your refund at this time. ${reasonText}`;
      case 'ESCALATED':
        return `Your refund request requires further review by our team. ${reasonText} We will be in touch shortly.`;
    }
  }
}
