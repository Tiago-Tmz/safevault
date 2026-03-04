import { Request, Response } from "express";
import * as assetService from "../services/assetService";

export async function listAssets(req: Request, res: Response) {
  try {
    const assets = await assetService.listAssets(req.query);
    res.json(assets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch assets" });
  }
}

export async function createAsset(req: Request, res: Response) {
  try {
    const asset = await assetService.createAsset(req.body);
    res.status(201).json(asset);
  } catch (err: any) {
    console.error(err);
    res.status(400).json({ error: err.message || "Failed to create asset" });
  }
}

export async function getAsset(req: Request, res: Response) {
  try {
    const asset = await assetService.getAsset(parseInt(req.params.id));
    if (!asset) {
      return res.status(404).json({ error: "Asset not found" });
    }
    res.json(asset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch asset" });
  }
}
