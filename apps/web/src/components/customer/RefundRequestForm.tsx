'use client';

import { REFUND_REASONS } from '@/lib/schemas';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { XCircle } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { FieldError } from '@/components/ui/FieldError';
import { FormLabel } from '@/components/ui/FormLabel';
import { FormStep } from '@/components/ui/FormStep';
import { ResultDisplay } from './ResultDisplay';
import { useRefundForm } from './hooks/useRefundForm';



export function RefundRequestForm() {
  const {
    form,
    result,
    onSubmit,
    handleReset,
    setCustomerSearchQuery,
    customerOptions,
    orderOptions,
    selectedOrder,
    loadingCustomers,
    loadingCustomer,
    submitMutation,
    selectedCustomerId,
    selectedOrderNumber,
    setValue,
  } = useRefundForm();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = form;

  if (result) {
    return (
      <div className="space-y-6">
        <ResultDisplay result={result} />
        <Button onClick={handleReset} className="!bg-white !text-slate-700 border border-slate-300 hover:!bg-slate-50">
          Submit another request
        </Button>
      </div>
    );
  }



  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <FormStep step={1} title="Your Information">
        <FormLabel>Search for your account (email or ID)</FormLabel>
        <SearchableSelect
          options={customerOptions}
          value={selectedCustomerId || ''}
          onChange={(val) => {
            setValue('customerId', val, { shouldValidate: true });
            setValue('orderNumber', '', { shouldValidate: true }); // reset order
          }}
          onSearch={setCustomerSearchQuery}
          placeholder="Type at least 3 characters..."
          isLoading={loadingCustomers}
          error={!!errors.customerId}
        />
        <FieldError message={errors.customerId?.message} />
      </FormStep>

      <FormStep step={2} title="Select Order">
        <FormLabel>Order</FormLabel>
        <SearchableSelect
          options={orderOptions}
          value={selectedOrderNumber || ''}
          onChange={(val) => setValue('orderNumber', val, { shouldValidate: true })}
          placeholder={!selectedCustomerId ? 'Select a customer first' : 'Search orders...'}
          disabled={!selectedCustomerId || loadingCustomer}
          isLoading={loadingCustomer}
          error={!!errors.orderNumber}
        />
        <FieldError message={errors.orderNumber?.message} />

        {selectedOrderNumber && selectedOrder && (
          <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-600">Order Summary</p>
                <StatusBadge status={selectedOrder.status} size="sm" />
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {selectedOrder.orderItems.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between px-4 py-2.5">
                  <div>
                    <p className="text-sm text-slate-800">{item.productName}</p>
                    <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    {item.isFinalSale && (
                      <p className="text-xs text-red-500 font-medium">Final Sale</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </FormStep>

      <FormStep step={3} title="Refund Details">
        <div>
          <FormLabel htmlFor="requestedAmount">Refund Amount (USD)</FormLabel>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
            <Input
              id="requestedAmount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              {...register('requestedAmount', { valueAsNumber: true })}
              className="pl-7"
              disabled={!selectedOrderNumber}
              error={!!errors.requestedAmount}
            />
          </div>
          <FieldError message={errors.requestedAmount?.message} />
        </div>

        <div>
          <FormLabel htmlFor="reason">Reason for Return</FormLabel>
          <Select
            id="reason"
            {...register('reason')}
            disabled={!selectedOrderNumber}
            error={!!errors.reason}
          >
            <option value="">— Select a reason —</option>
            {REFUND_REASONS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </Select>
          <FieldError message={errors.reason?.message} />
        </div>

        <div>
          <FormLabel htmlFor="description">Please describe your issue</FormLabel>
          <Textarea
            id="description"
            rows={4}
            placeholder="Please provide as much detail as possible about the issue with your order…"
            {...register('description')}
            disabled={!selectedOrderNumber}
            error={!!errors.description}
          />
          <FieldError message={errors.description?.message} />
        </div>
      </FormStep>

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

      <Button
        type="submit"
        disabled={isSubmitting || submitMutation.isPending}
        isLoading={submitMutation.isPending}
      >
        Submit Refund Request
      </Button>
    </form>
  );
}
