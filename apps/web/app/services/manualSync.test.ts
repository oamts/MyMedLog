import { loadDataFromBackend, saveDataToBackend } from "@/services/manualSync";
import type { Medicine } from "@mymedlog/contracts";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/services/db", () => ({
  listMedicinesLocal: vi.fn(),
  markManualSaveSuccessLocal: vi.fn(),
  replaceMedicinesLocal: vi.fn(),
  markManualLoadSuccessLocal: vi.fn()
}));

import {
  listMedicinesLocal,
  markManualLoadSuccessLocal,
  markManualSaveSuccessLocal,
  replaceMedicinesLocal
} from "@/services/db";

function buildMedicine(id: string, name: string): Medicine {
  return {
    id,
    name,
    notes: undefined,
    expiresOn: undefined,
    reminder: { type: "fixed_time", times: ["08:00"] },
    expirationAlert: {
      enabled: false,
      mode: "single",
      daysBefore: [30],
      includeOnExpirationDay: true
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

describe("manual sync service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("saveDataToBackend sends local snapshot and marks save success", async () => {
    const local = [buildMedicine("1f9f5c8a-6e2e-4ab0-a2a8-57a7d6802c2c", "Dipirona")];
    vi.mocked(listMedicinesLocal).mockResolvedValue(local);
    vi.mocked(markManualSaveSuccessLocal).mockResolvedValue();

    const saveSnapshot = vi.fn().mockResolvedValue({ status: "ok", total: 1 });

    const total = await saveDataToBackend(saveSnapshot);

    expect(saveSnapshot).toHaveBeenCalledWith(local);
    expect(markManualSaveSuccessLocal).toHaveBeenCalledTimes(1);
    expect(total).toBe(1);
  });

  it("loadDataFromBackend replaces local data and marks load success", async () => {
    const remote = [buildMedicine("7849aee2-0c49-457d-8dea-e5505152fcdc", "Amoxicilina")];
    vi.mocked(replaceMedicinesLocal).mockResolvedValue();
    vi.mocked(markManualLoadSuccessLocal).mockResolvedValue();

    const loadSnapshot = vi.fn().mockResolvedValue(remote);

    const total = await loadDataFromBackend(loadSnapshot);

    expect(replaceMedicinesLocal).toHaveBeenCalledWith(remote);
    expect(markManualLoadSuccessLocal).toHaveBeenCalledTimes(1);
    expect(total).toBe(1);
  });

  it("saveDataToBackend stops on first error and keeps metadata untouched", async () => {
    const local = [buildMedicine("43f68420-939b-43d5-b5a8-ebdb3ca73f56", "Ibuprofeno")];
    vi.mocked(listMedicinesLocal).mockResolvedValue(local);
    const failure = new Error("backend down");
    const saveSnapshot = vi.fn().mockRejectedValue(failure);

    await expect(saveDataToBackend(saveSnapshot)).rejects.toThrow("backend down");
    expect(markManualSaveSuccessLocal).not.toHaveBeenCalled();
  });

  it("loadDataFromBackend stops on error and does not mark load success", async () => {
    const failure = new Error("network timeout");
    const loadSnapshot = vi.fn().mockRejectedValue(failure);

    await expect(loadDataFromBackend(loadSnapshot)).rejects.toThrow("network timeout");
    expect(replaceMedicinesLocal).not.toHaveBeenCalled();
    expect(markManualLoadSuccessLocal).not.toHaveBeenCalled();
  });
});
