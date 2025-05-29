import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/utils/errors';
import { getAccountBalance } from '@/lib/services/balance-service';
import { formatMoney, fromCents } from '@/lib/utils/money';
import { validateUUID } from '@/lib/utils/validation';

export const GET = withErrorHandler(async (
  req: NextRequest,
  { params }: { params: { accountId: string } }
) => {
  const { accountId } = await params;

  if (!validateUUID(accountId)) {
    throw new Error('Invalid account ID');
  }

  // TODO: Should use Zod for param validation too

  const balanceCents = await getAccountBalance(accountId);

  return NextResponse.json({
    success: true,
    data: {
      accountId,
      balanceCents: balanceCents.toString(),
      balance: fromCents(balanceCents),
      formatted: formatMoney(balanceCents),
    }
  });
});
