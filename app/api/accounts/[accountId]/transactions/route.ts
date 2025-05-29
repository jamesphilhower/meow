import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withErrorHandler } from '@/lib/utils/errors';
import { validateUUID } from '@/lib/utils/validation';
import { formatMoney } from '@/lib/utils/money';
import { Prisma } from '@prisma/client';


type TransactionWithAccounts = Prisma.TransactionGetPayload<{
  include: {
    fromAccount: true;
    toAccount: true;
  };
}>;

export const GET = withErrorHandler(async (
  req: NextRequest,
  { params }: { params: { accountId: string } }
) => {
  const { accountId } = await params;

  if (!validateUUID(accountId)) {
    throw new Error('Invalid account ID');
  }

  const account = await prisma.account.findUnique({
    where: { id: accountId }
  });

  if (!account) {
    throw new Error('Account not found');
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      OR: [
        { fromAccountId: accountId },
        { toAccountId: accountId }
      ]
    },
    orderBy: { createdAt: 'desc' },
    include: {
      fromAccount: true,
      toAccount: true,
    }
  });

  const formattedTransactions = transactions.map((tx: TransactionWithAccounts) => ({
    id: tx.id,
    type: tx.type,
    amount: formatMoney(tx.amountCents),
    amountCents: tx.amountCents.toString(),
    direction: tx.fromAccountId === accountId ? 'DEBIT' : 'CREDIT',
    description: tx.description,
    createdAt: tx.createdAt,
    fromAccount: tx.fromAccount?.accountNumber,
    toAccount: tx.toAccount?.accountNumber,
  }));

  return NextResponse.json({
    success: true,
    data: {
      accountId,
      transactions: formattedTransactions,
      count: transactions.length,
    }
  });
});
