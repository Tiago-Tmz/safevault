import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middlewares/auth';
import { prisma } from '../database';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const departments = await prisma.department.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { employees: true },
      },
    },
  });
  res.json(departments);
});

router.post('/', requireAdmin, async (req, res) => {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  const location = typeof req.body?.location === 'string' ? req.body.location.trim() : '';

  if (!name) {
    return res.status(400).json({ error: 'Nome do departamento é obrigatório.' });
  }

  if (!location) {
    return res.status(400).json({ error: 'Localização do departamento é obrigatória.' });
  }

  try {
    const created = await prisma.department.create({
      data: { name, location },
      include: {
        _count: {
          select: { employees: true },
        },
      },
    });
    return res.status(201).json(created);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao criar departamento.' });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = Number.parseInt(rawId, 10);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'ID inválido.' });
  }

  try {
    const existing = await prisma.department.findUnique({
      where: { id },
      include: {
        _count: {
          select: { employees: true },
        },
      },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Departamento não encontrado.' });
    }

    if (existing._count.employees > 0) {
      return res.status(400).json({
        error: 'Não é possível remover um departamento com colaboradores associados.',
      });
    }

    await prisma.department.delete({ where: { id } });
    return res.json({ message: 'Departamento removido com sucesso.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao remover departamento.' });
  }
});

export default router;