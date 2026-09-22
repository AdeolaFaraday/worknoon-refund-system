import { z } from 'zod';

export const refundFormSchema = z.object({
  customerId: z.string().uuid({ message: 'Please select a customer' }),
  orderNumber: z.string().min(1, 'Please select an order'),
  requestedAmount: z.preprocess(
    (val) => (val === '' || val === undefined ? undefined : Number(val)),
    z.number({ error: 'Please enter a valid amount' }).min(0.01, 'Amount must be at least $0.01'),
  ),
  reason: z.string().min(1, 'Please select a reason'),
  description: z
    .string()
    .min(20, 'Please provide at least 20 characters of detail')
    .max(2000, 'Description must be under 2000 characters'),
});

export type RefundFormValues = z.infer<typeof refundFormSchema>;

export const REFUND_REASONS = [
  { value: 'damaged', label: 'Damaged or defective item' },
  { value: 'incorrect item', label: 'Incorrect item delivered' },
  { value: 'not as described', label: 'Not as described' },
  { value: 'never received', label: 'Never received' },
  { value: 'changed my mind', label: 'Changed my mind' },
  { value: 'other', label: 'Other' },
] as const;
