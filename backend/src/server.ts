import "dotenv/config";
import express from "express";
import cors from "cors";
import assetRoutes from "./routes/assetRoutes";

const app = express();

app.use(express.json());

// porta 5173 do  Vite
app.use(cors({ origin: "http://localhost:5173" }));

app.use("/api/assets", assetRoutes);

app.get("/", (req, res) => {
  res.send("SafeVault API is running");
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});