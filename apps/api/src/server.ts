import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import {
  type CreateMedicineResponse,
  type HealthResponse,
  medicineInputSchema,
  medicinesSnapshotSchema
} from "@mymedlog/contracts";
import Fastify from "fastify";

const app = Fastify({ logger: true });
const medicines: CreateMedicineResponse[] = [];

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

app.post<{ Body: unknown; Reply: CreateMedicineResponse }>(
  "/api/v1/medicines",
  {
    schema: {
      summary: "Create medicine",
      tags: ["medicines"],
      body: {
        type: "object",
        properties: {
          name: { type: "string" },
          notes: { type: "string" },
          expiresOn: { type: "string", format: "date" },
          reminder: { type: "object" }
        },
        required: ["name", "reminder"]
      },
      response: {
        201: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            notes: { type: "string" },
            expiresOn: { type: "string", format: "date" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            reminder: { type: "object" }
          },
          required: ["id", "name", "createdAt", "updatedAt", "reminder"]
        }
      }
    }
  },
  async (request, reply) => {
    const parsed = medicineInputSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        message: "Invalid medicine payload",
        issues: parsed.error.issues
      } as never);
    }

    const now = new Date().toISOString();
    const medicine: CreateMedicineResponse = {
      id: crypto.randomUUID(),
      ...parsed.data,
      createdAt: parsed.data.createdAt ?? now,
      updatedAt: parsed.data.updatedAt ?? now
    };

    medicines.push(medicine);

    return reply.status(201).send(medicine);
  }
);

app.get<{ Reply: CreateMedicineResponse[] }>(
  "/api/v1/medicines",
  {
    schema: {
      summary: "List medicines",
      tags: ["medicines"],
      response: {
        200: {
          type: "array",
          items: {
            type: "object"
          }
        }
      }
    }
  },
  async () => medicines
);

app.put<{ Body: unknown; Reply: { status: "ok"; total: number } }>(
  "/api/v1/medicines/snapshot",
  {
    schema: {
      summary: "Replace medicines snapshot",
      tags: ["medicines"],
      body: {
        type: "array",
        items: {
          type: "object"
        }
      },
      response: {
        200: {
          type: "object",
          properties: {
            status: { type: "string", const: "ok" },
            total: { type: "number" }
          },
          required: ["status", "total"]
        }
      }
    }
  },
  async (request, reply) => {
    const parsed = medicinesSnapshotSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        message: "Invalid medicines snapshot payload",
        issues: parsed.error.issues
      } as never);
    }

    medicines.splice(0, medicines.length, ...parsed.data);

    return {
      status: "ok",
      total: medicines.length
    };
  }
);

const port = Number(process.env.PORT ?? 3333);
const host = process.env.HOST ?? "0.0.0.0";

try {
  await app.listen({ port, host });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
