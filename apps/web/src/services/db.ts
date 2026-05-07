import Dexie, { type Table } from "dexie";
import { medicineSchema, type Medicine, type MedicineInput } from "@mymedlog/contracts";

class MyMedLogDatabase extends Dexie {
  medicines!: Table<Medicine, string>;

  constructor() {
    super("mymedlog");
    this.version(1).stores({
      medicines: "id, name, startsOn, updatedAt"
    });
  }
}

const db = new MyMedLogDatabase();

export async function createMedicineLocal(input: MedicineInput): Promise<Medicine> {
  const now = new Date().toISOString();
  const candidate: Medicine = {
    id: crypto.randomUUID(),
    ...input,
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now
  };

  const parsed = medicineSchema.safeParse(candidate);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid medicine payload");
  }

  await db.medicines.put(parsed.data);
  return parsed.data;
}

export async function listMedicinesLocal(): Promise<Medicine[]> {
  return db.medicines.orderBy("updatedAt").reverse().toArray();
}
