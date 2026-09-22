import { useQuery, useMutation } from '@tanstack/react-query';
import {
  fetchCustomers,
  fetchCustomer,
  fetchOrder,
  submitRefundRequest,
  fetchAdminRefunds,
  fetchAdminRefund,
} from '@/lib/api';
import type { CreateRefundRequest } from '@/types/api';

// ── Query Keys ───────────────────────────────────────────────────────────────

export const queryKeys = {
  customers: ['customers'] as const,
  customer: (id: string) => ['customers', id] as const,
  order: (orderNumber: string) => ['orders', orderNumber] as const,
  adminRefunds: ['admin', 'refunds'] as const,
  adminRefund: (id: string) => ['admin', 'refunds', id] as const,
} as const;

// ── Customer hooks ───────────────────────────────────────────────────────────

export function useCustomers() {
  return useQuery({
    queryKey: queryKeys.customers,
    queryFn: fetchCustomers,
  });
}

export function useCustomer(id: string | null) {
  return useQuery({
    queryKey: queryKeys.customer(id!),
    queryFn: () => fetchCustomer(id!),
    enabled: !!id,
  });
}

// ── Order hooks ──────────────────────────────────────────────────────────────

export function useOrder(orderNumber: string | null) {
  return useQuery({
    queryKey: queryKeys.order(orderNumber!),
    queryFn: () => fetchOrder(orderNumber!),
    enabled: !!orderNumber,
    retry: false, // don't retry 404s
  });
}

// ── Refund mutation ──────────────────────────────────────────────────────────

export function useSubmitRefund() {
  return useMutation({
    mutationFn: (body: CreateRefundRequest) => submitRefundRequest(body),
  });
}

// ── Admin hooks ──────────────────────────────────────────────────────────────

export function useAdminRefunds() {
  return useQuery({
    queryKey: queryKeys.adminRefunds,
    queryFn: fetchAdminRefunds,
    refetchInterval: 30_000, // refresh every 30s for live dashboard feel
  });
}

export function useAdminRefund(id: string | null) {
  return useQuery({
    queryKey: queryKeys.adminRefund(id!),
    queryFn: () => fetchAdminRefund(id!),
    enabled: !!id,
  });
}
