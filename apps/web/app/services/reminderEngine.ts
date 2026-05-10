import { listMedicinesLocal } from "./db";
import { getUpcomingFixedReminders } from "../domain/reminders/fixedTime";
import { getUpcomingIntervalReminders } from "../domain/reminders/interval";
import { getUpcomingExpirationAlerts } from "../domain/reminders/expiration";

export async function getLocalFixedReminderSchedule(now: Date = new Date()) {
  const medicines = await listMedicinesLocal();
  return getUpcomingFixedReminders(medicines, now);
}

export async function getLocalIntervalReminderSchedule(now: Date = new Date()) {
  const medicines = await listMedicinesLocal();
  return getUpcomingIntervalReminders(medicines, now);
}

export async function getLocalReminderSchedule(now: Date = new Date()) {
  const medicines = await listMedicinesLocal();
  const fixed = getUpcomingFixedReminders(medicines, now).map((item) => ({
    ...item,
    mode: "fixed_time" as const
  }));
  const interval = getUpcomingIntervalReminders(medicines, now).map((item) => ({
    ...item,
    mode: "interval_hours" as const
  }));
  const expiration = getUpcomingExpirationAlerts(medicines, now).map((item) => ({
    medicineId: item.medicineId,
    medicineName: item.medicineName,
    nextAt: item.nextAt,
    mode: "expiration_alert" as const
  }));

  return [...fixed, ...interval, ...expiration].sort((a, b) => a.nextAt.localeCompare(b.nextAt));
}
