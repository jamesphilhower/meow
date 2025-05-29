import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/utils/errors';
import { createAccount } from '@/lib/services/account-service';
import { toCents } from '@/lib/utils/money';
import { validateUUID, } from '@/lib/utils/validation';

export const POST = withErrorHandler(async (req: NextRequest) => {
  const body = await req.json();
  const { customerId, initialDepositAmount } = body;

  if (!validateUUID(customerId)) {
    throw new Error('Invalid customer ID');
  }

  const depositAmount = initialDepositAmount || 0;
  if (depositAmount < 0) {
    throw new Error('Initial deposit cannot be negative');
  }

  const account = await createAccount(
    customerId,
    toCents(depositAmount)
  );

  return NextResponse.json({
    success: true,
    data: {
      id: account.id,
      accountNumber: account.accountNumber,
      customerId: account.customerId,
      createdAt: account.createdAt,
    }
  }, { status: 201 });
});
