import express from "express";
import cors from "cors";
import env from "./config/env";
import apiRoutes from "./routes";

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
      // Allow requests with no origin (e.g. server-to-server, curl, Postman)
      if (!origin) return callback(null, true);
      const normalizedOrigin = origin.replace(/\/+$/, "");
      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy does not allow origin: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
