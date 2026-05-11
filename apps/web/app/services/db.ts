import Dexie, { type Table } from "dexie";
import { medicineSchema, type Medicine, type MedicineInput } from "@mymedlog/contracts";

type SyncMeta = {
  id: "sync-meta";
  hasPendingChanges: boolean;
  lastManualSaveAt: string | null;
  lastManualLoadAt: string | null;
};

class MyMedLogDatabase extends Dexie {
  medicines!: Table<Medicine, string>;
  deliveredTriggers!: Table<{ triggerId: string; deliveredAt: string }, string>;
  syncMeta!: Table<SyncMeta, "sync-meta">;

  constructor() {
    super("mymedlog");
    this.version(1).stores({
      medicines: "id, name, expiresOn, updatedAt",
      deliveredTriggers: "triggerId, deliveredAt",
      syncMeta: "id, hasPendingChanges"
    });
  }
}

const db = new MyMedLogDatabase();

async function getOrCreateSyncMeta(): Promise<SyncMeta> {
  const existing = await db.syncMeta.get("sync-meta");
  if (existing) {
    return existing;
  }

  const created: SyncMeta = {
    id: "sync-meta",
    hasPendingChanges: false,
    lastManualSaveAt: null,
    lastManualLoadAt: null
  };

  await db.syncMeta.put(created);
  return created;
}

async function markPendingChanges(): Promise<void> {
  const meta = await getOrCreateSyncMeta();
  await db.syncMeta.put({
    ...meta,
    hasPendingChanges: true
  });
}

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
  await markPendingChanges();
  return parsed.data;
}

export async function listMedicinesLocal(): Promise<Medicine[]> {
  return db.medicines.orderBy("updatedAt").reverse().toArray();
}

export async function updateMedicineLocal(
  id: string,
  input: MedicineInput
): Promise<Medicine> {
  const existing = await db.medicines.get(id);
  if (!existing) {
    throw new Error("Medicine not found");
  }

  const candidate: Medicine = {
    ...existing,
    ...input,
    id,
    updatedAt: new Date().toISOString()
  };

  const parsed = medicineSchema.safeParse(candidate);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid medicine payload");
  }

  await db.medicines.put(parsed.data);
  await markPendingChanges();
  return parsed.data;
}

export async function deleteMedicineLocal(id: string): Promise<void> {
  await db.medicines.delete(id);
  await markPendingChanges();
}

export async function replaceMedicinesLocal(medicines: Medicine[]): Promise<void> {
  for (const medicine of medicines) {
    const parsed = medicineSchema.safeParse(medicine);
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Invalid medicine payload");
    }
  }

  await db.transaction("rw", db.medicines, async () => {
    await db.medicines.clear();
    await db.medicines.bulkPut(medicines);
  });
}

export async function getSyncMetaLocal(): Promise<SyncMeta> {
  return getOrCreateSyncMeta();
}

export async function markManualSaveSuccessLocal(): Promise<void> {
  const meta = await getOrCreateSyncMeta();
  await db.syncMeta.put({
    ...meta,
    hasPendingChanges: false,
    lastManualSaveAt: new Date().toISOString()
  });
}

export async function markManualLoadSuccessLocal(): Promise<void> {
  const meta = await getOrCreateSyncMeta();
  await db.syncMeta.put({
    ...meta,
    hasPendingChanges: false,
    lastManualLoadAt: new Date().toISOString()
  });
}

export async function hasDeliveredTriggerLocal(triggerId: string): Promise<boolean> {
  const entry = await db.deliveredTriggers.get(triggerId);
  return Boolean(entry);
}

export async function markDeliveredTriggerLocal(triggerId: string): Promise<void> {
  await db.deliveredTriggers.put({
    triggerId,
    deliveredAt: new Date().toISOString()
  });
}

export async function pruneDeliveredTriggersLocal(olderThanDays = 30): Promise<void> {
  const cutoff = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;
  const entries = await db.deliveredTriggers.toArray();

  await Promise.all(
    entries
      .filter((entry) => new Date(entry.deliveredAt).getTime() < cutoff)
      .map((entry) => db.deliveredTriggers.delete(entry.triggerId))
  );
}
