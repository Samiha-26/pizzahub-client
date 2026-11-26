import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { jwt } from "better-auth/plugins";

const client = new MongoClient(process.env.MONGODB_URL as string);
const db = client.db(process.env.DB_NAME || "pizzahub");

const resolveBaseURL = () => {
  const envUrl = process.env.BETTER_AUTH_URL || "";
  if (envUrl && envUrl.startsWith("https://")) {
    return envUrl;
  }
  const nextPublicUrl = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "";
  if (nextPublicUrl && nextPublicUrl.startsWith("https://")) {
    return nextPublicUrl;
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (process.env.NODE_ENV === "production" || process.env.VERCEL === "1") {
    return "https://pizzahub-client-eta.vercel.app";
  }
  return envUrl || "http://localhost:3000";
};

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
    transaction: false,
  }),
  secret: process.env.BETTER_AUTH_SECRET || "pizzahub_default_auth_secret_dev_key",
  baseURL: resolveBaseURL(),
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:5000",
    "https://*.vercel.app",
    "https://pizzahub-client.vercel.app",
    "https://pizzahub-client-eta.vercel.app",
    "https://pizzahub-client-l0w1qnh4y-samiha1.vercel.app",
    process.env.BETTER_AUTH_URL || "",
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "",
    process.env.NEXT_PUBLIC_API_URL || "",
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "",
    process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "",
  ].filter(Boolean),
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "customer",
        input: true,
      },
      status: {
        type: "string",
        required: false,
        defaultValue: "active",
        input: false,
      },
      subscriptionTier: {
        type: "string",
        required: false,
        defaultValue: "free",
        input: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
      requireLocalEmailVerified: false,
    },
  },
  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
  },
  plugins: [jwt()],
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
});
