import { Request, Response } from "express";
import * as assetService from "../services/assetService";

// ---- Helpers de validação ----
function validateAssetBody(body: any): string | null {
  if (!body.model || typeof body.model !== "string" || body.model.trim().length === 0)
    return "Modelo é obrigatório";
  if (body.model.trim().length > 100)
    return "Modelo não pode ter mais de 100 caracteres";

  if (!body.category || typeof body.category !== "string" || body.category.trim().length === 0)
    return "Categoria é obrigatória";

  if (!body.serialNumber || typeof body.serialNumber !== "string" || body.serialNumber.trim().length === 0)
    return "Número de série é obrigatório";
  if (!/^[a-zA-Z0-9\-]+$/.test(body.serialNumber))
    return "Número de série contém caracteres inválidos";

  if (body.value === undefined || body.value === null)
    return "Valor é obrigatório";
  if (typeof body.value !== "number" || isNaN(body.value) || body.value <= 0)
    return "Valor deve ser um número positivo";

  return null;
}

function validateId(id: string): number | null {
  const parsed = parseInt(id);
  if (isNaN(parsed) || parsed <= 0) return null;
  return parsed;
}

// ---- Controllers ----

export async function listAssets(req: Request, res: Response) {
  try {
    const assets = await assetService.listAssets(req.query);
    res.json(assets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao listar equipamentos" });
  }
}

export async function createAsset(req: Request, res: Response) {
  const validationError = validateAssetBody(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const asset = await assetService.createAsset(req.body);
    res.status(201).json(asset);
  } catch (err: any) {
    console.error(err);
    res.status(400).json({ error: err.message || "Erro ao criar equipamento" });
  }
}

export async function getAsset(req: Request, res: Response) {
  const id = validateId(req.params.id as string);
  if (!id) {
    return res.status(400).json({ error: "ID inválido" });
  }

  try {
    const asset = await assetService.getAsset(id);
    if (!asset) {
      return res.status(404).json({ error: "Equipamento não encontrado" });
    }
    res.json(asset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar equipamento" });
  }
}

export async function deleteAsset(req: Request, res: Response) {
  const id = validateId(req.params.id as string);
  if (!id) {
    return res.status(400).json({ error: "ID inválido" });
  }

  try {
    await assetService.deleteAsset(id);
    res.status(200).json({ message: "Equipamento apagado com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao apagar equipamento" });
  }
}