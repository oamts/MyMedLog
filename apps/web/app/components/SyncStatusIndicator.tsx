import type { SyncStatusState } from "../hooks/useManualSyncStatus";

type SyncStatusIndicatorProps = {
  status: SyncStatusState;
};

const PHASE_LABEL: Record<SyncStatusState["phase"], string> = {
  idle: "Idle",
  pending: "Pending changes",
  saving: "Saving",
  loading: "Loading",
  synced: "Synced",
  error: "Error"
};

const PHASE_COLOR: Record<SyncStatusState["phase"], string> = {
  idle: "#6b7280",
  pending: "#b45309",
  saving: "#0369a1",
  loading: "#0369a1",
  synced: "#065f46",
  error: "#b91c1c"
};

export function SyncStatusIndicator({ status }: SyncStatusIndicatorProps) {
  return (
    <div
      style={{
        marginBottom: "0.75rem",
        border: "1px solid #d1d5db",
        borderRadius: "10px",
        padding: "0.65rem 0.75rem",
        background: "#ffffff"
      }}
    >
      <p style={{ margin: 0, marginBottom: "0.35rem" }}>
        Sync status: <strong style={{ color: PHASE_COLOR[status.phase] }}>{PHASE_LABEL[status.phase]}</strong>
      </p>
      <p style={{ margin: 0, marginBottom: "0.25rem" }}>
        Pending changes: <strong>{status.pendingChanges ? "yes" : "no"}</strong>
      </p>
      {status.lastManualSaveAt && (
        <p style={{ margin: 0, marginBottom: "0.2rem" }}>
          Last Save data: {new Date(status.lastManualSaveAt).toLocaleString()}
        </p>
      )}
      {status.lastManualLoadAt && (
        <p style={{ margin: 0, marginBottom: "0.2rem" }}>
          Last Load data: {new Date(status.lastManualLoadAt).toLocaleString()}
        </p>
      )}
      {status.message && <p style={{ margin: 0 }}>{status.message}</p>}
    </div>
  );
}
