import "dotenv/config";
import express from "express";
import cors from "cors";
import assetRoutes from "./routes/assetRoutes";
import session from "express-session";
import authRoutes from "./routes/authRoutes";

const app = express();

app.use(express.json());

// porta 5173 do  Vite
app.use(cors({ origin: "http://localhost:5173",
  credentials: true
 }));


 app.use(session({
  secret: process.env.SESSION_SECRET || "secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 1 dia
  }
}));

app.use("/api/assets", assetRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("SafeVault API is running");
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});