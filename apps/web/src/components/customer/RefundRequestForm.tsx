'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCustomers, useCustomer, useOrder, useSubmitRefund } from '@/hooks/useRefundQueries';
import { refundFormSchema, RefundFormValues, REFUND_REASONS } from '@/lib/schemas';
import { formatCurrency, formatDateShort } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingSpinner } from '@/components/ui/LoadingState';
import { CreateRefundResponse } from '@/types/api';
import { CheckCircle2, XCircle, AlertTriangle, ChevronDown, Info } from 'lucide-react';
import { useState } from 'react';

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1"><Info className="w-3 h-3" />{message}</p>;
}

function ResultDisplay({ result }: { result: CreateRefundResponse }) {
  const icons: Partial<Record<string, React.ReactNode>> = {
    APPROVED: <CheckCircle2 className="w-10 h-10 text-emerald-500" />,
    DENIED: <XCircle className="w-10 h-10 text-red-500" />,
    ESCALATED: <AlertTriangle className="w-10 h-10 text-amber-500" />,
  };

  const bgColors: Partial<Record<string, string>> = {
    APPROVED: 'from-emerald-50 to-white border-emerald-200',
    DENIED: 'from-red-50 to-white border-red-200',
    ESCALATED: 'from-amber-50 to-white border-amber-200',
  };

  return (
    <div className={`rounded-2xl border bg-gradient-to-b p-8 ${bgColors[result.finalDecision] ?? 'from-slate-50 to-white border-slate-200'}`}>
      <div className="flex flex-col items-center text-center gap-4 mb-8">
        {icons[result.finalDecision] ?? null}
        <div>
          <StatusBadge status={result.finalDecision} />
          <h2 className="mt-3 text-xl font-semibold text-slate-900">
            {result.finalDecision === 'APPROVED' && 'Refund Approved'}
            {result.finalDecision === 'DENIED' && 'Refund Not Approved'}
            {result.finalDecision === 'ESCALATED' && 'Under Review'}
          </h2>
        </div>
      </div>

      {/* Customer response */}
      <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm mb-6">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Message</p>
        <p className="text-sm text-slate-700 leading-relaxed">{result.customerResponse}</p>
      </div>

      {/* Policy reasons */}
      {result.policyReasons.length > 0 && (
        <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm mb-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Details</p>
          <ul className="space-y-2">
            {result.policyReasons.map((reason, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-700">
                <span className="mt-0.5 text-slate-400 flex-shrink-0">•</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-xs text-slate-400 text-center">
        Reference: <span className="font-mono">{result.id}</span>
      </p>
    </div>
  );
}

export function RefundRequestForm() {
  const [result, setResult] = useState<CreateRefundResponse | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RefundFormValues>({
    resolver: zodResolver(refundFormSchema) as any,
    defaultValues: { requestedAmount: undefined },
  });

  const selectedCustomerId = watch('customerId');
  const selectedOrderNumber = watch('orderNumber');

  const { data: customers, isLoading: loadingCustomers } = useCustomers();
  const { data: customer, isLoading: loadingCustomer } = useCustomer(selectedCustomerId ?? null);
  const { data: order, isLoading: loadingOrder } = useOrder(selectedOrderNumber ?? null);
  const submitMutation = useSubmitRefund();

  const onSubmit = async (values: RefundFormValues) => {
    try {
      const response = await submitMutation.mutateAsync(values);
      setResult(response);
    } catch (err) {
      // Error displayed inline via submitMutation.error
    }
  };

  if (result) {
    return (
      <div className="space-y-6">
        <ResultDisplay result={result} />
        <button
          onClick={() => { setResult(null); reset(); }}
          className="w-full py-3 px-4 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Submit another request
        </button>
      </div>
    );
  }

  const inputCls = "w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white disabled:bg-slate-50 disabled:text-slate-400 placeholder:text-slate-400 transition-shadow";
  const selectCls = `${inputCls} appearance-none`;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* Step 1: Select Customer */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60">
          <p className="text-sm font-semibold text-slate-700">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white text-xs font-bold mr-2">1</span>
            Your Information
          </p>
        </div>
        <div className="p-5">
          <label className="block text-xs font-medium text-slate-600 mb-1.5" htmlFor="customerId">
            Select your account
          </label>
          <div className="relative">
            <select id="customerId" {...register('customerId')} className={selectCls} disabled={loadingCustomers}>
              <option value="">
                {loadingCustomers ? 'Loading customers…' : '— Select a customer —'}
              </option>
              {customers?.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
          <FieldError message={errors.customerId?.message} />

          {customer && (
            <div className="mt-3 rounded-lg bg-indigo-50 border border-indigo-100 p-3 text-xs text-indigo-700">
              <span className="font-medium">{customer.name}</span> · {customer.email} · {customer.orders.length} orders
            </div>
          )}
        </div>
      </div>

      {/* Step 2: Select Order */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60">
          <p className="text-sm font-semibold text-slate-700">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white text-xs font-bold mr-2">2</span>
            Select Order
          </p>
        </div>
        <div className="p-5">
          <label className="block text-xs font-medium text-slate-600 mb-1.5" htmlFor="orderNumber">
            Order
          </label>
          <div className="relative">
            <select
              id="orderNumber"
              {...register('orderNumber')}
              className={selectCls}
              disabled={!selectedCustomerId || loadingCustomer}
            >
              <option value="">
                {!selectedCustomerId ? 'Select a customer first' : loadingCustomer ? 'Loading orders…' : '— Select an order —'}
              </option>
              {customer?.orders.map((o) => (
                <option key={o.orderNumber} value={o.orderNumber}>
                  {o.orderNumber} — {formatCurrency(o.totalAmount)} ({formatDateShort(o.orderDate)})
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
          <FieldError message={errors.orderNumber?.message} />

          {selectedOrderNumber && order && (
            <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-600">Order Summary</p>
                  <StatusBadge status={order.status} size="sm" />
                </div>
              </div>
              <div className="divide-y divide-slate-100">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between px-4 py-2.5">
                    <div>
                      <p className="text-sm text-slate-800">{item.productName}</p>
                      <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-800">{formatCurrency(item.unitPrice)}</p>
                      {item.isFinalSale && (
                        <p className="text-xs text-red-500 font-medium">Final Sale</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-slate-100">
                <p className="text-sm font-semibold text-slate-700">Order Total</p>
                <p className="text-sm font-bold text-slate-900">{formatCurrency(order.totalAmount)}</p>
              </div>
            </div>
          )}
          {loadingOrder && selectedOrderNumber && (
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
              <LoadingSpinner size="sm" />
              Loading order details…
            </div>
          )}
        </div>
      </div>

      {/* Step 3: Refund Details */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60">
          <p className="text-sm font-semibold text-slate-700">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white text-xs font-bold mr-2">3</span>
            Refund Details
          </p>
        </div>
        <div className="p-5 space-y-5">
          {/* Requested Amount */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5" htmlFor="requestedAmount">
              Refund Amount (USD)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
              <input
                id="requestedAmount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                {...register('requestedAmount', { valueAsNumber: true })}
                className={`${inputCls} pl-7`}
                disabled={!selectedOrderNumber}
              />
            </div>
            {order && (
              <p className="mt-1.5 text-xs text-slate-400">
                Maximum: {formatCurrency(order.totalAmount)}
              </p>
            )}
            <FieldError message={errors.requestedAmount?.message} />
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5" htmlFor="reason">
              Reason for Return
            </label>
            <div className="relative">
              <select id="reason" {...register('reason')} className={selectCls} disabled={!selectedOrderNumber}>
                <option value="">— Select a reason —</option>
                {REFUND_REASONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            <FieldError message={errors.reason?.message} />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5" htmlFor="description">
              Please describe your issue
            </label>
            <textarea
              id="description"
              rows={4}
              placeholder="Please provide as much detail as possible about the issue with your order…"
              {...register('description')}
              disabled={!selectedOrderNumber}
              className={`${inputCls} resize-none`}
            />
            <FieldError message={errors.description?.message} />
          </div>
        </div>
      </div>

      {/* API Error */}
      {submitMutation.isError && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Submission failed</p>
            <p className="text-sm text-red-600 mt-0.5">
              {submitMutation.error instanceof Error
                ? submitMutation.error.message
                : 'An unexpected error occurred. Please try again.'}
            </p>
          </div>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting || submitMutation.isPending}
        className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-center gap-2"
      >
        {submitMutation.isPending ? (
          <>
            <LoadingSpinner size="sm" />
            Submitting…
          </>
        ) : (
          'Submit Refund Request'
        )}
      </button>
    </form>
  );
}
