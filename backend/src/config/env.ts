import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z
    .string()
    .default("4000")
    .transform((val) => {
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? 4000 : parsed;
    }),
  DATABASE_URL: z.string().default(""),
  JWT_SECRET: z.string().default("bright_star_school_system_jwt_secret_dev_2026"),
  FRONTEND_URL: z.string().default("http://localhost:3000"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.format());
  throw new Error("Invalid environment configuration");
}

export const env = parsed.data;
export default env;
