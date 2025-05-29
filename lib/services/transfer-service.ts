import { prisma } from '@/lib/prisma';
import { getAccountBalance } from './balance-service';

export async function transferMoney(
  fromAccountId: string,
  toAccountId: string,
  amountCents: bigint,
  description?: string
) {
  const [fromAccount, toAccount] = await Promise.all([
    prisma.account.findUnique({ where: { id: fromAccountId } }),
    prisma.account.findUnique({ where: { id: toAccountId } })
  ]);

  if (!fromAccount || !toAccount) {
    throw new Error('Account not found');
  }

  // TODO: This has a race condition - two transfers could check the balance at the same time
  // and both pass, resulting in negative balance. We need to wrap this in a prisma transaction

  const currentBalance = await getAccountBalance(fromAccountId);

  if (currentBalance < amountCents) {
    throw new Error('Insufficient funds');
  }

  const transaction = await prisma.transaction.create({
    data: {
      fromAccountId,
      toAccountId,
      amountCents,
      type: 'TRANSFER',
      description,
    }
  });

  return transaction;
}
