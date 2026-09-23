import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { refundFormSchema, RefundFormValues } from '@/lib/schemas';
import { useSearchCustomers, useCustomerOrders, useSubmitRefund } from '@/hooks/useRefundQueries';
import { CreateRefundResponse } from '@/types/api';

export function useRefundForm() {
  const [result, setResult] = useState<CreateRefundResponse | null>(null);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');

  const form = useForm<RefundFormValues>({
    resolver: zodResolver(refundFormSchema) as any,
    defaultValues: { requestedAmount: undefined },
  });

  const { watch, reset, setValue } = form;
  const selectedCustomerId = watch('customerId');
  const selectedOrderNumber = watch('orderNumber');

  const { data: searchResults, isLoading: loadingCustomers } = useSearchCustomers(customerSearchQuery);
  const { data: customerOrders, isLoading: loadingCustomer } = useCustomerOrders(selectedCustomerId ?? null);
  
  const submitMutation = useSubmitRefund();

  const customerOptions = useMemo(() => {
    return searchResults?.map((c) => ({
      label: c.name,
      value: c.id,
      description: c.email,
    })) || [];
  }, [searchResults]);

  const orderOptions = useMemo(() => {
    return customerOrders?.map((o) => ({
      label: o.orderNumber,
      value: o.orderNumber,
      description: `$${parseFloat(o.totalAmount).toFixed(2)} - ${new Date(o.orderDate).toLocaleDateString()}`,
    })) || [];
  }, [customerOrders]);

  const selectedOrder = useMemo(() => {
    return customerOrders?.find((o) => o.orderNumber === selectedOrderNumber);
  }, [customerOrders, selectedOrderNumber]);

  const onSubmit = async (values: RefundFormValues) => {
    try {
      const response = await submitMutation.mutateAsync(values);
      setResult(response);
    } catch (err) {
      // Error is handled via submitMutation.isError
    }
  };

  const handleReset = () => {
    setResult(null);
    reset();
    setCustomerSearchQuery('');
  };

  return {
    form,
    result,
    onSubmit,
    handleReset,
    customerSearchQuery,
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
  };
}
