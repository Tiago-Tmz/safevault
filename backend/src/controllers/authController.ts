import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../database';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const employee = await prisma.employee.findUnique({ where: { email } });
  if (!employee) return res.status(401).json({ error: 'Credenciais inválidas' });

  const valid = await bcrypt.compare(password, employee.password);
  if (!valid) return res.status(401).json({ error: 'Credenciais inválidas' });

  req.session.user = {
    id: employee.id,
    name: employee.name,
    email: employee.email,
    isAdmin: employee.isAdmin,
  };

  res.json({
    id: employee.id,
    name: employee.name,
    email: employee.email,
    isAdmin: employee.isAdmin,
  });
};

export const logout = (req: Request, res: Response) => {
  req.session.destroy(() => res.json({ message: 'Sessão terminada' }));
};

export const me = (req: Request, res: Response) => {
  if (!req.session.user) return res.status(401).json({ error: 'Não autenticado' });
  res.json(req.session.user);
};