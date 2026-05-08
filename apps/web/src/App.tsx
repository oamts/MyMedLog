import { useEffect, useState } from "react";
import {
  medicineInputSchema,
  type Medicine,
  type MedicineInput
} from "@mymedlog/contracts";
import { useCreateMedicineMutation, useGetHealthQuery } from "./services/api";
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
  updateMedicineLocal
} from "./services/db";

const EMPTY_FORM_VALUES: MedicineFormValues = {
  name: "",
  expiresOn: "",
  time: "08:00",
  notes: ""
};

export function App() {
  const { data, isLoading, isError } = useGetHealthQuery();
  const [createMedicine, createState] = useCreateMedicineMutation();
  const [validationError, setValidationError] = useState<string | null>(null);
  const [localSaveMessage, setLocalSaveMessage] = useState<string | null>(null);
  const [localMedicines, setLocalMedicines] = useState<Medicine[]>([]);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [formValues, setFormValues] = useState<MedicineFormValues>(EMPTY_FORM_VALUES);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermissionState>(getNotificationPermissionState());

  useEffect(() => {
    void listMedicinesLocal().then(setLocalMedicines);
  }, []);

  useEffect(() => {
    async function checkDueReminders() {
      const schedule = await getLocalReminderSchedule();
      const now = Date.now();
      const lookaheadMs = 60 * 1000;

      schedule.forEach((item) => {
        const nextAtMs = new Date(item.nextAt).getTime();
        const isDueSoon = nextAtMs >= now && nextAtMs <= now + lookaheadMs;

        if (isDueSoon) {
          notifyReminder(item);
        }
      });
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
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : "Erro ao salvar localmente");
      return;
    }

    if (!editingMedicine) {
      await createMedicine(parsed.data).catch(() => null);
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
      notes: medicine.notes ?? ""
    });
    setValidationError(null);
    setLocalSaveMessage(`Editando: ${medicine.name}`);
  }

  async function removeMedicine(id: string) {
    await deleteMedicineLocal(id);
    setLocalMedicines(await listMedicinesLocal());
    if (editingMedicine?.id === id) {
      setEditingMedicine(null);
      setFormValues(EMPTY_FORM_VALUES);
    }
  }

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
        <HealthStatus isLoading={isLoading} isError={isError} data={data} />
        <hr style={{ margin: "1.25rem 0", borderColor: "#d1d5db" }} />
        <MedicineForm
          initialValues={formValues}
          isSubmitting={createState.isLoading}
          isEditing={Boolean(editingMedicine)}
          onSubmit={onSubmit}
        />
        {validationError && <p style={{ color: "#b91c1c" }}>{validationError}</p>}
        {localSaveMessage && <p style={{ color: "#065f46" }}>{localSaveMessage}</p>}
        {createState.isError && <p style={{ color: "#b91c1c" }}>Falha ao salvar medicamento.</p>}
        {createState.data && (
          <p>
            Medicamento salvo: <strong>{createState.data.name}</strong> (id {createState.data.id})
          </p>
        )}
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
