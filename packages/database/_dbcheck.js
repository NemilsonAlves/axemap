const { PrismaClient } = require('@prisma/client');
(async () => {
  const p = new PrismaClient();
  try {
    await p.$connect();
    console.log('DB CONNECT OK');
  } catch (e) {
    console.log('DB CONNECT FAIL:', e.message.split('\n')[0]);
  } finally {
    await p.$disconnect().catch(() => {});
  }
})();