import Fastify from "fastify";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import type { HealthResponse } from "@mymedlog/contracts";

const app = Fastify({ logger: true });

await app.register(swagger, {
  openapi: {
    openapi: "3.1.0",
    info: {
      title: "MyMedLog API",
      version: "0.1.0"
    }
  }
});

await app.register(swaggerUI, {
  routePrefix: "/documentation"
});

app.get<{ Reply: HealthResponse }>(
  "/api/v1/health",
  {
    schema: {
      summary: "Health check",
      tags: ["health"],
      response: {
        200: {
          type: "object",
          properties: {
            status: { type: "string", const: "ok" },
            service: { type: "string", const: "api" },
            timestamp: { type: "string", format: "date-time" }
          },
          required: ["status", "service", "timestamp"]
        }
      }
    }
  },
  async () => ({
    status: "ok",
    service: "api",
    timestamp: new Date().toISOString()
  })
);

const port = Number(process.env.PORT ?? 3333);
const host = process.env.HOST ?? "0.0.0.0";

try {
  await app.listen({ port, host });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
