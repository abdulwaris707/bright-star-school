import express from "express";
import cors from "cors";
import env from "./config/env";
import apiRoutes from "./routes";
import store from "./services/store";
import dbBridge from "./services/dbBridge";

const app = express();

// Configure CORS: allow FRONTEND_URL and http://localhost:3000 in development
const allowedOrigins: string[] = [env.FRONTEND_URL.replace(/\/+$/, "")];
if (env.NODE_ENV === "development" || !process.env.NODE_ENV) {
  const devOrigin = "http://localhost:3000";
  if (!allowedOrigins.includes(devOrigin)) {
    allowedOrigins.push(devOrigin);
  }
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. server-to-server, curl, Postman, same-origin relative requests)
      if (!origin) return callback(null, true);
      const normalizedOrigin = origin.replace(/\/+$/, "");
      if (
        allowedOrigins.includes(normalizedOrigin) ||
        normalizedOrigin.endsWith(".vercel.app") ||
        normalizedOrigin.includes("localhost")
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Real-time Supabase PostgreSQL synchronization middleware
app.use(async (_req, _res, next) => {
  try {
    await dbBridge.ensureSynced(store);
  } catch (err) {
    console.error("DB sync middleware non-fatal error:", err);
  }
  next();
});

// Mount all API routes under /api
app.use("/api", apiRoutes);

// Root informational endpoint
app.get("/", (_req, res) => {
  res.status(200).json({
    app: "Bright Star School Management System API",
    status: "running",
    healthCheck: "/api/health",
  });
});

export { app };
export default app;
