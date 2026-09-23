import type {
  Customer,
  CustomerWithOrders,
  OrderWithItems,
  RefundRequestListItem,
  RefundRequestDetail,
  CreateRefundRequest,
  CreateRefundResponse,
  PaginatedResponse,
  AdminRefundStats,
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

export function searchCustomers(query: string): Promise<Customer[]> {
  if (!query) return Promise.resolve([]);
  return apiFetch<Customer[]>(`/customers/search?query=${encodeURIComponent(query)}`);
}

export function fetchCustomer(id: string): Promise<CustomerWithOrders> {
  return apiFetch<CustomerWithOrders>(`/customers/${id}`);
}

export function fetchCustomerOrders(customerId: string): Promise<OrderWithItems[]> {
  return apiFetch<OrderWithItems[]>(`/orders/customer/${customerId}`);
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

export function fetchAdminRefunds(
  page = 1,
  limit = 10,
  search = '',
  status = 'ALL'
): Promise<PaginatedResponse<RefundRequestListItem>> {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  if (search) params.append('search', search);
  if (status && status !== 'ALL') params.append('status', status);

  return apiFetch<PaginatedResponse<RefundRequestListItem>>(`/admin/refunds?${params.toString()}`);
}

export function fetchAdminRefundStats(): Promise<AdminRefundStats> {
  return apiFetch<AdminRefundStats>('/admin/refunds/stats');
}

export function fetchAdminRefund(id: string): Promise<RefundRequestDetail> {
  return apiFetch<RefundRequestDetail>(`/admin/refunds/${id}`);
}
