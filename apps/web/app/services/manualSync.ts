import type { Medicine } from "@mymedlog/contracts";
import {
  listMedicinesLocal,
  markManualLoadSuccessLocal,
  markManualSaveSuccessLocal,
  replaceMedicinesLocal
} from "@/services/db";

type SaveSnapshot = (medicines: Medicine[]) => Promise<{ total: number }>;
type LoadSnapshot = () => Promise<Medicine[]>;

export async function saveDataToBackend(saveSnapshot: SaveSnapshot): Promise<number> {
  const medicines = await listMedicinesLocal();
  const response = await saveSnapshot(medicines);
  await markManualSaveSuccessLocal();
  return response.total;
}

export async function loadDataFromBackend(loadSnapshot: LoadSnapshot): Promise<number> {
  const medicines = await loadSnapshot();
  await replaceMedicinesLocal(medicines);
  await markManualLoadSuccessLocal();
  return medicines.length;
}
