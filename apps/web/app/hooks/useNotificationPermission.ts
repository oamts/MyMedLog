import {
  type NotificationPermissionState,
  getNotificationPermissionState,
  requestNotificationPermission
} from "@/services/notifications";
import { useState } from "react";

export function useNotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermissionState>(
    getNotificationPermissionState()
  );

  async function enableNotifications() {
    const next = await requestNotificationPermission();
    setPermission(next);
  }

  return {
    permission,
    enableNotifications
  };
}
