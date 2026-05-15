import type { SyncStatusState } from "@/hooks/useManualSyncStatus";
import "./style.css";

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

const PHASE_CLASS: Record<SyncStatusState["phase"], string> = {
  idle: "sync-status-indicator__phase-idle",
  pending: "sync-status-indicator__phase-pending",
  saving: "sync-status-indicator__phase-saving",
  loading: "sync-status-indicator__phase-loading",
  synced: "sync-status-indicator__phase-synced",
  error: "sync-status-indicator__phase-error"
};

export function SyncStatusIndicator({ status }: SyncStatusIndicatorProps) {
  return (
    <div className="sync-status-indicator">
      <p className="sync-status-indicator__line">
        Sync status:{" "}
        <strong className={PHASE_CLASS[status.phase]}>{PHASE_LABEL[status.phase]}</strong>
      </p>
      <p className="sync-status-indicator__line">
        Pending changes: <strong>{status.pendingChanges ? "yes" : "no"}</strong>
      </p>
      {status.lastManualSaveAt && (
        <p className="sync-status-indicator__line-compact">
          Last Save data: {new Date(status.lastManualSaveAt).toLocaleString()}
        </p>
      )}
      {status.lastManualLoadAt && (
        <p className="sync-status-indicator__line-compact">
          Last Load data: {new Date(status.lastManualLoadAt).toLocaleString()}
        </p>
      )}
      {status.message && <p className="sync-status-indicator__line-last">{status.message}</p>}
    </div>
  );
}
