import 'dotenv/config'; // tem de ser a primeira linha
import { prisma } from './database';
import bcrypt from 'bcryptjs';

async function main() {
  // Garante que existe um departamento default para o admin
  let dept = await prisma.department.findFirst({ where: { name: 'Administração' } });
  if (!dept) {
    dept = await prisma.department.create({
      data: { name: 'Administração', location: 'Sede' },
    });
    console.log('Departamento "Administração" criado.');
  }

  const adminEmail = 'admin@safevault.pt';
  const existing = await prisma.employee.findUnique({ where: { email: adminEmail } });

  if (existing) {
    // Garante que a conta existente tem isAdmin=true
    await prisma.employee.update({
      where: { email: adminEmail },
      data: { isAdmin: true },
    });
    console.log(`Conta admin já existe (${adminEmail}) — isAdmin atualizado para true.`);
  } else {
    const hashed = await bcrypt.hash('admin123', 10);
    await prisma.employee.create({
      data: {
        name: 'Administrador',
        email: adminEmail,
        password: hashed,
        isAdmin: true,
        departmentId: dept.id,
      },
    });
    console.log(`Conta admin criada com sucesso!`);
    console.log(`  Email:    ${adminEmail}`);
    console.log(`  Password: admin123`);
    console.log(`  ⚠️  Muda a password após o primeiro login!`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());