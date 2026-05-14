import { useCallback, useState } from "react";
import { getSyncMetaLocal } from "@/services/db";

export type SyncPhase = "idle" | "pending" | "saving" | "loading" | "synced" | "error";

export type SyncStatusState = {
  phase: SyncPhase;
  pendingChanges: boolean;
  lastManualSaveAt: string | null;
  lastManualLoadAt: string | null;
  message: string | null;
};

const INITIAL_STATE: SyncStatusState = {
  phase: "idle",
  pendingChanges: false,
  lastManualSaveAt: null,
  lastManualLoadAt: null,
  message: null
};

export function useManualSyncStatus() {
  const [state, setState] = useState<SyncStatusState>(INITIAL_STATE);

  const refreshFromStorage = useCallback(async () => {
    const meta = await getSyncMetaLocal();
    setState((current) => ({
      ...current,
      pendingChanges: meta.hasPendingChanges,
      lastManualSaveAt: meta.lastManualSaveAt,
      lastManualLoadAt: meta.lastManualLoadAt,
      phase: meta.hasPendingChanges ? "pending" : current.phase === "error" ? "error" : "synced"
    }));
  }, []);

  const startSaving = useCallback(() => {
    setState((current) => ({ ...current, phase: "saving", message: null }));
  }, []);

  const startLoading = useCallback(() => {
    setState((current) => ({ ...current, phase: "loading", message: null }));
  }, []);

  const markSaveSuccess = useCallback(async (total: number) => {
    const meta = await getSyncMetaLocal();
    setState((current) => ({
      ...current,
      phase: "synced",
      pendingChanges: meta.hasPendingChanges,
      lastManualSaveAt: meta.lastManualSaveAt,
      message: `Save data concluido (${total} registros enviados).`
    }));
  }, []);

  const markLoadSuccess = useCallback(async (total: number) => {
    const meta = await getSyncMetaLocal();
    setState((current) => ({
      ...current,
      phase: "synced",
      pendingChanges: meta.hasPendingChanges,
      lastManualLoadAt: meta.lastManualLoadAt,
      message: `Load data concluido (${total} registros carregados).`
    }));
  }, []);

  const markError = useCallback((message: string) => {
    setState((current) => ({
      ...current,
      phase: "error",
      message
    }));
  }, []);

  return {
    state,
    refreshFromStorage,
    startSaving,
    startLoading,
    markSaveSuccess,
    markLoadSuccess,
    markError
  };
}
