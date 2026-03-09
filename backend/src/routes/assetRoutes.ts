import { Router } from "express";
import * as assetController from "../controllers/assetController";
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

const router = Router();

router.get("/", limiter, assetController.listAssets);
router.post("/", limiter, assetController.createAsset);
router.get("/:id", limiter, assetController.getAsset);
router.delete("/:id", limiter, assetController.deleteAsset);
// additional routes (update, delete, status changes, filters etc.)

export default router;
