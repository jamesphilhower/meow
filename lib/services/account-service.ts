import { prisma } from '@/lib/prisma';
import { generateAccountNumber } from '../utils/account';

export async function createAccount(customerId: string, initialDepositCents: bigint) {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId }
  });

  if (!customer) {
    throw new Error('Customer not found');
  }

  const accountNumber = generateAccountNumber();

  const account = await prisma.account.create({
    data: {
      customerId,
      accountNumber,
    }
  });

  // We should probably throw an error if initialDepositCents is negative
  if (initialDepositCents > 0) {
    await prisma.transaction.create({
      data: {
        toAccountId: account.id,
        amountCents: initialDepositCents,
        type: 'DEPOSIT',
        description: 'Initial deposit',
      }
    });
    // TODO: Should probably extract transaction creation into a shared function
    // to ensure consistency across all transaction types
  }

  return account;
}
