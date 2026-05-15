import { HealthStatus } from "@/components/HealthStatus";
import { MedicineForm } from "@/components/MedicineForm";
import { MedicineList } from "@/components/MedicineList";
import { SyncStatusIndicator } from "@/components/SyncStatusIndicator";
import { useManualSyncStatus } from "@/hooks/useManualSyncStatus";
import { useMedicinesCrud } from "@/hooks/useMedicinesCrud";
import { useNotificationPermission } from "@/hooks/useNotificationPermission";
import { useReminderPolling } from "@/hooks/useReminderPolling";
import {
  useGetHealthQuery,
  useLazyGetMedicinesQuery,
  usePutMedicinesSnapshotMutation
} from "@/services/api";
import "./style.css";

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
    <main className="app-page">
      <section className="app-page__section">
        <h1 className="app-page__title">MyMedLog</h1>
        <p className="app-page__intro">
          Scaffold inicial concluido. Frontend conectado ao endpoint de health da API.
        </p>
        <div className="app-page__notification-block">
          <p className="app-page__notification-text">
            Permissao de notificacao: <strong>{notificationPermission}</strong>
          </p>
          <button
            type="button"
            onClick={() => {
              void enableNotifications();
            }}
            disabled={
              notificationPermission === "granted" || notificationPermission === "unsupported"
            }
          >
            Ativar notificacoes
          </button>
        </div>
        <div className="app-page__sync-actions">
          <button type="button" onClick={() => void saveData()} disabled={isSyncRunning}>
            {syncStatus.state.phase === "saving" ? "Saving..." : "Save data"}
          </button>
          <button type="button" onClick={() => void loadData()} disabled={isSyncRunning}>
            {syncStatus.state.phase === "loading" ? "Loading..." : "Load data"}
          </button>
        </div>
        <SyncStatusIndicator status={syncStatus.state} />
        <HealthStatus isLoading={isLoading} isError={isError} data={data} />
        <hr className="app-page__separator" />
        <MedicineForm
          initialValues={formValues}
          isSubmitting={saveSnapshotState.isLoading || loadMedicinesState.isFetching}
          isEditing={Boolean(editingMedicine)}
          onSubmit={onSubmit}
        />
        {validationError && <p className="app-page__error-text">{validationError}</p>}
        {localSaveMessage && <p className="app-page__success-text">{localSaveMessage}</p>}
        <h2 className="app-page__list-title">Medicamentos locais</h2>
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
