import { notifyReminder } from "@/services/notifications";
import { getLocalReminderSchedule } from "@/services/reminderEngine";
import { useEffect } from "react";

export function useReminderPolling() {
  useEffect(() => {
    async function checkDueReminders() {
      const schedule = await getLocalReminderSchedule();
      const now = Date.now();
      const lookbackMs = 60 * 1000;
      const lookaheadMs = 60 * 1000;

      await Promise.all(
        schedule.map(async (item) => {
          const nextAtMs = new Date(item.nextAt).getTime();
          const isDueSoon = nextAtMs >= now - lookbackMs && nextAtMs <= now + lookaheadMs;

          if (isDueSoon) {
            await notifyReminder(item);
          }
        })
      );
    }

    void checkDueReminders();
    const timerId = window.setInterval(() => {
      void checkDueReminders();
    }, 60 * 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, []);
}
