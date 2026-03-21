import "dotenv/config";
import express from "express";
import cors from "cors";
import assetRoutes from "./routes/assetRoutes";
import session from "express-session";
import authRoutes from "./routes/authRoutes";
import employeeRoutes from './routes/employeeRoutes';
import departmentRoutes from './routes/departmentRoutes';

const app = express();
const isProduction = process.env.NODE_ENV === 'production';
const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret || sessionSecret.length < 32) {
  throw new Error('SESSION_SECRET é obrigatório e deve ter pelo menos 32 caracteres');
}

if (isProduction) {
  app.set('trust proxy', 1);
}

app.use(express.json());

// porta 5173 do  Vite
app.use(cors({ origin: "http://localhost:5173",
  credentials: true
 }));


 app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 1000 * 60 * 60 * 24 // 1 dia
  }
}));

app.use("/api/assets", assetRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use('/api/departments', departmentRoutes);


app.get("/", (req, res) => {
  res.send("SafeVault API is running");
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});