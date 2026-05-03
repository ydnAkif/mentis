import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import fastifyJwt from "@fastify/jwt";
import { studentRoutes } from "./routes/student";
import { teacherRoutes } from "./routes/teacher";

async function main() {
  const app = Fastify({ logger: true });

  await app.register(cors, {
    origin: true,
    credentials: true,
  });

  await app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET ?? "super-secret-mentis-key",
  });

  app.get("/health", async () => ({ ok: true }));

  // Register routes
  await app.register(studentRoutes, { prefix: "/api" });
  await app.register(teacherRoutes, { prefix: "/api" });

  const port = Number(process.env.PORT ?? 4000);
  await app.listen({ port, host: "0.0.0.0" });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
