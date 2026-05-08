import {
  hasDeliveredTriggerLocal,
  markDeliveredTriggerLocal,
  pruneDeliveredTriggersLocal
} from "./db";

export type NotificationPermissionState = NotificationPermission | "unsupported";

type ReminderNotificationPayload = {
  medicineId: string;
  medicineName: string;
  nextAt: string;
  mode: "fixed_time" | "interval_hours" | "expiration_alert";
};

const emittedTriggerIds = new Set<string>();

export function toTriggerId(payload: ReminderNotificationPayload): string {
  return `${payload.medicineId}:${payload.mode}:${payload.nextAt}`;
}

export function getNotificationPermissionState(): NotificationPermissionState {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }

  return window.Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }

  return window.Notification.requestPermission();
}

export async function notifyReminder(payload: ReminderNotificationPayload): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }

  if (window.Notification.permission !== "granted") {
    return false;
  }

  const triggerId = toTriggerId(payload);
  if (emittedTriggerIds.has(triggerId) || (await hasDeliveredTriggerLocal(triggerId))) {
    return false;
  }

  await pruneDeliveredTriggersLocal();

  new window.Notification(`Hora do remedio: ${payload.medicineName}`, {
    body:
      payload.mode === "expiration_alert"
        ? `Alerta de validade previsto para ${new Date(payload.nextAt).toLocaleDateString()}`
        : `Lembrete ${payload.mode === "fixed_time" ? "por horario" : "por intervalo"} previsto para ${new Date(payload.nextAt).toLocaleTimeString()}`,
    tag: triggerId
  });

  emittedTriggerIds.add(triggerId);
  await markDeliveredTriggerLocal(triggerId);
  return true;
}
