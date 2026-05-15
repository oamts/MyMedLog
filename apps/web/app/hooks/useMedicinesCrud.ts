import { useEffect, useState } from "react";
import {
  medicineInputSchema,
  type Medicine,
  type MedicineInput
} from "@mymedlog/contracts";
import { loadDataFromBackend, saveDataToBackend } from "@/services/manualSync";
import {
  createMedicineLocal,
  deleteMedicineLocal,
  listMedicinesLocal,
  updateMedicineLocal
} from "@/services/db";
import { type MedicineFormValues } from "@/components/MedicineForm";
import { type SyncStatusState } from "@/hooks/useManualSyncStatus";

const EMPTY_FORM_VALUES: MedicineFormValues = {
  name: "",
  expiresOn: "",
  time: "08:00",
  notes: "",
  expirationAlertEnabled: false,
  expirationAlertMode: "single",
  expirationDaysBefore: "30",
  includeOnExpirationDay: true
};

type SyncStatusActions = {
  refreshFromStorage: () => Promise<void>;
  startSaving: () => void;
  startLoading: () => void;
  markSaveSuccess: (total: number) => Promise<void>;
  markLoadSuccess: (total: number) => Promise<void>;
  markError: (message: string) => void;
  state: SyncStatusState;
};

type UseMedicinesCrudArgs = {
  syncStatus: SyncStatusActions;
  putSnapshot: (medicines: Medicine[]) => Promise<{ total: number }>;
  fetchMedicines: () => Promise<Medicine[]>;
};

export function useMedicinesCrud({ syncStatus, putSnapshot, fetchMedicines }: UseMedicinesCrudArgs) {
  const [validationError, setValidationError] = useState<string | null>(null);
  const [localSaveMessage, setLocalSaveMessage] = useState<string | null>(null);
  const [localMedicines, setLocalMedicines] = useState<Medicine[]>([]);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [formValues, setFormValues] = useState<MedicineFormValues>(EMPTY_FORM_VALUES);

  useEffect(() => {
    async function loadLocalState() {
      setLocalMedicines(await listMedicinesLocal());
      await syncStatus.refreshFromStorage();
    }

    void loadLocalState();
  }, [syncStatus.refreshFromStorage]);

  async function onSubmit(values: MedicineFormValues) {
    setValidationError(null);
    setLocalSaveMessage(null);

    const payload: MedicineInput = {
      expirationAlert: {
        enabled: values.expirationAlertEnabled,
        mode: values.expirationAlertMode,
        daysBefore: values.expirationDaysBefore
          .split(",")
          .map((item) => Number(item.trim()))
          .filter((item) => Number.isInteger(item) && item >= 0),
        includeOnExpirationDay: values.includeOnExpirationDay
      },
      name: values.name,
      expiresOn: values.expiresOn || undefined,
      notes: values.notes || undefined,
      reminder: {
        type: "fixed_time",
        times: [values.time]
      }
    };

    const parsed = medicineInputSchema.safeParse(payload);
    if (!parsed.success) {
      setValidationError(parsed.error.issues[0]?.message ?? "Dados invalidos");
      return;
    }

    try {
      const localMedicine = editingMedicine
        ? await updateMedicineLocal(editingMedicine.id, parsed.data)
        : await createMedicineLocal(parsed.data);
      setLocalSaveMessage(
        editingMedicine
          ? `Atualizado localmente: ${localMedicine.name}`
          : `Salvo localmente: ${localMedicine.name}`
      );
      setLocalMedicines(await listMedicinesLocal());
      await syncStatus.refreshFromStorage();
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : "Erro ao salvar localmente");
      return;
    }

    setEditingMedicine(null);
    setFormValues(EMPTY_FORM_VALUES);
  }

  function startEdit(medicine: Medicine) {
    setEditingMedicine(medicine);
    setFormValues({
      name: medicine.name,
      expiresOn: medicine.expiresOn ?? "",
      time: medicine.reminder.type === "fixed_time" ? medicine.reminder.times[0] ?? "08:00" : "08:00",
      notes: medicine.notes ?? "",
      expirationAlertEnabled: medicine.expirationAlert.enabled,
      expirationAlertMode: medicine.expirationAlert.mode,
      expirationDaysBefore: medicine.expirationAlert.daysBefore.join(","),
      includeOnExpirationDay: medicine.expirationAlert.includeOnExpirationDay
    });
    setValidationError(null);
    setLocalSaveMessage(`Editando: ${medicine.name}`);
  }

  async function removeMedicine(id: string) {
    await deleteMedicineLocal(id);
    setLocalMedicines(await listMedicinesLocal());
    await syncStatus.refreshFromStorage();
    if (editingMedicine?.id === id) {
      setEditingMedicine(null);
      setFormValues(EMPTY_FORM_VALUES);
    }
  }

  async function saveData() {
    syncStatus.startSaving();
    try {
      const total = await saveDataToBackend(putSnapshot);
      await syncStatus.markSaveSuccess(total);
    } catch (error) {
      syncStatus.markError(error instanceof Error ? error.message : "Falha ao salvar dados no backend.");
    }
  }

  async function loadData() {
    syncStatus.startLoading();
    try {
      const total = await loadDataFromBackend(fetchMedicines);
      setLocalMedicines(await listMedicinesLocal());
      await syncStatus.markLoadSuccess(total);
    } catch (error) {
      syncStatus.markError(error instanceof Error ? error.message : "Falha ao carregar dados do backend.");
    }
  }

  return {
    validationError,
    localSaveMessage,
    localMedicines,
    editingMedicine,
    formValues,
    onSubmit,
    startEdit,
    removeMedicine,
    saveData,
    loadData
  };
}
