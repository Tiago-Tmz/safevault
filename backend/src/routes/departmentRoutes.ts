import { Router } from 'express';
import { requireAuth } from '../middlewares/auth';
import { prisma } from '../database';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const departments = await prisma.department.findMany();
  res.json(departments);
});

export default router;