import { useQuery, useMutation } from '@tanstack/react-query';
import {
  fetchCustomers,
  searchCustomers,
  fetchCustomer,
  fetchCustomerOrders,
  fetchOrder,
  submitRefundRequest,
  fetchAdminRefunds,
  fetchAdminRefundStats,
  fetchAdminRefund,
} from '@/lib/api';
import type { CreateRefundRequest } from '@/types/api';

// ── Query Keys ───────────────────────────────────────────────────────────────

export const queryKeys = {
  customers: ['customers'] as const,
  customerSearch: (query: string) => ['customers', 'search', query] as const,
  customer: (id: string) => ['customers', id] as const,
  customerOrders: (id: string) => ['customers', id, 'orders'] as const,
  order: (orderNumber: string) => ['orders', orderNumber] as const,
  adminRefunds: (page: number, limit: number, search: string, status: string) =>
    ['admin', 'refunds', page, limit, search, status] as const,
  adminRefundStats: ['admin', 'refunds', 'stats'] as const,
  adminRefund: (id: string) => ['admin', 'refunds', id] as const,
} as const;

// ── Customer hooks ───────────────────────────────────────────────────────────

export function useCustomers() {
  return useQuery({
    queryKey: queryKeys.customers,
    queryFn: fetchCustomers,
  });
}

export function useSearchCustomers(query: string) {
  return useQuery({
    queryKey: queryKeys.customerSearch(query),
    queryFn: () => searchCustomers(query),
    enabled: query.length >= 3,
  });
}

export function useCustomer(id: string | null) {
  return useQuery({
    queryKey: queryKeys.customer(id!),
    queryFn: () => fetchCustomer(id!),
    enabled: !!id,
  });
}

export function useCustomerOrders(id: string | null) {
  return useQuery({
    queryKey: queryKeys.customerOrders(id!),
    queryFn: () => fetchCustomerOrders(id!),
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

export function useAdminRefunds(page = 1, limit = 10, search = '', status = 'ALL') {
  return useQuery({
    queryKey: queryKeys.adminRefunds(page, limit, search, status),
    queryFn: () => fetchAdminRefunds(page, limit, search, status),
  });
}

export function useAdminRefundStats() {
  return useQuery({
    queryKey: queryKeys.adminRefundStats,
    queryFn: fetchAdminRefundStats,
    refetchInterval: 30_000,
  });
}

export function useAdminRefund(id: string | null) {
  return useQuery({
    queryKey: queryKeys.adminRefund(id!),
    queryFn: () => fetchAdminRefund(id!),
    enabled: !!id,
  });
}
