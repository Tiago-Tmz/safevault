import { prisma } from "../database";

// ---- listAssets ----
export function listAssets(filters: any) {
  const where: any = {};

  // Só aceita filtros conhecidos, ignora o resto
  if (filters.category && typeof filters.category === "string")
    where.category = filters.category.trim();
  if (filters.status && typeof filters.status === "string")
    where.status = filters.status.trim();

  return prisma.asset.findMany({
    where,
    include: {
      employee: { include: { department: true } },
    },
  });
}

// ---- createAsset ----
export async function createAsset(data: any) {
  // Verifica duplicado de número de série
  const existing = await prisma.asset.findUnique({
    where: { serialNumber: data.serialNumber },
  });
  if (existing) {
    throw new Error(`Número de série "${data.serialNumber}" já existe`);
  }

  return prisma.asset.create({
    data: {
      model:        data.model.trim(),
      category:     data.category.trim(),
      serialNumber: data.serialNumber.trim(),
      value:        data.value,
      purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : new Date(),
    },
  });
}

// ---- getAsset ----
export async function getAsset(id: number) {
  const asset = await prisma.asset.findUnique({
    where: { id },
    include: {
      employee: { include: { department: true } },
      maintenance: true,
    },
  });

  if (!asset) {
    throw new Error(`Equipamento com ID ${id} não encontrado`);
  }

  return asset;
}

// ---- deleteAsset ----
export async function deleteAsset(id: number) {
  // Verifica se existe antes de apagar
  const asset = await prisma.asset.findUnique({ where: { id } });
  if (!asset) {
    throw new Error(`Equipamento com ID ${id} não encontrado`);
  }

  return prisma.asset.delete({ where: { id } });
}