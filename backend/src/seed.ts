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
  const adminPassword = process.env.ADMIN_SEED_PASSWORD;
  const existing = await prisma.employee.findUnique({ where: { email: adminEmail } });

  if (existing) {
    // Garante que a conta existente tem isAdmin=true
    await prisma.employee.update({
      where: { email: adminEmail },
      data: { isAdmin: true },
    });
    console.log(`Conta admin já existe (${adminEmail}) — isAdmin atualizado para true.`);
  } else {
    if (!adminPassword || adminPassword.length < 12) {
      throw new Error('ADMIN_SEED_PASSWORD é obrigatória e deve ter pelo menos 12 caracteres');
    }

    const hashed = await bcrypt.hash(adminPassword, 12);
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
    console.log('  Password: definida por ADMIN_SEED_PASSWORD');
    console.log('  Muda a password após o primeiro login.');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());