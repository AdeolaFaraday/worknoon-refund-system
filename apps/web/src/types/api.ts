// ── Shared frontend TypeScript types for the Worknoon Refund API ──────────────

export type RefundStatus = 'PENDING' | 'APPROVED' | 'DENIED' | 'ESCALATED';
export type OrderStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';
export type ActorType = 'SYSTEM' | 'CUSTOMER' | 'ADMIN' | 'AI';

export interface Customer {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerWithOrders extends Customer {
  orders: Order[];
  refundRequests: RefundRequestSummary[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productName: string;
  quantity: number;
  unitPrice: string; // Decimal serialized as string by Prisma
  isFinalSale: boolean;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  orderDate: string;
  totalAmount: string; // Decimal serialized as string
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OrderWithItems extends Order {
  customer: Customer;
  orderItems: OrderItem[];
  refundRequests: RefundRequestSummary[];
}

export interface RefundRequestSummary {
  id: string;
  customerId: string;
  orderId: string;
  reason: string;
  description: string;
  requestedAmount: string;
  status: RefundStatus;
  finalDecision: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  refundRequestId: string;
  event: string;
  actor: ActorType;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

// Admin list view — joined with customer + order summary
export interface RefundRequestListItem extends RefundRequestSummary {
  customer: Pick<Customer, 'id' | 'name' | 'email'>;
  order: Pick<Order, 'id' | 'orderNumber' | 'totalAmount' | 'status'>;
}

// Admin detail view — full data
export interface RefundRequestDetail extends RefundRequestSummary {
  policyReasons: string | null; // JSON array string
  policyRules: string | null; // JSON array string
  aiClassification: string | null;
  aiReasoning: string | null;
  customer: Customer;
  order: OrderWithItems;
  auditLogs: AuditLog[];
}

// POST /refunds response
export interface CreateRefundResponse {
  id: string;
  finalDecision: RefundStatus;
  policyDecision: RefundStatus;
  policyReasons: string[];
  aiClassification: string | null;
  aiReasoning: string | null;
  customerResponse: string;
}

// POST /refunds request body
export interface CreateRefundRequest {
  customerId: string;
  orderNumber: string;
  requestedAmount: number;
  reason: string;
  description: string;
}
