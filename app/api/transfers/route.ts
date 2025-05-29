import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/utils/errors';
import { transferMoney } from '@/lib/services/transfer-service';
import { toCents } from '@/lib/utils/money';
import { validateUUID, validatePositiveAmount } from '@/lib/utils/validation';
export const POST = withErrorHandler(async (req: NextRequest) => {
  const body = await req.json();
  const { fromAccountId, toAccountId, amount, description } = body;

  // TODO: Use Zod for validation
  if (!validateUUID(fromAccountId) || !validateUUID(toAccountId)) {
    throw new Error('Invalid account ID');
  }

  if (fromAccountId === toAccountId) {
    throw new Error('Cannot transfer to the same account');
  }

  if (!validatePositiveAmount(amount)) {
    throw new Error('Transfer amount must be positive');
  }

  const transaction = await transferMoney(
    fromAccountId,
    toAccountId,
    toCents(amount),
    description
  );

  return NextResponse.json({
    success: true,
    data: {
      id: transaction.id,
      fromAccountId: transaction.fromAccountId,
      toAccountId: transaction.toAccountId,
      amount,
      description: transaction.description,
      createdAt: transaction.createdAt,
    }
  });
});
