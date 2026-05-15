import {
  useGetHealthQuery,
  useLazyGetMedicinesQuery,
  usePutMedicinesSnapshotMutation
} from "@/services/api";
import { HealthStatus } from "@/components/HealthStatus";
import { MedicineForm } from "@/components/MedicineForm";
import { MedicineList } from "@/components/MedicineList";
import { SyncStatusIndicator } from "@/components/SyncStatusIndicator";
import { useManualSyncStatus } from "@/hooks/useManualSyncStatus";
import { useNotificationPermission } from "@/hooks/useNotificationPermission";
import { useReminderPolling } from "@/hooks/useReminderPolling";
import { useMedicinesCrud } from "@/hooks/useMedicinesCrud";

export function App() {
  const { data, isLoading, isError } = useGetHealthQuery();
  const [putMedicinesSnapshot, saveSnapshotState] = usePutMedicinesSnapshotMutation();
  const [fetchMedicines, loadMedicinesState] = useLazyGetMedicinesQuery();
  const syncStatus = useManualSyncStatus();
  const { permission: notificationPermission, enableNotifications } = useNotificationPermission();
  useReminderPolling();
  const {
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
  } = useMedicinesCrud({
    syncStatus,
    putSnapshot: (medicines) => putMedicinesSnapshot(medicines).unwrap(),
    fetchMedicines: () => fetchMedicines().unwrap()
  });

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
        <SyncStatusIndicator status={syncStatus.state} />
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
