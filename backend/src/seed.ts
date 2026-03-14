import 'dotenv/config'; // tem de ser a primeira linha
import { prisma } from './database';
import bcrypt from 'bcryptjs';

async function main() {
  const hashed = await bcrypt.hash('123', 10);
  await prisma.employee.update({
    where: { email: 'teste@gmail.com' },
    data: { password: hashed }
  });
  console.log('Password atualizada com sucesso');
}

main().catch(console.error).finally(() => prisma.$disconnect());