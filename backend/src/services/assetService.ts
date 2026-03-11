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

export async function updateAsset(id: number, data: any) {
  // Verifica se existe antes de atualizar
  const asset = await prisma.asset.findUnique({ where: { id } });
  if (!asset) {
    throw new Error(`Equipamento com ID ${id} não encontrado`);
  }

  // Verifica duplicado de número de série (se for diferente do atual)
  if (data.serialNumber && data.serialNumber.trim() !== asset.serialNumber) {
    const existing = await prisma.asset.findUnique({
      where: { serialNumber: data.serialNumber.trim() },
    });
    if (existing) {
      throw new Error(`Número de série "${data.serialNumber}" já existe`);
    }
  }

  return prisma.asset.update({
    where: { id },
    data: {
      model:        data.model?.trim() || asset.model,
      category:     data.category?.trim() || asset.category,
      serialNumber: data.serialNumber?.trim() || asset.serialNumber,
      value:        data.value !== undefined ? data.value : asset.value,
      purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : asset.purchaseDate,
    },
  });
}