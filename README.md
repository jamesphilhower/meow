# Banking API

Simple banking API with Next.js, TypeScript, and Prisma.

## Setup

```bash
pnpm i

# Set DATABASE_URL in .env
npx prisma migrate dev

# You can manually run the seed file if you want
npx prisma db seed

pnpm dev
```

## Testing

```bash
python test_api.py
```

The test script creates accounts, transfers money, and checks balances.