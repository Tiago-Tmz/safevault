import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middlewares/auth';
import {
  listEmployees,
  createEmployee,
  getEmployee,
  deleteEmployee,
  updateEmployee
} from '../controllers/employeeController';

const router = Router();

// Qualquer utilizador autenticado pode listar e ver employees
router.get('/', requireAuth, listEmployees);
router.get('/:id', requireAuth, getEmployee);

// Apenas admins podem criar, editar ou apagar employees
router.post('/', requireAdmin, createEmployee);
router.put('/:id', requireAdmin, updateEmployee);
router.delete('/:id', requireAdmin, deleteEmployee);

export default router;