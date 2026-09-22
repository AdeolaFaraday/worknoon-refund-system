import type {
  Customer,
  CustomerWithOrders,
  OrderWithItems,
  RefundRequestListItem,
  RefundRequestDetail,
  CreateRefundRequest,
  CreateRefundResponse,
} from '@/types/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    let message = `API error ${res.status}`;
    try {
      const body = await res.json();
      message = body.message ?? message;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

// ── Customers ────────────────────────────────────────────────────────────────

export function fetchCustomers(): Promise<Customer[]> {
  return apiFetch<Customer[]>('/customers');
}

export function fetchCustomer(id: string): Promise<CustomerWithOrders> {
  return apiFetch<CustomerWithOrders>(`/customers/${id}`);
}

// ── Orders ───────────────────────────────────────────────────────────────────

export function fetchOrder(orderNumber: string): Promise<OrderWithItems> {
  return apiFetch<OrderWithItems>(`/orders/${orderNumber}`);
}

// ── Refunds (Customer) ───────────────────────────────────────────────────────

export function submitRefundRequest(body: CreateRefundRequest): Promise<CreateRefundResponse> {
  return apiFetch<CreateRefundResponse>('/refunds', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// ── Refunds (Admin) ──────────────────────────────────────────────────────────

export function fetchAdminRefunds(): Promise<RefundRequestListItem[]> {
  return apiFetch<RefundRequestListItem[]>('/admin/refunds');
}

export function fetchAdminRefund(id: string): Promise<RefundRequestDetail> {
  return apiFetch<RefundRequestDetail>(`/admin/refunds/${id}`);
}
