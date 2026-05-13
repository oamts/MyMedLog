import { useEffect, useState } from "react";
import {
  medicineInputSchema,
  type Medicine,
  type MedicineInput
} from "@mymedlog/contracts";
import {
  useGetHealthQuery,
  useLazyGetMedicinesQuery,
  usePutMedicinesSnapshotMutation
} from "./services/api";
import { HealthStatus } from "./components/HealthStatus";
import { MedicineForm, type MedicineFormValues } from "./components/MedicineForm";
import { MedicineList } from "./components/MedicineList";
import {
  getNotificationPermissionState,
  requestNotificationPermission,
  notifyReminder,
  type NotificationPermissionState
} from "./services/notifications";
import { getLocalReminderSchedule } from "./services/reminderEngine";
import {
  createMedicineLocal,
  deleteMedicineLocal,
  listMedicinesLocal,
  markManualLoadSuccessLocal,
  markManualSaveSuccessLocal,
  replaceMedicinesLocal,
  updateMedicineLocal
} from "./services/db";
import { useManualSyncStatus } from "./hooks/useManualSyncStatus";

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

export function App() {
  const { data, isLoading, isError } = useGetHealthQuery();
  const [putMedicinesSnapshot, saveSnapshotState] = usePutMedicinesSnapshotMutation();
  const [fetchMedicines, loadMedicinesState] = useLazyGetMedicinesQuery();
  const [validationError, setValidationError] = useState<string | null>(null);
  const [localSaveMessage, setLocalSaveMessage] = useState<string | null>(null);
  const [localMedicines, setLocalMedicines] = useState<Medicine[]>([]);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [formValues, setFormValues] = useState<MedicineFormValues>(EMPTY_FORM_VALUES);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermissionState>(getNotificationPermissionState());
  const syncStatus = useManualSyncStatus();

  useEffect(() => {
    async function loadLocalState() {
      setLocalMedicines(await listMedicinesLocal());
      await syncStatus.refreshFromStorage();
    }

    void loadLocalState();
  }, [syncStatus.refreshFromStorage]);

  useEffect(() => {
    async function checkDueReminders() {
      const schedule = await getLocalReminderSchedule();
      const now = Date.now();
      const lookbackMs = 60 * 1000;
      const lookaheadMs = 60 * 1000;

      await Promise.all(schedule.map(async (item) => {
        const nextAtMs = new Date(item.nextAt).getTime();
        const isDueSoon = nextAtMs >= now - lookbackMs && nextAtMs <= now + lookaheadMs;

        if (isDueSoon) {
          await notifyReminder(item);
        }
      }));
    }

    void checkDueReminders();
    const timerId = window.setInterval(() => {
      void checkDueReminders();
    }, 60 * 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, []);

  async function enableNotifications() {
    const permission = await requestNotificationPermission();
    setNotificationPermission(permission);
  }

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
      const medicines = await listMedicinesLocal();
      const response = await putMedicinesSnapshot(medicines).unwrap();
      await markManualSaveSuccessLocal();
      await syncStatus.markSaveSuccess(response.total);
    } catch (error) {
      syncStatus.markError(error instanceof Error ? error.message : "Falha ao salvar dados no backend.");
    }
  }

  async function loadData() {
    syncStatus.startLoading();
    try {
      const medicines = await fetchMedicines().unwrap();
      await replaceMedicinesLocal(medicines);
      await markManualLoadSuccessLocal();
      setLocalMedicines(await listMedicinesLocal());
      await syncStatus.markLoadSuccess(medicines.length);
    } catch (error) {
      syncStatus.markError(error instanceof Error ? error.message : "Falha ao carregar dados do backend.");
    }
  }

  const isSyncRunning = syncStatus.state.phase === "saving" || syncStatus.state.phase === "loading";

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "2rem",
        background:
          "radial-gradient(circle at top, #d1fae5 0%, #f4efe6 35%, #efe7d8 100%)",
        color: "#1f2937",
        fontFamily: "'Source Sans 3', system-ui, sans-serif"
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "720px",
          background: "rgba(255, 255, 255, 0.82)",
          borderRadius: "16px",
          boxShadow: "0 8px 30px rgba(15, 118, 110, 0.12)",
          padding: "1.5rem"
        }}
      >
        <h1 style={{ marginTop: 0 }}>MyMedLog</h1>
        <p style={{ marginBottom: "1.25rem" }}>
          Scaffold inicial concluido. Frontend conectado ao endpoint de health da API.
        </p>
        <div style={{ marginBottom: "0.75rem" }}>
          <p style={{ marginTop: 0, marginBottom: "0.4rem" }}>
            Permissao de notificacao: <strong>{notificationPermission}</strong>
          </p>
          <button
            type="button"
            onClick={() => {
              void enableNotifications();
            }}
            disabled={notificationPermission === "granted" || notificationPermission === "unsupported"}
          >
            Ativar notificacoes
          </button>
        </div>
        <div style={{ marginBottom: "0.75rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button type="button" onClick={() => void saveData()} disabled={isSyncRunning}>
            {syncStatus.state.phase === "saving" ? "Saving..." : "Save data"}
          </button>
          <button type="button" onClick={() => void loadData()} disabled={isSyncRunning}>
            {syncStatus.state.phase === "loading" ? "Loading..." : "Load data"}
          </button>
        </div>
        <p style={{ marginTop: 0, marginBottom: "0.4rem" }}>
          Mudancas pendentes: <strong>{syncStatus.state.pendingChanges ? "sim" : "nao"}</strong>
        </p>
        {syncStatus.state.lastManualSaveAt && (
          <p style={{ marginTop: 0, marginBottom: "0.25rem" }}>
            Ultimo Save data: {new Date(syncStatus.state.lastManualSaveAt).toLocaleString()}
          </p>
        )}
        {syncStatus.state.lastManualLoadAt && (
          <p style={{ marginTop: 0, marginBottom: "0.25rem" }}>
            Ultimo Load data: {new Date(syncStatus.state.lastManualLoadAt).toLocaleString()}
          </p>
        )}
        {syncStatus.state.message && <p style={{ marginTop: 0, marginBottom: "0.75rem" }}>{syncStatus.state.message}</p>}
        <HealthStatus isLoading={isLoading} isError={isError} data={data} />
        <hr style={{ margin: "1.25rem 0", borderColor: "#d1d5db" }} />
        <MedicineForm
          initialValues={formValues}
          isSubmitting={saveSnapshotState.isLoading || loadMedicinesState.isFetching}
          isEditing={Boolean(editingMedicine)}
          onSubmit={onSubmit}
        />
        {validationError && <p style={{ color: "#b91c1c" }}>{validationError}</p>}
        {localSaveMessage && <p style={{ color: "#065f46" }}>{localSaveMessage}</p>}
        <h2 style={{ marginTop: "1.5rem", marginBottom: "0.5rem", fontSize: "1.1rem" }}>
          Medicamentos locais
        </h2>
        <MedicineList
          medicines={localMedicines}
          onEdit={startEdit}
          onDelete={(id) => {
            void removeMedicine(id);
          }}
        />
      </section>
    </main>
  );
}
