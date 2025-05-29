import { prisma } from '@/lib/prisma';

export async function getAccountBalance(accountId: string): Promise<bigint> {
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
    }
  });

  let balance = 0;

  for (const transaction of transactions) {
    // TODO: My compiler was unhappy with bigint operations in this repo and I wasn't sure how long
    // it would take to resolve, so I'm using Number casts. In production we'd want to keep everything
    // as BigInt to avoid precision issues with large amounts
    if (transaction.toAccountId === accountId) {
      balance += Number(transaction.amountCents);
    }
    if (transaction.fromAccountId === accountId) {
      balance -= Number(transaction.amountCents);
    }
  }

  return BigInt(balance);
}
