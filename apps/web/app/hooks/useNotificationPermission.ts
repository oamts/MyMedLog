import { useState } from "react";
import {
  getNotificationPermissionState,
  requestNotificationPermission,
  type NotificationPermissionState
} from "@/services/notifications";

export function useNotificationPermission() {
  const [permission, setPermission] =
    useState<NotificationPermissionState>(getNotificationPermissionState());

  async function enableNotifications() {
    const next = await requestNotificationPermission();
    setPermission(next);
  }

  return {
    permission,
    enableNotifications
  };
}
