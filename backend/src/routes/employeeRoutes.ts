import { Router } from 'express';
import { requireAuth } from '../middlewares/auth';
import {
  listEmployees,
  createEmployee,
  getEmployee,
  deleteEmployee,
  updateEmployee
} from '../controllers/employeeController';

const router = Router();

router.use(requireAuth);

router.get('/', listEmployees);
router.post('/', createEmployee);
router.get('/:id', getEmployee);
router.delete('/:id', deleteEmployee);
router.put('/:id', updateEmployee);

export default router;