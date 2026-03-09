import { prisma } from "../database"; 

export function listAssets(filters: any) {
  const where: any = {};
  if (filters.category) where.category = filters.category;
  if (filters.status) where.status = filters.status;
  return prisma.asset.findMany({
    where,
    include: {
      employee: { include: { department: true } },
    },
  });
}

export function createAsset(data: any) {
  return prisma.asset.create({ data });
}

export function getAsset(id: number) {
  return prisma.asset.findUnique({
    where: { id },
    include: { employee: { include: { department: true } }, maintenance: true },
  });
}

export function deleteAsset(id: number) {
  return prisma.asset.delete({ where: { id } });
}