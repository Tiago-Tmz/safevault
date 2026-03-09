import { Router } from "express";
import * as assetController from "../controllers/assetController";

const router = Router();

router.get("/", assetController.listAssets);
router.post("/", assetController.createAsset);
router.get("/:id", assetController.getAsset);
router.delete("/:id", assetController.deleteAsset);
// additional routes (update, delete, status changes, filters etc.)

export default router;
