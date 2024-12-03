// scripts/createManager.ts

// Adjust the require statement to access the default export
// eslint-disable-next-line @typescript-eslint/no-require-imports
const prisma = require('../utils/prisma').default;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const bcrypt = require('bcryptjs');

async function main() {
  const username = 'manager';
  const password = 'test'; // Replace with the desired password

  const existingManager = await prisma.manager.findUnique({
    where: { username },
  });

  if (existingManager) {
    console.log('Manager account already exists');
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.manager.create({
    data: {
      username,
      password: hashedPassword,
    },
  });

  console.log('Manager account created');
}

main()
  .catch((e) => {
    console.error('An error occurred:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
