import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../database";

// ---- Helpers de validação ----

function validateEmployeeBody(body: any): string | null {
  if (!body.name || typeof body.name !== "string" || body.name.trim().length === 0)
    return "Nome é obrigatório";
  if (body.name.trim().length > 100)
    return "Nome não pode ter mais de 100 caracteres";

  if (!body.email || typeof body.email !== "string" || body.email.trim().length === 0)
    return "Email é obrigatório";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email))
    return "Email inválido";

  if (!body.password || typeof body.password !== "string" || body.password.trim().length === 0)
    return "Password é obrigatória";
  if (body.password.length < 6)
    return "Password deve ter pelo menos 6 caracteres";

  if (!body.departmentId || typeof body.departmentId !== "number" || body.departmentId <= 0)
    return "Departamento é obrigatório";

  return null;
}

function validateId(id: string): number | null {
  const parsed = parseInt(id);
  if (isNaN(parsed) || parsed <= 0) return null;
  return parsed;
}

// ---- Controllers ----

export async function listEmployees(req: Request, res: Response) {
  try {
    const employees = await prisma.employee.findMany({
      select: { id: true, name: true, email: true, departmentId: true }
      // password nunca é devolvida
    });
    res.json(employees);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao listar employees" });
  }
}

export async function createEmployee(req: Request, res: Response) {
  const validationError = validateEmployeeBody(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const hashed = await bcrypt.hash(req.body.password, 10);
    const employee = await prisma.employee.create({
      data: {
        name: req.body.name.trim(),
        email: req.body.email.trim(),
        password: hashed, // encriptada automaticamente
        departmentId: req.body.departmentId
      },
      select: { id: true, name: true, email: true, departmentId: true }
    });
    res.status(201).json(employee);
  } catch (err: any) {
    console.error(err);
    if (err.code === "P2002") {
      return res.status(400).json({ error: "Email já registado" });
    }
    res.status(400).json({ error: err.message || "Erro ao criar employee" });
  }
}

export async function getEmployee(req: Request, res: Response) {
  const id = validateId(req.params.id as string);
  if (!id) {
    return res.status(400).json({ error: "ID inválido" });
  }

  try {
    const employee = await prisma.employee.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, departmentId: true }
    });
    if (!employee) {
      return res.status(404).json({ error: "Employee não encontrado" });
    }
    res.json(employee);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar employee" });
  }
}

export async function deleteEmployee(req: Request, res: Response) {
  const id = validateId(req.params.id as string);
  if (!id) {
    return res.status(400).json({ error: "ID inválido" });
  }

  try {
    await prisma.employee.delete({ where: { id } });
    res.status(200).json({ message: "Employee apagado com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao apagar employee" });
  }
}

export async function updateEmployee(req: Request, res: Response) {
  const id = validateId(req.params.id as string);
  if (!id) {
    return res.status(400).json({ error: "ID inválido" });
  }

  try {
    const data: any = {};
    if (req.body.name) data.name = req.body.name.trim();
    if (req.body.email) data.email = req.body.email.trim();
    if (req.body.departmentId) data.departmentId = req.body.departmentId;
    if (req.body.password) {
      data.password = await bcrypt.hash(req.body.password, 10); // encripta se atualizar
    }

    const employee = await prisma.employee.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, departmentId: true }
    });
    res.json(employee);
  } catch (err: any) {
    console.error(err);
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Employee não encontrado" });
    }
    res.status(400).json({ error: err.message || "Erro ao atualizar employee" });
  }
}