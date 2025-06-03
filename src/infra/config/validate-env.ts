import { z } from "zod";

const envSchema = z.object({
    NODE_ENV: z.enum(["dev", "prod"]).default("dev"),
    MONGODB_URI: z.string(),
    MONGODB_URI_DEV: z.string().optional(),
    JWT_SECRET: z.string(),
    JWT_REFRESH_SECRET: z.string(),
    ACCESS_TOKEN_EXPIRES_IN: z.coerce.number(),
    REFRESH_TOKEN_EXPIRES_IN: z.coerce.number(),
})

const _env = envSchema.safeParse(process.env)

if(_env.success === false){
    console.error("❌ Invalid environment variables", _env.error.format())
    throw new Error("Invalid environment variables.")
}

export const env = _env.data